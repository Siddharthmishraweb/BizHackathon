// Thin wrapper around canvas-confetti so celebration moments (goal added & instantly on
// track, milestone crossed) share one consistent, on-brand burst instead of ad-hoc calls.
import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#a91f52', '#c6952c', '#8a1745', '#eac66a'];

export function celebrateGoalAdded(): void {
  const end = Date.now() + 600;
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: BRAND_COLORS,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: BRAND_COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function celebrateMilestone(): void {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors: BRAND_COLORS,
  });
}
