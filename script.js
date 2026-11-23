/* Bronze / Silver / Gold pipeline simulation.
   Records enter on the left, pass a schema check and a quality check,
   and the survivors build up as bars in the Gold layer.
   The data is generated for illustration only. */
(function () {
  'use strict';

  var wrap = document.getElementById('pipe-wrap');
  var canvas = document.getElementById('pipe');
  if (!wrap || !canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var btn = document.getElementById('inject');
  var okEl = document.getElementById('n-ok');
  var badEl = document.getElementById('n-bad');
  var logEl = document.getElementById('log');
  var announceEl = document.getElementById('announce');

  var G1 = 0.36;            // schema check, as a fraction of the width
  var G2 = 0.68;            // quality check
  var LANES = 7;
  var BARS = 6;
  var BARMAX = 16;
  var WEIGHTS = [1, 2, 3, 2.5, 1.5, 0.8];
  var WSUM = WEIGHTS.reduce(function (a, b) { return a + b; }, 0);

  var COLOR = { bronze: '#9A5B33', steel: '#6E7F8E', gold: '#D1A02B', goldDark: '#A67E16', bad: '#B23A2E', ink: '#17222C' };
  var REASONS1 = ['a column has the wrong type', 'a required field is missing', 'the schema changed unexpectedly'];
  var REASONS2 = ['it has a duplicate key', 'a value is out of range', 'its customer ID is null'];

  var W = 0, H = 0, dpr = 1, padTop = 66, padBottom = 46;
  var rows = [];
  var bars = [];
  for (var b = 0; b < BARS; b++) bars.push(0);
  var accepted = 0, rejected = 0;
  var shownOk = -1, shownBad = -1;
  var spawnTimer = 0, clock = 0, injectNo = 0, pending = null;

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function laneY(i) { return padTop + (H - padTop - padBottom) * (i + 0.5) / LANES; }
  function nearestLane(y) {
    var best = 0, bd = 1e9;
    for (var i = 0; i < LANES; i++) {
      var d = Math.abs(laneY(i) - y);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  function barBase() { return H - 44; }
  function barMaxH() { return Math.max(40, barBase() - 80); }
  function slotW() { return (W - G2 * W) * 0.84 / BARS; }
  function barX(i) { return G2 * W + (W - G2 * W) * 0.08 + slotW() * (i + 0.5); }
  function barTop(i) { return barBase() - bars[i] / BARMAX * barMaxH(); }
  function pickBar() {
    var r = Math.random() * WSUM;
    for (var i = 0; i < BARS; i++) { r -= WEIGHTS[i]; if (r <= 0) return i; }
    return BARS - 1;
  }

  function spawn(inject, gate) {
    var r = Math.random();
    var row = {
      x: -14,
      y: inject ? padTop + (H - padTop - padBottom) * 0.5 : padTop + Math.random() * (H - padTop - padBottom),
      w: inject ? 20 : 10 + Math.random() * 10,
      h: inject ? 12 : 6 + Math.random() * 5,
      rot: (Math.random() - 0.5) * 1.2,
      wob: Math.random() * 6.28,
      speed: inject ? W * 0.1 : W * (0.085 + Math.random() * 0.03),
      stage: 0, lane: 0, bar: 0, vy: 0, age: 0, dead: false,
      bad1: inject ? gate === 1 : r < 0.10,
      bad2: inject ? gate === 2 : (r >= 0.10 && r < 0.15),
      inject: !!inject
    };
    rows.push(row);
    return row;
  }

  function reject(row, gate) {
    row.stage = -1;
    row.vy = 10;
    row.age = 0;
    rejected++;
    if (row.inject) {
      pending = null;
      if (btn) btn.removeAttribute('aria-disabled');
      var msg = gate === 1
        ? 'Your record was stopped at the schema check because ' + pick(REASONS1) + '. It never reached Gold.'
        : 'Your record passed the schema check but was stopped at the quality check because ' + pick(REASONS2) + '. It never reached Gold.';
      logEl.textContent = msg;
      logEl.className = 'log is-bad';
      announceEl.textContent = msg;
    }
  }

  function step(dt) {
    clock += dt;
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn(false);
      spawnTimer = 0.16 + Math.random() * 0.14;
    }

    var i, row;
    for (i = 0; i < rows.length; i++) {
      row = rows[i];

      if (row.stage === 0) {
        row.x += row.speed * dt;
        row.y += Math.sin(clock * 3 + row.wob) * 10 * dt;
        row.y = Math.min(H - padBottom, Math.max(padTop, row.y));
        row.rot += Math.sin(clock * 2 + row.wob) * dt * 0.8;
        if (row.x >= G1 * W) {
          if (row.bad1) reject(row, 1);
          else { row.stage = 1; row.lane = nearestLane(row.y); }
        }
      } else if (row.stage === 1) {
        row.x += row.speed * dt;
        var k = Math.min(1, dt * 6);
        row.y += (laneY(row.lane) - row.y) * k;
        row.rot += (0 - row.rot) * k;
        row.w += ((row.inject ? 20 : 14) - row.w) * k;
        row.h += ((row.inject ? 12 : 8) - row.h) * k;
        if (row.x >= G2 * W) {
          if (row.bad2) reject(row, 2);
          else { row.stage = 2; row.bar = pickBar(); }
        }
      } else if (row.stage === 2) {
        var tx = barX(row.bar), ty = barTop(row.bar) - 5;
        var k2 = Math.min(1, dt * 3.2);
        row.x += (tx - row.x) * k2;
        row.y += (ty - row.y) * k2;
        if (Math.abs(tx - row.x) < 4 && Math.abs(ty - row.y) < 4) {
          row.dead = true;
          bars[row.bar] = Math.min(BARMAX, bars[row.bar] + 1);
          accepted++;
        }
      } else {
        row.age += dt;
        row.vy += 300 * dt;
        row.y += row.vy * dt;
        row.x += row.speed * dt * 0.3;
        if (row.age > 1.1) row.dead = true;
      }
    }

    for (i = 0; i < BARS; i++) bars[i] -= bars[i] * 0.12 * dt;
    rows = rows.filter(function (r) { return !r.dead; });
  }

  function drawGate(x) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, padTop - 14);
    ctx.moveTo(x, H - padBottom + 14);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Gold bars
    var bw = slotW() * 0.66, i;
    for (i = 0; i < BARS; i++) {
      var h = bars[i] / BARMAX * barMaxH();
      if (h < 1) continue;
      ctx.fillStyle = COLOR.gold;
      ctx.fillRect(barX(i) - bw / 2, barBase() - h, bw, h);
      ctx.fillStyle = COLOR.goldDark;
      ctx.fillRect(barX(i) - bw / 2, barBase() - h, bw, 2);
    }
    // Bar baseline
    ctx.fillStyle = 'rgba(23,34,44,0.35)';
    ctx.fillRect(G2 * W + (W - G2 * W) * 0.06, barBase(), (W - G2 * W) * 0.88, 1);

    // Gates
    ctx.strokeStyle = 'rgba(23,34,44,0.5)';
    ctx.lineWidth = 2;
    drawGate(Math.round(G1 * W));
    drawGate(Math.round(G2 * W));

    // Records
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      var c = r.stage === 0 ? COLOR.bronze : r.stage === 1 ? COLOR.steel : r.stage === 2 ? COLOR.gold : COLOR.bad;
      ctx.save();
      ctx.globalAlpha = r.stage === -1 ? Math.max(0, 1 - r.age / 1.1) : 1;
      ctx.translate(r.x, r.y);
      ctx.rotate(r.rot);
      ctx.fillStyle = c;
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
      if (r.inject) {
        ctx.strokeStyle = COLOR.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(-r.w / 2 - 3, -r.h / 2 - 3, r.w + 6, r.h + 6);
      }
      ctx.restore();
      if (r.inject && r.stage !== -1) {
        ctx.save();
        ctx.fillStyle = COLOR.ink;
        ctx.font = '600 12px "Bricolage Grotesque", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('your record', r.x, r.y - 16);
        ctx.restore();
      }
    }
  }

  function updateTally() {
    if (accepted !== shownOk) { shownOk = accepted; okEl.textContent = accepted.toLocaleString('en-IN'); }
    if (rejected !== shownBad) { shownBad = rejected; badEl.textContent = rejected.toLocaleString('en-IN'); }
  }

  function resize() {
    var box = wrap.getBoundingClientRect();
    var nw = Math.max(1, Math.round(box.width));
    var nh = Math.max(1, Math.round(box.height));
    if (nw === W && nh === H) return;
    var sx = W ? nw / W : 1, sy = H ? nh / H : 1;
    W = nw; H = nh;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    padTop = W <= 760 ? 56 : 66;
    for (var i = 0; i < rows.length; i++) { rows[i].x *= sx; rows[i].y *= sy; }
    if (reduce) draw();
  }

  // Animation loop, only while the pipeline is on screen
  var running = false, last = 0;
  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    step(dt);
    draw();
    updateTally();
    requestAnimationFrame(frame);
  }
  function setRunning(v) {
    if (v === running) return;
    running = v;
    if (v) { last = performance.now(); requestAnimationFrame(frame); }
  }

  btn.addEventListener('click', function () {
    if (pending) return;
    injectNo++;
    pending = spawn(true, injectNo % 2 === 1 ? 1 : 2);
    btn.setAttribute('aria-disabled', 'true');
    logEl.className = 'log';
    logEl.textContent = 'Record sent. Watch it travel through the layers.';
    if (reduce) {
      var n = 0;
      while (pending && n < 900) { step(1 / 30); n++; }
      draw();
      updateTally();
    }
  });

  resize();
  for (var w = 0; w < 300; w++) step(1 / 30);   // start with a populated pipeline
  draw();
  updateTally();

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(wrap);
  else window.addEventListener('resize', resize);

  if (!reduce) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        setRunning(entries[0].isIntersecting);
      }, { threshold: 0.05 }).observe(wrap);
    } else {
      setRunning(true);
    }
  }
})();


/* ------------------------------------------------------------------ */
/* Page behaviour: raw-to-clean motion, layer meter, project showcase  */
/* ------------------------------------------------------------------ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = window.RUN_DATA;
  var nf = new Intl.NumberFormat('en-IN');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  /* ---------- Project showcase, built from the real run data ---------- */
  var RULE_FIELD = {
    customer_id_not_null: 'customer_id', quantity_positive: 'quantity', unit_price_valid: 'unit_price',
    currency_known: 'currency', order_ts_parseable: 'order_ts', order_ts_not_future: 'order_ts',
    customer_exists: 'customer_id', product_exists: 'product_id', status_known: 'status'
  };

  function renderRules() {
    var host = document.getElementById('rules');
    if (!host || !D) return;
    var rows = D.scorecard.slice().sort(function (a, b) { return b.failed_orders - a.failed_orders; });
    var max = rows[0].failed_orders;
    rows.forEach(function (r) {
      var li = el('li', 'ledger-row raw');
      li.style.setProperty('--w', (r.failed_orders / max * 100).toFixed(1) + '%');
      var label = el('span', 'ledger-label', r.description);
      label.appendChild(el('span', 'rule-id', r.rule));
      var bar = el('span', 'ledger-bar'); bar.setAttribute('aria-hidden', 'true');
      li.appendChild(label); li.appendChild(bar);
      li.appendChild(el('span', 'ledger-count', nf.format(r.failed_orders)));
      host.appendChild(li);
    });
  }

  function renderProducts() {
    var host = document.getElementById('products');
    if (!host || !D) return;
    D.top_products.forEach(function (p) {
      var tr = el('tr');
      var first = el('td'); first.appendChild(document.createTextNode(p.name));
      first.appendChild(el('span', 'rule-id', p.category));
      tr.appendChild(first);
      [nf.format(p.orders), p.net_lakh.toFixed(1), (p.return_rate * 100).toFixed(1) + '%'].forEach(function (v) {
        tr.appendChild(el('td', 'num', v));
      });
      host.appendChild(tr);
    });
  }

  function renderRejects() {
    var host = document.getElementById('rejects');
    if (!host || !D) return;
    var desc = {};
    D.scorecard.forEach(function (r) { desc[r.rule] = r.description; });
    D.quarantine_sample.forEach(function (s) {
      var rule = s.failed[0], field = RULE_FIELD[rule];
      var value = s[field] === null || s[field] === '' ? '(empty)' : s[field];
      var li = el('li', 'reject raw');
      li.appendChild(el('span', 'reject-id', s.order_id));
      var bad = el('span', 'reject-bad');
      bad.appendChild(document.createTextNode(field + ' = '));
      bad.appendChild(el('mark', '', value));
      li.appendChild(bad);
      li.appendChild(el('span', 'reject-why', 'Failed "' + desc[rule] + '" (' + rule + ').'));
      host.appendChild(li);
    });
  }

  function renderChart() {
    var host = document.getElementById('chart');
    if (!host || !D) return;
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var top = 12; // scale ceiling, in crore
    var plot = el('div', 'chart-plot');
    var months = el('div', 'chart-months');
    [4, 8].forEach(function (v) {
      var g = el('span', 'grid-label', '\u20B9' + v + ' cr');
      g.style.bottom = 'calc(' + (v / top * 100) + '% + 3px)';
      plot.appendChild(g);
    });
    var tip = el('div', 'tip'); tip.setAttribute('aria-hidden', 'true');
    var last = D.monthly.length - 1;
    D.monthly.forEach(function (m, i) {
      var name = MONTHS[parseInt(m.month.slice(5), 10) - 1];
      var bar = el('div', 'bar');
      bar.style.setProperty('--h', (m.net_cr / top * 100).toFixed(2) + '%');
      bar.style.setProperty('--bd', (i * 0.05).toFixed(2) + 's');
      bar.tabIndex = 0;
      bar.setAttribute('role', 'img');
      var text = name + ' 2025: \u20B9' + m.net_cr.toFixed(2) + ' crore net revenue from ' + nf.format(m.orders) + ' orders';
      bar.setAttribute('aria-label', text);
      if (i === 0 || i === last) bar.appendChild(el('span', 'bar-val', m.net_cr.toFixed(1)));
      function show() {
        tip.textContent = '';
        tip.appendChild(el('strong', '', name + ' 2025'));
        tip.appendChild(document.createElement('br'));
        tip.appendChild(document.createTextNode('\u20B9' + m.net_cr.toFixed(2) + ' crore, ' + nf.format(m.orders) + ' orders'));
        var b = bar.getBoundingClientRect(), h = host.getBoundingClientRect();
        tip.style.left = Math.min(h.width - 90, Math.max(90, b.left - h.left + b.width / 2)) + 'px';
        tip.style.top = (b.top - h.top - 8) + 'px';
        tip.classList.add('is-on');
      }
      function hide() { tip.classList.remove('is-on'); }
      bar.addEventListener('pointerenter', show); bar.addEventListener('pointerleave', hide);
      bar.addEventListener('focus', show); bar.addEventListener('blur', hide);
      plot.appendChild(bar);
      months.appendChild(el('span', '', name));
    });
    host.appendChild(plot); host.appendChild(months); host.appendChild(tip);

    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { host.classList.add('is-in'); obs.disconnect(); }
      }, { threshold: 0.3 }).observe(host);
    } else {
      host.classList.add('is-in');
    }
  }

  function setupReplay() {
    var consoleEl = document.getElementById('console');
    var btn = document.getElementById('replay');
    var stack = document.getElementById('stack');
    var stages = document.getElementById('stages');
    if (!consoleEl || !btn || !D) return;
    var lines = D.log;
    var running = false;

    function secs(line) {
      var m = line.match(/^(\d\d):(\d\d):(\d\d)/);
      return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) : 0;
    }
    function appendLine(line) {
      var m = line.match(/^(\d\d:\d\d:\d\d) (\w+)\s+(.*)$/);
      var row = el('div');
      if (m) {
        row.appendChild(el('span', 't', m[1] + ' '));
        var rest = el('span', /WARNING/.test(m[2]) ? 'warn' : /ERROR/.test(m[2]) ? 'err' : /gate passed|SUCCEEDED/.test(m[3]) ? 'ok' : '', m[2].padEnd(7) + ' ' + m[3]);
        row.appendChild(rest);
      } else { row.textContent = line; }
      consoleEl.appendChild(row);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }
    function setDone(id) {
      var li = stages.querySelector('[data-stage="' + id + '"]');
      if (li) li.classList.add('is-done');
    }
    function mark(line) {
      var m = line.match(/stage (\w+): done/);
      if (m) setDone(m[1]);
      if (/quality gate passed/.test(line)) setDone('gate');
      if (/silver orders: \d+ valid/.test(line)) stack.classList.remove('is-empty');
    }
    function showFinal() {
      consoleEl.textContent = '';
      lines.forEach(function (l) { appendLine(l); mark(l); });
      consoleEl.scrollTop = 0;
    }
    function finish() {
      running = false;
      btn.removeAttribute('aria-disabled');
      btn.textContent = 'Replay the run';
    }

    showFinal();

    btn.addEventListener('click', function () {
      if (running) return;
      if (reduce) { showFinal(); return; }
      running = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.textContent = 'Running\u2026';
      consoleEl.textContent = '';
      stack.classList.add('is-empty');
      Array.prototype.forEach.call(stages.children, function (li) { li.classList.remove('is-done'); });
      var i = 0, prev = secs(lines[0]);
      (function next() {
        if (i >= lines.length) { finish(); return; }
        var l = lines[i];
        var wait = i === 0 ? 250 : Math.min(900, Math.max(80, (secs(l) - prev) * 160));
        prev = secs(l);
        setTimeout(function () { appendLine(l); mark(l); i++; next(); }, wait);
      })();
    });
  }

  /* ---------- Raw-to-clean motion ---------- */
  var RX = [-14, 10, -8, 16, -12, 6], RR = [-1.4, 1, -0.8, 1.6, -1.2, 0.6];
  var PROFILE = {
    bronze: { r: [-9, 6, -5, 10, -7, 4], y: [0.12, -0.09, 0.16, -0.11, 0.07, -0.13] },
    silver: { r: [-1.6, 1.1, -1, 1.6, -1.1, 0.8], y: [0.02, -0.02, 0.03, -0.02, 0.015, -0.03] },
    gold: { r: [0, 0, 0, 0], y: [0, 0, 0, 0] }
  };

  function setupLayerWords() {
    var words = document.querySelectorAll('.layer-word');
    Array.prototype.forEach.call(words, function (w) {
      var text = w.getAttribute('data-word') || w.textContent;
      var p = PROFILE[w.getAttribute('data-kind')] || PROFILE.gold;
      w.textContent = '';
      text.split('').forEach(function (ch, i) {
        var s = el('span', 'ch', ch);
        s.style.setProperty('--r', p.r[i % p.r.length] + 'deg');
        s.style.setProperty('--y', p.y[i % p.y.length] + 'em');
        s.style.setProperty('--d', (i * 0.06).toFixed(2) + 's');
        w.appendChild(s);
      });
    });
    return words;
  }

  function setupRaw() {
    var raws = document.querySelectorAll('.raw');
    Array.prototype.forEach.call(raws, function (n, i) {
      n.style.setProperty('--rx', RX[i % RX.length] + 'px');
      n.style.setProperty('--rr', RR[i % RR.length] + 'deg');
      n.style.setProperty('--rd', ((i % 6) * 0.04).toFixed(2) + 's');
    });
    return raws;
  }

  function observeClean(nodes, threshold) {
    if (!('IntersectionObserver' in window) || reduce) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add('is-clean'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-clean'); io.unobserve(e.target); }
      });
    }, { threshold: threshold, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }

  /* ---------- Layer meter ---------- */
  function setupMeter() {
    var items = document.querySelectorAll('.meter-item');
    var layers = document.querySelectorAll('.layer');
    if (!items.length || !layers.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.innerHeight * 0.45, cur = null;
      Array.prototype.forEach.call(layers, function (l) {
        var r = l.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) cur = l.getAttribute('data-layer');
      });
      Array.prototype.forEach.call(items, function (it) {
        var on = it.getAttribute('data-layer') === cur;
        it.classList.toggle('is-active', on);
        if (on) it.setAttribute('aria-current', 'true'); else it.removeAttribute('aria-current');
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  renderRules();
  renderProducts();
  renderRejects();
  renderChart();
  setupReplay();
  var words = setupLayerWords();
  var raws = setupRaw();
  observeClean(words, 0.35);
  observeClean(raws, 0.2);
  setupMeter();
})();
