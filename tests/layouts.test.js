(function testRunner(){
  'use strict';
  const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
  const scope={window:{}};
  vm.runInNewContext(fs.readFileSync('layouts.js','utf8'),scope,{filename:'layouts.js'});
  const lib=scope.window.LayoutStudioLibrary;
  assert.ok(lib);
  assert.equal(lib.categories.length,10);
  assert.equal(lib.forms.length,12);
  assert.equal(lib.catalog.length,120);
  assert.equal(new Set(lib.catalog.map(x=>x.id)).size,120);
  let checks=0;
  function check(items,w,h,description){
    assert.ok(items.length>0,description+' is empty');
    assert.equal(new Set(items.map(x=>x.id)).size,items.length,description+' IDs repeat');
    for(let a=0;a<items.length;a++){
      const x=items[a];
      assert.ok([x.x,x.y,x.w,x.h].every(Number.isInteger),description+' has non-integer bounds');
      assert.ok(x.x>=0&&x.y>=0&&x.w>0&&x.h>0&&x.x+x.w<=w&&x.y+x.h<=h,description+' has out-of-bounds element');
      for(let b=a+1;b<items.length;b++){
        const y=items[b],ow=Math.min(x.x+x.w,y.x+y.w)-Math.max(x.x,y.x),oh=Math.min(x.y+x.h,y.y+y.h)-Math.max(x.y,y.y);
        assert.ok(ow<=4||oh<=4,description+' overlapping '+x.type+' and '+y.type);
      }
    }
    checks++;
  }
  const signatures=new Set();
  for(const entry of lib.catalog){
    const items=lib.createLayout(entry,1280,720);
    check(items,1280,720,entry.id);
    signatures.add(items.map(i=>[i.type,i.x,i.y,i.w,i.h].join(':')).join('|'));
    assert.ok(lib.thumbnail(entry).includes('<svg'),entry.id+' missing thumbnail');
    check(lib.createLayout(entry,1920,1080),1920,1080,entry.id+' FHD');
  }
  assert.ok(signatures.size>=12,'Fewer than 12 distinct geometries');
  for(const category of lib.categories)for(const kpis of [2,3,4,6])for(const charts of [1,2,3])for(const navigation of ['top','side']){
    const name=category.id+' K'+kpis+' C'+charts+' '+navigation;
    const items=lib.quickBuild({category:category.id,kpis,charts,navigation,width:1280,height:720});
    assert.equal(items.filter(i=>i.type==='kpi').length,kpis,name+' KPI count');
    assert.equal(items.filter(i=>['bar','line','donut'].includes(i.type)).length,charts,name+' chart count');
    check(items,1280,720,name);
  }
  const index=fs.readFileSync('index.html','utf8');
  for(const file of ['app.js','layouts.js','styles.css','gallery.css']){
    assert.ok(index.includes('./'+file),file+' missing HTML reference');
    assert.ok(fs.existsSync(file),file+' missing on disk');
  }
  for(const id of ['layoutBackdrop','galleryGrid','galleryCategories','gallerySearch','quickGenerateBtn','galleryOpenBtn','sidebarGalleryBtn']){
    assert.ok(index.includes('id="'+id+'"'),id+' missing from UI');
  }
  console.log('PASS: 120 layouts, 12 compositions, 10 categories, '+checks+' layout/overlap checks, quick-builder combinations and UI assets');
})();
