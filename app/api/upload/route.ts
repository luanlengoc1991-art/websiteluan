import {isSameOrigin} from '@/lib/request-origin';
import {getCurrentUser} from '@/lib/auth';
import {supabaseServer,alphaBucket} from '@/db/store';
export async function POST(req:Request){
 try{
  if(!isSameOrigin(req))return Response.json({error:'Yêu cầu không hợp lệ'},{status:403});
  const user=await getCurrentUser();if(!user)return Response.json({error:'Vui lòng đăng nhập.'},{status:401});
  if(Number(req.headers.get('content-length')||0)>4096)return Response.json({error:'Yêu cầu quá lớn.'},{status:413});
  const body=await req.json();const {id,projectId,kind,name,mime}=body;
  if(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/.test(id)||typeof projectId!=='string'||!projectId||projectId.length>300||!['gallery','plan','panorama','document','model','amenity'].includes(kind)||typeof name!=='string'||!name||name.length>200||!['image/jpeg','image/png','image/webp','application/pdf'].includes(mime)||(kind!=='document'&&mime==='application/pdf'))return Response.json({error:'Thông tin file không hợp lệ.'},{status:400});
  const db=await supabaseServer(),key=`${user.userId}/${id}`;
  const {data:info,error:infoError}=await db.storage.from(alphaBucket).info(key);
  if(infoError||!info||typeof info.size!=='number'||info.size>15*1024*1024)return Response.json({error:'File chưa tải lên hoặc vượt quá 15 MB.'},{status:400});
  const {error}=await db.from('alpha_files').insert({id,owner:user.userId,project_id:projectId,kind,name,mime,object_key:key});
  if(error)throw error;
  return Response.json({ok:true,id});
 }catch(e){console.error(e);return Response.json({error:'Không thể lưu thông tin file. Vui lòng thử lại.'},{status:503});}
}
