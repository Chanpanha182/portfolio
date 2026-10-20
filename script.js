var root = document.documentElement;
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== "Change the mode" button (light / dark) =====
document.getElementById('theme-toggle').addEventListener('click', function () {
  var current = root.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// ===== Full-screen menu =====
var menuBtn = document.getElementById('menu-btn');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menuBtn.addEventListener('click', function () {
  setMenu(!document.body.classList.contains('menu-open'));
});
document.querySelectorAll('#menu a').forEach(function (link) {
  link.addEventListener('click', function () { setMenu(false); });
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') setMenu(false);
});

// ===== Line under the top bar once you scroll =====
var topbar = document.querySelector('.topbar');
function onScroll() { topbar.classList.toggle('scrolled', window.scrollY > 8); }
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Make "DEVELOPER" fill the full width =====
var hero = document.querySelector('.hero');
var heroTitle = document.querySelector('.hero-title');
var bigWord = document.querySelector('.line2');
function fitTitle() {
  heroTitle.style.setProperty('--fs', '100px');
  var size = 100 * heroTitle.clientWidth / bigWord.offsetWidth;
  heroTitle.style.setProperty('--fs', Math.min(size, 200) + 'px');
}
fitTitle();
if (document.fonts) document.fonts.ready.then(fitTitle);
window.addEventListener('resize', fitTitle);

// ===== Use the cut-out photo if you've added images/profile-cutout.png =====
var cutout = new Image();
cutout.onload = function () {
  document.getElementById('hero-img').src = cutout.src;
  hero.classList.add('cutout');
};
cutout.src = 'images/profile-cutout.png';

// ===== Fade things in as you scroll =====
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(function (el) {
  // Items next to each other appear one after another
  var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
  el.style.setProperty('--d', (siblings.indexOf(el) * 0.1) + 's');
  revealObserver.observe(el);
});

// ===== Skill pills: drop in, then drag them around =====
var pills = document.getElementById('pills');
var pillList = pills.querySelectorAll('.pill');
pillList.forEach(function (pill, i) { pill.style.setProperty('--delay', (i * 0.07) + 's'); });

new IntersectionObserver(function (entries, observer) {
  if (entries[0].isIntersecting) {
    pills.classList.add('dropped');
    observer.disconnect();
  }
}, { threshold: 0.3 }).observe(pills);

var topZ = 1;
pillList.forEach(function (pill) {
  var startX, startY, baseX = 0, baseY = 0;

  pill.addEventListener('pointerdown', function (e) {
    pill.setPointerCapture(e.pointerId);
    pill.classList.add('dragging');
    pill.style.zIndex = ++topZ;
    startX = e.clientX;
    startY = e.clientY;
  });
  pill.addEventListener('pointermove', function (e) {
    if (!pill.classList.contains('dragging')) return;
    pill.style.setProperty('--dx', (baseX + e.clientX - startX) + 'px');
    pill.style.setProperty('--dy', (baseY + e.clientY - startY) + 'px');
  });
  function drop(e) {
    if (!pill.classList.contains('dragging')) return;
    baseX += e.clientX - startX;
    baseY += e.clientY - startY;
    pill.classList.remove('dragging');
  }
  pill.addEventListener('pointerup', drop);
  pill.addEventListener('pointercancel', drop);
});

// ===== Copy buttons for email and phone =====
var toast = document.getElementById('toast');
var toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
}

document.querySelectorAll('.copy').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var text = document.getElementById(btn.dataset.target).textContent.trim();

    navigator.clipboard.writeText(text)
      .then(function () {
        btn.textContent = 'Copied';
        showToast('Copied ' + text);
      })
      .catch(function () { btn.textContent = 'Copy failed'; });

    setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
  });
});

// ===== Keep the footer year current =====
document.getElementById('year').textContent = new Date().getFullYear();
