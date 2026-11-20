// Motor de dados. Aceita expressões como 3d6+5, 2d20kh1, 4d6kl3, 1d8+1d4-2.
export const rng = () => {
  if (globalThis.crypto?.getRandomValues) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; }
  return Math.random();
};
export const d = (sides, r = rng) => 1 + Math.floor(r() * sides);

export function rollExpression(expr, r = rng) {
  const src = String(expr).toLowerCase().replace(/\s+/g, '');
  if (!src) throw new Error('Digite uma expressão, ex: 3d6+5');
  const re = /([+-]?)(?:(\d*)d(\d+)(?:(kh|kl)(\d+))?|(\d+))/g;
  const terms = [];
  let m, pos = 0, total = 0;
  while ((m = re.exec(src))) {
    if (m.index !== pos) break;
    pos = re.lastIndex;
    const sign = m[1] === '-' ? -1 : 1;
    if (m[3]) {
      const n = Math.min(parseInt(m[2] || '1', 10), 200), sides = parseInt(m[3], 10);
      if (n < 1 || sides < 2 || sides > 1000) throw new Error('Dado inválido: ' + m[0]);
      const rolls = Array.from({ length: n }, () => d(sides, r));
      let kept = rolls.map((_, i) => i);
      if (m[4]) {
        const k = Math.min(parseInt(m[5], 10), n);
        kept = rolls.map((v, i) => [v, i]).sort((a, b) => (m[4] === 'kh' ? b[0] - a[0] : a[0] - b[0])).slice(0, k).map((x) => x[1]).sort((a, b) => a - b);
      }
      const subtotal = sign * kept.reduce((s, i) => s + rolls[i], 0);
      terms.push({ kind: 'dice', sign, n, sides, rolls, kept, subtotal, text: m[0] });
      total += subtotal;
    } else {
      const v = sign * parseInt(m[6], 10);
      terms.push({ kind: 'flat', value: v, subtotal: v, text: m[0] });
      total += v;
    }
  }
  if (pos !== src.length || !terms.length) throw new Error('Expressão inválida: ' + expr);
  return { expr: src, total, terms };
}

// Teste do sistema: dice d6 (padrão 3d6) + bônus.
// adv > 0: rola dados extras e mantém os melhores; adv < 0: mantém os piores.
export function rollTest({ dice = 3, sides = 6, adv = 0, bonus = 0 } = {}, r = rng) {
  const rolls = Array.from({ length: dice + Math.abs(adv) }, () => d(sides, r));
  const kept = rolls.map((v, i) => [v, i]).sort((a, b) => (adv >= 0 ? b[0] - a[0] : a[0] - b[0])).slice(0, dice).map((x) => x[1]).sort((a, b) => a - b);
  const keptDice = kept.map((i) => rolls[i]);
  const sum = keptDice.reduce((s, v) => s + v, 0);
  return { rolls, kept, dice: keptDice, sides, sum, bonus, total: sum + bonus };
}
