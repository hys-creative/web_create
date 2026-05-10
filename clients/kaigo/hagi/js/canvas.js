/* ============================================================
   canvas.js — 紙ノイズ静止層 + 舞う植物パーティクル
============================================================ */

(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    // モーション抑制設定なら何もしない
    document.getElementById('petals')?.remove();
    document.getElementById('paper-noise')?.remove();
    return;
  }

  /* ===========================================================
     Layer 1: 紙ノイズテクスチャ
  ============================================================ */
  const noiseCanvas = document.getElementById('paper-noise');
  if (noiseCanvas) {
    const NOISE_KEY = 'hagi-paper-noise-v1';
    let cached = null;
    try { cached = sessionStorage.getItem(NOISE_KEY); } catch (_) {}

    const applyNoiseImage = (dataURL) => {
      noiseCanvas.style.backgroundImage = `url("${dataURL}")`;
      noiseCanvas.style.backgroundRepeat = 'repeat';
      noiseCanvas.style.backgroundSize = '512px 512px';
    };

    if (cached) {
      applyNoiseImage(cached);
    } else {
      // 1度だけ生成→キャッシュ
      const tmp = document.createElement('canvas');
      const SIZE = 512;
      tmp.width = SIZE;
      tmp.height = SIZE;
      const tctx = tmp.getContext('2d', { willReadFrequently: false });
      const img = tctx.createImageData(SIZE, SIZE);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        // 茶系ノイズ（ベージュの紙の繊維っぽさ）
        const v = 200 + Math.random() * 55;
        const r = v;
        const g = v - 8 - Math.random() * 12;
        const b = v - 18 - Math.random() * 18;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 90 + Math.random() * 60;
      }
      tctx.putImageData(img, 0, 0);
      try {
        const url = tmp.toDataURL('image/png');
        sessionStorage.setItem(NOISE_KEY, url);
        applyNoiseImage(url);
      } catch (_) {
        applyNoiseImage(tmp.toDataURL?.('image/png') || '');
      }
    }
  }

  /* ===========================================================
     Layer 2: 舞う植物パーティクル
  ============================================================ */
  const canvas = document.getElementById('petals');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const isMobile = () => window.innerWidth <= 820;
  const lowSpec = (navigator.hardwareConcurrency || 4) < 4;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener('resize', resize);
  resize();

  /* ----- パーティクル定義 ----- */
  const TYPE_LEAF = 0;
  const TYPE_PETAL = 1;
  const TYPE_LIGHT = 2;

  const COLORS = {
    leaf: ['#7E9A6F', '#9DB58E', '#6E8A60'],
    petal: ['#E8B4A6', '#F0C8BD', '#D9A441'],
    light: ['rgba(255, 240, 210, 0.45)', 'rgba(255, 220, 180, 0.4)']
  };

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : -30 - Math.random() * 60;
      const rand = Math.random();
      if (rand < 0.45) {
        this.type = TYPE_LEAF;
        this.size = 8 + Math.random() * 10;
        this.color = COLORS.leaf[Math.floor(Math.random() * COLORS.leaf.length)];
      } else if (rand < 0.85) {
        this.type = TYPE_PETAL;
        this.size = 6 + Math.random() * 7;
        this.color = COLORS.petal[Math.floor(Math.random() * COLORS.petal.length)];
      } else {
        this.type = TYPE_LIGHT;
        this.size = 3 + Math.random() * 4;
        this.color = COLORS.light[Math.floor(Math.random() * COLORS.light.length)];
      }
      this.vx = -0.2 + Math.random() * 0.4;
      this.vy = 0.3 + Math.random() * 0.6;
      this.angle = Math.random() * Math.PI * 2;
      this.angleVel = -0.02 + Math.random() * 0.04;
      this.swayAmp = 0.4 + Math.random() * 0.8;
      this.swayFreq = 0.005 + Math.random() * 0.01;
      this.life = 0;
      this.maxLife = 600 + Math.random() * 800;
      this.opacity = 0.55 + Math.random() * 0.35;
    }
    update(t, wind) {
      this.life++;
      this.x += this.vx + Math.sin(this.life * this.swayFreq) * this.swayAmp + wind;
      this.y += this.vy;
      this.angle += this.angleVel;
      if (this.y > H + 40 || this.x < -60 || this.x > W + 60 || this.life > this.maxLife) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.type === TYPE_LEAF) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.55, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(43,33,24,0.18)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();
      } else if (this.type === TYPE_PETAL) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // 花弁の形（涙形）
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(this.size * 0.7, -this.size * 0.5, this.size * 0.7, this.size * 0.5, 0, this.size);
        ctx.bezierCurveTo(-this.size * 0.7, this.size * 0.5, -this.size * 0.7, -this.size * 0.5, 0, -this.size);
        ctx.fill();
      } else {
        // 光の粒
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'rgba(255,240,210,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ----- 数量管理 ----- */
  const targetCount = () => {
    if (isMobile()) return 12;
    if (lowSpec) return 18;
    return 30;
  };

  let particles = [];
  const initParticles = () => {
    particles = [];
    const n = targetCount();
    for (let i = 0; i < n; i++) particles.push(new Particle());
  };
  initParticles();

  /* ----- スクロール量で風速 ----- */
  let scrollV = 0;
  let lastScroll = window.scrollY;
  let inactiveTicks = 0;
  window.addEventListener('scroll', () => {
    const now = window.scrollY;
    scrollV = Math.max(-3, Math.min(3, (now - lastScroll) * 0.05));
    lastScroll = now;
    inactiveTicks = 0;
  }, { passive: true });

  /* ----- アニメループ ----- */
  let running = true;
  let inViewport = true;

  const tick = (t) => {
    if (!running) return;
    if (!inViewport || document.hidden) {
      requestAnimationFrame(tick);
      return;
    }

    ctx.clearRect(0, 0, W, H);

    // 風速の減衰
    scrollV *= 0.93;
    if (Math.abs(scrollV) < 0.02) scrollV = 0;

    for (const p of particles) {
      p.update(t, scrollV);
      p.draw(ctx);
    }

    requestAnimationFrame(tick);
  };

  /* ----- IntersectionObserver: 画面外は停止 ----- */
  const visObs = new IntersectionObserver((entries) => {
    inViewport = entries[0].isIntersecting;
  }, { threshold: 0 });
  visObs.observe(canvas);

  /* ----- visibilityChange ----- */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) inactiveTicks = 0;
  });

  /* ----- リサイズで再生成 ----- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initParticles, 200);
  });

  requestAnimationFrame(tick);
})();
