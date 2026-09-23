'use client';
import {useState} from 'react';
export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 return <form className="stack" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const result=await response.json();if(!response.ok)throw Error(result.error);const target=new URLSearchParams(window.location.search).get('return_to');window.location.assign(target&&target.startsWith('/')&&!target.startsWith('//')&&!target.includes('\\')?target:'/quan-ly');}catch(e){setError(e instanceof Error?e.message:'Không thể đăng nhập.');setBusy(false);}}}>
 <label className="field"><span>Email quản trị</span><input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
 <label className="field"><span>Mật khẩu</span><input type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/></label>
 {error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}<button type="submit" className="button dark" disabled={busy}>{busy?'Đang đăng nhập…':'Đăng nhập'}</button>
 </form>;
}
