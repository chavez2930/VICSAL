/* ======================================================================
   CATÁLOGO DE PRODUCTOS VICSAL  (lógica)
   Lee window.VICSAL_CATALOGO (assets/js/productos-data.js) y arma en
   productos.html:
     - Buscador (ignora acentos y mayúsculas, varias palabras = todas
       deben coincidir) con sugerencias y atajo de teclado "/".
     - Filtros: línea, categoría, tipo, color, dama/caballero, material,
       reflejante, manga, tela, protección, proceso y talla. Cada opción
       muestra cuántos productos hay con los demás filtros ya aplicados.
     - Tarjetas de producto + VISTA PREVIA (ventana) con ficha completa,
       flechas para ver el anterior/siguiente y botón "Más información".
     - El botón "Más info" manda a contacto.html?producto=...&categoria=...&ref=...
     - Todo queda en la URL (?cat=camisolas&color=Blanco&q=polo), así que
       los links del megamenú (productos.html?cat=<id>) funcionan solos.

   Los productos NO se escriben aquí: se agregan/editan en productos-data.js.

   NOTA TÉCNICA: las clases de Tailwind que se usan dentro de los templates
   de este archivo se escriben completas (nunca armadas con pedazos), porque
   Tailwind (CDN) las detecta cuando el HTML ya está en la página.
   ====================================================================== */
(function () {
  'use strict';

  const DATA = window.VICSAL_CATALOGO;
  if (!DATA || !Array.isArray(DATA.productos)) {
    console.error('[catalogo] No se encontró window.VICSAL_CATALOGO. ¿Está cargado assets/js/productos-data.js antes que catalogo.js?');
    return;
  }

  /* ---------------------------------------------------------------
     Ajustes rápidos
     --------------------------------------------------------------- */
  const CONTACT_PAGE = 'contacto.html';           // a dónde manda "Más info"
  const LINEAS = { uniformes: 'Uniformes', calzado: 'Calzado de seguridad', epp: 'Equipo de Protección Personal' };

  // Tintes de fondo para las tarjetas sin foto (usa la paleta del sitio)
  const TINTS = [
    'from-primary-fixed to-secondary-container',
    'from-secondary-fixed to-primary-fixed',
    'from-tertiary-fixed to-secondary-container',
    'from-secondary-container to-surface-container',
    'from-primary-fixed to-tertiary-fixed',
  ];

  // Colores de referencia para el filtro de color (solo los que hay en el catálogo)
  const COLOR_DOT = {
    'Negro': '#111827', 'Café': '#6f4e37', 'Bronce': '#8a6a3a',
    'Ocre': '#c98a1c', 'Miel': '#e2a93b', 'Blanco': '#ffffff',
  };
  const COLOR_MULTI = 'linear-gradient(90deg,#ec4899,#fb923c 50%,#10b981)'; // mismo degradado del sitio

  // Filtros de la barra lateral, en el orden en que aparecen.
  //   kind: "list" (casillas con lista) | "pills" (botones chicos) | "color" (botones con muestra)
  //   open: abierto por defecto (los demás se abren solos si tienen algo elegido)
  const FACETS = [
    { key: 'cat',        label: 'Categoría',              kind: 'list',  open: true },
    { key: 'tipo',       label: 'Tipo de producto',       kind: 'list' },
    { key: 'color',      label: 'Color',                  kind: 'color', open: true },
    { key: 'genero',     label: 'Dama / Caballero',       kind: 'pills', open: true },
    { key: 'material',   label: 'Material',               kind: 'pills' },
    { key: 'reflejante', label: 'Reflejante',             kind: 'pills' },
    { key: 'manga',      label: 'Manga',                  kind: 'pills' },
    { key: 'tela',       label: 'Tela de camisería',      kind: 'list', collapse: 6 },
    { key: 'proteccion', label: 'Protección',             kind: 'pills' },
    { key: 'proceso',    label: 'Proceso de fabricación', kind: 'pills' },
  ];

  // Palabras que se ofrecen debajo del buscador (solo salen las que dan resultados)
  const SUGGESTIONS = ['Reflejante', 'Mandil', 'Polo', 'Mezclilla', 'Welt', 'Dieléctrico'];

  /* ---------------------------------------------------------------
     Utilidades
     --------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const plural = (n, one, many) => (n === 1 ? one : many);

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---------------------------------------------------------------
     Datos: categorías y productos (se preparan una sola vez)
     --------------------------------------------------------------- */
  const CATS = DATA.categorias;
  const PRODS = DATA.productos;
  const catById = Object.fromEntries(CATS.map((c) => [c.id, c]));

  const LIST_KEYS = ['linea'].concat(FACETS.map((f) => f.key));   // filtros con lista de valores
  PRODS.forEach((p, i) => {
    p._i = i;
    p._cat = catById[p.cat];
    if (!p._cat) console.warn('[catalogo] Categoría desconocida en', p.id, p.cat);
    p.f = p.f || {};
    p.f.cat = [p.cat];
    p.f.linea = [p._cat ? p._cat.linea : 'uniformes'];
    LIST_KEYS.forEach((k) => { if (!Array.isArray(p.f[k])) p.f[k] = []; });
    if (!Array.isArray(p.f.talla)) p.f.talla = null;
    p.specs = p.specs || [];

    // Texto donde busca el buscador (sin acentos, en minúsculas)
    const bits = [p.nombre, p.modelo || '', p.desc || '', p._cat.nombre, LINEAS[p._cat.linea] || ''];
    p.specs.forEach((s) => bits.push(s[1]));
    LIST_KEYS.forEach((k) => { if (k !== 'cat' && k !== 'linea') p.f[k].forEach((v) => bits.push(v)); });
    p._hay = norm(bits.join(' '));
    p._name = norm(p.nombre);
  });

  const ALL_SIZES = (() => {
    const s = PRODS.filter((p) => p.f.talla);
    if (!s.length) return [];
    const min = Math.min(...s.map((p) => p.f.talla[0]));
    const max = Math.max(...s.map((p) => p.f.talla[1]));
    const out = [];
    for (let n = min; n <= max; n++) out.push(n);
    return out;
  })();

  function valuesOf(key) {
    if (key === 'cat') return CATS.map((c) => c.id);
    const seen = [];
    PRODS.forEach((p) => p.f[key].forEach((v) => { if (!seen.includes(v)) seen.push(v); }));
    return seen;
  }
  const labelOf = (key, v) => (key === 'cat' ? (catById[v] ? catById[v].nombre : v) : (key === 'linea' ? LINEAS[v] || v : v));

  /* ---------------------------------------------------------------
     Estado
     --------------------------------------------------------------- */
  const state = { q: '', tokens: [], sel: {}, talla: null, sort: 'sug' };
  LIST_KEYS.forEach((k) => { state.sel[k] = new Set(); });
  let results = [];
  let qvId = null;          // producto abierto en la vista previa
  let qvList = [];          // ids sobre los que se navega con las flechas
  let qvOpener = null;      // elemento que abrió la vista previa (para devolver el foco)

  function readUrl() {
    let u;
    try { u = new URLSearchParams(location.search); } catch (e) { return; }
    state.q = (u.get('q') || '').trim();
    state.tokens = norm(state.q).split(/\s+/).filter(Boolean);
    LIST_KEYS.forEach((k) => {
      const valid = valuesOf(k);
      u.getAll(k).forEach((v) => { if (valid.includes(v)) state.sel[k].add(v); });
    });
    const t = parseInt(u.get('talla'), 10);
    if (ALL_SIZES.includes(t)) state.talla = t;
    const o = u.get('orden');
    if (['az', 'za'].includes(o)) state.sort = o;
    return u.get('p');
  }

  function syncUrl() {
    const u = new URLSearchParams();
    if (state.q) u.set('q', state.q);
    LIST_KEYS.forEach((k) => state.sel[k].forEach((v) => u.append(k, v)));
    if (state.talla !== null) u.set('talla', state.talla);
    if (state.sort !== 'sug') u.set('orden', state.sort);
    if (qvId) u.set('p', qvId);
    const qs = u.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// */ }
  }

  /* ---------------------------------------------------------------
     Filtrado
     "skip" sirve para calcular los contadores de un filtro sin
     contar la selección de ese mismo filtro.
     --------------------------------------------------------------- */
  function matches(p, skip) {
    if (state.tokens.length && !state.tokens.every((t) => p._hay.includes(t))) return false;
    for (const k of LIST_KEYS) {
      if (k === skip) continue;
      const s = state.sel[k];
      if (s.size && !p.f[k].some((v) => s.has(v))) return false;
    }
    if (skip !== 'talla' && state.talla !== null) {
      const t = p.f.talla;
      if (!t || state.talla < t[0] || state.talla > t[1]) return false;
    }
    return true;
  }

  function score(p) {
    // relevancia sencilla: palabras encontradas en el nombre pesan más
    let s = 0;
    state.tokens.forEach((t) => { if (p._name.includes(t)) s += 2; });
    if (state.tokens.length && p._name.startsWith(state.tokens[0])) s += 1;
    return s;
  }

  function sortResults(list) {
    if (state.sort === 'az') return list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (state.sort === 'za') return list.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    if (state.tokens.length) return list.sort((a, b) => score(b) - score(a) || a._i - b._i);
    return list.sort((a, b) => a._i - b._i);
  }

  /* ---------------------------------------------------------------
     Elementos de la página
     --------------------------------------------------------------- */
  let el = {};
  const facetUI = {};   // key -> { groupEl, opts: [{value, input, label, countEl, count}], moreBtn }

  /* ---------------------------------------------------------------
     Plantillas
     --------------------------------------------------------------- */
  function highlight(text) {
    if (!state.tokens.length) return esc(text);
    const n = norm(text);
    if (n.length !== text.length) return esc(text);       // por seguridad con caracteres raros
    const marks = new Array(text.length).fill(false);
    state.tokens.forEach((t) => {
      let i = n.indexOf(t);
      while (i !== -1) { for (let k = i; k < i + t.length; k++) marks[k] = true; i = n.indexOf(t, i + t.length); }
    });
    let out = '', open = false;
    for (let i = 0; i < text.length; i++) {
      if (marks[i] && !open) { out += '<mark class="bg-secondary-container text-on-surface rounded-sm px-0.5">'; open = true; }
      if (!marks[i] && open) { out += '</mark>'; open = false; }
      out += esc(text[i]);
    }
    return open ? out + '</mark>' : out;
  }

  function chipsFor(p) {
    const order = p._cat.linea === 'calzado'
      ? ['proteccion', 'proceso', 'talla']
      : ['reflejante', 'manga', 'color', 'material', 'genero'];
    const out = [];
    order.forEach((k) => {
      if (out.length >= 3) return;
      if (k === 'talla') { if (p.f.talla) out.push('Tallas ' + p.f.talla[0] + '–' + p.f.talla[1]); return; }
      p.f[k].forEach((v) => { if (out.length < 3 && !out.includes(v)) out.push(v); });
    });
    return out;
  }

  const contactUrl = (p) => CONTACT_PAGE + '?' + new URLSearchParams({ producto: p.nombre, categoria: p._cat.nombre, ref: p.id }).toString();

  function visualHTML(p, big) {
    if (p.img) {
      return '<img src="' + esc(p.img) + '" alt="' + esc(p.nombre) + '" loading="lazy" class="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"/>';
    }
    return '<div class="absolute inset-0 flex items-center justify-center" style="background-image:radial-gradient(rgba(11,27,61,.10) 1px,transparent 1.5px);background-size:16px 16px">' +
      '<span class="material-symbols-outlined ' + (big ? 'text-[120px]' : 'text-[68px]') + ' text-primary-container/25 group-hover:scale-110 transition-transform duration-500" aria-hidden="true">' + esc(p._cat.icono) + '</span></div>';
  }

  function cardHTML(p) {
    const cat = p._cat;
    const chips = chipsFor(p).map((c) => '<li class="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">' + esc(c) + '</li>').join('');
    return '' +
'<article class="group relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300" data-id="' + esc(p.id) + '">' +
  '<div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br ' + TINTS[cat.tinte % TINTS.length] + '">' +
    visualHTML(p, false) +
    '<span class="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-primary-container/90 text-on-primary font-label-xs text-label-xs font-semibold backdrop-blur-sm">' + esc(cat.corto) + '</span>' +
  '</div>' +
  '<div class="flex flex-col gap-space-xs p-space-md flex-1">' +
    '<span class="font-label-xs text-label-xs uppercase tracking-wider text-secondary font-bold">' + esc(LINEAS[cat.linea] || '') + '</span>' +
    '<h3 class="font-title-md text-title-md text-on-surface line-clamp-2 min-h-[3rem]">' + highlight(p.nombre) + '</h3>' +
    '<ul class="flex flex-wrap gap-1.5 mt-1">' + chips + '</ul>' +
    '<div class="mt-auto pt-space-sm flex flex-wrap items-center justify-between gap-2">' +
      '<button type="button" data-qv="' + esc(p.id) + '" class="relative z-[2] inline-flex items-center gap-1.5 px-2 py-2 rounded-lg whitespace-nowrap text-primary-container font-body-sm text-body-sm font-semibold hover:bg-surface-container transition-colors">' +
        '<span class="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>Vista rápida</button>' +
      '<a href="' + esc(contactUrl(p)) + '" data-path="contacto" class="vs-btn relative z-[2] inline-flex items-center justify-center gap-1.5 px-space-sm py-2 whitespace-nowrap bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold">' +
        '<span class="vs-btn-text">Más info</span><span class="material-symbols-outlined vs-btn-icon text-[16px]" aria-hidden="true">arrow_forward</span></a>' +
    '</div>' +
  '</div>' +
  // capa invisible para que toda la tarjeta abra la vista previa con el mouse
  '<button type="button" data-qv="' + esc(p.id) + '" tabindex="-1" aria-hidden="true" class="absolute inset-0 z-[1] cursor-pointer"></button>' +
'</article>';
  }

  function emptyHTML() {
    return '' +
'<div class="col-span-full flex flex-col items-center text-center gap-space-sm py-space-3xl px-space-md bg-surface-container-lowest rounded-xl">' +
  '<span class="material-symbols-outlined text-[44px] text-secondary" aria-hidden="true">search_off</span>' +
  '<h3 class="font-headline-sm text-headline-sm text-on-surface">No encontramos productos con esa búsqueda</h3>' +
  '<p class="font-body-md text-body-md text-on-surface-variant max-w-md">Prueba con otra palabra o quita algún filtro. Si buscas algo en específico, un ejecutivo te ayuda.</p>' +
  '<div class="flex flex-wrap justify-center gap-space-sm pt-space-sm">' +
    '<button type="button" data-clear-all class="vs-btn inline-flex items-center justify-center gap-2 px-space-md py-2.5 bg-primary-container text-on-primary font-body-md text-body-md font-semibold"><span class="vs-btn-text">Limpiar filtros</span></button>' +
    '<a href="' + CONTACT_PAGE + '" data-path="contacto" class="vs-btn inline-flex items-center justify-center gap-2 px-space-md py-2.5 bg-surface-container-low text-primary-container font-body-md text-body-md font-semibold"><span class="vs-btn-text">Hablar con un ejecutivo</span></a>' +
  '</div>' +
'</div>';
  }

  /* ---------------------------------------------------------------
     Filtros (se construyen UNA vez; después solo cambian contadores)
     --------------------------------------------------------------- */
  function optionHTML(f, v) {
    const val = esc(v), lab = esc(labelOf(f.key, v));
    if (f.kind === 'list') {
      return '<label class="flex items-center gap-2.5 px-space-sm py-1.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors text-body-sm font-body-sm text-on-surface-variant" data-opt>' +
        '<input type="checkbox" class="w-4 h-4 shrink-0 accent-primary-container" data-facet="' + f.key + '" value="' + val + '"/>' +
        '<span class="flex-1 min-w-0">' + lab + '</span>' +
        '<span class="font-label-md text-label-md text-secondary tabular-nums" data-count></span></label>';
    }
    let dot = '';
    if (f.kind === 'color') {
      const bg = COLOR_DOT[v] ? COLOR_DOT[v] : COLOR_MULTI;
      dot = '<span class="w-3.5 h-3.5 rounded-full border border-outline-variant shrink-0" style="background:' + bg + '"></span>';
    }
    return '<label class="cursor-pointer" data-opt>' +
      '<input type="checkbox" class="peer sr-only" data-facet="' + f.key + '" value="' + val + '"/>' +
      '<span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm text-on-surface-variant transition-colors hover:border-primary-container peer-checked:bg-primary-container peer-checked:border-primary-container peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-container">' +
      dot + '<span>' + lab + '</span><span class="opacity-60 font-label-md text-label-md tabular-nums" data-count></span></span></label>';
  }

  function buildFilters() {
    const host = el.groups;
    host.innerHTML = '';
    FACETS.forEach((f) => {
      const values = valuesOf(f.key);
      if (!values.length) return;
      const wrapCls = f.kind === 'list' ? 'flex flex-col gap-0.5' : 'flex flex-wrap gap-2';
      const det = document.createElement('details');
      det.className = 'group border-b border-surface-container py-space-sm last:border-b-0';
      det.dataset.group = f.key;
      det.innerHTML =
        '<summary class="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden py-1.5 select-none">' +
          '<span class="font-label-md text-label-md text-primary-container uppercase tracking-wider font-bold">' + esc(f.label) + '</span>' +
          '<span class="material-symbols-outlined text-[20px] text-secondary transition-transform duration-200 group-open:rotate-180" aria-hidden="true">expand_more</span>' +
        '</summary>' +
        '<div class="pt-1 ' + wrapCls + '" data-opts>' + values.map((v) => optionHTML(f, v)).join('') + '</div>';
      host.appendChild(det);

      const ui = { groupEl: det, opts: [], moreBtn: null };
      $$('[data-opt]', det).forEach((lab, i) => {
        ui.opts.push({ value: values[i], label: lab, input: $('input', lab), countEl: $('[data-count]', lab), count: 0 });
      });

      if (f.collapse && values.length > f.collapse) {
        ui.opts.forEach((o, i) => { if (i >= f.collapse) o.label.classList.add('hidden'); });
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mt-1 px-space-sm py-1 text-left font-body-sm text-body-sm text-primary-container font-semibold hover:underline';
        btn.textContent = 'Ver todas (' + values.length + ')';
        btn.dataset.more = f.key;
        $('[data-opts]', det).appendChild(btn);
        ui.moreBtn = btn;
      }
      facetUI[f.key] = ui;
    });

    // Talla (solo tiene sentido con calzado)
    if (ALL_SIZES.length) {
      const det = document.createElement('details');
      det.className = 'group border-b border-surface-container py-space-sm last:border-b-0';
      det.dataset.group = 'talla';
      det.innerHTML =
        '<summary class="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden py-1.5 select-none">' +
          '<span class="font-label-md text-label-md text-primary-container uppercase tracking-wider font-bold">Talla de calzado</span>' +
          '<span class="material-symbols-outlined text-[20px] text-secondary transition-transform duration-200 group-open:rotate-180" aria-hidden="true">expand_more</span>' +
        '</summary>' +
        '<div class="pt-1">' +
          '<label class="sr-only" for="size-select">Talla de calzado</label>' +
          '<select id="size-select" class="w-full rounded-lg bg-surface-container-low border border-outline-variant px-3 py-2 text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container">' +
            '<option value="">Cualquier talla</option>' +
            ALL_SIZES.map((n) => '<option value="' + n + '">Talla ' + n + '</option>').join('') +
          '</select>' +
          '<p class="mt-2 font-label-md text-label-md text-secondary">Muestra el calzado que se fabrica en esa talla.</p>' +
        '</div>';
      host.appendChild(det);
      facetUI.talla = { groupEl: det, select: $('select', det) };
    }

    // Abiertos por defecto / con selección
    Object.keys(facetUI).forEach((k) => {
      const f = FACETS.find((x) => x.key === k);
      const hasSel = k === 'talla' ? state.talla !== null : state.sel[k].size > 0;
      facetUI[k].groupEl.open = !!((f && f.open) || hasSel);
    });
    // si hay algo elegido en la parte colapsada de "tela", se despliega
    FACETS.forEach((f) => {
      const ui = facetUI[f.key];
      if (ui && ui.moreBtn && ui.opts.some((o, i) => i >= f.collapse && state.sel[f.key].has(o.value))) toggleMore(f.key, true);
    });
  }

  function toggleMore(key, forceOpen) {
    const f = FACETS.find((x) => x.key === key), ui = facetUI[key];
    if (!f || !ui || !ui.moreBtn) return;
    const expanded = forceOpen !== undefined ? forceOpen : ui.moreBtn.dataset.expanded !== '1';
    ui.opts.forEach((o, i) => { if (i >= f.collapse) o.label.classList.toggle('hidden', !expanded); });
    ui.moreBtn.dataset.expanded = expanded ? '1' : '0';
    ui.moreBtn.textContent = expanded ? 'Ver menos' : 'Ver todas (' + ui.opts.length + ')';
  }

  /* ---------------------------------------------------------------
     Pintar la página
     --------------------------------------------------------------- */
  function renderGrid() {
    el.grid.innerHTML = results.length ? results.map(cardHTML).join('') : emptyHTML();
  }

  function renderFacets() {
    FACETS.forEach((f) => {
      const ui = facetUI[f.key];
      if (!ui) return;
      const base = PRODS.filter((p) => matches(p, f.key));
      const counts = new Map();
      base.forEach((p) => p.f[f.key].forEach((v) => counts.set(v, (counts.get(v) || 0) + 1)));
      let visible = false;
      ui.opts.forEach((o) => {
        const c = counts.get(o.value) || 0;
        const chosen = state.sel[f.key].has(o.value);
        o.count = c;
        o.countEl.textContent = c;
        o.input.checked = chosen;
        const off = c === 0 && !chosen;
        o.input.disabled = off;
        o.label.classList.toggle('opacity-40', off);
        o.label.classList.toggle('cursor-not-allowed', off);
        if (c > 0 || chosen) visible = true;
      });
      ui.groupEl.classList.toggle('hidden', !visible);
    });

    // Talla: se muestra solo si en el contexto actual hay calzado con tallas
    if (facetUI.talla) {
      const base = PRODS.filter((p) => matches(p, 'talla'));
      facetUI.talla.groupEl.classList.toggle('hidden', !(base.some((p) => p.f.talla) || state.talla !== null));
      facetUI.talla.select.value = state.talla === null ? '' : String(state.talla);
    }

    // Pestañas de línea (Todos / Uniformes / Calzado)
    const baseL = PRODS.filter((p) => matches(p, 'linea'));
    $$('[data-linea]', el.tabs).forEach((b) => {
      const v = b.dataset.linea;
      const n = v ? baseL.filter((p) => p.f.linea.includes(v)).length : baseL.length;
      $('[data-count]', b).textContent = n;
      const active = v ? state.sel.linea.has(v) && state.sel.linea.size === 1 : state.sel.linea.size === 0;
      b.setAttribute('aria-selected', active ? 'true' : 'false');
      b.classList.toggle('bg-surface-container-lowest', active);
      b.classList.toggle('text-primary-container', active);
      b.classList.toggle('shadow-sm', active);
      b.classList.toggle('text-on-surface-variant', !active);
    });
  }

  function activeChips() {
    const out = [];
    if (state.q) out.push({ k: 'q', v: '', text: 'Búsqueda: “' + state.q + '”' });
    LIST_KEYS.forEach((k) => {
      if (k === 'linea') return;                 // la línea ya se ve en las pestañas
      state.sel[k].forEach((v) => out.push({ k, v, text: labelOf(k, v) }));
    });
    if (state.talla !== null) out.push({ k: 'talla', v: '', text: 'Talla ' + state.talla });
    return out;
  }

  function renderChips() {
    const chips = activeChips();
    const linea = state.sel.linea.size;
    const total = chips.length + (linea ? 1 : 0);
    el.chips.classList.toggle('hidden', total === 0);
    el.chips.innerHTML = chips.map((c) =>
      '<button type="button" data-rm-k="' + c.k + '" data-rm-v="' + esc(c.v) + '" class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm hover:border-primary-container transition-colors" aria-label="Quitar filtro: ' + esc(c.text) + '">' +
      esc(c.text) + '<span class="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">close</span></button>'
    ).join('') + (total ? '<button type="button" data-clear-all class="px-2 py-1 font-body-sm text-body-sm text-primary-container font-semibold hover:underline">Limpiar todo</button>' : '');

    // contador en el botón "Filtros" (móvil) y en los textos de la cortina
    const nFilters = chips.filter((c) => c.k !== 'q').length + (linea ? 1 : 0);
    el.filtersBadge.textContent = nFilters;
    el.filtersBadge.classList.toggle('hidden', nFilters === 0);
  }

  function renderCount() {
    const n = results.length, total = PRODS.length;
    el.count.innerHTML = '<strong class="font-semibold text-on-surface">' + n + '</strong> ' + plural(n, 'producto', 'productos') +
      (n !== total ? ' de ' + total : '');
    el.applyBtn.querySelector('[data-apply-text]').textContent = n ? 'Ver ' + n + ' ' + plural(n, 'producto', 'productos') : 'Sin resultados';
  }

  function update() {
    results = sortResults(PRODS.filter((p) => matches(p)));
    renderGrid();
    renderFacets();
    renderChips();
    renderCount();
    syncUrl();
  }

  /* ---------------------------------------------------------------
     Acciones sobre filtros
     --------------------------------------------------------------- */
  function toggleValue(key, value, on) {
    const s = state.sel[key];
    if (on === undefined) on = !s.has(value);
    if (on) s.add(value); else s.delete(value);
    update();
  }

  function clearAll() {
    LIST_KEYS.forEach((k) => state.sel[k].clear());
    state.talla = null;
    setQuery('', true);
  }

  function setQuery(v, updateInput) {
    state.q = String(v).trim();
    state.tokens = norm(state.q).split(/\s+/).filter(Boolean);
    if (updateInput) el.input.value = v;
    el.clear.classList.toggle('hidden', !el.input.value);
    update();
  }

  function scrollToResults() {
    el.anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------------------------------------------------------------
     Cortina de filtros (móvil)
     --------------------------------------------------------------- */
  let drawerOpen = false;
  function setDrawer(open) {
    drawerOpen = open;
    el.filters.classList.toggle('-translate-x-full', !open);
    el.overlay.classList.toggle('hidden', !open);
    el.filtersOpen.setAttribute('aria-expanded', open ? 'true' : 'false');
    lockScroll();
    if (open) setTimeout(() => { const b = $('[data-close-drawer]', el.filters); if (b) b.focus(); }, 50);
    else if (document.activeElement && el.filters.contains(document.activeElement)) el.filtersOpen.focus();
  }

  function lockScroll() {
    document.documentElement.classList.toggle('overflow-hidden', drawerOpen || !!qvId);
  }

  /* ---------------------------------------------------------------
     Vista previa
     --------------------------------------------------------------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function renderQV(p) {
    const cat = p._cat;
    const idx = qvList.indexOf(p.id);
    el.qvVisual.className = 'group relative aspect-[4/3] md:aspect-auto md:min-h-[26rem] overflow-hidden bg-gradient-to-br ' + TINTS[cat.tinte % TINTS.length];
    el.qvVisual.innerHTML = visualHTML(p, true) +
      '<span class="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-primary-container/90 text-on-primary font-label-xs text-label-xs font-semibold backdrop-blur-sm">' + esc(cat.corto) + '</span>';
    el.qvEyebrow.textContent = (LINEAS[cat.linea] || '') + ' · ' + cat.nombre;
    el.qvTitle.textContent = p.nombre;
    el.qvDesc.textContent = p.desc || '';
    el.qvDesc.classList.toggle('hidden', !p.desc);
    el.qvSpecs.innerHTML = p.specs.map((s) =>
      '<div class="flex justify-between gap-space-md py-2 border-b border-surface-container last:border-b-0">' +
      '<dt class="font-body-sm text-body-sm text-secondary">' + esc(s[0]) + '</dt>' +
      '<dd class="font-body-sm text-body-sm text-on-surface font-semibold text-right">' + esc(s[1]) + '</dd></div>').join('');
    el.qvSpecsWrap.classList.toggle('hidden', !p.specs.length);
    el.qvCta.href = contactUrl(p);
    el.qvPos.textContent = (idx + 1) + ' de ' + qvList.length;
    const many = qvList.length > 1;
    el.qvPrev.disabled = el.qvNext.disabled = !many;
    el.qvNav.classList.toggle('hidden', !many);
  }

  function openQV(id, opener) {
    const p = PRODS.find((x) => x.id === id);
    if (!p) return;
    qvOpener = opener || document.activeElement;
    const ids = results.map((r) => r.id);
    qvList = ids.includes(id) ? ids : [id];
    const wasOpen = !!qvId;
    qvId = id;
    renderQV(p);
    syncUrl();
    if (!wasOpen) {
      el.qv.classList.remove('hidden');
      lockScroll();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.qvBackdrop.classList.replace('opacity-0', 'opacity-100');
        el.qvPanel.classList.remove('opacity-0', 'translate-y-3');
        el.qvPanel.classList.add('opacity-100', 'translate-y-0');
      }));
      setTimeout(() => el.qvClose.focus(), 60);
    }
  }

  function closeQV() {
    if (!qvId) return;
    qvId = null;
    el.qvBackdrop.classList.replace('opacity-100', 'opacity-0');
    el.qvPanel.classList.remove('opacity-100', 'translate-y-0');
    el.qvPanel.classList.add('opacity-0', 'translate-y-3');
    setTimeout(() => { if (!qvId) el.qv.classList.add('hidden'); }, 200);
    lockScroll();
    syncUrl();
    if (qvOpener && document.body.contains(qvOpener)) qvOpener.focus();
  }

  function stepQV(dir) {
    if (!qvId || qvList.length < 2) return;
    const i = qvList.indexOf(qvId);
    const next = qvList[(i + dir + qvList.length) % qvList.length];
    const p = PRODS.find((x) => x.id === next);
    qvId = next;
    renderQV(p);
    syncUrl();
  }

  /* ---------------------------------------------------------------
     Eventos
     --------------------------------------------------------------- */
  function bind() {
    // Buscador
    el.input.addEventListener('input', debounce(() => setQuery(el.input.value), 120));
    el.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); setQuery(el.input.value); scrollToResults(); }
      else if (e.key === 'Escape') { if (el.input.value) { e.preventDefault(); setQuery('', true); } else el.input.blur(); }
    });
    el.clear.addEventListener('click', () => { setQuery('', true); el.input.focus(); });
    el.suggest.addEventListener('click', (e) => {
      const b = e.target.closest('[data-suggest]');
      if (!b) return;
      setQuery(b.dataset.suggest, true);
      scrollToResults();
    });

    // Filtros (casillas y botones)
    el.groups.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('input[data-facet]')) toggleValue(t.dataset.facet, t.value, t.checked);
      else if (t.id === 'size-select') { state.talla = t.value === '' ? null : parseInt(t.value, 10); update(); }
    });
    el.groups.addEventListener('click', (e) => {
      const m = e.target.closest('[data-more]');
      if (m) toggleMore(m.dataset.more);
    });

    // Pestañas de línea
    el.tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-linea]');
      if (!b) return;
      state.sel.linea.clear();
      if (b.dataset.linea) state.sel.linea.add(b.dataset.linea);
      update();
    });

    // Chips activos, "limpiar todo"
    document.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm-k]');
      if (rm) {
        const k = rm.dataset.rmK, v = rm.dataset.rmV;
        if (k === 'q') setQuery('', true);
        else if (k === 'talla') { state.talla = null; update(); }
        else toggleValue(k, v, false);
        return;
      }
      if (e.target.closest('[data-clear-all]')) { clearAll(); return; }

      const qv = e.target.closest('[data-qv]');
      if (qv) openQV(qv.dataset.qv, qv.closest('article') ? $('button[data-qv]:not([tabindex])', qv.closest('article')) : qv);
    });

    // Orden
    el.sort.addEventListener('change', () => { state.sort = el.sort.value; update(); });

    // Cortina móvil
    el.filtersOpen.addEventListener('click', () => setDrawer(true));
    el.overlay.addEventListener('click', () => setDrawer(false));
    el.applyBtn.addEventListener('click', () => { setDrawer(false); scrollToResults(); });
    $$('[data-close-drawer]', el.filters).forEach((b) => b.addEventListener('click', () => setDrawer(false)));
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && drawerOpen) setDrawer(false); });

    // Vista previa
    el.qvClose.addEventListener('click', closeQV);
    el.qvBackdrop.addEventListener('click', closeQV);
    el.qv.addEventListener('click', (e) => { if (e.target.hasAttribute('data-qv-outside')) closeQV(); });
    el.qvPrev.addEventListener('click', () => stepQV(-1));
    el.qvNext.addEventListener('click', () => stepQV(1));

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (qvId) {
        if (e.key === 'Escape') { e.preventDefault(); closeQV(); }
        else if (e.key === 'ArrowRight') stepQV(1);
        else if (e.key === 'ArrowLeft') stepQV(-1);
        else if (e.key === 'Tab') {                       // el foco se queda dentro de la ventana
          const f = $$(FOCUSABLE, el.qvPanel).filter((n) => n.offsetParent !== null);
          if (!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        return;
      }
      if (drawerOpen && e.key === 'Escape') { setDrawer(false); return; }
      if (e.key === '/' && !/^(input|textarea|select)$/i.test(e.target.tagName) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        el.input.focus();
        el.input.select();
      }
    });
  }

  /* ---------------------------------------------------------------
     Arranque
     --------------------------------------------------------------- */
  function init() {
    el = {
      input: $('#search-input'), clear: $('#search-clear'), suggest: $('#search-suggest'), stats: $('#search-stats'),
      anchor: $('#resultados'), tabs: $('#linea-tabs'), sort: $('#sort-select'), chips: $('#active-filters'),
      count: $('#results-count'), grid: $('#product-grid'),
      filters: $('#filters'), groups: $('#filters-groups'), overlay: $('#filters-overlay'),
      filtersOpen: $('#filters-open'), filtersBadge: $('#filters-badge'), applyBtn: $('#filters-apply'),
      qv: $('#qv'), qvBackdrop: $('#qv-backdrop'), qvPanel: $('#qv-panel'), qvClose: $('#qv-close'),
      qvVisual: $('#qv-visual'), qvEyebrow: $('#qv-eyebrow'), qvTitle: $('#qv-title'), qvDesc: $('#qv-desc'),
      qvSpecs: $('#qv-specs'), qvSpecsWrap: $('#qv-specs-wrap'), qvCta: $('#qv-cta'),
      qvPrev: $('#qv-prev'), qvNext: $('#qv-next'), qvPos: $('#qv-pos'), qvNav: $('#qv-nav'),
    };
    if (!el.grid || !el.input) { console.error('[catalogo] Faltan elementos en productos.html'); return; }

    const openId = readUrl();
    el.input.value = state.q;
    el.clear.classList.toggle('hidden', !state.q);
    el.sort.value = state.sort;

    // Sugerencias del buscador: solo las que sí devuelven productos
    const sug = SUGGESTIONS.filter((w) => PRODS.some((p) => p._hay.includes(norm(w))));
    el.suggest.innerHTML = sug.map((w) =>
      '<button type="button" data-suggest="' + esc(w) + '" class="px-3 py-1 rounded-full bg-surface-container-lowest border border-outline-variant font-body-sm text-body-sm text-on-surface-variant hover:border-primary-container hover:text-primary-container transition-colors">' + esc(w) + '</button>').join('');
    if (el.stats) el.stats.textContent = PRODS.length + ' productos en ' + CATS.length + ' categorías';

    buildFilters();
    bind();
    update();

    // Si llegaron desde el megamenú / una tarjeta (?cat=...), bajar directo a los resultados
    const hasFilters = state.q || state.talla !== null || LIST_KEYS.some((k) => state.sel[k].size);
    if (openId && PRODS.some((p) => p.id === openId)) openQV(openId, null);
    else if (hasFilters) {
      const go = () => el.anchor.scrollIntoView({ block: 'start' });
      if (document.readyState === 'complete') setTimeout(go, 50);
      else window.addEventListener('load', () => setTimeout(go, 50), { once: true });
    }
  }

  ready(init);
})();