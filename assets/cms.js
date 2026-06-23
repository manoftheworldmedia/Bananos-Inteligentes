/* ============================================================
   BANANOS INTELIGENTES — MOW CMS content loader
   ------------------------------------------------------------
   Reads content/home.json (+ navigation.json + settings.json) and
   injects the editor's copy, SEO meta and images into the live page.

   How it cooperates with js/site.js:
   The site renders bilingual text from data-en / data-es attributes and
   switches language via a private applyLang() that reads those attributes
   live on every click. This loader writes the CMS values BACK into the
   data-en / data-es attributes, then runs one apply pass for the current
   language. From then on the existing EN/ES toggle in site.js picks up the
   CMS copy automatically (it re-reads the attributes each click).

   It fails silently and leaves the static HTML untouched if anything is
   missing, so the site can never break because of the CMS.
   ============================================================ */
(function () {
  'use strict';

  var LANGS = ['en', 'es'];

  function currentLang() {
    try {
      var s = localStorage.getItem('bi_lang');
      if (s === 'en' || s === 'es') return s;
    } catch (e) {}
    var html = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return html === 'es' ? 'es' : 'en';
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      return r.json();
    });
  }

  /* ---------- home.json: copy + SEO + images ---------- */

  function applyHome(data) {
    if (!data || typeof data !== 'object') return;

    // Images
    if (data.images && typeof data.images === 'object') {
      var imgs = document.querySelectorAll('[data-cms-img]');
      for (var i = 0; i < imgs.length; i++) {
        var el = imgs[i];
        var key = (el.getAttribute('data-cms-img') || '').replace('images.', '');
        var v = data.images[key];
        if (v != null && v !== '' && el.getAttribute('src') !== String(v)) {
          el.setAttribute('src', String(v));
        }
      }
    }

    // SEO / meta (use current language block)
    var lang = currentLang();
    var block = data[lang] || data.en || {};
    if (block.seo_title) document.title = block.seo_title;
    setMeta('name', 'description', block.seo_description);
    setMeta('property', 'og:title', block.og_title || block.seo_title);
    setMeta('property', 'og:description', block.og_description || block.seo_description);
    if (data.images && data.images.og_image) {
      setMeta('property', 'og:image', data.images.og_image);
    }

    // Copy: write each per-language value into the element's data-en/data-es.
    var nodes = document.querySelectorAll('[data-cms]');
    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];
      var field = node.getAttribute('data-cms');
      if (!field) continue;
      LANGS.forEach(function (l) {
        var lb = data[l];
        if (lb && lb[field] != null && lb[field] !== '') {
          node.setAttribute('data-' + l, lb[field]);
        }
      });
    }
  }

  function setMeta(attr, name, value) {
    if (value == null || value === '') return;
    var m = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (m) m.setAttribute('content', String(value));
  }

  /* ---------- navigation.json: menu labels ---------- */

  function applyNav(nav) {
    if (!nav || !Array.isArray(nav.items)) return;
    nav.items.forEach(function (item) {
      if (!item || !item.url) return;
      // Match anchors by hash target: "/#chat" -> "#chat".
      var hash = String(item.url).replace(/^\//, '');
      var anchors = document.querySelectorAll('a[href="' + hash + '"], a[href="' + item.url + '"]');
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        // Don't overwrite the nav logo / footer logo.
        if (a.className && /logo/.test(a.className)) continue;
        if (item.label_en) a.setAttribute('data-en', item.label_en);
        if (item.label_es) a.setAttribute('data-es', item.label_es);
      }
    });
  }

  /* ---------- settings.json: footer + contact ---------- */

  function applySettings(settings) {
    if (!settings || typeof settings !== 'object') return;

    // Footer tagline (per language) into [data-cms-setting="footer_tagline"].
    var tagNodes = document.querySelectorAll('[data-cms-setting="footer_tagline"]');
    for (var i = 0; i < tagNodes.length; i++) {
      LANGS.forEach(function (l) {
        var blk = settings[l];
        if (blk && blk.footer_tagline) tagNodes[i].setAttribute('data-' + l, blk.footer_tagline);
      });
    }

    // Contact email -> any mailto: link.
    if (settings.email) {
      var mails = document.querySelectorAll('a[href^="mailto:"]');
      for (var m = 0; m < mails.length; m++) {
        mails[m].setAttribute('href', 'mailto:' + settings.email);
        // Replace the visible address only if it looks like an email.
        if (/@/.test(mails[m].textContent)) mails[m].textContent = settings.email;
      }
    }
  }

  /* ---------- re-apply the active language over [data-en]/[data-es] ---------- */
  // Mirrors js/site.js applyLang() for the elements we touched, so the page
  // shows the CMS copy immediately without depending on a re-render.

  function reapplyLang() {
    var lang = currentLang();
    var els = document.querySelectorAll('[data-en]');
    for (var i = 0; i < els.length; i++) {
      var val = els[i].getAttribute('data-' + lang);
      if (val != null) els[i].innerHTML = val;
    }
    var phs = document.querySelectorAll('[data-ph-' + lang + ']');
    for (var p = 0; p < phs.length; p++) {
      var ph = phs[p].getAttribute('data-ph-' + lang);
      if (ph != null) phs[p].placeholder = ph;
    }
  }

  /* ---------- FAQ: render from home.json faqs[] (portal-editable) ---------- */
  function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
  function renderFaqs(home){
    var faqs = home && home.faqs;
    if (!Array.isArray(faqs) || !faqs.length) return;
    var list = document.querySelector('.faq-band .faq-list');
    if (!list) return;
    list.innerHTML = faqs.map(function (f) {
      var qen = esc(f.question_en), qes = esc(f.question_es != null && f.question_es !== '' ? f.question_es : f.question_en);
      var aen = esc(f.answer_en),   aes = esc(f.answer_es != null && f.answer_es !== '' ? f.answer_es : f.answer_en);
      return '<details class="faq-item"><summary><span data-en="' + qen + '" data-es="' + qes + '">' +
        esc(f.question_en) + '</span><span class="faq-ico" aria-hidden="true"></span></summary>' +
        '<div class="faq-a"><p data-en="' + aen + '" data-es="' + aes + '">' + esc(f.answer_en) + '</p></div></details>';
    }).join('');
  }

  /* ---------- boot ---------- */

  function boot() {
    // home.json is required; nav + settings are best-effort.
    fetchJSON('content/home.json')
      .then(function (home) {
        applyHome(home);
        renderFaqs(home);
        return Promise.all([
          fetchJSON('content/navigation.json').then(applyNav).catch(function () {}),
          fetchJSON('content/settings.json').then(applySettings).catch(function () {}),
        ]);
      })
      .then(function () { reapplyLang(); })
      .catch(function () { /* leave the static HTML intact */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
