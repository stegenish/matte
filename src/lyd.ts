// Enkel lydmotor basert på Web Audio API.
// Kort, syntetiserte toner — ingen lydfiler å laste eller hoste.

let audioContext: AudioContext | null = null;
let lydErAv = false;

export function settLydAv(av: boolean): void {
  lydErAv = av;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;
  // Webkit-prefiks for Safari
  const Ctx =
    (window.AudioContext as typeof AudioContext) ||
    ((window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext as typeof AudioContext | undefined);
  if (!Ctx) return null;
  audioContext = new Ctx();
  return audioContext;
}

function tone(
  frekvens: number,
  varighet: number,
  type: OscillatorType = "sine",
  gain = 0.15,
  forsinkelse = 0,
): void {
  if (lydErAv) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frekvens;
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  const startTid = ctx.currentTime + forsinkelse;
  gainNode.gain.setValueAtTime(gain, startTid);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTid + varighet);
  osc.start(startTid);
  osc.stop(startTid + varighet);
}

// Korte, milde lyder ved hendelser.

export function spillRett(): void {
  tone(659, 0.12, "sine"); // E5
}

export function spillFeil(): void {
  tone(196, 0.18, "triangle", 0.1); // G3, mer dempet
}

export function spillOpprykk(): void {
  // Arpeggio: C5 → E5 → G5
  tone(523, 0.1, "sine", 0.15, 0);
  tone(659, 0.1, "sine", 0.15, 0.1);
  tone(784, 0.2, "sine", 0.15, 0.2);
}

export function spillComeback(): void {
  // Ned-så-opp som "comeback"
  tone(330, 0.1, "sine");
  tone(523, 0.15, "sine", 0.15, 0.12);
}
