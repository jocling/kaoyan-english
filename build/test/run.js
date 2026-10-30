const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:+process.argv[3]||1280,height:+process.argv[4]||1000}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.route('**/api.github.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:Buffer.from(fs.readFileSync(require('path').join(__dirname,'..','..','records','attempts.json'))).toString('base64'),sha:'x'})}));
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(2500);
const steps=require(process.argv[5]);
for(const st of steps){const f=st.frame?p.frames().find(f=>f!==p.mainFrame()):p;
 if(st.js){try{const r=await f.evaluate(st.js);if(st.save){require('fs').writeFileSync(st.save,typeof r==='string'?r:JSON.stringify(r));}else if(r!==undefined)console.log('JS→',typeof r==='string'?r.slice(0,4000):JSON.stringify(r).slice(0,4000));}catch(e){console.log('JSERR',e.message.slice(0,300))}}
 if(st.click){await f.click(st.click,{timeout:3000}).catch(e=>console.log('CLICKERR',st.click,e.message.slice(0,100)))}
 if(st.scroll){await p.mouse.move(st.scroll[0],st.scroll[1]);await p.mouse.wheel(0,st.scroll[2]);}
 await p.waitForTimeout(st.wait||600);
 if(st.shot)await p.screenshot({path:st.shot,fullPage:!!st.full});}
await b.close();})();
