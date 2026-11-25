// Same-origin static screens share this one temporary RAM session.
window.bc1q21CreatorSession={values:new Map(),workflow:{},revision:0};
window.addEventListener('pagehide',()=>{const s=window.bc1q21CreatorSession;s.values.clear();s.workflow={};s.revision++;});

window.addEventListener('pageshow',event=>{if(event.persisted)document.getElementById('creator-screen').src='./index.html';});
