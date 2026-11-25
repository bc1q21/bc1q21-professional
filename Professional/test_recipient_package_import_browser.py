from pathlib import Path
import subprocess,json,unittest,os,re,importlib.util
from urllib.parse import quote
from playwright.sync_api import sync_playwright

class RecipientPackageImportBrowserTests(unittest.TestCase):
 def test_static_preview_includes_recipient_dependencies(self):
  root=Path(__file__).resolve().parent
  spec=importlib.util.spec_from_file_location('preview_packager',root/'package-local-preview.py')
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  page='recipient-gift-specific-prototype.html'
  self.assertIn(page,module.FILES)
  for ref in re.findall(r'<(?:script|img)[^>]+(?:src)="([^\"]+)"',(root/page).read_text()):
   normalized=ref.removeprefix('./')
   self.assertIn(normalized,module.FILES)
   self.assertTrue((root/normalized).is_file())
 def test_import_funding_and_unsigned_claim_recovery(self):
  ROOT=Path(__file__).resolve().parent.parent
  source=(ROOT/'Professional/creator-plan-funding.test.mjs').read_text()
  js=source[:source.index('function fixture(')].replace("from './","from './Professional/")
  for name in ['function fixture(', 'async function signingFixture(', 'async function preflightFixture(', 'async function broadcastFixture(', 'async function recipientPackageFixture(', 'async function recipientImportFixture(', 'async function recipientFundingFixture(', 'async function recipientClaimFixture(']:
   start=source.index(name);end=source.index('\ntest(',start);js+=source[start:end]+'\n'
  js+='''
  const f=fixture(),x=await recipientClaimFixture(f),request={...x.pins,package:x.imports.recover(x.pins).package};
  x.flags.mtp=x.manifest.releases[0].locktime;
  const {createInterface}=await import('node:readline');
  createInterface({input:process.stdin}).on('line',mode=>{x.flags.mode=mode==='mature'?'confirmed':mode;if(mode==='mature')x.flags.mtp=x.manifest.releases.at(-1).locktime+1;console.log('mode-ready');});
  const server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),rpc:x.rpc,recipientClaimPins:[x.pin],recipientClaimTokenSha256:createHash('sha256').update('h'.repeat(64)).digest('hex')});
  server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({origin:'http://127.0.0.1:'+server.address().port,request,registration:f.registration})));
  process.on('SIGTERM',()=>server.close(()=>{f.close();process.exit(0);}));
  '''
  # Resolve only already-installed browser integration dependencies; never install.
  loader="import {registerHooks,createRequire} from 'node:module';\nimport {pathToFileURL} from 'node:url';\nconst require=createRequire(process.cwd()+'/Professional/browser-integration/package.json');\nregisterHooks({resolve(specifier,context,next){\n try {return next(specifier,context);}\n catch(error){\n  if(error.code!=='ERR_MODULE_NOT_FOUND'||specifier.startsWith('.')||specifier.startsWith('/')||specifier.includes(':'))throw error;\n  return {url:pathToFileURL(require.resolve(specifier)).href,shortCircuit:true};\n }\n}});\n"
  p=subprocess.Popen(['node','--import','data:text/javascript,'+quote(loader),'--input-type=module','-e',js],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,cwd=ROOT)
  try:
   line=p.stdout.readline()
   if not line:raise RuntimeError(p.stderr.read())
   data=json.loads(line);request=data['request']
   with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=os.environ.get('BC1Q21_TEST_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);page=b.new_page();page.clock.install();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    review_mode={'open':False}
    page.on('dialog',lambda d:(d.dismiss() if d.message.startswith('Acknowledge exact claim') and not review_mode['open'] else d.accept()) if d.type=='confirm' else d.accept('h'*64 if 'claim-preparation access token' in d.message else json.dumps(data['registration']) if 'PUBLIC wallet registration' in d.message else json.dumps(request['recipientPin'])))
    page.goto(data['origin']+'/recipient-gift-specific-prototype.html');page.wait_for_timeout(300)
    page.locator('#completeHandoffFile').set_input_files({'name':'recipient.json','mimeType':'application/json','buffer':json.dumps(request['package']).encode()})
    page.locator('#completeHandoffDigest').fill(request['expectedDigest']);page.locator('#verifyCompleteHandoff').click()
    page.wait_for_function('() => document.querySelector("#completeHandoffStatus").textContent.startsWith("PACKAGE IMPORTED")')
    page.wait_for_function('() => document.querySelector("#utxoEvidenceStatus").textContent.includes("2 confirmations")')
    assert 'IMMATURE' in page.locator('#giftScheduleRows').inner_text()
    assert page.locator('#giftScheduleRows tr').count()==2
    assert '20001 sats' in page.locator('#giftScheduleRows').inner_text()
    assert page.locator('#sign').is_disabled() and page.locator('#showUnsignedQr').is_disabled() and page.locator('#startCamera').is_disabled()
    page.locator('#selectedRelease').select_option('2');assert 'disabled' in page.locator('#selectedReleaseStatus').inner_text()
    page.reload();page.wait_for_function('() => document.querySelector("#completeHandoffStatus").textContent.startsWith("PACKAGE IMPORTED")')
    p.stdin.write('offline\n');p.stdin.flush();assert p.stdout.readline().strip()=='mode-ready'
    page.reload();page.wait_for_function('() => document.querySelector("#utxoEvidenceStatus").textContent.includes("UNAVAILABLE")')
    assert 'MATURE' not in page.locator('#giftScheduleRows').inner_text()
    p.stdin.write('mature\n');p.stdin.flush();assert p.stdout.readline().strip()=='mode-ready'
    page.reload();page.wait_for_function('() => document.querySelector("#utxoEvidenceStatus").textContent.includes("2 confirmations")')
    assert 'MATURE — CLAIM DISABLED' in page.locator('#giftScheduleRows').inner_text()
    assert page.locator('#sign').is_disabled()
    page.locator('#selectedRelease').select_option('1')
    page.wait_for_function('() => document.querySelector("#selectedReleaseStatus").textContent.startsWith("CLAIM PREPARED")')
    assert 'NOT SIGNED' in page.locator('#selectedReleaseStatus').inner_text()
    assert 'input 20001 sats' in page.locator('#selectedReleaseEvidence').inner_text()
    page.wait_for_function('() => document.querySelector("#message").textContent.includes("Review not acknowledged")')
    saved_claim=page.evaluate('localStorage.getItem("professional-recipient-import-v1-claim")')
    assert page.locator('#sign').is_disabled() and page.locator('#showUnsignedQr').is_disabled()
    page.reload();page.wait_for_function('() => document.querySelector("#utxoEvidenceStatus").textContent.includes("2 confirmations")')
    page.locator('#selectedRelease').select_option('1')
    page.wait_for_function('() => document.querySelector("#selectedReleaseStatus").textContent.includes("Recovered historical preparation")')
    page.wait_for_function('() => document.querySelector("#message").textContent.includes("Review not acknowledged")')
    assert page.locator('#sign').is_disabled()
    page.evaluate('localStorage.clear()');page.reload();page.locator('#completeHandoffDigest').fill(request['expectedDigest']);page.locator('#verifyCompleteHandoff').click()
    page.wait_for_function('() => document.querySelector("#completeHandoffStatus").textContent.startsWith("PACKAGE IMPORTED")')
    page.locator('#completeHandoffDigest').fill('00'*32);assert page.locator('#giftScheduleRows tr').count()==0
    page.locator('#verifyCompleteHandoff').click();page.wait_for_function('() => document.querySelector("#completeHandoffStatus").textContent.startsWith("Rejected import")')
    assert page.locator('#sign').is_disabled()
    page.evaluate('(d)=>{localStorage.setItem("professional-recipient-import-v1",JSON.stringify(d.pins));localStorage.setItem("professional-recipient-import-v1-claim",d.claim);sessionStorage.setItem("bc1q21-professional-coordinator-review","invalid stale creator binding");}',{'pins':{'expectedDigest':request['expectedDigest'],'recipientPin':request['recipientPin']},'claim':saved_claim})
    page.reload();page.wait_for_function('() => document.querySelector("#utxoEvidenceStatus").textContent.includes("2 confirmations")')
    review_mode['open']=True
    page.locator('#selectedRelease').select_option('1');page.wait_for_url('**/jade-signing-workspace.html#recipient-claim-review')
    page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("REVIEW AUTHORIZED")')
    details=page.locator('#transaction-review-details').inner_text()
    assert 'Input 20001 sats' in details and 'mining fee 398 sats' in details and '0.00019603 BTC' in details
    assert page.locator('#scan').is_disabled() and page.locator('#stop').is_disabled() and page.locator('#finish-gift').is_disabled()
    assert page.locator('#qr-panel').is_hidden() and page.locator('#verified-next').is_hidden()
    binding=page.evaluate('sessionStorage.getItem("bc1q21-professional-recipient-review")')
    page.reload();page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("REVIEW AUTHORIZED")')
    assert page.evaluate('sessionStorage.getItem("bc1q21-professional-recipient-review")')==binding
    page.clock.fast_forward(610000)
    assert 'expired' in page.locator('#status').inner_text()
    assert page.locator('#transaction-review').is_hidden() and page.locator('#scan').is_disabled()
    page.evaluate('sessionStorage.removeItem("bc1q21-professional-recipient-review")');page.reload()
    page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("Recipient review unavailable")')
    assert page.locator('#scan').is_disabled() and page.locator('#qr-panel').is_hidden()
    assert not errors,errors
    b.close();print('PASS Chromium: import/funding, unsigned claim preparation and reload recovery, disabled signing/QR, storage-loss recovery and wrong-digest rejection; no page errors. Synthetic fixtures only.')
  finally:
   p.terminate();p.wait(timeout=10);p.stdin.close();p.stdout.close();p.stderr.close()

 def test_authorized_recipient_qr_camera_and_durable_signed_receipt(self):
  ROOT=Path(__file__).resolve().parent.parent
  source=(ROOT/'Professional/creator-plan-funding.test.mjs').read_text()
  js=source[:source.index('function fixture(')].replace("from './","from './Professional/")
  for name in ['function fixture(', 'async function signingFixture(', 'async function preflightFixture(', 'async function broadcastFixture(', 'async function recipientPackageFixture(', 'async function recipientImportFixture(', 'async function recipientFundingFixture(', 'async function recipientClaimFixture(', 'async function recipientReviewFixture(', 'async function recipientSigningFixture(']:
   start=source.index(name);end=source.index('\ntest(',start);js+=source[start:end]+'\n'
  js+="""
  const QRCode=(await import('qrcode')).default;
  const f=fixture(),x=await recipientSigningFixture(f),c=x.signing.checked(x.signingBinding);
  const signed=signDisposableRequest(join(f.dir,'disposable.json'),c.signingRequest,c.signingRequest.requestDigest).signedPsbtBase64;
  const psbt=bitcoin.Psbt.fromBase64(signed),parent=bitcoin.Transaction.fromBuffer(psbt.data.inputs[0].nonWitnessUtxo);parent.ins.forEach((_,i)=>parent.setWitness(i,[]));psbt.data.inputs[0].nonWitnessUtxo=parent.toBuffer();
  const frames=makeCryptoPsbtFrames(psbt.toBuffer()),images=await Promise.all(frames.map(frame=>QRCode.toDataURL(frame,{width:360,margin:2,errorCorrectionLevel:'L'})));
  const {createInterface}=await import('node:readline');createInterface({input:process.stdin}).on('line',mode=>{x.flags.mode=mode;console.log('mode-ready');});
  const server=createCreatorPlanService({databasePath:join(f.dir,'state.sqlite'),rpc:x.rpc,recipientClaimPins:[x.pin],recipientClaimTokenSha256:createHash('sha256').update('h'.repeat(64)).digest('hex'),enableRecipientSigningSessions:true,recipientArtifactDirectory:join(f.dir,'recipient-browser-private'),recipientRecoveryTokenSha256:createHash('sha256').update('j'.repeat(64)).digest('hex'),recipientSigningTokenSha256:createHash('sha256').update('i'.repeat(64)).digest('hex')});
  server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({origin:'http://127.0.0.1:'+server.address().port,binding:x.binding,pins:x.pins,claim:{claimId:x.prepared.claimId,packageDigest:x.prepared.packageDigest,releaseNumber:1},images,unsignedFrames:makeCryptoPsbtFrames(Buffer.from(x.prepared.unsignedPsbtBase64,'base64'))})));
  process.on('SIGTERM',()=>server.close(()=>{f.close();process.exit(0);}));
  """
  loader="import {registerHooks,createRequire} from 'node:module';\nimport {pathToFileURL} from 'node:url';\nconst require=createRequire(process.cwd()+'/Professional/browser-integration/package.json');\nregisterHooks({resolve(specifier,context,next){\n try {return next(specifier,context);}\n catch(error){\n  if(error.code!=='ERR_MODULE_NOT_FOUND'||specifier.startsWith('.')||specifier.startsWith('/')||specifier.includes(':'))throw error;\n  return {url:pathToFileURL(require.resolve(specifier)).href,shortCircuit:true};\n }\n}});\n"
  p=subprocess.Popen(['node','--import','data:text/javascript,'+quote(loader),'--input-type=module','-e',js],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,cwd=ROOT)
  try:
   line=p.stdout.readline()
   if not line:raise RuntimeError(p.stderr.read())
   data=json.loads(line)
   with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path=os.environ.get('BC1Q21_TEST_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.accept() if d.type=='confirm' else d.accept('i'*64 if 'SIGNING' in d.message else 'j'*64 if 'ARTIFACT RECOVERY' in d.message else data['pins']['expectedDigest'] if 'Independent expected recipient package' in d.message else json.dumps(data['pins']['recipientPin']) if 'Independent recipient public pin' in d.message else 'h'*64))
    page.add_init_script('const fixture='+json.dumps(data)+""";
     if(location.protocol==='http:'){
      if(!sessionStorage.getItem('bc1q21-professional-recipient-review'))sessionStorage.setItem('bc1q21-professional-recipient-review',JSON.stringify(fixture.binding));
      localStorage.setItem('professional-recipient-import-v1',JSON.stringify(fixture.pins));
      localStorage.setItem('professional-recipient-import-v1-claim',JSON.stringify(fixture.claim));
     }
     window.__cameraCalls=0;window.__cameraStopped=false;
     Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{
      window.__cameraCalls++;
      const images=await Promise.all(fixture.images.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;})));
      const canvas=document.createElement('canvas');canvas.width=480;canvas.height=480;const ctx=canvas.getContext('2d');let n=0;
      const draw=()=>{ctx.fillStyle='white';ctx.fillRect(0,0,480,480);ctx.drawImage(images[n++%images.length],60,60,360,360);};draw();const timer=setInterval(draw,180),stream=canvas.captureStream(12);
      stream.getTracks().forEach(track=>{const stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);window.__cameraStopped=true;stop();};});return stream;
     }}});
    """)
    page.goto(data['origin']+'/jade-signing-workspace.html#recipient-claim-review')
    page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("REVIEW AUTHORIZED")')
    assert page.locator('#qr-panel').is_hidden() and page.evaluate('window.__cameraCalls')==0
    assert page.locator('#scan').inner_text()=='Authorize recipient signing session'
    page.locator('#scan').click();page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("SIGNING AUTHORIZED")')
    assert page.locator('#qr-panel').is_visible() and page.evaluate('window.__cameraCalls')==0
    # Decode the actual displayed unsigned QR using an existing independent decoder.
    page.locator('#pause').click()
    page.add_script_tag(path=str(ROOT/'Professional/browser-integration/node_modules/jsqr/dist/jsQR.js'))
    decoded=page.evaluate("""async()=>{const img=document.querySelector('#qr');await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,c.width,c.height);return jsQR(d.data,d.width,d.height)?.data;}""")
    assert decoded and decoded.lower() in [f.lower() for f in data['unsignedFrames']]
    # Actual camera receiver decodes synthetic frames; no physical camera/device.
    page.locator('#scan').click();page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("CLAIM SIGNED — NOT BROADCAST")',timeout=60000)
    assert page.evaluate('window.__cameraCalls')==1 and page.evaluate('window.__cameraStopped')
    assert page.locator('#scan').is_disabled() and page.locator('#qr-panel').is_hidden() and page.locator('#finish-gift').is_disabled()
    assert '398 sats mining' in page.locator('#verification').inner_text()
    assert 'retained and cryptographically reverified' in page.locator('#verification').inner_text()
    assert 'rawTransactionHex' not in page.evaluate('JSON.stringify(localStorage)')
    p.stdin.write('offline\n');p.stdin.flush();assert p.stdout.readline().strip()=='mode-ready'
    page.reload();page.wait_for_function('() => document.querySelector("#status").textContent.startsWith("CLAIM SIGNED — NOT BROADCAST")')
    assert page.locator('#scan').is_disabled() and page.evaluate('window.__cameraCalls')==0
    locator=page.evaluate('(claimId)=>JSON.parse(localStorage.getItem("professional-recipient-signing-v1-"+claimId))',data['claim']['claimId'])
    # New context has genuinely empty browser storage, without initialization that restores locators.
    recovery=b.new_page();recovery.on('pageerror',lambda e:errors.append(str(e)))
    recovery.on('dialog',lambda d:d.accept('j'*64 if 'ARTIFACT RECOVERY' in d.message else data['pins']['expectedDigest'] if 'Independent expected recipient package' in d.message else json.dumps(data['pins']['recipientPin'])))
    recovery.goto(data['origin']+'/customer-walkthrough.html')
    assert recovery.evaluate('localStorage.length')==0 and recovery.evaluate('sessionStorage.length')==0
    recovery.goto(data['origin']+'/jade-signing-workspace.html#recipient-claim-recovery='+locator['sessionId'])
    recovery.wait_for_function('() => document.querySelector("#status").textContent.startsWith("CLAIM SIGNED — NOT BROADCAST")')
    assert recovery.locator('#scan').is_disabled() and recovery.locator('#qr-panel').is_hidden()
    assert 'retained and cryptographically reverified' in recovery.locator('#verification').inner_text()
    assert recovery.evaluate('(id)=>JSON.parse(localStorage.getItem("professional-recipient-signing-v1-"+id)).sessionId',data['claim']['claimId'])==locator['sessionId']
    recovery.close()
    page.goto(data['origin']+'/recipient-gift-specific-prototype.html')
    page.wait_for_function('() => document.querySelector("#completeHandoffStatus").textContent.startsWith("PACKAGE IMPORTED")')
    page.locator('#selectedRelease').select_option('1');page.wait_for_function('() => document.querySelector("#selectedReleaseStatus").textContent==="CLAIM SIGNED — NOT BROADCAST"')
    assert page.locator('#sign').is_disabled()
    assert not errors,errors
    b.close()
  finally:
   p.terminate();p.wait(timeout=10);p.stdin.close();p.stdout.close();p.stderr.close()

if __name__ == "__main__":
 unittest.main()
