/* =====================
   ALERT BANNER — mașini disponibile dinamic
   ===================== */
(function() {
  const el = document.getElementById('availableCars');
  if (!el) return;

  const hour = new Date().getHours();

  function getCars() {
    if (hour >= 20 || hour < 6) return 1;
    if (hour >= 6 && hour < 9) return 3;
    return 2;
  }

  let cars = getCars();
  el.textContent = cars === 1 ? '1 mașină' : `${cars} mașini`;

  function flashUpdate(next) {
    // Animație flash vizibilă
    el.style.transition = 'none';
    el.style.transform = 'scale(1.3)';
    el.style.color = '#fff';
    el.style.background = 'rgba(255,255,255,0.25)';
    el.style.borderRadius = '4px';
    el.style.padding = '0 4px';

    setTimeout(() => {
      el.textContent = next === 1 ? '1 mașină' : `${next} mașini`;
      el.style.transform = 'scale(1.15)';
      setTimeout(() => {
        el.style.transition = 'transform 0.4s ease, background 0.4s ease';
        el.style.transform = 'scale(1)';
        el.style.background = 'transparent';
        el.style.padding = '0';
      }, 150);
    }, 120);
  }

  function scheduleChange() {
    // Prima schimbare după 15s, apoi la fiecare 3–5 min
    const isFirst = cars === getCars();
    const delay = isFirst ? 15000 : (Math.random() * 2 + 3) * 60 * 1000;

    setTimeout(() => {
      if (cars > 1) {
        cars--;
        flashUpdate(cars);
        scheduleChange();
      }
    }, delay);
  }

  scheduleChange();
})();

/* =====================
   GA4 — helper
   ===================== */
function ga4(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params || {});
  }
}

/* =====================
   GA4 — Scroll depth 25% / 50% / 75% / 90%
   ===================== */
(function() {
  const milestones = { 25: false, 50: false, 75: false, 90: false };
  window.addEventListener('scroll', function() {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const pct = Math.round((scrolled / total) * 100);
    for (const depth of [25, 50, 75, 90]) {
      if (!milestones[depth] && pct >= depth) {
        milestones[depth] = true;
        ga4('scroll_depth', { depth_percent: depth, percent_scrolled: depth });
      }
    }
  }, { passive: true });
})();

/* =====================
   GA4 — Time on page 30s / 60s
   ===================== */
(function() {
  [30, 60].forEach(sec => {
    setTimeout(() => {
      ga4('time_on_page', { seconds: sec });
    }, sec * 1000);
  });
})();

/* =====================
   DYNAMIC HERO WORD
   ===================== */
(function () {
  const words = ['depozite', 'oficii', 'locuințe', 'deșeuri'];
  const el = document.getElementById('dynamicWord');
  if (!el) return;
  let idx = 0;

  function next() {
    idx = (idx + 1) % words.length;

    el.classList.add('slide-out');
    setTimeout(() => {
      el.textContent = words[idx];
      el.classList.remove('slide-out');
      el.classList.add('slide-in');
      setTimeout(() => el.classList.remove('slide-in'), 400);
    }, 320);
  }

  const interval = 3000 + Math.random() * 1000; // 3–4s
  setInterval(next, interval);
})();

/* =====================
   HEADER SCROLL
   ===================== */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

/* =====================
   BURGER MENU
   ===================== */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* =====================
   SCROLL REVEAL
   ===================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =====================
   TELEGRAM
   ===================== */
const TG_TOKEN = '8716780190:AAHQ6UgMBB7XQeOOlqMR0n-UA_gJn_EA0rg';
const TG_CHAT  = '-1003855483080';

// ─── FRAUD DETECTION (server-side) ────────────────────────────
async function checkFraudIP() {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: window.location.href })
    });
  } catch (e) {
    console.warn('Fraud check failed:', e);
  }
}

checkFraudIP();
// ────────────────────────────────────────────────────────────────

// Captează UTM-urile din URL
function getUTM() {
  const p = new URLSearchParams(window.location.search);
  const parts = [];
  if (p.get('utm_source'))   parts.push(`src: ${p.get('utm_source')}`);
  if (p.get('utm_medium'))   parts.push(`med: ${p.get('utm_medium')}`);
  if (p.get('utm_campaign')) parts.push(`camp: ${p.get('utm_campaign')}`);
  if (p.get('utm_content'))  parts.push(`cont: ${p.get('utm_content')}`);
  if (p.get('utm_term'))     parts.push(`term: ${p.get('utm_term')}`);
  return parts.length ? parts.join(' | ') : null;
}

function getFullURL() {
  return window.location.href;
}

async function sendToTelegram(data) {
  const utm = getUTM();
  const url = getFullURL();

  const text =
    `🚚 *Cerere nouă — Relocare.MD*\n\n` +
    `👤 *Nume:* ${data.name || '—'}\n` +
    `📞 *Telefon:* ${data.phone}\n` +
    `🔧 *Serviciu:* ${data.service}\n` +
    `📝 *Detalii:* ${data.details || '—'}\n` +
    `📍 *Sursă form:* ${data.source}\n` +
    (utm ? `📊 *UTM:* ${utm}\n` : '') +
    `🔗 *URL:* ${url}`;

  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TG_CHAT,
      text,
      parse_mode: 'Markdown'
    })
  });
}

/* =====================
   FORM HANDLER (reusable)
   ===================== */
function setupForm(formId, successId, source, fieldMap) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const success = document.getElementById(successId);
    const originalText = btn.textContent;

    btn.textContent = 'Se trimite...';
    btn.disabled = true;

    const data = {
      name:    this.querySelector(fieldMap.name)?.value || '',
      phone:   this.querySelector(fieldMap.phone)?.value || '',
      service: this.querySelector(fieldMap.service)?.value || '',
      details: this.querySelector(fieldMap.details)?.value || '',
      source
    };

    try {
      await sendToTelegram(data);
    } catch (err) {
      console.error('Telegram error:', err);
    }

    // Meta Pixel — Lead
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: data.service,
        content_category: source
      });
    }

    // GA4 — Formular_expediat
    ga4('Formular_expediat', {
      form_location: source,
      serviciu: data.service,
      method: 'web_form'
    });

    // GA4 — generate_lead (event standard GA4)
    ga4('generate_lead', {
      currency: 'MDL',
      value: 350
    });

    btn.style.display = 'none';
    success.classList.add('show');
    this.reset();

    setTimeout(() => {
      btn.style.display = '';
      btn.textContent = originalText;
      btn.disabled = false;
      success.classList.remove('show');
    }, 5000);
  });
}

setupForm('heroForm',    'heroFormSuccess',    'Hero (sus)',    { name: '#h-name', phone: '#h-phone', service: '#h-service', details: '#h-details' });
setupForm('pricingForm', 'pricingFormSuccess', 'Prețuri (mijloc)', { name: '#p-name', phone: '#p-phone', service: '#p-service', details: '#p-details' });
setupForm('contactForm', 'formSuccess',        'Contact (jos)', { name: '#name',   phone: '#phone',   service: '#service',   details: '#message' });

/* =====================
   META PIXEL + TELEGRAM — Contact click events
   ===================== */
document.querySelectorAll('a[href^="tel:"], a[href^="https://wa.me"]').forEach(btn => {
  btn.addEventListener('click', () => {
    // Meta Pixel
    if (typeof fbq === 'function') {
      fbq('track', 'Contact');
    }

    // Telegram notification
    const isWa = btn.href.includes('wa.me');

    // GA4
    ga4('Intentie_apel', {
      contact_type: isWa ? 'whatsapp' : 'telefon'
    });
    ga4('contact', { method: isWa ? 'whatsapp' : 'phone' });
    const type = isWa ? 'WhatsApp' : 'Telefon';
    const page = document.title;

    const utm = getUTM();
    const url = getFullURL();

    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT,
        parse_mode: 'Markdown',
        text: `📲 *Intenție apel — Relocare.MD*\n\n` +
              `Tip: *${type}*\n` +
              (utm ? `📊 *UTM:* ${utm}\n` : '') +
              `🔗 *URL:* ${url}`
      })
    }).catch(() => {});
  });
});

/* =====================
   GA4 — Sectiuni vizitate (IntersectionObserver)
   ===================== */
(function() {
  const sections = [
    { id: 'servicii', name: 'Servicii' },
    { id: 'oferta',   name: 'Preturi' },
    { id: 'despre',   name: 'Despre_noi' },
    { id: 'contact',  name: 'Contact' },
  ];
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = sections.find(s => s.id === entry.target.id);
        if (section) {
          ga4('sectiune_vizitata', { sectiune: section.name });
          obs.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) obs.observe(el);
  });
})();

/* =====================
   FRAUD DETECTION — vizite repetate
   Dacă același browser intră de 2+ ori în 5 min → alertă Telegram
   ===================== */
(function() {
  const KEY        = 'rlc_visits';
  const WINDOW_MS  = 5 * 60 * 1000; // 5 minute
  const THRESHOLD  = 2;             // număr de vizite care declanșează alerta

  const now   = Date.now();
  const raw   = localStorage.getItem(KEY);
  let visits  = raw ? JSON.parse(raw) : [];

  // Păstrăm doar vizitele din ultimele 5 minute
  visits = visits.filter(ts => now - ts < WINDOW_MS);
  visits.push(now);
  localStorage.setItem(KEY, JSON.stringify(visits));

  if (visits.length >= THRESHOLD) {
    const firstVisit  = new Date(visits[0]).toLocaleTimeString('ro-RO');
    const lastVisit   = new Date(visits[visits.length - 1]).toLocaleTimeString('ro-RO');
    const spanSec     = Math.round((visits[visits.length - 1] - visits[0]) / 1000);
    const utm         = getUTM();
    const url         = getFullURL();

    const text =
      `⚠️ *ALERTĂ FRAUDĂ — Relocare.MD*\n\n` +
      `🔁 *Vizite în ultimele 5 min:* ${visits.length}\n` +
      `🕐 *Prima vizită:* ${firstVisit}\n` +
      `🕐 *Ultima vizită:* ${lastVisit}\n` +
      `⏱ *Interval total:* ${spanSec}s\n` +
      `📱 *User-Agent:* ${navigator.userAgent.substring(0, 80)}\n` +
      `🖥 *Ecran:* ${screen.width}×${screen.height}\n` +
      (utm ? `📊 *UTM:* ${utm}\n` : '') +
      `🔗 *URL:* ${url}`;

    fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' })
    }).catch(() => {});
  }
})();

/* =====================
   SMOOTH ANCHOR OFFSET
   ===================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
