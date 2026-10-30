const R="document.getElementById('v28-native').shadowRoot";
module.exports=[{js:"openExam('2017-1','read');''",wait:900},{click:'[data-k="1:5"] .sn',wait:500},{js:"!!document.querySelector('.g36-how')"},
{js:"show('sent');''",wait:700},{js:"!!document.querySelector('.ls36-chunks')"},{js:"document.querySelector('[data-grp=sent] [data-sub=tails]').click();document.querySelectorAll('.ls42-sum').length"},
{js:"show('vocab');render();''",wait:2500},
{js:`(()=>{const r=${R};r.querySelector('[data-action=home-screen]').click();const n=r.querySelectorAll('.vl-row').length;r.querySelectorAll('[data-action=screen-grade][data-grade=forgot]')[0]?.click();r.querySelector('.tb42-back').click();r.querySelector('[data-action=home-cards]').click();r.querySelector('[data-action=flip]').click();const tabs=r.querySelectorAll('.t41-tab').length,yd=r.querySelectorAll('.yd46').length;r.querySelector('.tb42-back').click();r.querySelector('[data-action=library]').click();return [n,tabs,yd,r.querySelectorAll('.vl-library-items > details').length].join(',')})()`,wait:800},
{js:"show('home');render();show('sheet');renderSheet();show('history');render();'ok'",wait:500}]
