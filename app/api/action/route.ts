import {isSameOrigin} from '@/lib/request-origin';
import {getCurrentUser} from '@/lib/auth';
import {supabaseServer} from '@/db/store';
import {seedUnits,seedProjects,defaultSettings} from '@/lib/catalog';
import {z} from 'zod';
const num=z.number().finite().nonnegative();const str=z.string().trim().min(1).max(300);const url=z.string().max(2000).refine(v=>v===''||v.startsWith('/api/files/')||/^https:\/\//.test(v),'URL không hợp lệ');
const schemas:Record<string,z.ZodTypeAny>={
unit:z.object({tower:z.string().max(100).optional(),id:str,code:str,projectId:str,category:z.enum(['low','high']),zone:str,type:str,group:str,direction:str,area:num.positive(),builtArea:num,price:num,status:z.enum(['Còn hàng','Đã bán']),beds:num.int(),floor:num.int(),x:num.max(100),y:num.max(100),note:z.string().max(5000)}),
project:z.object({id:str,name:str,location:str,region:str,developer:str,category:z.enum(['low','high']),status:str,image:url,hot:z.boolean(),description:z.string().max(20000),lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180)}),
customer:z.object({id:str,name:str,phone:z.string().regex(/^[+\d ()-]{8,20}$/),email:z.union([z.literal(''),z.string().email()]),note:z.string().max(5000),stage:z.enum(['Mới','Đang tư vấn','Đã giao dịch'])}),
article:z.object({id:str,title:str,category:str,body:z.string().min(1).max(40000),image:url,date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)}),
settings:z.object({brand:str,phone:z.string().max(30),email:z.union([z.literal(''),z.string().email()]),address:z.string().max(500),holdHours:z.number().int().min(1).max(168),notifications:z.boolean(),profileName:z.string().max(100)}),
favorite:z.object({enabled:z.boolean()}),read:z.object({at:num}),subscription:z.object({email:z.string().email()})};
export async function POST(request:Request){
 try{
  if(!isSameOrigin(request))return Response.json({error:'Yêu cầu không hợp lệ.'},{status:403});
  const user=await getCurrentUser();
  if(!user)return Response.json({error:'Vui lòng đăng nhập để lưu dữ liệu.'},{status:401});
  if(Number(request.headers.get('content-length')||0)>1000000)return Response.json({error:'Dữ liệu quá lớn.'},{status:413});
  const body:any=await request.json(),db=await supabaseServer(),owner=user.userId,now=Date.now();
  const must=<T extends {error:unknown}>(result:T)=>{if(result.error)throw result.error;return result;};
  const put=async(kind:string,id:string,data:unknown)=>{
   must(await db.from('alpha_records').upsert({owner,kind,id,payload:JSON.stringify(data),updated:now},{onConflict:'owner,kind,id'}));
  };
  const validateUnits=async(items:any[])=>{
   const projects=must(await db.from('alpha_records').select('id,payload').eq('owner',owner).eq('kind','project')).data||[];
   const units=must(await db.from('alpha_records').select('id,payload').eq('owner',owner).eq('kind','unit')).data||[];
   const projectMap=new Map(seedProjects.map(p=>[p.id,p]));
   for(const p of projects)projectMap.set(p.id,JSON.parse(p.payload));
   const all=new Map(seedUnits.map(u=>[u.id,u]));
   for(const u of units)all.set(u.id,JSON.parse(u.payload));
   for(const u of items){const p=projectMap.get(u.projectId);if(!p||p.category!==u.category)throw Error('Dự án và nhóm sản phẩm của căn chưa khớp.');all.set(u.id,u);}
   const codes=new Set();for(const u of all.values()){const key=u.projectId+'|'+u.code.trim().toLowerCase();if(codes.has(key))throw Error('Mã căn đã tồn tại trong dự án.');codes.add(key);}
   for(const u of items)if(u.status==='Đã bán'){
    const result=must(await db.from('alpha_reservations').select('id').eq('owner',owner).eq('unit_id',u.id).eq('status','Đang giữ chỗ').gt('expires_at',now).limit(1));
    if(result.data?.length)throw Error('Căn đang được giữ chỗ. Hãy chuyển Đã bán trong mục Giao dịch.');
   }
  };
  if(body.action==='save'){
   const {kind}=body;if(!schemas[kind])throw Error('Loại dữ liệu không hợp lệ.');
   const id=str.parse(body.id),data=schemas[kind].parse(body.data);
   if(data.id&&data.id!==id)throw Error('Mã dữ liệu không khớp.');
   if(kind==='settings'&&id!=='main')throw Error('Cấu hình không hợp lệ.');
   if(kind==='unit')await validateUnits([data]);
   await put(kind,id,data);return Response.json({ok:true});
  }
  if(body.action==='import'){
   const rows=z.array(schemas.unit).min(1).max(300).parse(body.rows);
   if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Mã căn bị trùng trong file.');
   await validateUnits(rows);
   must(await db.from('alpha_records').upsert(rows.map(r=>({owner,kind:'unit',id:r.id,payload:JSON.stringify(r),updated:now})),{onConflict:'owner,kind,id'}));
   return Response.json({ok:true,count:rows.length});
  }
  if(body.action==='reserve'){
   const unitId=str.parse(body.unitId),customerId=str.parse(body.customerId),note=z.string().max(5000).parse(body.note||'');
   const [row,customer,setting]=await Promise.all([
    db.from('alpha_records').select('payload').eq('owner',owner).eq('kind','unit').eq('id',unitId).maybeSingle(),
    db.from('alpha_records').select('id').eq('owner',owner).eq('kind','customer').eq('id',customerId).maybeSingle(),
    db.from('alpha_records').select('payload').eq('owner',owner).eq('kind','settings').eq('id','main').maybeSingle()
   ]);
   for(const result of [row,customer,setting])must(result);
   const unit=row.data?JSON.parse(row.data.payload):seedUnits.find(u=>u.id===unitId);
   if(!unit||unit.status!=='Còn hàng')return Response.json({error:'Căn không còn khả dụng.'},{status:409});
   if(!customer.data)throw Error('Vui lòng chọn khách hàng hợp lệ.');
   const hours=setting.data?JSON.parse(setting.data.payload).holdHours:defaultSettings.holdHours,id=crypto.randomUUID();
   const reserved=must(await db.rpc('alpha_reserve',{p_id:id,p_unit_id:unitId,p_customer_id:customerId,p_note:note,p_expires_at:now+hours*3600000,p_created_at:now}));
   if(!reserved.data)return Response.json({error:'Căn vừa được giữ chỗ hoặc đã bán. Hãy tải lại bảng hàng.'},{status:409});
   await put('notification',id,{title:`Đã giữ chỗ căn ${unit.code}`,at:now});
   return Response.json({ok:true,id});
  }
  if(body.action==='reservation'){
   const id=str.parse(body.id),op=z.enum(['cancel','extend','sold']).parse(body.operation);
   const existing=must(await db.from('alpha_reservations').select('expires_at').eq('id',id).eq('owner',owner).eq('status','Đang giữ chỗ').gt('expires_at',now).maybeSingle());
   if(!existing.data)return Response.json({error:'Giao dịch đã thay đổi hoặc hết hạn. Vui lòng tải lại.'},{status:409});
   const update={status:op==='cancel'?'Đã hủy':op==='sold'?'Đã bán':'Đang giữ chỗ',expires_at:op==='extend'?existing.data.expires_at+24*3600000:existing.data.expires_at};
   const changed=must(await db.from('alpha_reservations').update(update).eq('id',id).eq('owner',owner).eq('status','Đang giữ chỗ').eq('expires_at',existing.data.expires_at).gt('expires_at',now).select('id'));
   if(!changed.data?.length)return Response.json({error:'Giao dịch đã thay đổi hoặc hết hạn. Vui lòng tải lại.'},{status:409});
   await put('notification',crypto.randomUUID(),{title:op==='cancel'?'Đã hủy giữ chỗ':op==='sold'?'Đã ghi nhận giao dịch bán':'Đã gia hạn giữ chỗ thêm 24 giờ',at:now});
   return Response.json({ok:true});
  }
  return Response.json({error:'Thao tác không được hỗ trợ.'},{status:400});
 }catch(e){console.error(e);return Response.json({error:e instanceof z.ZodError?'Thông tin chưa hợp lệ. Kiểm tra các trường bắt buộc, số và địa chỉ email.':e instanceof Error?e.message:'Không thể lưu. Vui lòng thử lại.'},{status:400});}
}
