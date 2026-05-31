// スクロールフェードイン（IntersectionObserver）
const fadeElements = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
});

fadeElements.forEach((el) => observer.observe(el));

// 追従バー: FVを過ぎたら表示
const stickyBar = document.getElementById('stickyBar');
const fv = document.querySelector('.fv');

if (stickyBar && fv) {
  const stickyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        stickyBar.classList.add('is-visible');
      } else {
        stickyBar.classList.remove('is-visible');
      }
    });
  }, { threshold: 0 });

  stickyObserver.observe(fv);
}

// 追従バー表示制御（CSS対応）
const style = document.createElement('style');
style.textContent = `
  .sticky-bar { transform: translateY(100%); transition: transform 0.4s ease; }
  .sticky-bar.is-visible { transform: translateY(0); }
`;
document.head.appendChild(style);
