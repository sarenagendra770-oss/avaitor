document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const startRoundBtn = document.getElementById('startRound');
  const cashOutBtn = document.getElementById('cashOut');
  const betInput = document.getElementById('betAmount');
  const multiplierEl = document.getElementById('multiplierValue');
  const overlayMultiplierEl = document.getElementById('overlayMultiplier');
  const roundStatusEl = document.getElementById('roundStatus');
  const roundNumberEl = document.getElementById('roundNumber');
  const payoutEl = document.getElementById('payoutValue');
  const crashValueEl = document.getElementById('crashValue');
  const statusValueEl = document.getElementById('statusValue');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const state = {
    running: false,
    crashed: false,
    cashedOut: false,
    multiplier: 1,
    crashAt: 2.5,
    bet: 20,
    payout: 0,
    round: 4823,
    planeX: canvas.width / 2,
    planeY: canvas.height * 0.78,
    wobble: 0,
    lastTime: 0,
  };

  function updateSummary() {
    multiplierEl.textContent = `${state.multiplier.toFixed(2)}x`;
    overlayMultiplierEl.textContent = `${state.multiplier.toFixed(2)}x`;
    roundNumberEl.textContent = `#${state.round}`;
    payoutEl.textContent = `$${state.payout.toFixed(2)}`;
    crashValueEl.textContent = state.running ? `${state.crashAt.toFixed(2)}x` : '--';
    statusValueEl.textContent = state.cashedOut ? 'Cashed out' : state.crashed ? 'Crashed' : state.running ? 'In flight' : 'Waiting';
    updateWalletDisplays();
  }

  function resetFlight() {
    state.running = false;
    state.crashed = false;
    state.cashedOut = false;
    state.multiplier = 1;
    state.payout = 0;
    state.planeX = canvas.width / 2;
    state.planeY = canvas.height * 0.78;
    state.wobble = 0;
    state.crashAt = 2.2 + Math.random() * 2.8;
    updateSummary();
    roundStatusEl.textContent = 'Ready to launch';
  }

  function startFlight() {
    if (state.running) return;

    const requestedBet = Math.max(1, Number(betInput?.value) || 20);
    const balance = getWalletBalance();

    if (balance < requestedBet) {
      roundStatusEl.textContent = 'Insufficient balance';
      updateSummary();
      return;
    }

    state.bet = requestedBet;
    setWalletBalance(balance - requestedBet);
    state.round += 1;
    state.running = true;
    state.crashed = false;
    state.cashedOut = false;
    state.multiplier = 1;
    state.payout = 0;
    state.planeX = canvas.width / 2;
    state.planeY = canvas.height * 0.78;
    state.wobble = 0;
    state.crashAt = 2.0 + Math.random() * 2.8;
    updateSummary();
    roundStatusEl.textContent = 'Flight in progress';
  }

  function cashOut() {
    if (!state.running) return;
    state.running = false;
    state.cashedOut = true;
    state.payout = state.bet * state.multiplier;
    const profit = state.payout - state.bet;
    setWalletBalance(getWalletBalance() + profit);
    roundStatusEl.textContent = 'Cash out secured';
    updateSummary();
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#0f2b4d');
    sky.addColorStop(1, '#07111f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.19)';
    for (let i = 0; i < 6; i += 1) {
      const x = (i * 180 + (state.wobble * 20)) % (canvas.width + 160) - 80;
      const y = 90 + i * 45;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#12314d';
    ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);
  }

  function drawPlane() {
    ctx.save();
    ctx.translate(state.planeX, state.planeY);
    ctx.rotate(Math.sin(state.wobble) * 0.08);
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(26, 8);
    ctx.lineTo(10, 10);
    ctx.lineTo(0, 24);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-26, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f5f7ff';
    ctx.fillRect(-8, -4, 16, 4);
    ctx.restore();
  }

  function drawOverlayText() {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 20px Inter, Arial';
    ctx.fillText(`Crash at ${state.crashAt.toFixed(2)}x`, 24, 36);
  }

  function animate(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const delta = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;

    if (state.running) {
      state.wobble += delta * 8;
      state.multiplier += delta * 1.15;
      state.planeY = canvas.height * 0.78 - Math.sin(state.wobble) * 40 - (state.multiplier - 1) * 16;
      state.planeX = canvas.width / 2 + Math.sin(state.wobble * 1.2) * 34;

      if (state.multiplier >= state.crashAt) {
        state.running = false;
        state.crashed = true;
        roundStatusEl.textContent = 'Crash detected';
        updateSummary();
      }
    }

    drawBackground();
    drawPlane();
    drawOverlayText();
    requestAnimationFrame(animate);
  }

  startRoundBtn?.addEventListener('click', () => {
    startFlight();
  });

  cashOutBtn?.addEventListener('click', () => {
    cashOut();
  });

  resetFlight();
  updateSummary();
  requestAnimationFrame(animate);
});
