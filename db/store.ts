import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

export async function supabaseServer(){
 const store=await cookies();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw Error('Supabase chưa được cấu hình.');
 return createServerClient(url,key,{
  cookies:{
   getAll(){return store.getAll();},
   setAll(items){for(const {name,value,options} of items)store.set(name,value,options);}
  }
 });
}

export const alphaBucket='alpha-hub-files';
