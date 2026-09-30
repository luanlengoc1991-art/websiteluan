'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  House,
  Layers3,
  MapPin,
  MoreVertical,
  PlayCircle,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from 'lucide-react';
import type {Asset, Customer, Project, Reservation, Unit} from '@/lib/catalog';

type Notification={id:string;data:{title:string;at:number}};

type Props={
  projects:Project[];
  units:Unit[];
  customers:Customer[];
  reservations:Reservation[];
  files:Asset[];
  notifications:Notification[];
};

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();

export default function AdminOverview({projects,units,customers,reservations,files,notifications}:Props){
  const [query,setQuery]=useState('');
  const [region,setRegion]=useState('all');
  const [status,setStatus]=useState('all');
  const unitCounts=useMemo(()=>{
    const counts=new Map<string,number>();
    units.forEach(unit=>counts.set(unit.projectId,(counts.get(unit.projectId)||0)+1));
    return counts;
  },[units]);
  const regions=useMemo(()=>Array.from(new Set(projects.map(project=>project.region))).sort(),[projects]);
  const statuses=useMemo(()=>Array.from(new Set(projects.map(project=>project.status))).sort(),[projects]);
  const filteredProjects=useMemo(()=>projects.filter(project=>
    normalize(project.name+' '+project.location+' '+project.developer).includes(normalize(query))&&
    (region==='all'||project.region===region)&&
    (status==='all'||project.status===status)
  ),[projects,query,region,status]);
  const featured=projects.filter(project=>project.hot).slice(0,4);
  const activeProjects=projects.filter(project=>!/(tạm dừng|đóng|ngừng)/i.test(project.status)).length;
  const availableUnits=units.filter(unit=>unit.status==='Còn hàng').length;
  const soldReservations=reservations.filter(item=>item.status==='Đã bán').length;
  const chartProjects=projects.slice(0,8);
  const chartMax=Math.max(1,...chartProjects.map(project=>unitCounts.get(project.id)||0));
  const chartPoints=chartProjects.map((project,index)=>{
    const x=chartProjects.length===1?50:(index/(chartProjects.length-1))*100;
    const y=88-((unitCounts.get(project.id)||0)/chartMax)*68;
    return {project,x,y,count:unitCounts.get(project.id)||0};
  });
  const linePoints=chartPoints.map(point=>`${point.x},${point.y}`).join(' ');
  const areaPoints=chartPoints.length?`0,100 ${linePoints} 100,100`:'0,100 100,100';
  const metrics=[
    {label:'Tổng dự án',value:projects.length,detail:`${projects.filter(project=>project.hot).length} dự án nổi bật`,icon:Layers3,tone:'green'},
    {label:'Dự án nổi bật',value:projects.filter(project=>project.hot).length,detail:`${files.length} ảnh & tài liệu`,icon:Star,tone:'gold'},
    {label:'Tổng quỹ căn',value:units.length,detail:`${availableUnits} căn còn hàng`,icon:Building2,tone:'green'},
    {label:'Đang hoạt động',value:activeProjects,detail:`${customers.length} khách · ${soldReservations} đã bán`,icon:PlayCircle,tone:'green'},
  ];

  return <div className="admin-dashboard">
    <div className="admin-ambient" aria-hidden="true" style={{backgroundImage:projects[2]?.image?`url(${projects[2].image})`:undefined}}/>
    <div className="admin-dashboard-heading">
      <div><h2>Quản lý dự án</h2><p>Quản lý danh sách dự án và quỹ căn toàn hệ thống</p></div>
      <Link className="admin-primary-action" href="/admin/quan-ly-du-an"><Plus size={20}/>Thêm dự án</Link>
    </div>

    <section className="admin-kpi-grid" aria-label="Tổng quan dữ liệu thực tế">
      {metrics.map(({label,value,detail,icon:Icon,tone})=><article className={`admin-kpi-card ${tone==='gold'?'is-gold':''}`} key={label}>
        <div className="admin-kpi-top"><span className="admin-kpi-icon"><Icon size={23}/></span><MoreVertical size={17} aria-hidden="true"/></div>
        <div className="admin-kpi-copy"><span>{label}</span><strong>{value.toLocaleString('vi-VN')}</strong></div>
        <div className="admin-kpi-foot"><span><Sparkles size={13}/>{detail}</span><svg aria-hidden="true" viewBox="0 0 88 26"><path d="M1 24 C10 18 15 20 22 12 S35 22 43 11 S56 16 63 7 S76 18 87 2"/></svg></div>
      </article>)}
    </section>

    <div className="admin-dashboard-main">
      <section className="admin-glass-panel admin-project-chart">
        <header><div><h3>Quỹ căn theo dự án</h3><p>Số lượng hiện có trong dữ liệu quản trị</p></div><span className="admin-live-pill"><i/>Dữ liệu trực tiếp</span></header>
        <div className="admin-chart-wrap">
          <div className="admin-chart-scale"><span>{chartMax}</span><span>{Math.round(chartMax*.66)}</span><span>{Math.round(chartMax*.33)}</span><span>0</span></div>
          <div className="admin-chart-plot">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Biểu đồ số quỹ căn theo dự án" role="img">
              <defs><linearGradient id="adminChartArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#15ed8b" stopOpacity=".54"/><stop offset="1" stopColor="#0acb76" stopOpacity=".04"/></linearGradient></defs>
              <g className="admin-grid-lines"><line x1="0" y1="20" x2="100" y2="20"/><line x1="0" y1="43" x2="100" y2="43"/><line x1="0" y1="66" x2="100" y2="66"/><line x1="0" y1="89" x2="100" y2="89"/></g>
              <polygon points={areaPoints} fill="url(#adminChartArea)"/>
              <polyline className="admin-chart-line" points={linePoints}/>
              {chartPoints.map(point=><circle key={point.project.id} cx={point.x} cy={point.y} r="1.45"><title>{point.project.name}: {point.count} căn</title></circle>)}
            </svg>
            <div className="admin-chart-labels">{chartPoints.map(point=><span key={point.project.id} title={point.project.name}>{point.project.name.replace('Vinhomes ','').replace('Masteri ','')}</span>)}</div>
          </div>
        </div>
      </section>

      <aside className="admin-glass-panel admin-featured">
        <header><div><h3>Dự án nổi bật</h3><p>Dữ liệu đang hiển thị trên website</p></div><MoreVertical size={18}/></header>
        <div className="admin-featured-list">{featured.map(project=><Link href="/admin/quan-ly-du-an" key={project.id}>
          <span className="admin-project-thumb"><Image src={project.image} alt="" fill sizes="62px" unoptimized/></span>
          <span><b>{project.name}</b><small><MapPin size={12}/>{project.location}</small><em><i/>{project.status}</em></span>
          <ChevronRight size={17}/>
        </Link>)}</div>
        <Link href="/admin/quan-ly-du-an" className="admin-view-all">Xem tất cả <ArrowRight size={15}/></Link>
      </aside>
    </div>

    <section className="admin-glass-panel admin-project-table-panel">
      <header className="admin-table-heading"><div><h3>Danh sách dự án</h3><p>{filteredProjects.length} / {projects.length} dự án</p></div><div className="admin-table-filters">
        <label><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm kiếm dự án..." aria-label="Tìm kiếm dự án"/></label>
        <select value={region} onChange={event=>setRegion(event.target.value)} aria-label="Lọc khu vực"><option value="all">Tất cả khu vực</option>{regions.map(item=><option key={item}>{item}</option>)}</select>
        <select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Lọc trạng thái"><option value="all">Tất cả trạng thái</option>{statuses.map(item=><option key={item}>{item}</option>)}</select>
        <button aria-label="Đặt lại bộ lọc" onClick={()=>{setQuery('');setRegion('all');setStatus('all');}}><SlidersHorizontal size={17}/></button>
      </div></header>
      <div className="admin-project-table" role="table" aria-label="Danh sách dự án">
        <div className="admin-project-row admin-project-row-head" role="row"><span>Dự án</span><span>Khu vực</span><span>Loại hình</span><span>Quỹ căn</span><span>Trạng thái</span><span/></div>
        {filteredProjects.slice(0,7).map(project=><div className="admin-project-row" role="row" key={project.id}>
          <Link href="/admin/quan-ly-du-an" className="admin-project-name"><span className="admin-table-thumb"><Image src={project.image} alt="" fill sizes="58px" unoptimized/></span><b>{project.name}</b><ChevronRight size={15}/></Link>
          <span><MapPin size={14}/>{project.region}</span>
          <span>{project.category==='high'?<Building2 size={15}/>:<House size={15}/>} {project.category==='high'?'Cao tầng':'Thấp tầng'}</span>
          <strong>{(unitCounts.get(project.id)||0).toLocaleString('vi-VN')} căn</strong>
          <em><i/>{project.status}</em>
          <Link href="/admin/quan-ly-du-an" aria-label={`Quản lý ${project.name}`}><ArrowUpRight size={17}/></Link>
        </div>)}
        {!filteredProjects.length?<div className="admin-table-empty">Không tìm thấy dự án phù hợp với bộ lọc.</div>:null}
      </div>
      {notifications.length>0?<footer className="admin-dashboard-activity"><span><i/>Cập nhật gần nhất</span><b>{notifications[0].data.title}</b><time>{new Date(notifications[0].data.at).toLocaleString('vi-VN')}</time></footer>:null}
    </section>
  </div>;
}
