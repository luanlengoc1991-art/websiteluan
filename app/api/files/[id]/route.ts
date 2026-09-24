import {getCurrentUser} from '@/lib/auth';
import {supabaseServer,alphaBucket} from '@/db/store';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const user=await getCurrentUser();if(!user)return new Response('Cần đăng nhập',{status:401});
  const {id}=await params,db=await supabaseServer();
  const {data:row,error}=await db.from('alpha_files').select('object_key,mime,name').eq('id',id).eq('owner',user.userId).maybeSingle();
  if(error)throw error;if(!row)return new Response('Không tìm thấy',{status:404});
  const download=new URL(req.url).searchParams.has('download');
  const signed=await db.storage.from(alphaBucket).createSignedUrl(row.object_key,60,download?{download:row.name}:undefined);
  if(signed.error||!signed.data)throw signed.error||Error('Không thể tạo liên kết tải file.');
  return Response.redirect(signed.data.signedUrl,302);
 }catch(e){console.error(e);return new Response('Kho tài liệu tạm thời chưa khả dụng',{status:503});}
}
