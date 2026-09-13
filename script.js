/**
 * GEN Z FITNESS & RECREATION ADULT CLUB
 * script.js — Animation, Interactions & UX
 */

'use strict';

/* ============================================================
   LOADER
   ============================================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Kick off hero reveal
    document.querySelectorAll('.hero .reveal-up').forEach(el => {
      el.classList.add('revealed');
    });
  }, 1800);
});

/* ============================================================
   NAVIGATION — scroll shrink + active link + hamburger
   ============================================================ */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

// Scroll shrink
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  updateActiveNav();
}, { passive: true });

// Hamburger toggle
hamburger?.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close nav on link click
navLinks?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Active nav link on scroll
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 120;
  let current    = '';
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

// Reset mobile menu on resize to prevent scroll lock bug
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && hamburger?.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinks?.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}, { passive: true });

/* ============================================================
   INTERSECTION OBSERVER — scroll reveal
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || '0', 10);
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  // Skip hero elements — handled by loader
  if (!el.closest('.hero')) revealObserver.observe(el);
});

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function animateCounter(el) {
  const target  = parseInt(el.dataset.target, 10);
  const prefix  = el.dataset.prefix  || '';
  const suffix  = el.dataset.suffix  || '';
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ============================================================
   HERO PARALLAX (subtle)
   ============================================================ */
const heroBg = document.getElementById('hero-bg');
if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
}

/* ============================================================
   REVIEWS CAROUSEL
   ============================================================ */
(function initCarousel() {
  const carousel = document.getElementById('reviews-carousel');
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');
  const dotsWrap = document.getElementById('carousel-dots');
  if (!carousel) return;

  const cards = carousel.querySelectorAll('.review-card');
  let current  = 0;
  let autoTimer;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Review ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap?.appendChild(dot);
  });

  function getVisible() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function goTo(index) {
    const visible = getVisible();
    const maxIdx  = Math.max(0, cards.length - visible);
    current = Math.min(Math.max(index, 0), maxIdx);
    const cardWidth = cards[0]?.offsetWidth + 24 || 0;
    carousel.style.transform = `translateX(-${current * cardWidth}px)`;
    dotsWrap?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Touch / swipe
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });

  // Auto-play
  function startAuto() { autoTimer = setInterval(() => { goTo(current + 1 > cards.length - getVisible() ? 0 : current + 1); }, 4500); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

  // Recalculate on resize
  window.addEventListener('resize', () => goTo(current));
})();

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-question').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        const otherId = other.getAttribute('aria-controls');
        document.getElementById(otherId)?.classList.remove('open');
      }
    });

    // Toggle this one
    btn.setAttribute('aria-expanded', String(!isOpen));
    answer?.classList.toggle('open', !isOpen);
  });
});

/* ============================================================
   CONTACT FORM — simple client-side feedback
   ============================================================ */
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameEl  = document.getElementById('name');
  const phoneEl = document.getElementById('phone');

  if (!nameEl.value.trim() || !phoneEl.value.trim()) {
    nameEl.style.borderColor  = '#ff5a5a';
    phoneEl.style.borderColor = '#ff5a5a';
    setTimeout(() => {
      nameEl.style.borderColor  = '';
      phoneEl.style.borderColor = '';
    }, 2000);
    return;
  }

  const btn = document.getElementById('enquiry-submit-btn');
  btn.textContent = 'SENDING...';
  btn.disabled = true;

  setTimeout(() => {
    const success = document.getElementById('form-success');
    success.style.display = 'block';
    contactForm.reset();
    btn.textContent = 'SEND ENQUIRY →';
    btn.disabled = false;
    setTimeout(() => { success.style.display = 'none'; }, 5000);
  }, 1200);
});

/* ============================================================
   SMOOTH SCROLL for all anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '76', 10);
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   KEYBOARD NAVIGATION — ESC closes mobile menu
   ============================================================ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ============================================================
   BUTTON HOVER RIPPLE (subtle accent)
   ============================================================ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', function(e) {
    this.style.setProperty('--x', `${e.offsetX}px`);
    this.style.setProperty('--y', `${e.offsetY}px`);
  });
});

console.log('%c🏋️ GEN Z FITNESS — Your fitness era starts here.', 'color: #b5ff2d; font-size: 14px; font-weight: bold;');
