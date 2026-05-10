/* ============================================================
   parallax.js — data-parallax 属性をもつ要素に対するパララックス
============================================================ */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const elems = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!elems.length) return;

  const items = elems.map((el) => ({
    el,
    coef: parseFloat(el.dataset.parallax) || 0,
    visible: false,
    offset: 0
  }));

  // visibility監視
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const item = items.find((i) => i.el === entry.target);
      if (item) {
        item.visible = entry.isIntersecting;
        if (entry.isIntersecting) {
          item.el.style.willChange = 'transform';
        } else {
          item.el.style.willChange = '';
        }
      }
    });
  }, { rootMargin: '20% 0px' });

  items.forEach((i) => obs.observe(i.el));

  let pending = false;
  let lastY = window.scrollY;

  const update = () => {
    pending = false;
    const winH = window.innerHeight;
    items.forEach((item) => {
      if (!item.visible) return;
      const rect = item.el.getBoundingClientRect();
      // 中央からの相対位置（-1〜1）
      const center = rect.top + rect.height / 2;
      const rel = (center - winH / 2) / winH;
      const y = rel * 100 * item.coef;
      item.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    });
  };

  const onScroll = () => {
    lastY = window.scrollY;
    if (!pending) {
      pending = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
