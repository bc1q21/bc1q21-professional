// Memory-only navigation gate. No acceptance or customer data is stored or sent.
export function createDisclaimerGate(policy,{fetchDocument=globalThis.fetch,baseUrl=globalThis.location?.href}={}){
 let ready=false,accepted=false,version=null,generation=0;
 return Object.freeze({
  async prepare(){
   const current=++generation;ready=false;accepted=false;version=null;
   if(!policy?.pdfPath||!policy?.acceptanceText)throw Error('Professional disclaimer is not configured.');
   const url=new URL(policy.pdfPath,baseUrl);
   if(url.origin!==new URL(baseUrl).origin)throw Error('Professional disclaimer must be hosted with this application.');
   const response=await fetchDocument(url.href,{credentials:'same-origin',cache:'no-store',redirect:'error'});
   if(!response.ok)throw Error('Unable to load the Professional disclaimer. Reload this page to try again.');
   const bytes=new Uint8Array(await response.arrayBuffer());
   if(!response.headers.get('content-type')?.toLowerCase().includes('application/pdf')||
      new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('Professional disclaimer is not a valid PDF response.');
   const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
   const candidate=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
   if(current!==generation)return null;
   version=candidate;ready=true;
   return Object.freeze({version,url:url.href,acceptanceText:policy.acceptanceText});
  },
  setAcceptance(value){accepted=ready&&value?.version===version&&value?.checked===true;},
  canContinue(){return ready&&accepted;},
  state(){return Object.freeze({ready,accepted,version});}
 });
}
