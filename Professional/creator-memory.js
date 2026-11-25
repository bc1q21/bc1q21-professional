// Temporary RAM only. This is not Web Storage and never serializes to a URL.
(()=>{
 if(window.parent===window&&location.pathname.endsWith('jade-signing-workspace.html')&&location.hash.startsWith('#recipient-claim-'))return;
 if(window.parent===window){location.replace(new URL('./creator.html',document.currentScript.src).href);return;}
 const session=window.parent.bc1q21CreatorSession;
 if(!session)throw Error('Start the creator wizard at creator.html');
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
 window.bc1q21BrowserCreator=true;
 window.creatorSession=session;
 window.creatorMemory={
  get length(){return session.values.size;},key:i=>Array.from(session.values.keys())[i]??null,
  getItem:key=>session.values.get(key)??null,
  setItem(key,value){if(key==='bc1q21-professional-approved-plan-preview'&&session.values.get(key)!==String(value)){session.revision++;session.workflow={};}session.values.set(key,String(value));},
  removeItem(key){if(key==='bc1q21-professional-approved-plan-preview'&&session.values.has(key)){session.revision++;session.workflow={};}session.values.delete(key);},
 };
})();
