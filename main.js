/**
 * Portfolio v3 — main.js
 */

const isMobile = window.matchMedia('(max-width:768px)').matches;
const isTouch  = window.matchMedia('(hover:none)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ── NAV ─────────────────────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ── THREE.JS HERO ───────────────────────────────────────── */
(function initThree() {
  if (reducedMotion) return;
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 5;

  const geo = isMobile
    ? new THREE.IcosahedronGeometry(1.3, 1)
    : new THREE.TorusKnotGeometry(1.0, 0.28, 110, 16, 2, 3);

  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1000,
    emissive: new THREE.Color(0xf97316),
    emissiveIntensity: 0.07,
    roughness: 0.38,
    metalness: 0.82,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const light1 = new THREE.PointLight(0xf97316, isMobile ? 0.9 : 1.5, 14);
  light1.position.set(4, 3, 4);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xff6600, 0.4, 10);
  light2.position.set(-4, -2, 2);
  scene.add(light2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.06));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let mx = 0, my = 0;
  if (!isTouch) {
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / innerWidth  - .5) * 2;
      my = (e.clientY / innerHeight - .5) * 2;
    }, { passive: true });
  }

  let scrollP = 0;
  window.addEventListener('scroll', () => {
    const h = document.getElementById('hero');
    if (h) scrollP = Math.min(scrollY / h.offsetHeight, 1);
  }, { passive: true });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mesh.rotation.x = t * 0.10;
    mesh.rotation.y = t * 0.16;
    mesh.rotation.z = t * 0.05;
    if (!isTouch) {
      mesh.position.x += (mx * 0.4 - mesh.position.x) * 0.04;
      mesh.position.y += (my * -0.3 - mesh.position.y) * 0.04;
    }
    canvas.style.opacity = Math.max(0, 0.55 - scrollP * 0.55);
    renderer.render(scene, camera);
  })();
})();

/* ── CURSOR ──────────────────────────────────────────────── */
(function initCursor() {
  if (isTouch || reducedMotion) return;
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorFollower');
  if (!dot || !ring) return;

  let fx = 0, fy = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
  }, { passive: true });

  (function tick() {
    fx += (cx - fx) * 0.11;
    fy += (cy - fy) * 0.11;
    ring.style.left = fx + 'px'; ring.style.top = fy + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .project-card, .approach-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();

/* ── GSAP HERO ENTRY ─────────────────────────────────────── */
(function initGSAP() {
  if (typeof gsap === 'undefined' || reducedMotion) return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  // Hero stagger in
  gsap.set(['.hero-eyebrow', '.hero-heading', '.hero-sub', '.hero-btn', '.hero-scroll-hint'], {
    opacity: 0, y: 30
  });
  gsap.to(['.hero-eyebrow', '.hero-heading', '.hero-sub', '.hero-btn', '.hero-scroll-hint'], {
    opacity: 1, y: 0, stagger: 0.1, duration: 0.75, ease: 'power3.out', delay: 0.2
  });

  // Section titles on scroll
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.utils.toArray('.section-title, .section-sub').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0, y: 24, duration: 0.65, ease: 'power3.out'
      });
    });

    // CTA
    gsap.from('.cta-inner', {
      scrollTrigger: { trigger: '.cta-section', start: 'top 80%', once: true },
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
    });
  }
})();

/* ── INTERSECTION OBSERVER (skills, timeline, cards) ─────── */
(function initObserver() {
  if (reducedMotion) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-animate]').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.1 + 's';
    obs.observe(el);
  });

  // Timeline items
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-20px)';
    el.style.transition = `opacity .6s ease, transform .6s ease`;
    el.style.transitionDelay = i * 0.15 + 's';
    obs.observe(el);
    el.addEventListener('transitionend', () => {}, { once: true });
  });
})();

// Make timeline items respond to the observer
document.querySelectorAll('.timeline-item').forEach(el => {
  const obs2 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateX(0)';
        obs2.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  obs2.observe(el);
});

/* ── BUTTON MICRO-INTERACTIONS ───────────────────────────── */
(function initMicro() {
  if (isTouch || reducedMotion || typeof gsap === 'undefined') return;
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() { gsap.to(this,{scale:1.04,duration:.2,ease:'power2.out'}); });
    btn.addEventListener('mouseleave', function() { gsap.to(this,{scale:1,duration:.25,ease:'power2.out'}); });
    btn.addEventListener('mousedown',  function() { gsap.to(this,{scale:.97,duration:.1}); });
    btn.addEventListener('mouseup',    function() { gsap.to(this,{scale:1.04,duration:.15}); });
  });
})();

/* ── CONTACT FORM ────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function() {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    setTimeout(() => {
      if (btn) { btn.textContent = 'Send Message ↗'; btn.disabled = false; }
    }, 4000);
  });
})();