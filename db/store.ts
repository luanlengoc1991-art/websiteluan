import {DatabaseSync, type SQLInputValue} from 'node:sqlite';
import {mkdirSync,readFileSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';

export function dataDirectory(){return resolve(process.env.ALPHA_DATA_DIR||'./data');}
const globalDb=globalThis as typeof globalThis & {alphaDb?:DatabaseSync;alphaDbPath?:string};
export function sqlite(){
 const path=join(dataDirectory(),'alpha-hub.sqlite');
 if(globalDb.alphaDb&&globalDb.alphaDbPath===path)return globalDb.alphaDb;
 mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS records(owner TEXT NOT NULL,kind TEXT NOT NULL,id TEXT NOT NULL,payload TEXT NOT NULL,updated INTEGER NOT NULL,PRIMARY KEY(owner,kind,id));
 CREATE TABLE IF NOT EXISTS reservations(id TEXT PRIMARY KEY,owner TEXT NOT NULL,unit_id TEXT NOT NULL,customer_id TEXT NOT NULL,note TEXT NOT NULL,status TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS idx_reservations_owner_unit ON reservations(owner,unit_id,status);
 CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,owner TEXT NOT NULL,project_id TEXT NOT NULL,kind TEXT NOT NULL,name TEXT NOT NULL,mime TEXT NOT NULL,object_key TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS idx_files_owner ON files(owner);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,owner TEXT NOT NULL,email TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS login_limits(id TEXT PRIMARY KEY,attempts INTEGER NOT NULL,reset_at INTEGER NOT NULL);`);
 globalDb.alphaDb=db;globalDb.alphaDbPath=path;return db;
}
class Statement{
 constructor(private sql:string,private values:SQLInputValue[]=[] ){}
 bind(...values:SQLInputValue[]){return new Statement(this.sql,values);}
 async all<T=Record<string,unknown>>(){return {results:sqlite().prepare(this.sql).all(...this.values) as T[]};}
 async first<T=Record<string,unknown>>(){return (sqlite().prepare(this.sql).get(...this.values)||null) as T|null;}
 execute(){const r=sqlite().prepare(this.sql).run(...this.values);return {success:true,meta:{changes:Number(r.changes)}};}
 async run(){return this.execute();}
}
export function database(){return {prepare:(sql:string)=>new Statement(sql),async batch(statements:Statement[]){const db=sqlite();db.exec('BEGIN IMMEDIATE');try{const out=statements.map(s=>s.execute());db.exec('COMMIT');return out;}catch(error){db.exec('ROLLBACK');throw error;}}};}
function objectPath(key:string){const root=join(dataDirectory(),'uploads');const target=resolve(root,key);if(!target.startsWith(root+sep))throw Error('Invalid file path');return target;}
export function bucket(){return {
 async put(key:string,data:ArrayBuffer,_options?:unknown){const path=objectPath(key);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,Buffer.from(data));},
 async get(key:string){const path=objectPath(key);return existsSync(path)?{body:new Uint8Array(readFileSync(path))}:null;},
 async delete(key:string){const path=objectPath(key);if(existsSync(path))unlinkSync(path);}
};}
