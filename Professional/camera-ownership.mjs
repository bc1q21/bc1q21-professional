// One page-local webcam owner. No duration/inactivity timer and no wallet state.
export function cameraOwnership(){
 let turn=0,current=null,barrier=Promise.resolve();
 function stop(){turn++;current?.stop();current=null;}
 async function start(receiver){
  stop();current=receiver;const token=turn,previous=barrier;let release;
  barrier=new Promise(resolve=>{release=resolve;});
  try{await previous;if(token!==turn)return false;await receiver.start();return token===turn&&receiver.active;}
  catch(e){if(token!==turn)return false;stop();throw e;}
  finally{release();}
 }
 return {start,stop};
}
