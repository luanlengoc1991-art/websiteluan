import {isSameOrigin} from '@/lib/request-origin';
import {NextResponse} from 'next/server';
import {verifyPassword,newSession,sessionCookie,sessionLifetime,cookieOptions} from '@/lib/auth';
import {sqlite} from '@/db/store';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!isSameOrigin(req))return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>4096)return NextResponse.json({error:'Yêu cầu quá lớn.'},{status:413});
 const admin=(process.env.ALPHA_ADMIN_EMAIL||'').trim().toLowerCase();
 if(!admin||!process.env.ALPHA_ADMIN_PASSWORD_HASH)return NextResponse.json({error:'Chưa cấu hình tài khoản. Chạy npm run setup trên máy chủ.'},{status:503});
 let body;try{body=await req.json();}catch{return NextResponse.json({error:'Thông tin chưa hợp lệ.'},{status:400});}
 if(typeof body.email!=='string'||typeof body.password!=='string'||body.email.length>254||body.password.length>256)return NextResponse.json({error:'Thông tin chưa hợp lệ.'},{status:400});
 const db=sqlite(),now=Date.now();const limit=db.prepare('SELECT attempts,reset_at FROM login_limits WHERE id=?').get('admin');
 if(limit&&Number(limit.reset_at)>now&&Number(limit.attempts)>=20)return NextResponse.json({error:'Thử quá nhiều lần. Vui lòng đợi 15 phút.'},{status:429});
 db.prepare('INSERT INTO login_limits(id,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END').run('admin',now+900000,now,now);
 const valid=await verifyPassword(body.password);
 if(body.email.trim().toLowerCase()!==admin||!valid)return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401});
 db.prepare('DELETE FROM login_limits WHERE id=?').run('admin');
 const res=NextResponse.json({ok:true});res.cookies.set(sessionCookie,newSession(admin),{...cookieOptions(),maxAge:sessionLifetime});return res;
}
