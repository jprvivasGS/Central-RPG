// Ferramentas gerais: iniciativa de combate e rolagens personalizadas (presets).
import { h, toast } from './core/ui.js';
import * as store from './core/storage.js';
import { rollTest, rollExpression } from './core/dice.js';
import { addRoll, exprEntry } from './core/rollLog.js';

const KEY = 'initiative';
const getInit = () => store.getKV(KEY, { round: 1, turn: 0, list: [] });
const setInit = (s) => store.setKV(KEY, s);

export function addToInitiative(entry) {
  const s = getInit();
  s.list.push({ id: store.uid(), nome: entry.nome, bonus: entry.bonus || 0, init: null, pa: entry.paMax ?? 2, paMax: entry.paMax ?? 2,
    vidaEx: entry.vidaEx ?? 0, vidaExMax: entry.vidaExMax ?? entry.vidaEx ?? 0, vidaIn: entry.vidaIn ?? 0, vidaInMax: entry.vidaInMax ?? entry.vidaIn ?? 0,
    cond: '', tipo: entry.tipo || 'npc' });
  setInit(s);
  toast(`${entry.nome} entrou na iniciativa.`);
}

export function toolsView() {
  const root = h('div', {});
  const draw = () => root.replaceChildren(initiativeSection(draw), presetsSection(draw));
  draw();
  return h('div', {}, h('h1', {}, 'Ferramentas'), root);
}

function initiativeSection(redraw) {
  const s = getInit();
  const save = () => setInit(s);
  const upd = (fn) => (e) => { fn(e); save(); redraw(); };
  const rollInit = (c) => {
    const r = rollTest({ bonus: c.bonus || 0 });
    c.init = r.total;
    addRoll({ label: `${c.nome} — Iniciativa`, total: r.total, formula: `3d6 + ${c.bonus || 0}`, parts: [{ rolls: r.rolls, kept: r.kept, sides: 6 }] });
  };
  const sort = () => { s.list.sort((a, b) => (b.init ?? -999) - (a.init ?? -999)); s.turn = 0; };
  const next = () => {
    if (!s.list.length) return;
    s.turn += 1;
    if (s.turn >= s.list.length) { s.turn = 0; s.round += 1; s.list.forEach((c) => (c.pa = c.paMax)); toast(`Rodada ${s.round}: PA restaurados.`); }
  };

  const nome = h('input', { placeholder: 'Nome' });
  const bonus = h('input', { type: 'number', value: 0, class: 'mini', title: 'Bônus de iniciativa' });
  const pa = h('input', { type: 'number', value: 2, class: 'mini', title: 'PA máximos' });
  const vida = h('input', { type: 'number', value: 0, class: 'mini', title: 'Vida externa' });
  const vidaI = h('input', { type: 'number', value: 0, class: 'mini', title: 'Vida interna' });

  const rows = s.list.map((c, i) => h('div', { class: 'ini' + (i === s.turn ? ' turn' : '') + (c.tipo === 'pc' ? ' pc' : '') },
    h('input', { type: 'number', class: 'mini', value: c.init ?? '', placeholder: 'ini', onchange: upd((e) => (c.init = e.target.value === '' ? null : +e.target.value)) }),
    h('input', { class: 'grow', value: c.nome, onchange: upd((e) => (c.nome = e.target.value)) }),
    h('span', { class: 'row' }, h('button', { class: 'chip', onclick: upd(() => (c.pa = Math.max(0, c.pa - 1))) }, '−'), h('b', {}, `PA ${c.pa}/${c.paMax}`), h('button', { class: 'chip', onclick: upd(() => (c.pa += 1)) }, '+')),
    h('label', { class: 'small' }, 'Ext ', h('input', { type: 'number', class: 'mini', value: c.vidaEx, onchange: upd((e) => (c.vidaEx = +e.target.value)) }), `/${c.vidaExMax}`),
    h('label', { class: 'small' }, 'Int ', h('input', { type: 'number', class: 'mini', value: c.vidaIn, onchange: upd((e) => (c.vidaIn = +e.target.value)) }), `/${c.vidaInMax}`),
    h('input', { class: 'grow', placeholder: 'condições / sentimentos', value: c.cond, onchange: upd((e) => (c.cond = e.target.value)) }),
    h('button', { class: 'chip', title: 'Rolar iniciativa', onclick: upd(() => rollInit(c)) }, '🎲'),
    h('button', { class: 'chip danger', onclick: upd(() => { s.list.splice(i, 1); if (s.turn >= s.list.length) s.turn = 0; }) }, '✕')));

  return h('section', { class: 'card' }, h('h2', {}, `Iniciativa — rodada ${s.round}`),
    h('div', { class: 'row wrap' },
      h('button', { onclick: upd(next) }, 'Próximo turno ▶'),
      h('button', { class: 'ghost', onclick: upd(() => { s.list.forEach(rollInit); sort(); }) }, '🎲 Rolar todos e ordenar'),
      h('button', { class: 'ghost', onclick: upd(sort) }, 'Ordenar'),
      h('button', { class: 'ghost', onclick: upd(() => { s.round = 1; s.turn = 0; s.list.forEach((c) => (c.pa = c.paMax)); }) }, 'Reiniciar combate'),
      h('button', { class: 'ghost danger', onclick: () => { if (confirm('Limpar toda a lista de iniciativa?')) { s.list = []; s.round = 1; s.turn = 0; save(); redraw(); } } }, 'Limpar')),
    h('div', { class: 'inilist' }, rows.length ? rows : h('p', { class: 'muted' }, 'Ninguém na iniciativa. Adicione abaixo, ou use “→ Iniciativa” numa ficha ou inimigo.')),
    h('div', { class: 'row wrap item' }, nome, 'bônus', bonus, 'PA', pa, 'vida ext.', vida, 'vida int.', vidaI,
      h('button', { onclick: () => { if (!nome.value.trim()) return toast('Dê um nome.'); addToInitiative({ nome: nome.value.trim(), bonus: +bonus.value, paMax: +pa.value, vidaEx: +vida.value, vidaIn: +vidaI.value }); redraw(); } }, '+ Adicionar')));
}

function presetsSection(redraw) {
  const defaults = [{ nome: 'Teste padrão (3d6)', expr: '3d6' }, { nome: 'Teste com vantagem', expr: '4d6kh3' }, { nome: 'Teste com desvantagem', expr: '4d6kl3' }];
  const presets = store.getKV('presets', defaults);
  const save = () => { store.setKV('presets', presets); redraw(); };
  const nome = h('input', { placeholder: 'Nome (ex: Soco do Gentil)' });
  const expr = h('input', { placeholder: 'Expressão (ex: 3d6+8)' });
  const go = (p) => { try { const r = rollExpression(p.expr); addRoll(exprEntry(r, p.nome)); toast(`${p.nome}: ${r.total}`); } catch (e) { toast(e.message); } };
  return h('section', { class: 'card' }, h('h2', {}, 'Rolagens personalizadas'),
    h('p', { class: 'muted small' }, 'Salve expressões que você usa sempre. Sintaxe: NdM, soma/subtração, khK (mantém os K maiores), klK (mantém os K menores). Ex: 3d6+5, 4d6kh3, 1d8+1d4-2.'),
    presets.map((p, i) => h('div', { class: 'row wrap item' }, h('b', { class: 'grow' }, p.nome), h('code', {}, p.expr),
      h('button', { class: 'chip', onclick: () => go(p) }, '🎲 Rolar'), h('button', { class: 'chip danger', onclick: () => { presets.splice(i, 1); save(); } }, '✕'))),
    h('div', { class: 'row wrap' }, nome, expr, h('button', { onclick: () => {
      try { rollExpression(expr.value); } catch (e) { return toast(e.message); }
      presets.push({ nome: nome.value.trim() || expr.value, expr: expr.value.trim() }); save();
    } }, '+ Salvar')));
}
