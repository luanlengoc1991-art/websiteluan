import {cookies} from 'next/headers';
import {randomBytes,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {sqlite} from '@/db/store';
const derive=promisify(scrypt);
export const sessionCookie='alpha_session';
export const sessionLifetime=7*24*60*60;
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export async function getCurrentUser(){
 const token=(await cookies()).get(sessionCookie)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const row=sqlite().prepare('SELECT owner,email FROM sessions WHERE token_hash=? AND expires>?').get(tokenHash(token),Date.now());
 if(!row)return null;
 return {userId:String(row.owner),email:String(row.email),displayName:String(row.email),fullName:null};
}
export async function verifyPassword(password:string){
 const encoded=process.env.ALPHA_ADMIN_PASSWORD_HASH||'';
 const [version,salt,hash]=encoded.split(':');
 if(version!=='scrypt'||!salt||!hash||password.length>256)return false;
 const expected=Buffer.from(hash,'hex');if(expected.length!==64)return false;
 const actual=await derive(password,salt,64) as Buffer;return timingSafeEqual(expected,actual);
}
export function newSession(email:string){
 const token=randomBytes(32).toString('hex');const db=sqlite();
 db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
 db.prepare('INSERT INTO sessions(token_hash,owner,email,expires) VALUES(?,?,?,?)').run(tokenHash(token),'admin',email,Date.now()+sessionLifetime*1000);
 return token;
}
export function cookieOptions(){return {httpOnly:true,sameSite:'lax' as const,secure:process.env.ALPHA_SECURE_COOKIE==='true'||(process.env.NODE_ENV==='production'&&process.env.ALPHA_SECURE_COOKIE!=='false'),path:'/'};}
