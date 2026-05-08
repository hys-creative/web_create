// スクロールアニメーション
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ヘッダー：スクロールで影を追加
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ハンバーガーメニュー
const hamburger = document.getElementById('hamburger');
const navSp = document.getElementById('nav-sp');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navSp.classList.toggle('open');
});

// SPメニューのリンクをクリックしたら閉じる
document.querySelectorAll('.sp-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navSp.classList.remove('open');
  });
});
