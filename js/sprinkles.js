/* Scatters candy sprinkles across each ice-cream dome (.sprinkles canvas),
   raining down onto the purple. Drawn on a canvas (no hand-authored SVG),
   static after one paint so the page keeps to a single motion moment.
   Works for any number of domes (homepage hero + subpage heroes). */
(function () {
  const canvases = document.querySelectorAll('.sprinkles');
  if (!canvases.length) return;

  const colors = ['#ff5c7a', '#ffd34e', '#5ad1a0', '#5aa9ff', '#ff9b42', '#ff7ac0', '#ffffff'];

  function roundedCapsule(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function build(canvas) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // the homepage dome is pulled up under the navbar, so only its lower
    // portion shows — concentrate sprinkles there; elsewhere spread evenly
    const bottomBias = canvas.dataset.bias === 'bottom';
    const count = Math.max(20, Math.min(120, Math.round((w * h) / 6500)));
    const sprinkles = [];
    for (let i = 0; i < count; i++) {
      sprinkles.push({
        x: Math.random() * w,
        y: h * (bottomBias ? 0.4 + 0.6 * Math.random() : Math.random()),
        len: 7 + Math.random() * 8,
        thick: 2.6 + Math.random() * 1.4,
        rot: Math.random() * Math.PI,
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
    canvas._sprinkles = sprinkles;
  }

  function draw(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (const s of canvas._sprinkles) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = s.color;
      roundedCapsule(ctx, -s.len / 2, -s.thick / 2, s.len, s.thick, s.thick / 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function render() {
    canvases.forEach(function (canvas) {
      build(canvas);
      draw(canvas);
    });
  }

  render();

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });
})();
