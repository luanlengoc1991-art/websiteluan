'use client';
import {useEffect, useState} from 'react';
const messages: Record<string,string> = {
 google_unavailable:'Đăng nhập Google chưa được cấu hình đầy đủ. Vui lòng liên hệ quản trị viên.',
 google_cancelled:'Đăng nhập chưa hoàn tất. Bạn có thể thử lại bằng Google.',
 google_expired:'Phiên đăng nhập đã hết hạn. Vui lòng thử lại.',
 google_forbidden:'Tài khoản Google này chưa được cấp quyền quản trị. Vui lòng chọn tài khoản được phép.',
 google_failed:'Không thể xác thực với Google. Vui lòng thử lại.',
};
export default function LoginForm() {
 const [error,setError] = useState('');
 const [target,setTarget] = useState('/admin');
 const [busy,setBusy] = useState(false);
 useEffect(() => {const params=new URLSearchParams(window.location.search);setError(messages[params.get('error') || ''] || '');setTarget(params.get('return_to') || '/admin');}, []);
 return <form className="stack" action={'/api/auth/google?return_to='+encodeURIComponent(target)} method="post" onSubmit={()=>setBusy(true)}>
  <button className="button" type="submit" disabled={busy} style={{width:'100%',background:'#fff',color:'#1f2937',border:'1px solid #d1d5db',minHeight:48,display:'flex',justifyContent:'center',alignItems:'center',gap:12}}>
   <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.52c-.9.6-2.06.97-3.38.97-2.6 0-4.81-1.76-5.6-4.12H3.05v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.94a6 6 0 0 1 0-3.88v-2.6H3.05a10 10 0 0 0 0 9.08l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.46l3.35 2.6A5.98 5.98 0 0 1 12 5.94Z"/></svg>
   {busy?'Đang chuyển đến Google…':'Tiếp tục với Google'}
  </button>
  {error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}
  <p className="small muted">Đăng nhập bằng tài khoản Google đã được cấp quyền quản trị.</p>
 </form>;
}
