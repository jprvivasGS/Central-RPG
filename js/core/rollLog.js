// Histórico global de rolagens (usado pelo painel flutuante, pelas fichas e pelas ferramentas).
const KEY = 'mesa-central:v1:rolls';
let entries = [];
const subs = new Set();
try { entries = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { entries = []; }

export const getLog = () => entries;
export function addRoll(e) {
  entries = [{ ...e, t: Date.now() }, ...entries].slice(0, 60);
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (err) { /* ignora */ }
  subs.forEach((f) => f());
}
export function clearLog() { entries = []; try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ } subs.forEach((f) => f()); }
export function subscribe(f) { subs.add(f); return () => subs.delete(f); }

// Converte o resultado de rollExpression() em uma entrada de log.
export function exprEntry(r, label) {
  return {
    label: label || r.expr,
    formula: r.expr,
    total: r.total,
    parts: r.terms.filter((t) => t.kind === 'dice').map((t) => ({ rolls: t.rolls, kept: t.kept, sides: t.sides, sign: t.sign })),
  };
}
