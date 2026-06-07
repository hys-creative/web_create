(() => {
  'use strict';

  /* ヘッダー：スクロールで背景を強調 */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ハンバーガーメニューの開閉 */
  const hamburger = document.getElementById('hamburger');
  const navSp = document.getElementById('nav-sp');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navSp.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  navSp.querySelectorAll('.sp-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navSp.classList.remove('open');
      hamburger.setAttribute('aria-label', 'メニューを開く');
    });
  });

  /* スクロール演出：fade-in */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeTargets = document.querySelectorAll('.fade-in');

  if (reduceMotion) {
    fadeTargets.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    fadeTargets.forEach((el) => revealObserver.observe(el));
  }
})();
