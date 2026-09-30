'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Bell,Building2,ChevronDown,ExternalLink,FileText,House,Image as ImageIcon,LayoutDashboard,LogOut,Menu,RefreshCw,Settings,ShieldCheck,Users,BriefcaseBusiness,X} from 'lucide-react';

export const adminNavigation=[
  ['tong-quan','Tổng quan',LayoutDashboard],
  ['quan-ly-du-an','Quản lý dự án',Building2],
  ['quan-ly','Quản lý quỹ căn',House],
  ['khach-hang','Khách hàng',Users],
  ['giao-dich','Giao dịch',BriefcaseBusiness],
  ['thu-vien','Thư viện',ImageIcon],
  ['bai-viet','Tin tức',FileText],
  ['cau-hinh','Cài đặt',Settings],
] as const;

export default function AdminShell({section,name,onRefresh}:{section:string;name:string;onRefresh:()=>void}){
  const [open,setOpen]=useState(false),[error,setError]=useState('');
  const currentLabel=adminNavigation.find(item=>item[0]===section)?.[1]||'Tổng quan';
  const adminName=name||'Admin';
  return <>
    <aside className={'admin-sidebar '+(open?'is-open':'')}>
      <Link href="/admin" className="admin-wordmark"><Image src="/alpha-hub-logo.png" alt="Alpha HUB" width={52} height={52} priority/><div><b>ALPHA HUB</b><small>TRUNG TÂM QUẢN TRỊ</small></div></Link>
      <button className="admin-close" aria-label="Đóng menu" onClick={()=>setOpen(false)}><X/></button>
      <div className="admin-nav-label">KHÔNG GIAN LÀM VIỆC</div>
      <nav aria-label="Điều hướng quản trị">{adminNavigation.map(([id,label,Icon])=><Link aria-current={section===id?'page':undefined} key={id} href={'/admin/'+id} className={section===id?'active':''} onClick={()=>setOpen(false)}><Icon size={19}/>{label}{section===id?<span className="admin-nav-dot"/>:null}</Link>)}</nav>
      <div className="admin-side-bottom">
        <div className="admin-private"><ShieldCheck size={19}/><div>Khu vực quản trị<small>Chỉ tài khoản được cấp quyền</small></div></div>
        <Link href="/quy-hang"><ExternalLink size={17}/>Mở website</Link>
        <button onClick={async()=>{try{const response=await fetch('/api/auth/logout',{method:'POST'});if(!response.ok)throw Error();window.location.assign('/dang-nhap');}catch{setError('Chưa đăng xuất được. Vui lòng thử lại.');}}}><LogOut size={17}/>Đăng xuất</button>
        {error?<p role="alert">{error}</p>:null}
      </div>
    </aside>
    {open?<button className="admin-backdrop" aria-label="Đóng điều hướng" onClick={()=>setOpen(false)}/>:null}
    <div className="admin-topbar">
      <div className="admin-topbar-title"><button className="admin-mobile-toggle" aria-label="Mở điều hướng quản trị" onClick={()=>setOpen(true)}><Menu/></button><span>{currentLabel}</span><small>Alpha HUB Admin</small></div>
      <div className="admin-top-actions">
        <button title="Tải lại dữ liệu" aria-label="Tải lại dữ liệu" onClick={onRefresh}><RefreshCw size={17}/></button>
        <Link title="Xem hoạt động giao dịch" aria-label="Xem hoạt động giao dịch" className="admin-bell" href="/admin/giao-dich"><Bell size={18}/><i/></Link>
        <span className="admin-user-avatar">{adminName.charAt(0).toUpperCase()}</span>
        <span className="admin-user-name">{adminName}<small>Quản trị viên</small></span>
        <ChevronDown className="admin-user-chevron" size={16}/>
      </div>
    </div>
  </>;
}
