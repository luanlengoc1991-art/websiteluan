import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const origin=`http://127.0.0.1:${port}`;let logs='';
const server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','-H','127.0.0.1','-p',String(port)],{env:{...process.env,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'test-public-key'},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);
const post=(path,data,otherOrigin=origin)=>fetch(origin+path,{method:'POST',headers:{Origin:otherOrigin,'Content-Type':'application/json'},body:JSON.stringify(data)});
try{
 let ready=false;for(let i=0;i<150;i++){if(server.exitCode!==null)throw Error(logs);try{if((await fetch(origin+'/api/state')).status===200){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}
 assert.ok(ready,'Server did not start: '+logs);
 const state=await(await fetch(origin+'/api/state',{headers:{'oai-authenticated-user-id':'fake'}})).json();assert.equal(state.user,null);
 assert.equal((await post('/api/action',{action:'save'})).status,401);
 assert.equal((await post('/api/auth/login',{email:'test@example.com',password:'test'},'https://other.test')).status,403);
 assert.equal((await fetch(origin+'/api/files/'+crypto.randomUUID())).status,401);
 for(const path of ['/du-an','/quy-hang','/dang-nhap']){const page=await fetch(origin+path);assert.equal(page.status,200);assert.match(await page.text(),/Alpha/);}
 console.log('PASS: public pages, anonymous isolation, protected actions/files, same-origin login.');
}catch(error){console.error(error);process.exitCode=1;}finally{server.kill();await new Promise(r=>server.once('exit',r));}
