/* ============================================================
   介護センター はぎ — main.js
   ヘッダー / ナビ / セクション登場アニメ / SVGパス描画
============================================================ */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== ヘッダー：スクロールで縮小 ===== */
  const header = document.querySelector('.site-header');
  let lastScrolled = false;
  const onScrollHeader = () => {
    const isScrolled = window.scrollY > 30;
    if (isScrolled !== lastScrolled) {
      header.classList.toggle('scrolled', isScrolled);
      lastScrolled = isScrolled;
    }
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ===== ハンバーガーメニュー ===== */
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.site-nav');

  const closeNav = () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openNav = () => {
    nav.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.contains('open') ? closeNav() : openNav();
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target) && nav.classList.contains('open')) {
      closeNav();
    }
  });

  /* ===== スムーズスクロール（アンカーリンク） ===== */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight || 60) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      closeNav();
    });
  });

  /* ===== セクション登場アニメ：IntersectionObserver ===== */
  const sections = document.querySelectorAll('section[data-anim]');
  const articleObserve = document.querySelectorAll('.service-article');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    // threshold:0 + rootMargin で「セクションが画面内に入った瞬間」に発火させる
    // （threshold指定だとサービスのような縦長セクションで intersectionRatio が
    //  thresholdに達する前にユーザーが大きくスクロールしてしまい未発火になるため）
    { threshold: 0, rootMargin: '0px 0px -120px 0px' }
  );
  sections.forEach((s) => sectionObserver.observe(s));
  articleObserve.forEach((a) => sectionObserver.observe(a));

  /* ===== SVGパス描画：個別 ===== */
  // CSS で大半は処理しているが、複雑な図形は path長を計測して --len 変数を設定する
  document.querySelectorAll('.draw-on-scroll').forEach((el) => {
    const paths = el.querySelectorAll('path, line, polyline');
    paths.forEach((p) => {
      try {
        const len = p.getTotalLength?.() ?? 400;
        p.style.setProperty('--len', Math.ceil(len));
      } catch (_) {
        // SVG未対応 — フォールバック
      }
    });
  });

  const drawObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          drawObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('.draw-on-scroll').forEach((el) => drawObserver.observe(el));

  /* ===== Reduced Motion: 全アニメをスキップ ===== */
  if (reducedMotion) {
    sections.forEach((s) => s.classList.add('visible'));
    articleObserve.forEach((a) => a.classList.add('visible'));
    document.querySelectorAll('.draw-on-scroll').forEach((el) => el.classList.add('drawn'));
  }

  /* ===== ESC でナビを閉じる ===== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      closeNav();
    }
  });

  /* ===== 画像のlazyload ===== */
  document.querySelectorAll('img').forEach((img) => {
    if (!img.loading) img.loading = 'lazy';
    if (!img.decoding) img.decoding = 'async';
  });
})();
