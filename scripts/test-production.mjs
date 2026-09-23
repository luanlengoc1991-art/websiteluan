import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes,scryptSync} from 'node:crypto';
import {createServer} from 'node:net';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const dir=mkdtempSync(join(tmpdir(),'alpha-hub-test-'));
const password=randomBytes(20).toString('hex'),salt=randomBytes(16).toString('hex');
const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const origin=`http://127.0.0.1:${port}`;let server,logs='',cookie='';
const env={...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',ALPHA_DATA_DIR:dir,ALPHA_ADMIN_EMAIL:'admin@example.test',ALPHA_ADMIN_PASSWORD_HASH:`scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`,ALPHA_SECURE_COOKIE:'false'};
async function start(){server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(port)],{env,stdio:['ignore','pipe','pipe']});server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);for(let i=0;i<150;i++){if(server.exitCode!==null)throw Error(logs);try{const r=await fetch(origin+'/api/state');if(r.status===200)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw Error('Server did not start: '+logs);}
async function stop(){if(server&&server.exitCode===null){server.kill();await new Promise(r=>server.once('exit',r));}}
async function post(path,data,extra={}){return fetch(origin+path,{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...extra},body:JSON.stringify(data)});}
try{
 await start();
 const anonymous=await fetch(origin+'/api/state',{headers:{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':'fake@example.test'}});assert.equal((await anonymous.json()).user,null);
 assert.equal((await post('/api/action',{action:'save'})).status,401);
 assert.equal((await post('/api/auth/login',{email:'admin@example.test',password:'incorrect'})).status,401);
 assert.equal((await post('/api/auth/login',{email:'admin@example.test',password},{Origin:'https://other.test'})).status,403);
 const login=await post('/api/auth/login',{email:'admin@example.test',password});assert.equal(login.status,200);const setCookie=login.headers.get('set-cookie');assert.match(setCookie,/HttpOnly/i);cookie=setCookie.split(';')[0];
 const customer={id:'test-customer',name:'Khách kiểm thử',phone:'0900000000',email:'',note:'',stage:'Mới'};
 assert.equal((await post('/api/action',{action:'save',kind:'customer',id:customer.id,data:customer})).status,200);
 const holds=await Promise.all([post('/api/action',{action:'reserve',unitId:'u-2-0',customerId:customer.id}),post('/api/action',{action:'reserve',unitId:'u-2-0',customerId:customer.id})]);assert.deepEqual(holds.map(r=>r.status).sort(),[200,409]);
 let state=await(await fetch(origin+'/api/state',{headers:{Cookie:cookie}})).json();assert.equal(state.records[0].data.name,customer.name);const hold=state.reservations[0];
 for(const operation of ['extend','cancel'])assert.equal((await post('/api/action',{action:'reservation',id:hold.id,operation})).status,200);
 const form=new FormData();form.set('projectId','green-paradise');form.set('kind','document');form.set('file',new Blob(['%PDF-1.4 test'],{type:'application/pdf'}),'sample.pdf');
 const upload=await fetch(origin+'/api/upload',{method:'POST',headers:{Cookie:cookie,Origin:origin},body:form});assert.equal(upload.status,200);const fileId=(await upload.json()).id;
 assert.equal((await fetch(origin+'/api/files/'+fileId)).status,401);
 assert.equal(await(await fetch(origin+'/api/files/'+fileId,{headers:{Cookie:cookie}})).text(),'%PDF-1.4 test');
 for(const path of ['/du-an','/quy-hang','/du-an/masteri-grand-coast/quy-can-360','/du-an/masteri-grand-coast/bang-hang','/dang-nhap']){const page=await fetch(origin+path);assert.equal(page.status,200);assert.match(await page.text(),/Alpha/);}
 await stop();await start();
 state=await(await fetch(origin+'/api/state',{headers:{Cookie:cookie}})).json();assert.equal(state.records.find(r=>r.id===customer.id).data.name,customer.name);assert.equal(state.files[0].id,fileId);
 const logout=await fetch(origin+'/api/auth/logout',{method:'POST',headers:{Cookie:cookie,Origin:origin},redirect:'manual'});assert.equal(logout.status,303);
 assert.equal((await(await fetch(origin+'/api/state',{headers:{Cookie:cookie}})).json()).user,null);
 console.log('PASS: Next.js pages, password login, HttpOnly session, rejected spoofed identity, CSRF, customer persistence, atomic holds, extension/cancellation, protected upload/download, persistence after restart, logout revocation.');
}catch(error){console.error(error);process.exitCode=1;}finally{await stop();rmSync(dir,{recursive:true,force:true});}
