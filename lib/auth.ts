import {supabaseServer} from '@/db/store';
export async function getCurrentUser(){
 const client=await supabaseServer();
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user||!user.email)return null;
 return {userId:user.id,email:user.email,displayName:user.email,fullName:null};
}
