// Preserve the existing recipient LAB workspace; the new creator never runs it.
if(!globalThis.bc1q21BrowserCreator&&location.hash.startsWith('#recipient-claim-')){
 const template=document.getElementById('legacy-lab-scripts');
 for(const original of template.content.querySelectorAll('script')){
  const script=document.createElement('script');for(const a of original.attributes)script.setAttribute(a.name,a.value);script.textContent=original.textContent;
  if(script.src||script.type==='module')await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject;document.body.append(script);});
  else document.body.append(script);
 }
}else await import('./creator-browser-jade.mjs');
