/* ============================================================
   AETHERA — index.js
   Scroll-driven 3D house, cursor, particles, interactions
   ============================================================ */

/* ── PRELOADER ─────────────────────────────────────────── */
(function () {
  const preloader = document.getElementById('preloader');
  const fill      = document.getElementById('preloader-fill');
  const pct       = document.getElementById('preloader-pct');
  let progress    = 0;

  const tick = () => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) {
      progress = 100;
      fill.style.width = '100%';
      pct.textContent  = '100%';
      setTimeout(() => {
        preloader.classList.add('out');
        document.body.dispatchEvent(new Event('aethera:ready'));
        initScroll();
        initParticles();
      }, 420);
      return;
    }
    fill.style.width = progress + '%';
    pct.textContent  = Math.round(progress) + '%';
    setTimeout(tick, 60 + Math.random() * 80);
  };
  setTimeout(tick, 200);
})();

/* ── CUSTOM CURSOR ─────────────────────────────────────── */
(function () {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function followLoop () {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(followLoop);
  })();

  document.querySelectorAll('a, button, .property-card, .panel-cta, .card-cta, .filter-tab, .toggle-btn, .nav-cta, .form-submit, .form-submit-btn, .hover-target').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
})();

/* ── NAVBAR ────────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('menu-toggle');
  const links  = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
  }

  // close on link click
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => {
      toggle && toggle.classList.remove('open');
      links && links.classList.remove('open');
    });
  });
})();

/* ── PARTICLES ─────────────────────────────────────────── */
function initParticles () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  const particles = [];
  const COUNT = window.innerWidth < 600 ? 30 : 60;

  function resize () {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -Math.random() * 0.22 - 0.04,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.5 + 0.1,
      gold: Math.random() > 0.7,
    });
  }

  function draw () {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(196,160,100,${p.a})`
        : `rgba(255,255,255,${p.a * 0.5})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── SCROLL HOUSE ENGINE ───────────────────────────────── */
function initScroll () {
  const heroSection = document.getElementById('hero');
  const house3d     = document.getElementById('house-3d');
  const progFill    = document.getElementById('progress-fill');
  const hintEl      = document.getElementById('scroll-hint');
  const badgeEl     = document.getElementById('scroll-badge');
  const panels      = [
    document.getElementById('panel-1'),
    document.getElementById('panel-2'),
    document.getElementById('panel-3'),
    document.getElementById('panel-4'),
  ];

  if (!heroSection || !house3d) return;

  const SCROLL_HEIGHT = window.innerHeight * 5;

  // Spring for smooth rotation
  let targetRotY = 0, targetRotX = 0;
  let currentRotY = 0, currentRotX = 0;
  let currentScale = 1, targetScale = 1;

  // Panel thresholds [0–1]
  const thresholds = [
    [0, 0.22],
    [0.18, 0.55],
    [0.52, 0.88],
    [0.86, 1],
  ];

  function lerp (a, b, t) { return a + (b - a) * t; }
  function clamp (val, min, max) { return Math.max(min, Math.min(max, val)); }
  function easeInOut (t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  function panelOpacity (progress, start, end) {
    const fadeLen = 0.08;
    if (progress < start) return 0;
    if (progress > end) return 0;
    const fadeInEnd = start + fadeLen;
    const fadeOutStart = end - fadeLen;
    if (progress < fadeInEnd) return easeInOut((progress - start) / fadeLen);
    if (progress > fadeOutStart) return easeInOut(1 - (progress - fadeOutStart) / fadeLen);
    return 1;
  }

  function update () {
    const rect = heroSection.getBoundingClientRect();
    const scrolled = -rect.top;
    const progress = clamp(scrolled / (SCROLL_HEIGHT - window.innerHeight), 0, 1);

    // Progress bar
    if (progFill) progFill.style.height = (progress * 100) + '%';

    // Scroll hint fade
    if (hintEl) hintEl.style.opacity = progress < 0.06 ? 1 : 0;

    // Badge fade
    if (badgeEl) badgeEl.style.opacity = progress < 0.12 ? 1 : 0;

    // Welcome layer fade
    const welcomeEl = document.getElementById('welcome-layer');
    if (welcomeEl) {
      const welcomeOp = clamp(1 - (progress / 0.05), 0, 1);
      welcomeEl.style.opacity = welcomeOp;
      if (welcomeOp < 0.01) {
        welcomeEl.style.pointerEvents = 'none';
        welcomeEl.style.visibility = 'hidden';
      } else {
        welcomeEl.style.pointerEvents = 'all';
        welcomeEl.style.visibility = 'visible';
      }
    }

    // House target rotation
    targetRotY = progress * 360;
    targetRotX = Math.sin(progress * Math.PI * 1.2) * 10;
    targetScale = progress < 0.3 ? lerp(1, 1.06, progress / 0.3)
                : progress < 0.7 ? lerp(1.06, 1.04, (progress - 0.3) / 0.4)
                : lerp(1.04, 1, (progress - 0.7) / 0.3);

    // Spring
    const STIFF = 0.08, DAMP = 0.65;
    currentRotY   = lerp(currentRotY, targetRotY, STIFF + (1-DAMP)*0.02);
    currentRotX   = lerp(currentRotX, targetRotX, STIFF + (1-DAMP)*0.02);
    currentScale  = lerp(currentScale, targetScale, 0.06);

    house3d.style.transform =
      `rotateY(${currentRotY}deg) rotateX(${currentRotX}deg) scale(${currentScale})`;

    // House Y offset
    const houseY = Math.sin(progress * Math.PI) * -30;
    document.getElementById('house-stage').style.transform =
      `translateY(${houseY}px)`;

    // Text panels
    panels.forEach((panel, i) => {
      if (!panel) return;
      const [start, end] = thresholds[i];
      const op = panelOpacity(progress, start, end);
      panel.style.opacity = op;
      if (op < 0.01) {
        panel.classList.add('panel-hidden');
        panel.style.pointerEvents = 'none';
      } else {
        panel.classList.remove('panel-hidden');
        if (i === 3) panel.style.pointerEvents = 'all';
      }
    });

    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  /* ── Drag to rotate ──────────────────────────────────── */
  let dragging = false, lastX = 0, lastY = 0, dragDeltaX = 0, dragDeltaY = 0;

  function onPointerDown (e) {
    dragging = true;
    lastX = e.touches ? e.touches[0].clientX : e.clientX;
    lastY = e.touches ? e.touches[0].clientY : e.clientY;
  }
  function onPointerMove (e) {
    if (!dragging) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    dragDeltaX = cx - lastX;
    dragDeltaY = cy - lastY;
    lastX = cx; lastY = cy;
    targetRotY += dragDeltaX * 0.5;
    targetRotX -= dragDeltaY * 0.3;
  }
  function onPointerUp () { dragging = false; }

  const stage = document.getElementById('house-stage');
  if (stage) {
    stage.addEventListener('mousedown', onPointerDown);
    stage.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
  }
}

/* ── SCROLL REVEAL ─────────────────────────────────────── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
})();

/* ── 3D CARD TILT INTERACTION ──────────────────────────── */
(function () {
  const cards = document.querySelectorAll('.property-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;

      const rect = card.getBoundingClientRect();
      const percentX = ((e.clientX - rect.left) / rect.width) - 0.5;
      const percentY = ((e.clientY - rect.top) / rect.height) - 0.5;

      const maxRotateX = 12;
      const maxRotateY = -12;

      const rotX = percentY * maxRotateX;
      const rotY = percentX * maxRotateY;

      card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;

      const glowColor = `rgba(212, 175, 55, ${Math.min(0.18, (Math.abs(percentX) + Math.abs(percentY)) * 0.3)})`;
      card.style.boxShadow = `0 25px 50px rgba(0,0,0,0.06), 0 0 30px ${glowColor}`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.8s var(--ease), box-shadow 0.8s var(--ease), border-color 0.8s var(--ease)';
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow = '';

      setTimeout(() => {
        card.style.transition = 'border-color 0.5s var(--ease), box-shadow 0.5s var(--ease)';
      }, 800);
    });
  });
})();

/* ── CARD IMAGE TOGGLE ─────────────────────────────────── */
(function () {
  const cards = document.querySelectorAll('.property-card');

  cards.forEach(card => {
    const extBtn = card.querySelector('.exterior-btn');
    const intBtn = card.querySelector('.interior-btn');
    const badge = card.querySelector('.view-badge');

    if (extBtn && intBtn) {
      extBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('show-interior');
        extBtn.classList.add('active');
        intBtn.classList.remove('active');
        if (badge) badge.textContent = 'Exterior';
      });

      intBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('show-interior');
        intBtn.classList.add('active');
        extBtn.classList.remove('active');
        if (badge) badge.textContent = 'Interior';
      });
    }
  });
})();

/* ── FILTER TABS ───────────────────────────────────────── */
(function () {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.property-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      cards.forEach(card => {
        const extBtn = card.querySelector('.exterior-btn');
        const intBtn = card.querySelector('.interior-btn');

        if (filterValue === 'all') {
          card.style.display = 'block';
          setTimeout(() => card.style.opacity = '1', 50);
        } else if (filterValue === 'exteriors') {
          card.style.display = 'block';
          if (extBtn) extBtn.click();
        } else if (filterValue === 'interiors') {
          card.style.display = 'block';
          if (intBtn) intBtn.click();
        }
      });
    });
  });
})();

/* ── INQUIRY FORM ──────────────────────────────────────── */
(function () {
  const form = document.getElementById('landing-contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name     = document.getElementById('form-name').value.trim();
    const email    = document.getElementById('form-email').value.trim();
    const res      = document.getElementById('form-residence').value;
    const msg      = document.getElementById('form-message').value.trim();
    const success  = document.getElementById('form-success');

    if (!name || !email || !res || !msg) {
      showToast('Please complete all fields.');
      return;
    }

    // Save to localStorage
    const inquiries = JSON.parse(localStorage.getItem('aethera_inquiries') || '[]');
    inquiries.push({ name, email, res, msg, date: new Date().toISOString() });
    localStorage.setItem('aethera_inquiries', JSON.stringify(inquiries));

    // Update visitor/inquiry counts
    const visitors = parseInt(localStorage.getItem('aethera_visitors') || '0') + 1;
    localStorage.setItem('aethera_visitors', visitors);

    form.reset();
    success && success.classList.add('visible');
    showToast('Your inquiry has been received.');

    setTimeout(() => success && success.classList.remove('visible'), 5000);
  });
})();

/* ── ADMIN PAGE ────────────────────────────────────────── */
(function () {
  const adminBack = document.getElementById('admin-back');
  if (adminBack) {
    adminBack.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('admin-page').style.display = 'none';
      document.getElementById('landing-page').style.display = '';
    });
  }

  // Secret combo: press Ctrl+Shift+A
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      const lp = document.getElementById('landing-page');
      const ap = document.getElementById('admin-page');
      lp.style.display = 'none';
      ap.style.display = 'block';
      loadAdminData();
    }
  });

  function loadAdminData () {
    const visitors  = parseInt(localStorage.getItem('aethera_visitors') || '0');
    const inquiries = JSON.parse(localStorage.getItem('aethera_inquiries') || '[]');

    document.getElementById('stats-visitors').textContent  = visitors;
    document.getElementById('stats-inquiries').textContent = inquiries.length;

    // Pipeline calc
    const total = inquiries.reduce((sum, inq) => {
      const prices = { 'The Obsidian Pavilion': 12.45, 'Aetheria Monolith': 16.8, 'The Luminary Crest': 24 };
      return sum + (prices[inq.res] || 0);
    }, 0);
    document.getElementById('stats-pipeline').textContent = '$' + total.toFixed(2) + 'M';

    const list = document.getElementById('admin-inquiry-list');
    if (!list) return;
    if (!inquiries.length) {
      list.innerHTML = '<p class="admin-empty">No inquiries received yet.</p>';
      return;
    }
    list.innerHTML = inquiries.map((inq, i) => `
      <div style="padding:20px;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <strong style="font-family:var(--font-serif);color:var(--off-white)">${inq.name}</strong>
          <span style="font-size:9px;color:var(--muted);letter-spacing:.1em">${new Date(inq.date).toLocaleDateString()}</span>
        </div>
        <div style="font-size:10px;color:var(--gold-a);margin-bottom:6px;letter-spacing:.1em">${inq.email} — ${inq.res}</div>
        <div style="font-size:13px;color:var(--muted);font-family:var(--font-serif);font-style:italic">${inq.msg}</div>
      </div>
    `).join('');
  }
})();



/* ── VISITOR TRACKING ──────────────────────────────────── */
(function () {
  const key = 'aethera_visited';
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    const v = parseInt(localStorage.getItem('aethera_visitors') || '0') + 1;
    localStorage.setItem('aethera_visitors', v);
  }
})();

/* ── TEXT PANELS MOUSE PARALLAX ────────────────────────── */
(function () {
  const scrollSticky = document.getElementById('scroll-sticky');
  const panelsLayer = document.querySelector('.panels-layer');

  if (scrollSticky && panelsLayer) {
    scrollSticky.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      const rect = scrollSticky.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);

      const shiftX = (x / rect.width) * 30;
      const shiftY = (y / rect.height) * 20;

      panelsLayer.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });

    scrollSticky.addEventListener('mouseleave', () => {
      panelsLayer.style.transition = 'transform 0.8s var(--ease)';
      panelsLayer.style.transform = 'translate3d(0, 0, 0)';
    });

    scrollSticky.addEventListener('mouseenter', () => {
      panelsLayer.style.transition = 'none';
    });
  }
})();

/* ── TOAST ─────────────────────────────────────────────── */
function showToast (msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
