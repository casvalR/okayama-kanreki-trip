// Countdown to 2026-05-22 18:51 JST
function updateCountdown() {
  const target = new Date('2026-05-22T18:51:00+09:00').getTime();
  const now = new Date().getTime();
  const diff = target - now;

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (diff <= 0) {
    if (daysEl) daysEl.textContent = '0';
    if (hoursEl) hoursEl.textContent = '0';
    if (minutesEl) minutesEl.textContent = '0';
    if (secondsEl) secondsEl.textContent = '0';
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = '旅行中・お楽しみください';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (daysEl) daysEl.textContent = days;
  if (hoursEl) hoursEl.textContent = hours;
  if (minutesEl) minutesEl.textContent = minutes;
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navList.classList.toggle('active');
  });

  document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navList.classList.remove('active');
    });
  });
}

// Back to top button
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Fade-in on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.section-header, .booking-card, .timeline-item, .food-card, .highlight-card, .tips-card, .closing-frame').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Make food card summaries clickable -> open Google Maps for the shop
document.querySelectorAll('.food-card').forEach(card => {
  const summary = card.querySelector('.food-card-summary');
  const shopEl = card.querySelector('.food-card-shop');
  if (!summary || !shopEl) return;

  let mainName = '';
  for (const node of shopEl.childNodes) {
    if (node.nodeName === 'BR' || node.nodeName === 'SMALL') break;
    if (node.nodeType === Node.TEXT_NODE) mainName += node.textContent;
  }
  mainName = mainName.trim();
  if (!mainName) return;

  const smallEl = shopEl.querySelector('small');
  let subInfo = '';
  if (smallEl) {
    const raw = smallEl.textContent.trim();
    if (!/おすすめ|👑/.test(raw)) subInfo = raw;
  }

  const blockLoc = card.closest('.food-block')?.querySelector('.food-block-location');
  let location = '';
  if (blockLoc) {
    location = blockLoc.textContent
      .replace(/^@\s*/, '')
      .replace(/[（）()]/g, ' ')
      .replace(/城下町|周辺/g, '')
      .trim();
  }

  const query = [mainName, subInfo, location].filter(Boolean).join(' ');
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  summary.setAttribute('role', 'link');
  summary.setAttribute('tabindex', '0');
  summary.setAttribute('aria-label', `${mainName}をGoogleマップで開く`);

  summary.addEventListener('click', () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  summary.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
});

// Toggle food card details
document.querySelectorAll('.food-card-toggle').forEach(btn => {
  const textEl = btn.querySelector('.food-card-toggle-text');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.food-card');
    if (!card) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    card.classList.toggle('is-expanded');
    if (textEl) textEl.textContent = expanded ? '詳細・地図を見る' : '閉じる';
  });
});

// Equalize food card heights within each row (without affecting expand animation)
function equalizeFoodCardHeights() {
  if (window.matchMedia('(max-width: 640px)').matches) {
    // Mobile: single column, no need to equalize
    document.querySelectorAll('.food-card').forEach(c => { c.style.minHeight = ''; });
    return;
  }
  document.querySelectorAll('.food-cards').forEach(grid => {
    const cards = Array.from(grid.querySelectorAll('.food-card'));
    cards.forEach(c => { c.style.minHeight = ''; });
    // Wait a frame so reset takes effect, then measure
    requestAnimationFrame(() => {
      const rows = new Map();
      cards.forEach(card => {
        if (card.classList.contains('is-expanded')) return;
        const top = Math.round(card.getBoundingClientRect().top);
        if (!rows.has(top)) rows.set(top, []);
        rows.get(top).push(card);
      });
      rows.forEach(rowCards => {
        let maxH = 0;
        rowCards.forEach(c => {
          if (c.offsetHeight > maxH) maxH = c.offsetHeight;
        });
        rowCards.forEach(c => { c.style.minHeight = maxH + 'px'; });
      });
    });
  });
}

let _equalizeTimer;
function debouncedEqualize() {
  clearTimeout(_equalizeTimer);
  _equalizeTimer = setTimeout(equalizeFoodCardHeights, 120);
}

window.addEventListener('load', () => {
  equalizeFoodCardHeights();
  // Re-run after images likely loaded
  setTimeout(equalizeFoodCardHeights, 800);
});
window.addEventListener('resize', debouncedEqualize);
