/* スクロールフェードイン */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.08 }
);
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
