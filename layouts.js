(function layoutLibrary() {
  'use strict';
  const sectors = [
    ['Executive','Executive Performance','LEADERSHIP INTELLIGENCE','Net Revenue|$8.45M','Goal Attainment|94.6%','Operating Margin|24.8%','YoY Growth|+18.4%','Strategic KPIs|32','Active Regions|12','Division Performance','Executive Trend','Strategy Mix','Board Scorecard'],
    ['Sales','Sales Command Center','COMMERCIAL INTELLIGENCE','Gross Sales|$4.82M','Units Sold|242K','Sales Growth|+14.2%','Active Accounts|1,840','Conversion Rate|21.3%','Average Deal|$12.8K','Monthly Revenue','Sales Momentum','Product Mix','Top Customers'],
    ['Finance','Financial Intelligence','FINANCE & PROFITABILITY','Net Profit|$2.15M','Operating Costs|$1.28M','Profit Margin|29.2%','Cash Flow|$840K','Budget Used|76%','Variance|-4.2%','P&L Breakdown','Cash Flow Trend','Cost Distribution','Budget vs Actual'],
    ['HR','People Analytics','TALENT & PERFORMANCE','Headcount|2,480','Retention Rate|94.2%','Engagement|87.5%','New Hires|214','Avg. Score|4.36','Training Hours|8.4K','Headcount by Team','Performance Trend','Workforce Mix','Talent Pipeline'],
    ['Operations','Operations Command','OPERATIONAL EXCELLENCE','Orders Processed|18.4K','On-Time Rate|97.1%','Efficiency|91.8%','Open Tickets|246','Cycle Time|4.2d','Quality Score|98.4%','Throughput by Site','Process Trend','Issue Distribution','Workflow Detail'],
    ['Marketing','Marketing Performance','GROWTH & ACQUISITION','Campaign Spend|$425K','ROAS|4.8×','Leads Generated|8,240','Conversion|6.9%','Reach|1.2M','CAC|$41','Channel Performance','Campaign Trend','Channel Mix','Lead Funnel'],
    ['Healthcare','Healthcare Insights','CLINICAL & MEDICAL DATA','Patients Served|42.8K','Service Quality|96.3%','Appointments|8,420','Response Rate|89.4%','Avg. Wait|12 min','Active Clinics|32','Care by Facility','Visit Trend','Service Mix','Care Quality'],
    ['Retail','Retail Intelligence','RETAIL & CATEGORY DATA','Store Revenue|$6.14M','Transactions|94.2K','Basket Size|$65.2','Same-Store Growth|+9.1%','Active Stores|84','Inventory Turns|6.4×','Revenue by Store','Daily Trend','Category Share','Store Ranking'],
    ['Customers','Customer 360','CUSTOMER EXPERIENCE','Active Customers|28.4K','Satisfaction|92%','Lifetime Value|$3.2K','Churn Rate|2.8%','NPS Score|+68','New Customers|1.9K','Segment Value','Customer Trend','Segment Mix','Accounts Detail'],
    ['Projects','Portfolio Intelligence','PROJECTS & DELIVERY','Active Projects|48','On Track|86%','Total Budget|$12.5M','Milestones|254','At Risk|6','Completion|72.8%','Projects by Stage','Delivery Trend','Portfolio Mix','Milestone Status']
  ].map((data,index)=>({id:data[0],index,subject:data[1],tagline:data[2],kpis:data.slice(3,9).map(v=>v.split('|')),charts:data.slice(9,13)}));
  const forms=[
    ['overview','Classic Overview','Balanced','Three KPIs, two focused charts'],
    ['navigation','Sidebar Command','Balanced','A navigation rail and a trend'],
    ['scorecard','KPI Scorecard','Detailed','Six metrics in a smart grid'],
    ['spotlight','Hero Spotlight','Simple','A statement metric and insights'],
    ['analytics','Analytics Deep Dive','Balanced','Trends and supporting visuals'],
    ['matrix','Insight Matrix','Detailed','An analytical four-panel canvas'],
    ['ribbon','Performance Ribbon','Balanced','Visuals above a ribbon of KPI cards'],
    ['threecol','Three-Column Studio','Detailed','Metrics, trends and tabular detail'],
    ['compare','Comparison Board','Balanced','Side-by-side trends with summary KPIs'],
    ['pulse','Signal Monitor','Balanced','One big trend, four performance signals'],
    ['control','Control Room','Detailed','A side rail with strong visual panels'],
    ['minimal','Editorial Focus','Simple','Minimal framing, maximum focus']
  ];
  const catalog=sectors.flatMap((sector,si)=>forms.map((f,fi)=>({id:`${sector.id.toLowerCase()}-${f[0]}`,name:`${sector.id} · ${f[1]}`,shortName:f[1],description:f[3],category:sector.id,sectorIndex:si,form:f[0],density:f[2],theme:['midnight','ocean','arctic'][(si+fi)%3],featured:fi===0||fi===3})));
  const palettes={
    midnight:{bg:'#0b1426',card:'#15263d',border:'#29405a',accent:'#099999',text:'#effaff',muted:'#8faabd'},
    ocean:{bg:'#08252c',card:'#103b43',border:'#28575e',accent:'#27bfae',text:'#f2ffff',muted:'#94c3c8'},
    arctic:{bg:'#f0f5f9',card:'#ffffff',border:'#d5e3e9',accent:'#099999',text:'#1b3444',muted:'#63808d'}
  };
  function build(record) {
    const data=sectors[record.sectorIndex]||sectors[0],out=[];
    const add=(type,x,y,w,h,title='',value='',note='')=>out.push({type,x,y,w,h,title,value,note});
    const header=(x=44,w=760)=>{add('title',x,35,w,57,data.subject);add('label',x+6,98,w,25,data.tagline+'  /  FY 2026');};
    const kpi=(n,x,y,w,h)=>{const [title,value]=data.kpis[n%6];add('kpi',x,y,w,h,title,value,['+12.8%','+8.4%','+3.2%','+5.6%','+11.7%','+2.5%'][n%6]);};
    const chart=(type,n,x,y,w,h)=>add(type,x,y,w,h,data.charts[n%4]);
    const footer=(x=44,w=1190)=>{add('divider',x,679,w,4);add('label',x,688,Math.min(700,w),18,'X ACADEMY  /  BUSINESS INTELLIGENCE');};
    switch(record.form){
      case 'overview':
        header();add('nav',845,46,388,46);
        for(let i=0;i<3;i++)kpi(i,44+i*407,146,378,131);
        chart('bar',0,44,307,749,339);chart('donut',2,822,307,412,339);footer();break;
      case 'navigation':
        add('nav',42,35,192,610);header(266,730);
        for(let i=0;i<4;i++)kpi(i,266+(i%2)*487,152+Math.floor(i/2)*147,457,124);
        chart('line',1,266,464,946,181);footer(266,946);break;
      case 'scorecard':
        header();add('slicer',852,45,380,79,'Period Filters');
        for(let i=0;i<6;i++)kpi(i,44+(i%3)*407,148+Math.floor(i/3)*136,378,111);
        chart('line',1,44,443,757,204);chart('donut',2,829,443,404,204);footer();break;
      case 'spotlight':
        header(44,840);add('slicer',902,42,332,86,'Reporting Period');
        kpi(0,44,155,393,339);kpi(1,44,520,393,126);
        chart('line',1,463,155,771,247);chart('bar',0,463,426,771,220);footer();break;
      case 'analytics':
        header();add('nav',841,47,393,45);
        chart('line',1,44,148,805,316);kpi(0,876,148,358,149);kpi(2,876,316,358,148);
        chart('bar',0,44,485,572,163);chart('donut',2,642,485,592,163);footer();break;
      case 'matrix':
        header();add('slicer',859,39,375,94,'Reporting Period');
        for(let i=0;i<4;i++)kpi(i,44+i*307,153,282,118);
        chart('bar',0,44,298,573,161);chart('line',1,644,298,590,161);
        chart('table',3,44,485,573,160);chart('donut',2,644,485,590,160);footer();break;
      case 'ribbon':
        header();add('nav',845,46,388,46);
        chart('bar',0,44,145,722,306);chart('donut',2,791,145,443,306);
        for(let i=0;i<4;i++)kpi(i,44+i*307,479,283,166);
        footer();break;
      case 'threecol':
        header();add('slicer',908,42,326,87,'Period / Region');
        kpi(0,44,151,279,145);kpi(1,44,322,279,145);kpi(2,44,493,279,152);
        chart('line',1,348,151,557,494);chart('table',3,930,151,304,494);
        footer();break;
      case 'compare':
        header();add('nav',846,46,388,46);
        kpi(0,44,147,574,131);kpi(1,641,147,593,131);
        chart('bar',0,44,310,574,337);chart('line',1,641,310,593,337);
        footer();break;
      case 'pulse':
        header();add('slicer',873,43,360,86,'Slicer / Period');
        chart('line',1,44,146,1190,270);
        for(let i=0;i<4;i++)kpi(i,44+i*307,442,282,204);
        footer();break;
      case 'control':
        add('nav',44,38,181,606);header(251,725);
        chart('bar',0,251,152,459,294);chart('donut',2,731,152,479,294);
        for(let i=0;i<3;i++)kpi(i,251+i*329,471,306,173);
        footer(251,959);break;
      case 'minimal':
        header(44,800);add('nav',858,46,376,46);
        kpi(0,44,168,554,479);
        chart('donut',2,625,168,609,220);
        chart('bar',0,625,413,609,234);
        footer();break;
    }
    return out;
  }
  function scale(nodes,width=1280,height=720,prefix='lib') {
    const sx=width/1280,sy=height/720;
    return nodes.map((n,index)=>({id:`${prefix}-${index}-${Math.random().toString(36).slice(2,8)}`,type:n.type,
      x:Math.round(n.x*sx),y:Math.round(n.y*sy),w:Math.max(24,Math.round(n.w*sx)),h:Math.max(5,Math.round(n.h*sy)),
      title:n.title,value:n.value,note:n.note}));
  }
  function createLayout(record,width,height){if(!record)throw Error('Unknown layout');return scale(build(record),width,height,record.id);}
  function quickBuild(options={}) {
    const data=sectors.find(s=>s.id===options.category)||sectors[1];
    const kpis=[2,3,4,6].includes(+options.kpis)?+options.kpis:3,charts=[1,2,3].includes(+options.charts)?+options.charts:2;
    const side=options.navigation==='side',left=side?253:44,right=1234,span=right-left,gap=18,items=[];
    const add=(type,x,y,w,h,title='',value='',note='')=>items.push({type,x,y,w,h,title,value,note});
    add('title',left,35,side?710:770,57,data.subject);add('label',left+5,98,660,24,data.tagline+'  /  CUSTOM LAYOUT');
    if(side)add('nav',44,35,185,608);else add('nav',845,46,389,46);
    const perRow=kpis===6?3:kpis,rows=kpis===6?2:1,kpiH=rows===2?105:137,cardW=(span-gap*(perRow-1))/perRow;
    for(let i=0;i<kpis;i++){const metric=data.kpis[i%6];add('kpi',left+(i%perRow)*(cardW+gap),145+Math.floor(i/perRow)*(kpiH+14),cardW,kpiH,metric[0],metric[1],'+12.8%');}
    const chartY=145+rows*kpiH+(rows-1)*14+24,chartH=648-chartY;
    if(charts===1)add('bar',left,chartY,span,chartH,data.charts[0]);
    if(charts===2){const w1=Math.round(span*.63);add('bar',left,chartY,w1,chartH,data.charts[0]);add('donut',left+w1+gap,chartY,span-w1-gap,chartH,data.charts[2]);}
    if(charts===3){const w=(span-2*gap)/3;['bar','line','donut'].forEach((type,i)=>add(type,left+i*(w+gap),chartY,w,chartH,data.charts[i]));}
    add('divider',left,679,span,4);add('label',left,690,Math.min(700,span),18,'X ACADEMY / LAYOUT STUDIO');
    return scale(items,options.width||1280,options.height||720,'quick');
  }
  function thumbnail(record){
    const nodes=build(record),p=palettes[record.theme];
    const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    let s=`<svg class="layout-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${safe(record.name)}"><rect width="1280" height="720" fill="${p.bg}"/><ellipse cx="1100" cy="0" rx="440" ry="290" fill="${p.accent}" opacity=".07"/>`;
    for(const n of nodes){
      const {x,y,w,h,type}=n;
      if(['kpi','bar','line','donut','slicer','table'].includes(type)){
        s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${p.card}" stroke="${p.border}" stroke-width="2"/>`;
        s+=`<text x="${x+17}" y="${y+29}" font-size="16" font-family="sans-serif" fill="${p.muted}">${safe(n.title.slice(0,27))}</text>`;
        if(type==='kpi')s+=`<rect x="${x+18}" y="${y+53}" width="${Math.min(175,w*.56)}" height="17" rx="5" fill="${p.text}" opacity=".9"/><rect x="${x+18}" y="${y+h-27}" width="73" height="12" rx="5" fill="${p.accent}" opacity=".62"/>`;
        if(type==='bar'||type==='line'){
          const base=y+h-22,space=base-y-50,values=[.3,.51,.43,.7,.6,.78,.66,.91,.82];
          if(type==='bar'){values.forEach((v,i)=>{const q=(w-42)/values.length,hh=Math.max(3,v*space);s+=`<rect x="${x+21+i*q}" y="${base-hh}" width="${q*.57}" height="${hh}" rx="5" fill="${p.accent}" opacity="${i%3===0?.7:.94}"/>`;});}
          else{s+=`<polyline fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" points="${values.map((v,i)=>`${x+24+i*(w-48)/8},${base-v*space}`).join(' ')}"/>`;}
        }
        if(type==='donut'){const rr=Math.min(w*.17,h*.25),cx=x+w*.45,cy=y+h*.57;s+=`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${p.accent}" stroke-width="${rr*.57}" stroke-dasharray="${rr*3.3} ${rr*6.4}" transform="rotate(-90 ${cx} ${cy})"/><circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="#5c80ae" stroke-width="${rr*.57}" stroke-dasharray="${rr*2.1} ${rr*6.4}" stroke-dashoffset="${-rr*3.4}" transform="rotate(-90 ${cx} ${cy})"/>`;}
        if(type==='table')for(let j=0;j<3;j++)s+=`<rect x="${x+18}" y="${y+56+j*30}" width="${w-36}" height="9" rx="4" fill="${p.muted}" opacity="${.25+j*.05}"/>`;
        if(type==='slicer')for(let j=0;j<3;j++)s+=`<rect x="${x+17+j*Math.min(100,(w-34)/3)}" y="${y+Math.min(h-27,55)}" width="${Math.min(85,(w-42)/3)}" height="18" rx="7" fill="${j===0?p.accent:p.border}"/>`;
      }else if(type==='title')s+=`<rect x="${x}" y="${y+11}" width="7" height="${h-19}" rx="3" fill="${p.accent}"/><text x="${x+20}" y="${y+43}" font-family="sans-serif" font-weight="800" font-size="38" fill="${p.text}">${safe(n.title.slice(0,25))}</text>`;
      else if(type==='label')s+=`<text x="${x}" y="${y+h*.65}" font-family="sans-serif" letter-spacing="3" font-size="14" fill="${p.muted}">${safe(n.title.slice(0,50))}</text>`;
      else if(type==='divider')s+=`<rect x="${x}" y="${y}" width="${w}" height="2" rx="1" fill="${p.accent}" opacity=".5"/>`;
      else if(type==='nav'){
        if(h>w){s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="17" fill="${p.card}" stroke="${p.border}" stroke-width="2"/>`;for(let j=0;j<6;j++)s+=`<rect x="${x+17}" y="${y+29+j*63}" width="${w-34}" height="34" rx="8" fill="${j===0?p.accent:p.border}" opacity=".85"/>`;}
        else for(let j=0;j<3;j++)s+=`<rect x="${x+j*w/3}" y="${y}" width="${w/3-8}" height="${h}" rx="8" fill="${j===0?p.accent:p.card}" stroke="${p.border}" stroke-width="2"/>`;
      }
    }
    return s+'</svg>';
  }
  window.LayoutStudioLibrary={catalog,categories:sectors,forms,palettes,createLayout,quickBuild,thumbnail};
})();
