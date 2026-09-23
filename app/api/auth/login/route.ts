import {isSameOrigin} from '@/lib/request-origin';
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/db/store';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!isSameOrigin(req))return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 if(Number(req.headers.get('content-length')||0)>4096)return NextResponse.json({error:'Yêu cầu quá lớn.'},{status:413});
 let body;try{body=await req.json();}catch{return NextResponse.json({error:'Thông tin chưa hợp lệ.'},{status:400});}
 if(typeof body.email!=='string'||typeof body.password!=='string'||body.email.length>254||body.password.length>256)return NextResponse.json({error:'Thông tin chưa hợp lệ.'},{status:400});
 try{
  const client=await supabaseServer();
  const {error}=await client.auth.signInWithPassword({email:body.email.trim().toLowerCase(),password:body.password});
  if(error)return NextResponse.json({error:'Email hoặc mật khẩu không đúng.'},{status:401});
  return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error(error);return NextResponse.json({error:'Đăng nhập tạm thời chưa khả dụng.'},{status:503});}
}
