// Local regtest plan acceptance only. No RPC, wallet, signing or submission.
import {DatabaseSync} from 'node:sqlite';
import {approveCreatorPlan} from './coordinator.mjs';
export class PlanRequestError extends Error {constructor(message,status=400){super(message);this.status=status;}}
export class CreatorPlanStore {
 constructor(path){
  this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS plans (id TEXT PRIMARY KEY, digest TEXT NOT NULL, plan TEXT NOT NULL, created TEXT NOT NULL)');
 }
 close(){this.db.close();}
 accept(body){
  if(!body||Object.keys(body).sort().join(',')!=='network,plan,requestId'||body.network!=='regtest'||typeof body.requestId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(body.requestId))throw new PlanRequestError('Invalid regtest plan request.');
  const p=body.plan;
  if(!p||p.format!=='bc1q21-professional-retail-plan-preview-v1'||p.status!=='UNFUNDED_PREVIEW_NOT_SIGNABLE'||['fundingAuthorized','signingAuthorized','broadcastAuthorized'].some(k=>p[k]!==false)||Object.keys(p).sort().join(',')!=='broadcastAuthorized,format,fundingAuthorized,releases,signingAuthorized,status,totalSats'||!Array.isArray(p.releases)||p.releases.some(r=>!r||Object.keys(r).sort().join(',')!=='amountSats,date'))throw new PlanRequestError('Only an approved public planning preview is accepted.');
  let approved;try{approved=approveCreatorPlan(p);}catch{throw new PlanRequestError('Invalid schedule or exact satoshi total.');}
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const old=this.db.prepare('SELECT digest FROM plans WHERE id=?').get(body.requestId);
   if(old&&old.digest!==approved.planDigest)throw new PlanRequestError('Request ID belongs to a different plan. Review the edited plan and use a new request.',409);
   if(!old)this.db.prepare('INSERT INTO plans VALUES (?,?,?,?)').run(body.requestId,approved.planDigest,JSON.stringify(approved.plan),new Date().toISOString());
   this.db.exec('COMMIT');
   return {status:old?'already-processed':'accepted',requestId:body.requestId,planDigest:approved.planDigest,network:'regtest',fundingAuthorized:false,signingAuthorized:false,broadcastAuthorized:false};
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
}
