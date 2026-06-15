/* ============================================================
   BANANOS INTELIGENTES — site.js
   ============================================================ */
(function(){
  'use strict';

  /* ---------- scroll: solidify nav ---------- */
  var nav = document.getElementById('nav');
  function onScroll(){ if(nav) nav.classList.toggle('solid', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open){
    if(!mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
    if(burger) burger.setAttribute('aria-expanded', open ? 'true':'false');
  }
  if(burger) burger.addEventListener('click', function(){ setMenu(!mobileMenu.classList.contains('open')); });
  if(mobileMenu) mobileMenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });

  /* ============================================================
     LANGUAGE TOGGLE (EN / ES)
     Each translatable node carries data-en / data-es (HTML).
     ============================================================ */
  var LANG = 'en';
  try { var stored = localStorage.getItem('bi_lang'); if(stored==='en'||stored==='es') LANG = stored; } catch(e){}

  var i18nEls = Array.prototype.slice.call(document.querySelectorAll('[data-en]'));

  function applyLang(lang){
    LANG = lang;
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('lang-es', lang==='es');
    i18nEls.forEach(function(el){
      var val = el.getAttribute('data-'+lang);
      if(val != null) el.innerHTML = val;
    });
    // input placeholders
    document.querySelectorAll('[data-ph-en]').forEach(function(el){
      var p = el.getAttribute('data-ph-'+lang);
      if(p != null) el.placeholder = p;
    });
    // toggle buttons
    document.querySelectorAll('[data-lang-btn]').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-lang-btn')===lang);
    });
    try{ localStorage.setItem('bi_lang', lang); }catch(e){}
  }

  document.querySelectorAll('[data-lang-btn]').forEach(function(b){
    b.addEventListener('click', function(){ applyLang(b.getAttribute('data-lang-btn')); });
  });
  applyLang(LANG);

  /* ============================================================
     BANANA CHAT — cycle through sample exchanges
     ============================================================ */
  var chatBody = document.getElementById('chatBody');
  var EXCHANGES = {
    en: [
      { q: "Which blocks are trending toward Black Sigatoka pressure this week?",
        a: "Blocks <strong>7, 12 and 19</strong> are trending up — leaf wetness and the last spray window line up with early lesion patterns from 2023.",
        chips: ["RISK <b>HIGH</b> · BLK 7,12,19","LEAF WETNESS <b>+18%</b>","NEXT SPRAY <b>3 DAYS</b>"] },
      { q: "Where is humidity pressure building toward rot risk right now?",
        a: "The <strong>lower-elevation blocks</strong> have held above <strong>85% RH for 40+ hours</strong> — that's the threshold where rot incidence historically climbs. Airflow-limited corners are first to watch.",
        chips: ["HUMIDITY <b>85%+ / 40H</b>","ROT RISK <b>ELEVATED</b>","WATCH <b>LOW BLOCKS</b>"] },
      { q: "How is soil health trending across the farm this quarter?",
        a: "Organic matter is <strong>up 0.4 pts</strong> where cover-crop rotation ran; nitrogen is <strong>drawing down in Blocks 3 & 8</strong>. Recommend pulling those two forward in the fertigation plan.",
        chips: ["ORG. MATTER <b>+0.4 PTS</b>","N LOW <b>BLK 3,8</b>","ACTION <b>FERTIGATE</b>"] },
      { q: "Are bunch weights holding up against last season?",
        a: "Average bunch weight is <strong>+1.3 kg vs. last season</strong>, but <strong>Block 11 is lagging</strong> — the dip tracks with its delayed deleafing. Closing that gap recovers an estimated <strong>2.1 boxes/ha</strong>.",
        chips: ["BUNCH WT <b>+1.3 KG</b>","LAG <b>BLK 11</b>","RECOVERY <b>2.1 BOX/HA</b>"] },
      { q: "What did the lead agronomist flag about Block 4 before retiring?",
        a: "Captured: their rule that <strong>two rain events inside 72h</strong> on Block 4 historically precede rot spikes. The system now watches for it automatically.",
        chips: ["KNOWLEDGE <b>CAPTURED</b>","RULE <b>2 RAINS / 72H</b>","STATUS <b>MONITORING</b>"] },
      { q: "What has targeted spraying saved us versus calendar spraying?",
        a: "By spraying on risk instead of the calendar, applications dropped <strong>~22%</strong> while <strong>rot incidence fell 31%</strong> — an estimated <strong>$184/ha saved</strong> this cycle, fungicide plus labor.",
        chips: ["SPRAYS <b>−22%</b>","ROT <b>−31%</b>","SAVED <b>$184/HA</b>"] }
    ],
    es: [
      { q: "¿Qué lotes muestran tendencia de presión de Sigatoka Negra esta semana?",
        a: "Los lotes <strong>7, 12 y 19</strong> van en aumento — la humedad foliar y la última ventana de fumigación coinciden con patrones tempranos de lesión de 2023.",
        chips: ["RIESGO <b>ALTO</b> · LOTE 7,12,19","HUMEDAD FOLIAR <b>+18%</b>","PRÓX. FUMIGACIÓN <b>3 DÍAS</b>"] },
      { q: "¿Dónde se está acumulando presión de humedad hacia riesgo de pudrición ahora?",
        a: "Los <strong>lotes de menor elevación</strong> se mantienen por encima del <strong>85% HR por más de 40 horas</strong> — el umbral donde la incidencia de pudrición históricamente sube. Las esquinas con poco flujo de aire son las primeras a vigilar.",
        chips: ["HUMEDAD <b>85%+ / 40H</b>","RIESGO PUDR. <b>ELEVADO</b>","VIGILAR <b>LOTES BAJOS</b>"] },
      { q: "¿Cómo va la salud del suelo en la finca este trimestre?",
        a: "La materia orgánica subió <strong>0.4 pts</strong> donde se rotó cultivo de cobertura; el nitrógeno <strong>baja en los Lotes 3 y 8</strong>. Recomendamos adelantarlos en el plan de fertirriego.",
        chips: ["MAT. ORG. <b>+0.4 PTS</b>","N BAJO <b>LOTE 3,8</b>","ACCIÓN <b>FERTIRRIEGO</b>"] },
      { q: "¿Se mantienen los pesos de racimo frente a la temporada pasada?",
        a: "El peso promedio de racimo está <strong>+1.3 kg vs. la temporada pasada</strong>, pero el <strong>Lote 11 va rezagado</strong> — la caída coincide con su deshoje tardío. Cerrar esa brecha recupera unas <strong>2.1 cajas/ha</strong>.",
        chips: ["PESO RACIMO <b>+1.3 KG</b>","REZAGO <b>LOTE 11</b>","RECUPER. <b>2.1 CAJAS/HA</b>"] },
      { q: "¿Qué advirtió el agrónomo principal sobre el Lote 4 antes de jubilarse?",
        a: "Capturado: su regla de que <strong>dos lluvias en 72h</strong> en el Lote 4 anteceden picos de pudrición. El sistema ahora lo vigila automáticamente.",
        chips: ["CONOCIMIENTO <b>CAPTURADO</b>","REGLA <b>2 LLUVIAS / 72H</b>","ESTADO <b>MONITOREANDO</b>"] },
      { q: "¿Qué nos ha ahorrado la fumigación dirigida frente a la de calendario?",
        a: "Al fumigar por riesgo y no por calendario, las aplicaciones bajaron <strong>~22%</strong> mientras la <strong>incidencia de pudrición cayó 31%</strong> — un ahorro estimado de <strong>$184/ha</strong> este ciclo, entre fungicida y mano de obra.",
        chips: ["FUMIGAC. <b>−22%</b>","PUDRIC. <b>−31%</b>","AHORRO <b>$184/HA</b>"] }
    ]
  };
  var WHO = { user:{en:"Agronomy · Field",es:"Agronomía · Campo"}, bot:{en:"Banana Chat",es:"Banana Chat"} };
  var chatIdx = 0, chatTimer = null;

  function renderChat(showTyping){
    if(!chatBody) return;
    var ex = EXCHANGES[LANG][chatIdx % EXCHANGES[LANG].length];
    chatBody.innerHTML = '';
    // user
    var u = document.createElement('div'); u.className='msg user';
    u.innerHTML = '<div class="who">'+WHO.user[LANG]+'</div><div class="bubble">'+ex.q+'</div>';
    chatBody.appendChild(u);
    if(showTyping){
      var t = document.createElement('div'); t.className='msg bot';
      t.innerHTML = '<div class="who">'+WHO.bot[LANG]+'</div><div class="typing"><span></span><span></span><span></span></div>';
      chatBody.appendChild(t);
      setTimeout(function(){
        if(!chatBody) return;
        t.innerHTML = '<div class="who">'+WHO.bot[LANG]+'</div><div class="bubble">'+ex.a+
          '<div class="bot-data">'+ex.chips.map(function(c){return '<span class="chip">'+c+'</span>';}).join('')+'</div></div>';
      }, 1100);
    } else {
      var b = document.createElement('div'); b.className='msg bot';
      b.innerHTML = '<div class="who">'+WHO.bot[LANG]+'</div><div class="bubble">'+ex.a+
        '<div class="bot-data">'+ex.chips.map(function(c){return '<span class="chip">'+c+'</span>';}).join('')+'</div></div>';
      chatBody.appendChild(b);
    }
  }
  function startChat(){
    if(!chatBody) return;
    renderChat(true);
    clearInterval(chatTimer);
    chatTimer = setInterval(function(){
      chatIdx++; renderChat(true);
    }, 5200);
  }
  // re-render immediately on language change
  var _applyLang = applyLang;
  applyLang = function(l){ _applyLang(l); if(chatBody) renderChat(true); };
  document.querySelectorAll('[data-lang-btn]').forEach(function(b){
    b.addEventListener('click', function(){ /* applyLang already re-renders */ });
  });

  if(chatBody){
    var chatObserver = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ startChat(); chatObserver.disconnect(); } });
    }, {threshold:0.3});
    chatObserver.observe(chatBody);
  }

  /* ============================================================
     POSTCARD SHARE
     ============================================================ */
  var SITE = 'https://bananosinteligentes.com';
  var MSG = {
    en: 'From Bananos Inteligentes — intelligence, by the bunch. \uD83C\uDF4C Hear everything the banana is telling us: '+SITE,
    es: 'De Bananos Inteligentes — inteligencia, por racimo. \uD83C\uDF4C Escuchá todo lo que el banano nos dice: '+SITE
  };
  function msg(){ return MSG[LANG]; }

  // preload sticker for canvas
  var stickerImg = new Image();
  stickerImg.src = 'assets/sticker.png';

  function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

  // banana "INTELLIGENCE" seal — the mark of intelligence stamped on the sticker
  function drawSeal(ctx,cx,cy,R){
    ctx.save();
    // banana disc
    ctx.fillStyle='#F5D547'; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#0A0A0A';
    ctx.lineWidth=R*0.035; ctx.beginPath(); ctx.arc(cx,cy,R*0.9,0,Math.PI*2); ctx.stroke();
    ctx.lineWidth=R*0.02; ctx.setLineDash([R*0.05,R*0.05]); ctx.beginPath(); ctx.arc(cx,cy,R*0.66,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    function curved(text,radius,dir,size){
      ctx.save(); ctx.translate(cx,cy);
      ctx.fillStyle='#0A0A0A'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font='700 '+(R*size)+'px "JetBrains Mono", monospace';
      var total=text.length, per=(Math.PI*0.9)/total;
      var ang = -Math.PI/2 - (per*(total-1))/2 * dir;
      for(var i=0;i<total;i++){
        ctx.save(); ctx.rotate(ang+per*i*dir); ctx.translate(0,-radius*dir);
        if(dir<0) ctx.rotate(Math.PI);
        ctx.fillText(text[i],0,0); ctx.restore();
      }
      ctx.restore();
    }
    curved('INTELLIGENCE', R*0.78, 1, 0.15);
    curved('BANANOS INTELIGENTES', R*0.78, -1, 0.1);
    ctx.fillStyle='#0A0A0A'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font='700 '+(R*0.34)+'px "JetBrains Mono", monospace';
    ctx.fillText('AI', cx, cy-R*0.04);
    ctx.font='600 '+(R*0.11)+'px "JetBrains Mono", monospace';
    ctx.fillText('· '+new Date().getFullYear()+' ·', cx, cy+R*0.32);
    ctx.restore();
  }

  // a big die-cut sticker: white tile + B-mark + INTELLIGENCE seal
  function makeStickerCanvas(){
    var W=1200, H=1200;
    var c=document.createElement('canvas'); c.width=W; c.height=H;
    var ctx=c.getContext('2d');
    // white sticker tile (die-cut), slightly tilted
    var tx=170, ty=200, tw=W-340, th=H-400, rad=90;
    ctx.save();
    ctx.translate(W/2,H/2); ctx.rotate(-4*Math.PI/180); ctx.translate(-W/2,-H/2);
    ctx.shadowColor='rgba(10,10,10,.35)'; ctx.shadowBlur=60; ctx.shadowOffsetY=34;
    roundRect(ctx,tx,ty,tw,th,rad); ctx.fillStyle='#ffffff'; ctx.fill();
    ctx.shadowColor='transparent';
    // B-mark centered in tile
    if(stickerImg.complete && stickerImg.naturalWidth){
      var padX=tw*0.13, padY=th*0.12;
      var boxW=tw-padX*2, boxH=th-padY*2;
      var ar=stickerImg.naturalWidth/stickerImg.naturalHeight;
      var dw=boxW, dh=dw/ar; if(dh>boxH){ dh=boxH; dw=dh*ar; }
      ctx.drawImage(stickerImg, tx+(tw-dw)/2, ty+(th-dh)/2, dw, dh);
    }
    ctx.restore();
    // seal over the top-right corner (not rotated with tile, its own tilt)
    ctx.save();
    ctx.translate(W-300, 250); ctx.rotate(12*Math.PI/180); ctx.translate(-(W-300),-250);
    drawSeal(ctx, W-300, 250, 150);
    ctx.restore();
    return c;
  }

  function stickerBlob(){
    return fetch('assets/sticker-foil-hd.png').then(function(r){ return r.blob(); }).catch(function(){ return null; });
  }

  // wire up
  var card = document.getElementById('stickerObj');
  var overlay = document.getElementById('shareOverlay');
  if(card && overlay){
    var waBtn = document.getElementById('shareWa');
    var nativeBtn = document.getElementById('shareNative');
    var dlBtn = document.getElementById('shareDownload');
    var copyBtn = document.getElementById('shareCopy');

    function openSheet(){
      if(waBtn) waBtn.href='https://wa.me/?text='+encodeURIComponent(msg());
      overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
    }
    function closeSheet(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); }

    card.addEventListener('click', openSheet);
    card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openSheet(); } });
    document.querySelectorAll('[data-open-share]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); openSheet(); }); });
    overlay.querySelector('.share-close').addEventListener('click', closeSheet);
    overlay.addEventListener('click', function(e){ if(e.target===overlay) closeSheet(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeSheet(); });

    if(nativeBtn) nativeBtn.addEventListener('click', async function(){
      var blob = await stickerBlob();
      try{
        if(blob && navigator.canShare){
          var file = new File([blob],'bananos-inteligentes-sticker.png',{type:'image/png'});
          if(navigator.canShare({files:[file]})){
            await navigator.share({files:[file], title:'Bananos Inteligentes', text:msg()});
            return;
          }
        }
      }catch(e){}
      // fallback: open SMS composer with the message
      var a=document.createElement('a');
      a.href='sms:?&body='+encodeURIComponent(msg());
      document.body.appendChild(a); a.click(); a.remove();
    });

    if(dlBtn) dlBtn.addEventListener('click', async function(){
      var blob = await stickerBlob();
      if(!blob) return;
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a'); a.href=url; a.download='bananos-inteligentes-sticker.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
    });

    if(copyBtn) copyBtn.addEventListener('click', async function(){
      try{ await navigator.clipboard.writeText(msg()); }catch(e){}
      var orig = copyBtn.getAttribute('data-'+LANG) || copyBtn.textContent;
      copyBtn.classList.add('copied');
      copyBtn.querySelector('.lbl').textContent = LANG==='es' ? 'Copiado ✓' : 'Copied ✓';
      setTimeout(function(){
        copyBtn.classList.remove('copied');
        copyBtn.querySelector('.lbl').textContent = copyBtn.querySelector('.lbl').getAttribute('data-'+LANG) || (LANG==='es'?'Copiar enlace':'Copy link');
      }, 1800);
    });
  }

  /* ============================================================
     LEAD FORM
     ============================================================ */
  var leadForm = document.getElementById('leadForm');
  if(leadForm){
    leadForm.addEventListener('submit', function(e){
      e.preventDefault();
      var nm = leadForm.querySelector('[name="name"]');
      var em = leadForm.querySelector('[name="email"]');
      if(nm && !nm.value.trim()){ nm.focus(); nm.style.borderColor='#d8453a'; return; }
      if(em && !em.checkValidity()){ em.focus(); em.style.borderColor='#d8453a'; return; }
      // compose the email to marketing@mow.media with the entered details
      var farm = (leadForm.querySelector('[name="farm"]')||{}).value || '';
      var loc  = (leadForm.querySelector('[name="location"]')||{}).value || '';
      var pains = [].slice.call(leadForm.querySelectorAll('input[name="pain"]:checked')).map(function(c){
        var sp = c.parentElement.querySelector('span'); return sp ? sp.textContent.trim() : c.value;
      });
      var subject = 'Pilot interest — ' + nm.value.trim();
      var body = [
        'Name: ' + nm.value.trim(),
        'Email: ' + em.value.trim(),
        'Farm / Organization: ' + (farm || '—'),
        'Location: ' + (loc || '—'),
        'Pain points: ' + (pains.join(', ') || '—'),
        '',
        'Sent from bananosinteligentes.com'
      ].join('\n');
      var a = document.createElement('a');
      a.href = 'mailto:marketing@mow.media?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      document.body.appendChild(a); a.click(); a.remove();
      var success = document.getElementById('leadSuccess');
      leadForm.hidden = true;
      if(success) success.hidden = false;
    });
    leadForm.querySelectorAll('input').forEach(function(i){
      i.addEventListener('input', function(){ i.style.borderColor=''; });
    });
  }

})();
