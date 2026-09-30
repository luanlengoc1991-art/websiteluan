'use client';

import {useMemo,useState} from 'react';
import Image from 'next/image';
import {ArrowUpRight,Building2,CalendarDays,ChevronRight,Leaf,MapPin,MessageCircle,Pencil,Phone,Search,Sparkles} from 'lucide-react';
import Link from './site-link';
import {projectPath} from '@/lib/project-routes';
import type {Article,Project} from '@/lib/catalog';
import styles from './news-index.module.css';

type NewsIndexProps={
  articles:Article[];
  projects:Project[];
  phone?:string;
  canEdit:boolean;
  onEdit:(article:Article)=>void;
  onCreate:()=>void;
};

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
const formatDate=(value:string)=>new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(`${value}T00:00:00`));
const excerpt=(body:string,length=170)=>{const text=body.replace(/\s+/g,' ').trim();return text.length>length?`${text.slice(0,length).trim()}…`:text;};

function NewsImage({src,alt,priority=false}:{src:string;alt:string;priority?:boolean}){
  const [broken,setBroken]=useState(false);
  if(!src||broken)return <div className={styles.imageFallback}><Leaf size={34}/><span>{alt}</span></div>;
  return <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1200px) 66vw, 760px" priority={priority} unoptimized onError={()=>setBroken(true)}/>;
}

export default function NewsIndex({articles,projects,phone,canEdit,onEdit,onCreate}:NewsIndexProps){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const categories=useMemo(()=>Array.from(new Set(articles.map(article=>article.category).filter(Boolean))),[articles]);
  const filtered=useMemo(()=>articles.filter(article=>{
    const matchesCategory=category==='all'||article.category===category;
    const needle=normalize(query.trim());
    return matchesCategory&&(!needle||normalize(`${article.title} ${article.body} ${article.category}`).includes(needle));
  }).sort((a,b)=>b.date.localeCompare(a.date)),[articles,category,query]);
  const featured=filtered[0];
  const highlights=filtered.slice(1,4);
  const activeLabel=category==='all'?'Tin tức mới nhất':category;
  const cleanPhone=(phone||'0343977651').replace(/\s+/g,'');

  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.glowOne}/><div className={styles.glowTwo}/>
      <div className={styles.heroInner}>
        <span className={styles.heroEyebrow}><Sparkles size={15}/> ALPHA HUB JOURNAL</span>
        <h1>Tin tức &amp; Kiến thức</h1>
        <p>Cập nhật thông tin dự án, kinh nghiệm lựa chọn quỹ căn và góc nhìn thị trường bất động sản.</p>
        <nav className={styles.categories} aria-label="Chuyên mục tin tức">
          <button className={category==='all'?styles.categoryActive:''} onClick={()=>setCategory('all')}>Tổng hợp</button>
          {categories.map(item=><button className={category===item?styles.categoryActive:''} key={item} onClick={()=>setCategory(item)}>{item}</button>)}
        </nav>
      </div>
    </section>

    <section className={styles.newsStage}>
      <div className={styles.stageInner}>
        <div className={styles.contentColumn}>
          <div className={styles.sectionTitle}>
            <div><span>NỘI DUNG NỔI BẬT</span><h2>{activeLabel}</h2></div>
            <span className={styles.resultCount}>{filtered.length.toLocaleString('vi-VN')} bài viết</span>
          </div>

          {!featured?<div className={styles.empty}><Search size={34}/><h2>Không tìm thấy bài viết phù hợp</h2><p>Hãy thử từ khóa hoặc chuyên mục khác.</p></div>:<>
            <article className={styles.featuredCard}>
              <div className={styles.featuredCopy}>
                <span className={styles.badge}>{featured.category}</span>
                <h2><Link href={`/tin-tuc/${featured.id}`}>{featured.title}</Link></h2>
                <p>{excerpt(featured.body,210)}</p>
                <div className={styles.meta}><CalendarDays size={15}/>{formatDate(featured.date)}</div>
                <div className={styles.cardActions}>
                  <Link className={styles.readButton} href={`/tin-tuc/${featured.id}`}>Đọc bài viết <ArrowUpRight size={17}/></Link>
                  {canEdit?<button className={styles.editButton} onClick={()=>onEdit(featured)}><Pencil size={15}/>Chỉnh sửa</button>:null}
                </div>
              </div>
              <Link href={`/tin-tuc/${featured.id}`} className={styles.featuredMedia} aria-label={`Đọc ${featured.title}`}><NewsImage src={featured.image} alt={featured.title} priority/></Link>
            </article>

            {highlights.length?<div className={styles.highlightGrid}>{highlights.map(article=><article className={styles.highlightCard} key={article.id}>
              <Link href={`/tin-tuc/${article.id}`} className={styles.highlightMedia}><NewsImage src={article.image} alt={article.title}/></Link>
              <div><span>{article.category} · {formatDate(article.date)}</span><h3><Link href={`/tin-tuc/${article.id}`}>{article.title}</Link></h3>{canEdit?<button onClick={()=>onEdit(article)}><Pencil size={14}/> Sửa bài</button>:null}</div>
            </article>)}</div>:null}
          </>}
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.sideCard}>
            <span className={styles.sideLabel}>TÌM KIẾM</span><h2>Tìm bài viết</h2>
            <label className={styles.searchField}><Search size={19}/><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Nhập nội dung cần tìm" aria-label="Tìm kiếm bài viết"/></label>
          </section>
          <section className={`${styles.sideCard} ${styles.consultCard}`}>
            <span className={styles.sideLabel}>TƯ VẤN NHU CẦU</span><h2>Dự án bạn quan tâm</h2>
            <p>Khám phá thông tin và quỹ căn đang có trên Alpha HUB.</p>
            <div className={styles.projectLinks}>{projects.slice(0,4).map(project=><Link key={project.id} href={projectPath(project.id)}><Building2 size={16}/><span><b>{project.name}</b><small><MapPin size={11}/>{project.location}</small></span><ChevronRight size={16}/></Link>)}</div>
            <a className={styles.hotline} href={`tel:${cleanPhone}`}><Phone size={17}/>Gọi tư vấn {phone||'0343977651'}</a>
            <a className={styles.zalo} href="https://zalo.me/0343977651" target="_blank" rel="noreferrer"><MessageCircle size={17}/>Nhắn tin Zalo</a>
          </section>
          {canEdit?<button className={styles.createButton} onClick={onCreate}>Viết bài mới <ArrowUpRight size={17}/></button>:null}
        </aside>
      </div>
    </section>

    {filtered.length?<section className={styles.latestSection}>
      <div className={styles.latestInner}>
        <div className={styles.latestHeading}><div><span>KHÁM PHÁ THÊM</span><h2>Tất cả bài viết</h2></div><Leaf size={32}/></div>
        <div className={styles.articleGrid}>{filtered.map(article=><article className={styles.articleCard} key={article.id}>
          <Link className={styles.articleMedia} href={`/tin-tuc/${article.id}`}><NewsImage src={article.image} alt={article.title}/><span>{article.category}</span></Link>
          <div className={styles.articleCopy}><div className={styles.meta}><CalendarDays size={14}/>{formatDate(article.date)}</div><h3><Link href={`/tin-tuc/${article.id}`}>{article.title}</Link></h3><p>{excerpt(article.body,120)}</p><Link className={styles.textLink} href={`/tin-tuc/${article.id}`}>Đọc bài viết <ArrowUpRight size={15}/></Link></div>
        </article>)}</div>
      </div>
    </section>:null}
  </main>;
}
