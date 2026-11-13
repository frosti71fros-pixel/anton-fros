/*
  Съём раскладки кейса с Behance или Dprofile.
  Как пользоваться: открыть страницу кейса в Chrome, F12 → Console, вставить весь файл, Enter.
  Скрипт прокрутит страницу, соберёт картинки, видео и тексты по порядку,
  сгруппирует картинки, стоящие на одной высоте, в ряды и выведет JSON.
  Формат результата:
    {i:"url"}                         — картинка во всю ширину
    {r:[["url", доляШирины], ...]}    — ряд картинок (сетка)
    {v:"url"}                         — видео (iframe)
    {t:"текст"}                       — текстовый блок (Dprofile)
*/
(async()=>{
  for(let i=0;i<30;i++){window.scrollBy(0,1500);await new Promise(r=>setTimeout(r,200));}
  window.scrollTo(0,0);await new Promise(r=>setTimeout(r,400));
  const isB=location.host.includes('behance');
  let els=isB
    ?[...document.querySelectorAll('img[src*="project_modules"],img[srcset*="project_modules"],iframe[src]')]
    :[...document.querySelectorAll('img.image-module__image,[class^="text-module"],[class*=" text-module"],iframe,video')];
  els=els.filter(e=>{
    if(e.tagName==='IFRAME')return /youtube|vimeo|kinescope|adobe/.test(e.src);
    if(e.tagName==='IMG'||e.tagName==='VIDEO')return true;
    return !e.parentElement.closest('[class*="text-module"]');
  });
  const bx=e=>{let n=e;while(n&&n.getBoundingClientRect().width<2)n=n.parentElement;return n.getBoundingClientRect()};
  const items=els.map(e=>{const r=bx(e);let k,v;
    if(e.tagName==='IMG'){k='i';v=e.srcset?e.srcset.split(',').map(x=>x.trim().split(' ')[0]).pop():(e.currentSrc||e.src)}
    else if(e.tagName==='IFRAME'||e.tagName==='VIDEO'){k='v';v=e.src||e.querySelector('source')?.src}
    else{k='t';v=e.innerText.trim()}
    return {k,v,top:Math.round(r.top+scrollY),left:r.left,w:r.width}}).filter(x=>x.v&&x.w>40);
  items.sort((a,b)=>a.top-b.top||a.left-b.left);
  const cw=Math.max(...items.filter(x=>x.k==='i').map(x=>x.w));const seen=new Set();const out=[];
  for(const it of items){if(seen.has(it.v))continue;seen.add(it.v);
    if(it.k!=='i'){out.push(it.k==='t'?{t:it.v}:{v:it.v});continue}
    const last=out[out.length-1];
    if(last&&last.r&&Math.abs(last._top-it.top)<6){last.r.push([it.v,+(it.w/cw).toFixed(3)]);continue}
    if(it.w<cw*.92){out.push({r:[[it.v,+(it.w/cw).toFixed(3)]],_top:it.top});continue}
    out.push({i:it.v});}
  const fin=out.map(b=>{if(b.r){if(b.r.length===1&&b.r[0][1]>.8)return {i:b.r[0][0]};return {r:b.r}}return b});
  console.log(JSON.stringify(fin));
  console.log(fin.map(b=>b.r?'R'+b.r.length:b.i?'I':b.v?'V':'T').join(' '));
})();
