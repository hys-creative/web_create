/* スクロールフェードイン（B型：ゆっくりしたフェードで世界観を優先） */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1 }
);
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* ギャラリーアイテムを順番にフェードイン（遅延付き） */
const galleryObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      const items = e.target.querySelectorAll('.gallery-item');
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 120);
      });
      galleryObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.1 }
);
const gallerySection = document.querySelector('.gallery');
if (gallerySection) {
  gallerySection.querySelectorAll('.gallery-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(16px)';
    item.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });
  document.addEventListener('DOMContentLoaded', () => {
    galleryObserver.observe(gallerySection);
  });
}

/* gallery-item の visible クラス付与時にスタイル適用 */
document.querySelectorAll('.gallery-item').forEach(item => {
  const observer2 = new MutationObserver(() => {
    if (item.classList.contains('visible')) {
      item.style.opacity = '0.35';
      item.style.transform = 'none';
    }
  });
  observer2.observe(item, { attributes: true, attributeFilter: ['class'] });
});
