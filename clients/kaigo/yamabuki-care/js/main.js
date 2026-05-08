/* スクロールアニメーション */
const animClasses = [
  '.reveal-clip', '.reveal-up',
  '.slide-up', '.slide-right', '.slide-left',
  '.img-scale'
];

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(animClasses.join(',')).forEach(el => observer.observe(el));

/* ヘッダースクロール */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ハンバーガーメニュー */
const hamburger = document.getElementById('hamburger');
const navSp = document.getElementById('nav-sp');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navSp.classList.toggle('open');
});
document.querySelectorAll('.sp-link').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navSp.classList.remove('open');
  });
});

/* カウンターアニメーション */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();

    const tick = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.num-val[data-count]').forEach(el => counterObserver.observe(el));

/* ヒーローアニメーション（ページロード時に即発火） */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal-up, #hero .reveal-clip').forEach(el => {
      el.classList.add('visible');
    });
  }, 200);
});
