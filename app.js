'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORE = 'xacademy-powerbi-layout-studio-v1';
  const ELEMENT_TYPES = ['kpi','bar','line','donut','table','slicer','title','label','divider','nav'];
  const THEMES = {
    midnight: {name:'Midnight Teal',desc:'Executive · Premium',bg:'#0b1426',card:'#15263d',border:'#29405a',text:'#f1f9ff',muted:'#92adc0',accent:'#099999',glow:'#087c8c'},
    ocean: {name:'Ocean Intelligence',desc:'Deep teal · Editorial',bg:'#08252c',card:'#103b43',border:'#28575e',text:'#f2ffff',muted:'#9ac3c8',accent:'#27bfae',glow:'#17b9a3'},
    arctic: {name:'Arctic Canvas',desc:'Light · Minimal',bg:'#f0f5f9',card:'#ffffff',border:'#d5e3e9',text:'#1b3444',muted:'#637f8d',accent:'#099999',glow:'#a4ddd8'}
  };
  const TITLES = {kpi:'KPI Card',bar:'Column Chart',line:'Trend Line',donut:'Donut Chart',table:'Data Table',slicer:'Filter Slicer',title:'Page Title',label:'Text Label',divider:'Accent Divider',nav:'Page Navigation'};
  const ICONS = {
    kpi:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 15l4-5 3 3 3-4"/>',
    bar:'<rect x="4" y="13" width="4" height="7" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/>',
    line:'<path d="M3 18l6-7 4 3 7-9"/><path d="M16 5h4v4"/>',
    donut:'<path d="M12 3a9 9 0 1 1-9 9h9V3"/><path d="M4 8a9 9 0 0 1 6-5"/>',
    table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M10 4v16"/>',
    slicer:'<path d="M4 6h16M7 12h10M10 18h4"/><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>',
    title:'<path d="M4 6h16M12 6v14M8 20h8"/>',label:'<path d="M4 7h16M4 12h12M4 17h8"/>',
    divider:'<path d="M2 12h20"/>',nav:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M9 5v14M13 9h5M13 13h5"/>'
  };
  const clone = v => JSON.parse(JSON.stringify(v));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp = (n, low, high) => Math.max(low, Math.min(high, Number(n) || 0));
  const hexToRgb = hex => {const h=String(hex).replace('#',''); return {r:parseInt(h.slice(0,2),16)||0,g:parseInt(h.slice(2,4),16)||0,b:parseInt(h.slice(4,6),16)||0};};
  const rgba = (hex, a) => {const x=hexToRgb(hex);return `rgba(${x.r},${x.g},${x.b},${a})`;};
  const id = () => `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.kpi}</svg>`;
  const item = (type,x,y,w,h,title,value='',note='vs last period') => ({id:id(),type,x,y,w,h,title,value,note});
  const template = (which) => {
    const t = THEMES[which] || THEMES.midnight;
    const common={version:1,name:which==='arctic'?'Executive Snapshot':which==='ocean'?'Ocean Insights':'Sales Intelligence',width:1280,height:720,theme:which,colors:{accent:t.accent,bg:t.bg,card:t.card},radius:18,glow:65,grid:false,snap:true};
    return {...common,items:[
      item('title',44,35,660,57,which==='arctic'?'Executive Overview':'Sales Intelligence'),
      item('label',49,97,680,28,'PERFORMANCE AT A GLANCE  /  FY 2026'),
      item('nav',844,47,389,46,'Dashboard'),
      item('kpi',44,152,376,132,'Total Revenue','$4.82M','+12.8%'),
      item('kpi',451,152,376,132,'Active Customers','18,240','+8.4%'),
      item('kpi',858,152,376,132,'Growth Rate','25.1%','+3.2%'),
      item('bar',44,313,772,304,'Revenue by Month'),
      item('donut',845,313,389,304,'Revenue Mix'),
      item('divider',44,657,1190,5,''),
      item('label',45,664,750,21,'X ACADEMY  /  BUSINESS INTELLIGENCE')
    ]};
  };
  let state;
  try {const raw=localStorage.getItem(STORE);state=raw?validate(JSON.parse(raw)):template('midnight');} catch(e){state=template('midnight');}
  let selected=null, past=[],future=[],zoom=1,zoomMode='fit',pointer=null,focusBefore=null,saveTimer=0,exportBusy=false;
  function validate(source){
    if(!source || typeof source!=='object') throw Error('Invalid project');
    const width=clamp(source.width,320,7680),height=clamp(source.height,200,4320);
    const theme=THEMES[source.theme]?source.theme:'midnight',base=THEMES[theme];
    const items=Array.isArray(source.items)?source.items.slice(0,200).filter(i=>i&&ELEMENT_TYPES.includes(i.type)).map(i=>({
      id:String(i.id||id()).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,55)||id(),
      type:i.type,x:clamp(i.x,0,width),y:clamp(i.y,0,height),
      w:clamp(i.w,24,width),h:clamp(i.h,5,height),
      title:String(i.title||'').slice(0,100),value:String(i.value||'').slice(0,60),note:String(i.note||'').slice(0,80)
    })):template(theme).items;
    return {version:1,name:String(source.name||'Untitled Dashboard').slice(0,60),layoutId:String(source.layoutId||'').slice(0,90),width,height,theme,
      colors:{accent:validHex(source.colors?.accent,base.accent),bg:validHex(source.colors?.bg,base.bg),card:validHex(source.colors?.card,base.card)},
      radius:clamp(source.radius??18,0,38),glow:clamp(source.glow??65,0,100),grid:!!source.grid,snap:source.snap!==false,items};
  }
  function validHex(value,fallback){return /^#[0-9a-f]{6}$/i.test(String(value))?value:fallback;}
  function notify(message,error=false){
    const el=document.createElement('div');el.className=`toast${error?' error':''}`;el.textContent=message;$('#toastHost').append(el);
    setTimeout(()=>{el.remove();},3600);
  }
  function persist(){
    $('#saveStatus').textContent='Saving locally…';$('#saveDot').style.background='#e1bd69';
    clearTimeout(saveTimer);saveTimer=setTimeout(()=>{
      try{localStorage.setItem(STORE,JSON.stringify(state));$('#saveStatus').textContent='All changes saved';$('#saveDot').style.background='#2bd8b8';}
      catch(e){$('#saveStatus').textContent='Storage unavailable — export a project';$('#saveDot').style.background='#f0b65b';}
    },240);
  }
  function checkpoint(before){past.push(before||clone(state));if(past.length>65)past.shift();future=[];}
  function update(mutator,fit=false){checkpoint();mutator(state);refresh(fit);persist();}
  function undo(){if(!past.length)return;future.push(clone(state));state=past.pop();selected=state.items.some(i=>i.id===selected)?selected:null;refresh(true);persist();}
  function redo(){if(!future.length)return;past.push(clone(state));state=future.pop();selected=state.items.some(i=>i.id===selected)?selected:null;refresh(true);persist();}
  function activeTheme(){const preset=THEMES[state.theme];return {...preset,...state.colors,text:preset.text,muted:preset.muted,border:preset.border,glowColor:preset.glow};}
  function cardStyles(t){return `--stage-card:${t.card};--stage-border:${t.border};--stage-text:${t.text};--stage-subtext:${t.muted};--stage-accent:${t.accent};--card-radius:${state.radius}px`;}
  function chartSvg(type,accent){
    if(type==='bar'){
      const heights=[32,51,42,61,57,78,68,91,72,84,94,80];
      return `<svg viewBox="0 0 440 190" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bars" x1="0" x2="0" y1="0" y2="1"><stop stop-color="${accent}" stop-opacity=".96"/><stop offset="1" stop-color="${accent}" stop-opacity=".33"/></linearGradient></defs>${[0,1,2,3].map(j=>`<path d="M0 ${j*45+18}H440" stroke="currentColor" opacity=".09"/>`).join('')}${heights.map((h,j)=>`<rect x="${10+j*36}" y="${173-h*1.48}" width="22" height="${h*1.48}" rx="5" fill="${j===9?'#56ddd1':'url(#bars)'}" opacity="${j%3===0?.74:1}"/>`).join('')}</svg>`;
    }
    if(type==='line')return `<svg viewBox="0 0 440 190" preserveAspectRatio="none"><defs><linearGradient id="linefill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="${accent}" stop-opacity=".29"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs><path d="M2 145 L40 123 L82 134 L118 92 L160 108 L201 65 L249 87 L288 43 L329 58 L374 25 L437 18 L437 182 L2 182 Z" fill="url(#linefill)"/><path d="M2 145 L40 123 L82 134 L118 92 L160 108 L201 65 L249 87 L288 43 L329 58 L374 25 L437 18" fill="none" stroke="${accent}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>${[0,1,2,3].map(j=>`<path d="M0 ${j*45+18}H440" stroke="currentColor" opacity=".08"/>`).join('')}</svg>`;
    if(type==='donut')return `<svg viewBox="0 0 280 180" preserveAspectRatio="xMidYMid meet"><circle cx="116" cy="88" r="62" stroke="${accent}" stroke-width="30" fill="none" stroke-dasharray="208 390" transform="rotate(-90 116 88)"/><circle cx="116" cy="88" r="62" stroke="#426b96" stroke-width="30" fill="none" stroke-dasharray="112 390" stroke-dashoffset="-213" transform="rotate(-90 116 88)"/><circle cx="116" cy="88" r="62" stroke="#7855c2" stroke-width="30" fill="none" stroke-dasharray="58 390" stroke-dashoffset="-329" transform="rotate(-90 116 88)"/><text x="116" y="83" fill="currentColor" font-family="sans-serif" font-weight="800" font-size="28" text-anchor="middle">62%</text><text x="116" y="104" fill="currentColor" opacity=".6" font-family="sans-serif" font-size="10" text-anchor="middle">TOP SEGMENT</text><circle cx="220" cy="68" r="5" fill="${accent}"/><circle cx="220" cy="94" r="5" fill="#426b96"/><circle cx="220" cy="120" r="5" fill="#7855c2"/></svg>`;
    return '';
  }
  function elementMarkup(i,t){
    if(i.type==='title')return `<div class="design-title"><span class="title-accent"></span><strong>${esc(i.title)}</strong></div>`;
    if(i.type==='label')return `<div class="design-label">${esc(i.title)}</div>`;
    if(i.type==='divider')return '<div class="design-line"></div>';
    if(i.type==='nav')return `<div class="nav-pills${i.h>i.w?' vertical':''}"><span class="nav-pill active">Overview</span><span class="nav-pill">Analysis</span><span class="nav-pill">Details</span></div>`;
    const top=`<div class="visual-top"><span class="visual-title">${esc(i.title)}</span><span class="visual-menu">···</span></div>`;
    if(i.type==='kpi')return `<div class="visual-card">${top}<div class="kpi-value">${esc(i.value||'$4.82M')}</div><div class="kpi-footer"><span class="kpi-change">↗ ${esc(i.note||'+12.8%')}</span><span>vs previous period</span></div></div>`;
    if(['bar','line','donut'].includes(i.type))return `<div class="visual-card">${top}<div class="chart-mock">${chartSvg(i.type,t.accent)}</div></div>`;
    if(i.type==='table')return `<div class="visual-card">${top}<table class="table-mock"><tr><th>Category</th><th>Revenue</th><th>Growth</th></tr><tr><td>North</td><td>$1.52M</td><td>+15%</td></tr><tr><td>Central</td><td>$1.26M</td><td>+8%</td></tr><tr><td>South</td><td>$945K</td><td>+12%</td></tr></table></div>`;
    if(i.type==='slicer')return `<div class="visual-card">${top}<div class="slicer-pills"><span class="slicer-pill active">All</span><span class="slicer-pill">North</span><span class="slicer-pill">South</span></div></div>`;
    return '';
  }
  function paintStage(){
    const t=activeTheme(),stage=$('#stage');
    stage.style.width=`${state.width}px`;stage.style.height=`${state.height}px`;
    stage.style.backgroundColor=t.bg;
    stage.style.setProperty('--stage-glow',rgba(t.accent,.5));
    stage.style.setProperty('--glow-strength',String(state.glow/100));
    stage.style.setProperty('--stage-card',t.card);
    stage.style.setProperty('--stage-border',t.border);
    stage.style.setProperty('--stage-text',t.text);
    stage.style.setProperty('--stage-subtext',t.muted);
    stage.style.setProperty('--stage-accent',t.accent);
    stage.classList.toggle('show-grid',state.grid);
    stage.innerHTML=state.items.map(i=>`<div class="design-item${selected===i.id?' selected':''}" data-id="${esc(i.id)}" style="left:${i.x}px;top:${i.y}px;width:${i.w}px;height:${i.h}px;--card-radius:${state.radius}px;${cardStyles(t)}"><div class="item-body">${elementMarkup(i,t)}</div><div class="resize-handle" title="Resize visual"></div></div>`).join('');
    $('#elementCounter').textContent=`${state.items.length} ELEMENTS`;
    $('#canvasSizeTag').textContent=`${state.width} × ${state.height}`;
  }
  function renderTemplates(){
    $('#templateGrid').innerHTML=Object.entries(THEMES).map(([key,t])=>`<button type="button" class="template-card${state.theme===key?' active':''}" data-template="${key}" title="Apply ${esc(t.name)} layout"><div class="template-mini" style="color:${t.accent};background:${t.bg};border:1px solid ${t.border}"><div class="mock-head"></div><div class="mock-row"><i></i><i></i><i></i></div><div class="mock-graph"></div></div><span class="template-title">${key==='midnight'?'Midnight':key==='ocean'?'Ocean':'Arctic'}</span></button>`).join('');
    $('#themeOptions').innerHTML=Object.entries(THEMES).map(([key,t])=>`<button type="button" class="theme-option${state.theme===key?' active':''}" data-theme="${key}"><span class="theme-swatches"><i style="background:${t.bg}"></i><i style="background:${t.card}"></i><i style="background:${t.accent}"></i></span><span class="theme-meta"><strong>${esc(t.name)}</strong><small>${esc(t.desc)}</small></span><span class="theme-check">${state.theme===key?'✓':''}</span></button>`).join('');
  }
  function renderVisuals(){$('#visualGrid').innerHTML=ELEMENT_TYPES.map(type=>`<button class="visual-add" type="button" data-add="${type}" title="Add ${TITLES[type]}">${icon(type)}<span>${esc(TITLES[type])}</span></button>`).join('');}
  function renderLayers(){
    $('#layerCount').textContent=`${state.items.length} ITEMS`;
    $('#layersList').innerHTML=state.items.length?state.items.slice().reverse().map(i=>`<button type="button" class="layer-item${selected===i.id?' active':''}" data-select="${i.id}">${icon(i.type)}<span class="layer-name">${esc(i.title||TITLES[i.type])}</span><span class="layer-type">${esc(i.type)}</span></button>`).join(''):'<p class="empty-layers">Your canvas is empty. Add a visual from Build to get started.</p>';
  }
  function propField(label,key,val,type='text',extra=''){return `<label class="property-field"><span>${label}</span><input data-prop="${key}" type="${type}" value="${esc(val)}" ${extra}></label>`;}
  function renderInspector(){
    const target=state.items.find(i=>i.id===selected);
    if(!target){
      $('#inspector').innerHTML=`<div class="inspector-empty"><div class="inspector-empty-icon">⌗</div><h3>Every pixel, under control.</h3><p>Select any visual on your canvas to customize its content, exact position and dimensions.</p><button type="button" class="outline-action" data-action="select-first">Select first visual →</button></div><section class="inspector-section"><div class="inspector-title">POWER BI EXPORT</div><p class="prop-note">The exported layout uses exact pixel coordinates. Clean background exports never include sample chart values.</p></section>`;
      return;
    }
    const isCard=!['title','label','divider','nav'].includes(target.type),hasVal=target.type==='kpi';
    $('#inspector').innerHTML=`
      <section class="inspector-section"><div class="selected-header"><span class="inspector-title" style="margin:0">SELECTED ELEMENT</span><span class="selected-pill">${esc(TITLES[target.type])}</span></div><div style="margin-top:18px">${propField('Display title','title',target.title)}</div>${hasVal?propField('Preview value','value',target.value)+propField('Preview change','note',target.note):''}<p class="prop-note">Preview data is illustrative and is not included in clean background exports.</p></section>
      <section class="inspector-section"><div class="inspector-title">POSITION & SIZE <span style="float:right;color:#35b6ae">PX</span></div><div class="property-pair">${propField('X POSITION','x',target.x,'number','step="1"')}${propField('Y POSITION','y',target.y,'number','step="1"')}${propField('WIDTH','w',target.w,'number','min="24" step="1"')}${propField('HEIGHT','h',target.h,'number','min="5" step="1"')}</div><div class="inspector-operations"><button class="outline-action" type="button" data-action="center-h">↔ Center horizontally</button><button class="outline-action" type="button" data-action="center-v">↕ Center vertically</button></div></section>
      <section class="inspector-section"><div class="inspector-title">ARRANGE</div><div class="inspector-operations"><button class="outline-action" type="button" data-action="front">↑ Bring to front</button><button class="outline-action" type="button" data-action="back">↓ Send to back</button><button class="outline-action" type="button" data-action="duplicate">▣ Duplicate</button><button class="outline-action danger" type="button" data-action="delete">× Delete</button></div></section>
      <section class="inspector-section"><div class="inspector-title">VISUAL STYLE</div><p class="prop-note">${isCard?'This card inherits your theme colors and corner styling. Change Appearance for consistent results across the report.':'This element uses theme typography and your chosen accent color.'}</p><div class="swatch-inline">${[state.colors.accent,activeTheme().muted,state.colors.card].map((c,j)=>`<button type="button" style="background:${c}" data-swatch="${j}" title="Theme color"></button>`).join('')}</div></section>`;
  }
  function renderFields(){
    $('#projectName').value=state.name;
    $('#canvasWidth').value=state.width;$('#canvasHeight').value=state.height;
    const sizes=['1280x720','1920x1080','1600x900','3840x2160'];
    const key=`${state.width}x${state.height}`;
    $('#canvasPreset').value=sizes.includes(key)?key:'custom';
    $('#accentPicker').value=state.colors.accent;$('#backgroundPicker').value=state.colors.bg;$('#cardPicker').value=state.colors.card;
    $('#radiusSlider').value=state.radius;$('#glowSlider').value=state.glow;
    $('#radiusValue').textContent=`${state.radius} px`;$('#glowValue').textContent=`${state.glow}%`;
    $('#gridToggle').checked=state.grid;$('#snapToggle').checked=state.snap;
    $('#undoBtn').disabled=past.length===0;$('#redoBtn').disabled=future.length===0;
  }
  function fitScale(){
    const view=$('#canvasViewport');
    return Math.max(.08,Math.min((view.clientWidth-34)/state.width,(view.clientHeight-34)/state.height,1.4));
  }
  function applyScale(){
    if(zoomMode==='fit')zoom=fitScale();
    zoom=clamp(zoom,.08,3);
    const shell=$('#stageShell');
    shell.style.width=`${state.width*zoom}px`;
    shell.style.height=`${state.height*zoom}px`;
    $('#stage').style.transform=`scale(${zoom})`;
    $('#zoomLabel').textContent=`${Math.round(zoom*100)}%`;
  }
  function refresh(fit=false){paintStage();renderTemplates();renderLayers();renderInspector();renderFields();if(fit)zoomMode='fit';applyScale();}
  function select(elementId){selected=elementId;paintStage();renderInspector();renderLayers();}
  function addVisual(type){
    const specs={kpi:[340,132],bar:[570,290],line:[570,290],donut:[345,280],table:[570,270],slicer:[345,118],title:[590,58],label:[550,35],divider:[560,6],nav:[398,48]};
    const [w,h]=specs[type];const shift=(state.items.length*37)%220;
    const x=clamp(44+shift,0,Math.max(0,state.width-w)),y=clamp(150+shift,0,Math.max(0,state.height-h));
    const values={kpi:'$1.24M',title:'Your Dashboard Title',label:'SECTION OVERVIEW'};
    const newItem=item(type,x,y,w,h,type==='title'?'Your Dashboard Title':type==='label'?'SECTION OVERVIEW':TITLES[type],values[type]||'',type==='kpi'?'+12.8%':'');
    update(s=>s.items.push(newItem));select(newItem.id);notify(`${TITLES[type]} added — drag to position`);
  }
  function selectedAction(action){
    const index=state.items.findIndex(i=>i.id===selected);if(index<0)return;
    if(action==='delete'){update(s=>s.items.splice(index,1));selected=null;refresh();notify('Element removed');return;}
    if(action==='duplicate'){const source=state.items[index];const duplicate={...clone(source),id:id(),x:clamp(source.x+24,0,Math.max(0,state.width-source.w)),y:clamp(source.y+24,0,Math.max(0,state.height-source.h))};update(s=>s.items.push(duplicate));select(duplicate.id);return;}
    update(s=>{
      const i=s.items.findIndex(v=>v.id===selected),el=s.items[i];
      if(action==='center-h')el.x=Math.round((s.width-el.w)/2);
      if(action==='center-v')el.y=Math.round((s.height-el.h)/2);
      if(action==='front'){s.items.splice(i,1);s.items.push(el);}
      if(action==='back'){s.items.splice(i,1);s.items.unshift(el);}
    });
  }
  function resizeCanvas(w,h){
    w=clamp(w,320,7680);h=clamp(h,200,4320);
    update(s=>{const scaleX=w/s.width,scaleY=h/s.height;
      s.items.forEach(i=>{i.x=Math.round(i.x*scaleX);i.y=Math.round(i.y*scaleY);i.w=Math.round(i.w*scaleX);i.h=Math.round(i.h*scaleY);});
      s.width=w;s.height=h;
    },true);
  }
  function applyTemplate(which){update(s=>Object.assign(s,template(which)),true);selected=null;refresh();notify('Template applied — Ctrl+Z to undo');}
  function applyTheme(which){update(s=>{s.theme=which;const t=THEMES[which];s.colors={accent:t.accent,bg:t.bg,card:t.card};});notify('Color theme updated');}
  function switchTab(which){
    $$('.sidebar-tab').forEach(b=>b.classList.toggle('active',b.dataset.leftTab===which));
    $$('.tab-pane').forEach(p=>p.classList.toggle('active',p.id===`${which}Pane`));
  }
  function pointerDown(e){
    if(e.button!==0)return;
    const el=e.target.closest('.design-item');
    if(!el){select(null);return;}
    const target=state.items.find(i=>i.id===el.dataset.id);if(!target)return;
    const resize=!!e.target.closest('.resize-handle');
    select(target.id);
    pointer={id:target.id,resize,startX:e.clientX,startY:e.clientY,origin:{x:target.x,y:target.y,w:target.w,h:target.h},before:clone(state),changed:false};
    document.body.style.cursor=resize?'nwse-resize':'grabbing';
    e.preventDefault();
  }
  function pointerMove(e){
    if(!pointer)return;
    const i=state.items.find(v=>v.id===pointer.id);if(!i)return;
    const dx=(e.clientX-pointer.startX)/zoom,dy=(e.clientY-pointer.startY)/zoom;
    const snap=v=>state.snap?Math.round(v/8)*8:Math.round(v);
    if(pointer.resize){
      i.w=clamp(snap(pointer.origin.w+dx),Math.min(80,state.width),Math.max(80,state.width-i.x));
      i.h=clamp(snap(pointer.origin.h+dy),Math.min(32,state.height),Math.max(32,state.height-i.y));
    }else{
      i.x=clamp(snap(pointer.origin.x+dx),0,Math.max(0,state.width-i.w));
      i.y=clamp(snap(pointer.origin.y+dy),0,Math.max(0,state.height-i.h));
    }
    pointer.changed=pointer.changed||i.x!==pointer.origin.x||i.y!==pointer.origin.y||i.w!==pointer.origin.w||i.h!==pointer.origin.h;
    const node=$('.design-item.selected');
    if(node){node.style.left=`${i.x}px`;node.style.top=`${i.y}px`;node.style.width=`${i.w}px`;node.style.height=`${i.h}px`;}
    $$('#inspector [data-prop]').forEach(input=>{if(['x','y','w','h'].includes(input.dataset.prop))input.value=i[input.dataset.prop];});
  }
  function pointerUp(){if(!pointer)return;document.body.style.cursor='';if(pointer.changed){checkpoint(pointer.before);refresh();persist();}pointer=null;}
  function initEvents(){
    $('#templateGrid').addEventListener('click',e=>{const b=e.target.closest('[data-template]');if(b)applyTheme(b.dataset.template);});
    $('#visualGrid').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b)addVisual(b.dataset.add);});
    $('#themeOptions').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b)applyTheme(b.dataset.theme);});
    $('#layersList').addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(b)select(b.dataset.select);});
    $$('.sidebar-tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.leftTab)));
    $('#inspector').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='select-first')select(state.items[0]?.id||null);else selectedAction(b.dataset.action);});
    $('#inspector').addEventListener('focusin',e=>{if(e.target.matches('[data-prop]'))focusBefore=clone(state);});
    $('#inspector').addEventListener('input',e=>{
      const field=e.target.closest('[data-prop]');if(!field)return;const it=state.items.find(i=>i.id===selected);if(!it)return;
      const p=field.dataset.prop;
      if(['x','y','w','h'].includes(p)){
        const num=Number(field.value);
        if(!Number.isFinite(num))return;
        if(p==='x')it.x=clamp(num,0,Math.max(0,state.width-it.w));
        if(p==='y')it.y=clamp(num,0,Math.max(0,state.height-it.h));
        if(p==='w')it.w=clamp(num,24,Math.max(24,state.width-it.x));
        if(p==='h')it.h=clamp(num,5,Math.max(5,state.height-it.y));
      }else it[p]=field.value.slice(0,100);
      paintStage();
    });
    $('#inspector').addEventListener('change',e=>{if(!e.target.matches('[data-prop]'))return;if(focusBefore&&JSON.stringify(focusBefore)!==JSON.stringify(state)){checkpoint(focusBefore);persist();}focusBefore=null;refresh();});
    $('#stage').addEventListener('pointerdown',pointerDown);
    window.addEventListener('pointermove',pointerMove);
    window.addEventListener('pointerup',pointerUp);
    window.addEventListener('blur',pointerUp);
    $('#canvasPreset').addEventListener('change',e=>{if(e.target.value==='custom')return;const [w,h]=e.target.value.split('x').map(Number);resizeCanvas(w,h);});
    for(const idValue of ['canvasWidth','canvasHeight']){$(`#${idValue}`).addEventListener('change',()=>resizeCanvas(Number($('#canvasWidth').value),Number($('#canvasHeight').value)));}
    const bindColor=(input,key)=>$(`#${input}`).addEventListener('change',e=>update(s=>s.colors[key]=validHex(e.target.value,s.colors[key])));
    bindColor('accentPicker','accent');bindColor('backgroundPicker','bg');bindColor('cardPicker','card');
    $('#radiusSlider').addEventListener('change',e=>update(s=>s.radius=clamp(e.target.value,0,38)));
    $('#glowSlider').addEventListener('change',e=>update(s=>s.glow=clamp(e.target.value,0,100)));
    $('#radiusSlider').addEventListener('input',e=>$('#radiusValue').textContent=`${e.target.value} px`);
    $('#glowSlider').addEventListener('input',e=>$('#glowValue').textContent=`${e.target.value}%`);
    $('#gridToggle').addEventListener('change',e=>update(s=>s.grid=e.target.checked));
    $('#snapToggle').addEventListener('change',e=>update(s=>s.snap=e.target.checked));
    $('#projectName').addEventListener('change',e=>update(s=>s.name=e.target.value.trim().slice(0,60)||'Untitled Dashboard'));
    $('#undoBtn').addEventListener('click',undo);$('#redoBtn').addEventListener('click',redo);
    $('#fitBtn').addEventListener('click',()=>{zoomMode='fit';applyScale();});
    $('#zoomInBtn').addEventListener('click',()=>{zoomMode='manual';zoom+=.1;applyScale();});
    $('#zoomOutBtn').addEventListener('click',()=>{zoomMode='manual';zoom-=.1;applyScale();});
    $('#exportBtn').addEventListener('click',()=>openModal(true));$('#closeExport').addEventListener('click',()=>openModal(false));
    $('#exportModal').addEventListener('click',e=>{if(e.target===$('#exportModal'))openModal(false);const b=e.target.closest('[data-download]');if(b)exportFile(b.dataset.download);});
    $('#saveProjectBtn').addEventListener('click',()=>downloadJson(`${fileStem()}-project.json`,state));
    $('#importBtn').addEventListener('click',()=>$('#fileImport').click());
    $('#fileImport').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw Error('Project file exceeds 2 MB');const parsed=JSON.parse(await file.text());const clean=validate(parsed);update(s=>Object.assign(s,clean),true);selected=null;refresh(true);notify('Project restored successfully');}catch(error){notify(`Could not open project: ${error.message}`,true);}e.target.value='';});
    $('#mobileMenu').addEventListener('click',()=>$('#leftSidebar').classList.toggle('mobile-open'));
    $('#canvasArea').addEventListener('pointerdown',()=>$('#leftSidebar').classList.remove('mobile-open'));
    window.addEventListener('resize',()=>{if(zoomMode==='fit')applyScale();});
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(zoomMode==='fit')applyScale();}).observe($('#canvasViewport'));
    document.addEventListener('keydown',e=>{
      const typing=e.target.matches('input,textarea,select,[contenteditable=true]');
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
      else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
      else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();downloadJson(`${fileStem()}-project.json`,state);}
      else if(e.key==='Escape'){openModal(false);select(null);}
      else if(!typing&&(e.key==='Delete'||e.key==='Backspace')&&selected){e.preventDefault();selectedAction('delete');}
      else if(!typing&&selected&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
        e.preventDefault();update(s=>{const i=s.items.find(v=>v.id===selected);if(!i)return;const n=e.shiftKey?8:1;if(e.key==='ArrowUp')i.y=clamp(i.y-n,0,s.height-i.h);if(e.key==='ArrowDown')i.y=clamp(i.y+n,0,s.height-i.h);if(e.key==='ArrowLeft')i.x=clamp(i.x-n,0,s.width-i.w);if(e.key==='ArrowRight')i.x=clamp(i.x+n,0,s.width-i.w);});
      }
    });
  }
  function openModal(show){$('#exportModal').classList.toggle('open',show);$('#exportModal').setAttribute('aria-hidden',String(!show));}
  function fileStem(){return (state.name||'dashboard').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'dashboard';}
  function download(blob,name){
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function downloadJson(name,value){download(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),name);notify('Editable file downloaded');}
  function reportTheme(){
    const t=activeTheme();
    return {name:`X Academy - ${t.name}`,dataColors:[t.accent,'#3f8bc1','#8a6fd7','#e7aa5f','#36aa8a','#e57d89','#6f9fbc','#c5a4e7'],
      background:t.bg,foreground:t.text,tableAccent:t.accent,good:'#22b991',neutral:'#e0aa60',bad:'#e5717d',
      textClasses:{title:{fontFace:'Segoe UI',color:t.text},header:{fontFace:'Segoe UI',color:t.text},label:{fontFace:'Segoe UI',color:t.muted},callout:{fontFace:'Segoe UI',color:t.text}}};
  }
  function reportLayout(){
    return {format:'XAcademy-PowerBI-Layout-v1',project:state.name,canvas:{width:state.width,height:state.height,unit:'pixel'},note:'Visuals are layout guides. Import theme and background separately in Power BI; position the actual Power BI visuals using these pixel coordinates.',visuals:state.items.map((i,index)=>({order:index+1,id:i.id,type:i.type,title:i.title,x:i.x,y:i.y,width:i.w,height:i.h}))};
  }
  function rounded(ctx,x,y,w,h,r){
    r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();
    if(typeof ctx.roundRect==='function')ctx.roundRect(x,y,w,h,r);
    else{ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);}
    ctx.closePath();
  }
  function canvasColorFill(ctx,color,x,y,w,h,r){rounded(ctx,x,y,w,h,r);ctx.fillStyle=color;ctx.fill();}
  function canvasText(ctx,text,x,y,size,color,weight='600',maxWidth=9999){
    ctx.fillStyle=color;ctx.font=`${weight} ${size}px "Segoe UI",Arial,sans-serif`;
    ctx.textBaseline='top';ctx.fillText(String(text),x,y,maxWidth);
  }
  function drawImage(clean=false){
    const w=state.width,h=state.height,t=activeTheme(),canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas rendering is unsupported');
    const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,t.bg);gradient.addColorStop(1,t.bg);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    const drawGlow=(x,y,r,opacity)=>{
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(t.accent,opacity));g.addColorStop(1,rgba(t.accent,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
    };
    drawGlow(w*.9,h*.02,w*.54,state.glow/100*.21);drawGlow(w*.04,h*.99,w*.39,state.glow/100*.13);
    const scale=Math.max(.55,Math.min(1.5,w/1280));
    for(const i of state.items){
      const {x,y,w:ew,h:eh}=i,r=Math.min(state.radius,ew/3,eh/3);
      if(['kpi','bar','line','donut','table','slicer'].includes(i.type)){
        ctx.shadowColor=rgba('#000000',.15);ctx.shadowBlur=12*scale;ctx.shadowOffsetY=6*scale;
        canvasColorFill(ctx,t.card,x,y,ew,eh,r);ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
        rounded(ctx,x+.6,y+.6,ew-1.2,eh-1.2,r);ctx.lineWidth=1.2*scale;ctx.strokeStyle=t.border;ctx.stroke();
        if(clean)continue;
        const pad=Math.min(20*scale,ew*.09),fontSize=Math.max(10,16*scale);
        canvasText(ctx,i.title,x+pad,y+pad,fontSize,t.muted,'600',ew-pad*2);
        canvasText(ctx,'···',x+ew-pad-17*scale,y+pad,20*scale,t.muted);
        if(i.type==='kpi'){
          canvasText(ctx,i.value||'$1.24M',x+pad,y+eh*.41,Math.min(eh*.32,40*scale),t.text,'800',ew-pad*2);
          canvasColorFill(ctx,rgba('#22b991',.15),x+pad,y+eh-34*scale,69*scale,22*scale,5*scale);
          canvasText(ctx,`↗ ${i.note||'+12.8%'}`,x+pad+6*scale,y+eh-29*scale,11*scale,'#28c99c','700',65*scale);
        }
        if(i.type==='bar'||i.type==='line'){
          const left=x+pad,right=x+ew-pad,top=y+55*scale,bottom=y+eh-23*scale;
          if(bottom<=top)continue;
          ctx.strokeStyle=rgba(t.muted,.17);ctx.lineWidth=1*scale;
          for(let j=0;j<4;j++){const gy=top+(bottom-top)*j/3;ctx.beginPath();ctx.moveTo(left,gy);ctx.lineTo(right,gy);ctx.stroke();}
          if(i.type==='bar'){
            const values=[.33,.54,.49,.7,.63,.77,.66,.93,.78,.85,.92,.75],available=right-left,gap=available/values.length;
            values.forEach((v,j)=>{const height=v*(bottom-top);const g=ctx.createLinearGradient(0,bottom-height,0,bottom);g.addColorStop(0,j===9?'#53e1d3':t.accent);g.addColorStop(1,rgba(t.accent,.37));canvasColorFill(ctx,g,left+j*gap+gap*.18,bottom-height,gap*.62,height,4*scale);});
          }else{
            const values=[.29,.48,.4,.64,.57,.79,.69,.84,.73,.91,.89,1],span=bottom-top;
            ctx.beginPath();values.forEach((v,j)=>{const px=left+(right-left)*j/(values.length-1),py=bottom-v*span*.83;j?ctx.lineTo(px,py):ctx.moveTo(px,py);});
            ctx.strokeStyle=t.accent;ctx.lineWidth=4*scale;ctx.lineJoin='round';ctx.stroke();
          }
        }
        if(i.type==='donut'){
          const cx=x+ew*.46,cy=y+eh*.57,rr=Math.max(10,Math.min(ew*.27,eh*.27)),lw=rr*.42;
          const parts=[[.56,t.accent],[.30,'#497dae'],[.14,'#8b71c7']];let start=-Math.PI/2;
          parts.forEach(([f,color])=>{ctx.beginPath();ctx.arc(cx,cy,rr,start,start+Math.PI*2*f-.035);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();start+=Math.PI*2*f;});
          canvasText(ctx,'62%',cx-27*scale,cy-14*scale,26*scale,t.text,'800',65*scale);
        }
        if(i.type==='table'){
          const rows=[['Category','Revenue','Growth'],['North','$1.52M','+15%'],['Central','$1.26M','+8%'],['South','$945K','+12%']];
          rows.forEach((row,j)=>{const yy=y+56*scale+j*36*scale;if(yy+20*scale>y+eh)return;canvasText(ctx,row[0],x+pad,yy,12*scale,j? t.text:t.muted,'600',ew*.32);canvasText(ctx,row[1],x+ew*.43,yy,12*scale,j?t.text:t.muted,'600',ew*.23);canvasText(ctx,row[2],x+ew*.76,yy,12*scale,j?t.text:t.muted,'600',ew*.18);ctx.strokeStyle=t.border;ctx.beginPath();ctx.moveTo(x+pad,yy+26*scale);ctx.lineTo(x+ew-pad,yy+26*scale);ctx.stroke();});
        }
        if(i.type==='slicer'){
          ['All','North','South'].forEach((name,j)=>{const px=x+pad+j*85*scale,py=y+eh*.54;if(px+70*scale>x+ew)return;canvasColorFill(ctx,j?t.bg:t.accent,px,py,73*scale,30*scale,7*scale);canvasText(ctx,name,px+12*scale,py+8*scale,12*scale,j?t.muted:'#ffffff','600');});
        }
      }else if(i.type==='title'){
        canvasColorFill(ctx,t.accent,x,y+eh*.15,7*scale,eh*.7,4*scale);
        canvasText(ctx,i.title,x+22*scale,y+eh*.1,Math.min(eh*.65,42*scale),t.text,'800',ew-26*scale);
      }else if(i.type==='label'){
        canvasText(ctx,i.title,x,y+eh*.08,Math.min(18*scale,eh*.8),t.muted,'700',ew);
      }else if(i.type==='divider'){
        const g=ctx.createLinearGradient(x,y,x+ew,y);g.addColorStop(0,t.accent);g.addColorStop(1,rgba(t.accent,0));ctx.fillStyle=g;ctx.fillRect(x,y+eh/2,ew,Math.min(3*scale,eh));
      }else if(i.type==='nav'){
        if(eh>ew){
          canvasColorFill(ctx,t.card,x,y,ew,eh,Math.min(state.radius,17*scale));
          const labels=['Overview','Analysis','Details','Performance'];
          labels.forEach((text,j)=>{
            const px=x+16*scale,py=y+26*scale+j*62*scale,pw=Math.max(20,ew-32*scale),ph=39*scale;
            if(py+ph>y+eh)return;
            canvasColorFill(ctx,j===0?t.accent:t.bg,px,py,pw,ph,8*scale);
            if(!clean)canvasText(ctx,text,px+11*scale,py+12*scale,13*scale,j===0?'#ffffff':t.muted,'700',pw-14*scale);
          });
        }else{
          ['Overview','Analysis','Details'].forEach((text,j)=>{const pw=Math.min(112*scale,ew/3.2),gap=8*scale,px=x+j*(pw+gap),py=y;if(px+pw>x+ew)return;canvasColorFill(ctx,j?t.card:t.accent,px,py,pw,Math.min(eh,42*scale),8*scale);if(!clean)canvasText(ctx,text,px+12*scale,py+12*scale,12*scale,j?t.muted:'#ffffff','700',pw-12*scale);});
        }
      }
    }
    return canvas;
  }
  async function pngBlob(clean){const canvas=drawImage(clean);return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not render PNG')),'image/png'));}
  function jsonBlob(data){return new Blob([JSON.stringify(data,null,2)],{type:'application/json'});}
  function crc32(bytes){let crc=-1;for(const byte of bytes){crc^=byte;for(let j=0;j<8;j++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}return (crc^(-1))>>>0;}
  async function createZip(files){
    const local=[],central=[],encoder=new TextEncoder();let offset=0;const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),dosDate=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
    for(const [name,blob] of files){
      const nameBytes=encoder.encode(name),data=new Uint8Array(await blob.arrayBuffer()),crc=crc32(data);
      const h=new Uint8Array(30+nameBytes.length),v=new DataView(h.buffer);
      v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(8,0,true);v.setUint16(10,dosTime,true);v.setUint16(12,dosDate,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,nameBytes.length,true);h.set(nameBytes,30);local.push(h,data);
      const c=new Uint8Array(46+nameBytes.length),d=new DataView(c.buffer);
      d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(10,0,true);d.setUint16(12,dosTime,true);d.setUint16(14,dosDate,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,nameBytes.length,true);d.setUint32(42,offset,true);c.set(nameBytes,46);central.push(c);offset+=h.length+data.length;
    }
    const centralSize=central.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),view=new DataView(end.buffer);
    view.setUint32(0,0x06054b50,true);view.setUint16(8,files.length,true);view.setUint16(10,files.length,true);view.setUint32(12,centralSize,true);view.setUint32(16,offset,true);
    return new Blob([...local,...central,end],{type:'application/zip'});
  }
  async function exportFile(type){
    if(exportBusy)return;exportBusy=true;
    const buttons=$$('.export-item');buttons.forEach(b=>b.disabled=true);
    try{
      const stem=fileStem();
      if(type==='background'){download(await pngBlob(true),`${stem}-background.png`);}
      if(type==='preview'){download(await pngBlob(false),`${stem}-preview.png`);}
      if(type==='theme')download(jsonBlob(reportTheme()),`${stem}-powerbi-theme.json`);
      if(type==='layout')download(jsonBlob(reportLayout()),`${stem}-visual-layout.json`);
      if(type==='zip'){
        const readme=`X ACADEMY / POWER BI LAYOUT STUDIO\n\nPROJECT: ${state.name}\nCANVAS: ${state.width} x ${state.height} pixels\n\nFILES\nbackground.png - clean, sample-data-free decorative background for Power BI canvas\npreview.png - visual concept preview only; contains illustrative values\npowerbi-theme.json - import with Power BI Desktop > View > Themes > Browse for themes\nvisual-layout.json - exact pixel positions and dimensions for your visuals\nproject.json - restore and edit design with Open in Layout Studio\n\nUSING THE DESIGN\n1. In Power BI Desktop, match your report canvas to ${state.width} x ${state.height}.\n2. Apply background.png as the page wallpaper or page background and choose Image fit = Fit.\n3. Import powerbi-theme.json with Browse for themes.\n4. Use visual-layout.json coordinates to place your actual Power BI visuals.\n5. The background does not create or bind live data visuals. Sample chart values appear only in preview.png.\n\nMade with X Academy Layout Studio.\n`;
        const files=[['background.png',await pngBlob(true)],['preview.png',await pngBlob(false)],['powerbi-theme.json',jsonBlob(reportTheme())],['visual-layout.json',jsonBlob(reportLayout())],['project.json',jsonBlob(state)],['README.txt',new Blob([readme],{type:'text/plain'})]];
        download(await createZip(files),`${stem}-design-package.zip`);
      }
      notify('Export completed successfully');openModal(false);
    }catch(error){console.error(error);notify(`Export failed: ${error.message}`,true);}
    finally{exportBusy=false;buttons.forEach(b=>b.disabled=false);}
  }
  const library=window.LayoutStudioLibrary;
  const favKey='xacademy-layout-favorites-v1';
  const seenKey='xacademy-layout-gallery-2026-v1';
  const view={category:'All',search:'',page:'templates'};
  const quick={category:'Sales',kpis:3,charts:2,navigation:'top'};
  let favorites=[];
  try{const saved=JSON.parse(localStorage.getItem(favKey)||'[]');if(Array.isArray(saved))favorites=saved.filter(v=>typeof v==='string');}catch(e){favorites=[];}
  function selectGalleryPage(page){
    view.page=page==='builder'?'builder':'templates';
    document.querySelectorAll('.library-tab').forEach(b=>b.classList.toggle('active',b.dataset.galleryPage===view.page));
    $('#galleryTemplatesPage').classList.toggle('active',view.page==='templates');
    $('#galleryBuilderPage').classList.toggle('active',view.page==='builder');
    if(view.page==='builder')renderQuickPreview();
  }
  function openGallery(page='templates'){
    $('#layoutBackdrop').classList.add('open');
    $('#layoutBackdrop').setAttribute('aria-hidden','false');
    selectGalleryPage(page);
    if(page==='templates'){$('#gallerySearch').value=view.search;renderGallery();}
    else renderQuickPreview();
    try{localStorage.setItem(seenKey,'1');}catch(e){}
    $('#leftSidebar').classList.remove('mobile-open');
    setTimeout(()=>{if($('#layoutBackdrop').classList.contains('open'))(page==='templates'?$('#gallerySearch'):$('#quickCategory')).focus();},0);
  }
  function closeGallery(){
    $('#layoutBackdrop').classList.remove('open');
    $('#layoutBackdrop').setAttribute('aria-hidden','true');
  }
  function galleryEntries(){
    const q=view.search.trim().toLowerCase();
    return library.catalog.filter(record=>{
      if(view.category==='Favorites'&&!favorites.includes(record.id))return false;
      if(view.category!=='All'&&view.category!=='Favorites'&&record.category!==view.category)return false;
      if(!q)return true;
      return [record.name,record.category,record.description,record.density,record.form].join(' ').toLowerCase().includes(q);
    }).sort((a,b)=>Number(b.featured)-Number(a.featured));
  }
  function renderGallery(){
    $('#galleryCategories').innerHTML=['All','Favorites',...library.categories.map(c=>c.id)].map(category=>{
      const label=category==='All'?'All layouts':category==='Favorites'?'★ Saved':category;
      return `<button class="category-chip${view.category===category?' active':''}" type="button" data-category="${esc(category)}">${esc(label)}</button>`;
    }).join('');
    const entries=galleryEntries();
    $('#galleryCount').textContent=`${entries.length} ${entries.length===1?'layout':'layouts'} to explore`;
    $('#galleryGrid').innerHTML=entries.map(record=>{
      const favorite=favorites.includes(record.id);
      const tag=record.featured?'POPULAR':record.density.toUpperCase();
      return `<article class="layout-card">
        <div class="layout-card-tags"><span>${esc(record.category)}</span><span>${esc(tag)}</span></div>
        <button class="layout-preview-button" type="button" data-choose-layout="${esc(record.id)}" aria-label="Use ${esc(record.name)}">
          <div class="layout-card-preview">${library.thumbnail(record)}<div class="layout-card-sheen"></div><div class="layout-card-overlay"><b>Use this layout ↗</b></div></div>
        </button>
        <div class="layout-card-bottom">
          <div class="layout-card-meta"><strong>${esc(record.name)}</strong><small>${esc(record.description)}</small></div>
          <button class="favorite-button${favorite?' active':''}" type="button" data-favorite="${esc(record.id)}" title="${favorite?'Remove saved layout':'Save layout'}" aria-label="${favorite?'Remove saved layout':'Save layout'}">${favorite?'★':'☆'}</button>
        </div>
      </article>`;
    }).join('');
    $('#galleryEmpty').hidden=entries.length>0;
  }
  function chooseLayout(idValue){
    const selectedLayout=library.catalog.find(x=>x.id===idValue);
    if(!selectedLayout)return;
    update(s=>{
      s.items=library.createLayout(selectedLayout,s.width,s.height);
      s.name=selectedLayout.name.replace(' · ',' — ');
      s.layoutId=selectedLayout.id;
      s.theme=selectedLayout.theme;
      const t=THEMES[selectedLayout.theme];s.colors={accent:t.accent,bg:t.bg,card:t.card};
    },true);
    selected=null;refresh(true);closeGallery();
    notify(`${selectedLayout.shortName} applied — customize anything`);
  }
  function toggleFavorite(idValue){
    if(favorites.includes(idValue))favorites=favorites.filter(v=>v!==idValue);
    else favorites.push(idValue);
    try{localStorage.setItem(favKey,JSON.stringify(favorites));}catch(e){}
    renderGallery();
  }
  function renderQuickPreview(){
    const nodes=library.quickBuild({...quick,width:1280,height:720});
    const t=activeTheme();
    let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="${t.bg}"/><ellipse cx="1050" cy="5" rx="460" ry="270" fill="${t.accent}" opacity=".08"/>`;
    for(const n of nodes){
      const x=n.x,y=n.y,w=n.w,h=n.h;
      if(['kpi','bar','line','donut'].includes(n.type)){
        svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="15" fill="${t.card}" stroke="${t.border}" stroke-width="2"/>`;
        svg+=`<rect x="${x+17}" y="${y+17}" width="${Math.min(155,w*.52)}" height="10" rx="4" fill="${t.muted}" opacity=".58"/>`;
        if(n.type==='kpi'){svg+=`<rect x="${x+18}" y="${y+48}" width="${Math.min(w*.44,160)}" height="17" rx="5" fill="${t.text}" opacity=".83"/><rect x="${x+18}" y="${y+h-28}" width="75" height="11" rx="5" fill="${t.accent}" opacity=".6"/>`;}
        if(n.type==='bar')for(let i=0;i<8;i++){const v=[.3,.5,.42,.7,.55,.82,.64,.93][i],bh=v*(h-75),xx=x+20+i*(w-40)/8;svg+=`<rect x="${xx}" y="${y+h-20-bh}" width="${Math.max(8,(w-40)/8*.6)}" height="${bh}" rx="4" fill="${t.accent}" opacity=".8"/>`;}
        if(n.type==='line')svg+=`<polyline fill="none" stroke="${t.accent}" stroke-width="7" points="${[.31,.52,.44,.73,.58,.84,.69,.94].map((v,i)=>`${x+25+i*(w-50)/7},${y+h-25-v*(h-75)}`).join(' ')}"/>`;
        if(n.type==='donut'){const rr=Math.min(h*.27,w*.2),cx=x+w*.5,cy=y+h*.57;svg+=`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${t.accent}" stroke-width="${rr*.55}" stroke-dasharray="${rr*3.5} ${rr*6.4}"/>`;}
      }
      if(n.type==='title')svg+=`<rect x="${x}" y="${y+10}" width="7" height="39" rx="3" fill="${t.accent}"/><rect x="${x+22}" y="${y+18}" width="${Math.min(430,w-50)}" height="21" rx="5" fill="${t.text}" opacity=".88"/>`;
      if(n.type==='label')svg+=`<rect x="${x}" y="${y+8}" width="${Math.min(350,w)}" height="9" rx="3" fill="${t.muted}" opacity=".55"/>`;
      if(n.type==='nav'){
        if(h>w){svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${t.card}" stroke="${t.border}"/>`;for(let i=0;i<5;i++)svg+=`<rect x="${x+15}" y="${y+29+i*62}" width="${w-30}" height="34" rx="7" fill="${i===0?t.accent:t.border}"/>`;}
        else for(let i=0;i<3;i++)svg+=`<rect x="${x+i*w/3}" y="${y}" width="${w/3-9}" height="${h}" rx="7" fill="${i===0?t.accent:t.card}" stroke="${t.border}"/>`;
      }
    }
    svg+='</svg>';
    $('#quickPreview').innerHTML=svg;
    $('#quickSummary').textContent=`${quick.kpis} KPI cards + ${quick.charts} ${quick.charts===1?'chart':'charts'} · ${quick.navigation==='side'?'Sidebar':'Top'} navigation`;
  }
  function buildQuick(){
    update(s=>{
      s.items=library.quickBuild({...quick,width:s.width,height:s.height});
      const sector=library.categories.find(c=>c.id===quick.category);
      s.name=`${sector?.subject||quick.category} — Custom`;
      s.layoutId='quick';
    },true);
    selected=null;refresh(true);closeGallery();notify('Your custom layout is ready — fine-tune anything');
  }
  function initGallery(){
    if(!library ||library.catalog.length!==120){console.error('Layout library is unavailable');return;}
    $('#quickCategory').innerHTML=library.categories.map(c=>`<option value="${esc(c.id)}">${esc(c.id)}</option>`).join('');
    $('#quickCategory').value=quick.category;
    $('#galleryOpenBtn').addEventListener('click',()=>openGallery('templates'));
    $('#sidebarGalleryBtn').addEventListener('click',()=>openGallery('templates'));
    $('#sidebarQuickBtn').addEventListener('click',()=>openGallery('builder'));
    $('#closeGallery').addEventListener('click',closeGallery);
    $('#layoutBackdrop').addEventListener('click',e=>{if(e.target===$('#layoutBackdrop'))closeGallery();});
    document.querySelectorAll('.library-tab').forEach(b=>b.addEventListener('click',()=>selectGalleryPage(b.dataset.galleryPage)));
    $('#gallerySearch').addEventListener('input',e=>{view.search=e.target.value;renderGallery();});
    $('#galleryCategories').addEventListener('click',e=>{
      const b=e.target.closest('[data-category]');if(!b)return;view.category=b.dataset.category;
      renderGallery();$('.gallery-list-scroll').scrollTop=0;
    });
    $('#galleryGrid').addEventListener('click',e=>{
      const star=e.target.closest('[data-favorite]');if(star){toggleFavorite(star.dataset.favorite);return;}
      const card=e.target.closest('[data-choose-layout]');if(card)chooseLayout(card.dataset.chooseLayout);
    });
    $('#randomLayoutBtn').addEventListener('click',()=>{const entries=galleryEntries();const source=entries.length?entries:library.catalog;chooseLayout(source[Math.floor(Math.random()*source.length)].id);});
    $('#quickCategory').addEventListener('change',e=>{quick.category=e.target.value;renderQuickPreview();});
    document.querySelectorAll('.quick-choice-grid').forEach(group=>group.addEventListener('click',e=>{
      const btn=e.target.closest('[data-choice-value]');if(!btn)return;
      const key=group.dataset.choiceGroup;quick[key]=['kpis','charts'].includes(key)?Number(btn.dataset.choiceValue):btn.dataset.choiceValue;
      group.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));renderQuickPreview();
    }));
    $('#quickGenerateBtn').addEventListener('click',buildQuick);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#layoutBackdrop').classList.contains('open'))closeGallery();});
    renderGallery();renderQuickPreview();
    try{if(!localStorage.getItem(seenKey))setTimeout(()=>openGallery('templates'),350);}catch(e){}
  }
  renderVisuals();initEvents();initGallery();refresh(true);
})();
