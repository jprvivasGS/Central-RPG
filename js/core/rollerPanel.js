// Painel flutuante de dados: expressão livre + histórico.
import { h, toast } from './ui.js';
import { rollExpression } from './dice.js';
import { addRoll, getLog, clearLog, subscribe, exprEntry } from './rollLog.js';

export function logEntryEl(e) {
  const dice = (e.parts || []).map((p) => h('span', { class: 'dgroup' }, p.rolls.map((v, i) =>
    h('span', { class: 'die' + (p.kept.includes(i) ? '' : ' drop') + (v === p.sides ? ' max' : '') }, v))));
  return h('div', { class: 'logentry' },
    h('div', { class: 'lhead' }, h('b', {}, e.label), h('span', { class: 'ltotal' }, e.total)),
    h('div', { class: 'ldice' }, dice),
    e.formula && h('div', { class: 'muted small' }, e.formula),
    e.note && h('div', { class: 'small note' }, e.note));
}

export function mountRoller(root) {
  const list = h('div', { class: 'loglist' });
  const input = h('input', { placeholder: '3d6+5 · 2d20kh1 · 4d6kl3', 'aria-label': 'Expressão de dados' });
  const go = (expr) => {
    try { addRoll(exprEntry(rollExpression(expr))); } catch (e) { toast(e.message); }
  };
  const quick = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', '3d6'].map((x) => h('button', { class: 'chip', onclick: () => go(x.startsWith('d') ? '1' + x : x) }, x));
  const draw = () => list.replaceChildren(...getLog().slice(0, 15).map(logEntryEl));
  subscribe(draw); draw();
  const panel = h('details', { class: 'roller' },
    h('summary', {}, '🎲 Dados'),
    h('div', { class: 'rbody' },
      h('div', { class: 'row' }, input, h('button', { onclick: () => go(input.value) }, 'Rolar')),
      h('div', { class: 'row wrap' }, quick, h('button', { class: 'chip ghost', onclick: clearLog }, 'limpar')),
      list));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(input.value); });
  root.append(panel);
}
