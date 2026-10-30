// 冻结区回归测试：node build/test/freeze.js  （全部 PASS 才能交付）
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const HTML='file://'+path.join(__dirname,'..','..','index.html');
const REC=path.join(__dirname,'..','..','records','attempts.json');
const R="document.getElementById('v28-native').shadowRoot";
const checks=[
 ['精读拆解：主句/从句/修饰顺序，译文在最后',`openExam('2017-1','read');document.querySelector('[data-k="1:2"] .sn').click();const h=[...document.querySelectorAll('.g36-flow h5')].map(x=>x.textContent).join('|');const last=document.querySelector('.g36')?.lastElementChild?.className;/主句怎样成立/.test(h)&&/从句/.test(h)&&/修饰/.test(h)&&last==='g36-cn'`],
 ['原句上不标主谓宾小字',`document.querySelectorAll('.g36-sent rt').length===0`],
 ['主干讲解存在',`!!document.querySelector('.g36-how')`],
 ['修饰可点并标黄',`document.querySelector('.g36-mod')?.click();document.querySelectorAll('.g36-t.hl').length>0`],
 ['精读无划短语/看题目按钮',`getComputedStyle(document.getElementById('tg-ph')).display==='none'&&getComputedStyle(document.getElementById('tg-q')).display==='none'`],
 ['2017 题目有译文、错因非模板',`Object.keys(QTR['2017-1']).length===5&&!JSON.stringify(QCHOICE['2017-1']).includes('定位句真正支持的是')`],
 ['长难句 Tab 不全屏、三步',`show('sent');!document.body.classList.contains('sr27-active')&&document.querySelectorAll('.ls36-steps button').length===3&&getComputedStyle(document.querySelector('body>.top')).display!=='none'`],
 ['长难句列表有完成状态',`document.querySelectorAll('.ls36-item .st').length>0`],
 ['生词首页',`show('vocab');true`,1500],
 ['生词首页三入口',`const r=${R};r.querySelector('#vocab-flow-lab').dataset.stage==='home39'&&r.querySelectorAll('.h41-entry').length===3`],
 ['筛词默认 10 个一组列表、无有道',`const r=${R};r.querySelector('[data-action=home-screen]').click();r.querySelectorAll('.vl-row').length===10&&r.querySelectorAll('.yd44').length===0`],
 ['顶栏统一：返回按钮+搜词+今日计时',`const r=${R};!!r.querySelector('.tb42-back')&&!!r.querySelector('.s44')&&/今天/.test(r.querySelector('.tb42-time').textContent)`],
 ['单词卡：释义固定、7 个分页、有道在分页栏、上一个下一个',`const r=${R};r.querySelector('[data-action=screen-grade][data-grade=forgot]').click();r.querySelector('.tb42-back').click();r.querySelector('[data-action=home-cards]').click();r.querySelector('[data-action=flip]').click();!!r.querySelector('.m47')&&r.querySelectorAll('.t41-tab').length===7&&!!r.querySelector('.t41-bar .yd46')&&!!r.querySelector('[data-action=prev42]')&&!!r.querySelector('[data-action=next42]')&&!r.querySelector('.vl-under')`],
 ['不自动上传',`return (async()=>{let puts=0;const f=window.fetch;window.fetch=function(u,o){if(o&&o.method==='PUT')puts++;return f.apply(this,arguments)};localStorage.setItem('gh_token','x');await ghPush();localStorage.removeItem('gh_token');return puts===0;})()`],
];
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1280,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/api.github.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:Buffer.from(fs.readFileSync(REC)).toString('base64'),sha:'x'})}));
 await p.goto(HTML);await p.waitForTimeout(2500);let fail=0;
 for(const [name,code,wait] of checks){let ok=false;try{ok=await p.evaluate(`(()=>{${code.includes('return')?code:(code.includes(';')?code.replace(/;([^;]*)$/,';return $1'):'return '+code)}})()`);if(ok&&ok.then)ok=await ok;}catch(e){ok='ERR '+e.message.slice(0,80);}console.log(ok===true?'PASS':'FAIL',name,ok===true?'':ok);if(ok!==true)fail++;await p.waitForTimeout(wait||400);}
 if(errs.length){console.log('PAGE ERRORS:',errs.slice(0,5));fail++;}
 await b.close();console.log(fail?`\n${fail} 项未通过——不要交付`:'\n全部通过');process.exit(fail?1:0);})();
