// Public presentation only. Never interpret advisor fields as HTML or URLs.
export function renderPlannerBrand(document,profile){
 const logo=document.getElementById('professional-wizard-brand-logo');
 const details=document.getElementById('professional-advisor-details');
 logo.src='../assets/original/bc1q21-logo.png';logo.alt='bc1q21 logo';logo.hidden=false;
 details.replaceChildren();details.hidden=true;
 if(typeof profile?.business!=='string'||!profile.business.trim())return;
 const name=profile.business.trim().slice(0,100);
 const title=document.createElement('strong');title.textContent=name;details.append(title);
 for(const key of ['contact','address','email','phone']){
  if(typeof profile[key]==='string'&&profile[key].trim()){
   const line=document.createElement('div');line.textContent=profile[key].trim().slice(0,200);details.append(line);
  }
 }
 details.hidden=false;
 if(typeof profile.logoData==='string'&&profile.logoData.length<400000&&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(profile.logoData)){
  logo.src=profile.logoData;logo.alt=name+' logo';
 }else{logo.hidden=true;}
}
