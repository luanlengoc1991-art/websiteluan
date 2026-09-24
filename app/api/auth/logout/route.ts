import {isSameOrigin} from '@/lib/request-origin';
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/db/store';
export async function POST(req:Request){
 if(!isSameOrigin(req))return NextResponse.json({error:'Yêu cầu không hợp lệ.'},{status:403});
 const client=await supabaseServer();await client.auth.signOut();
 return NextResponse.redirect(new URL('/dang-nhap',req.url),303);
}
