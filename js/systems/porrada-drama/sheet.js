// Ficha de Porrada & Drama. Re-renderiza inteira a cada mudança (ctx.refresh()).
import { h, toast } from '../../core/ui.js';
import { rollTest, rollExpression } from '../../core/dice.js';
import { exprEntry } from '../../core/rollLog.js';
import * as R from './rules.js';
import { personalidades } from './data/personalities.js';
import { meritos, demeritos } from './data/merits.js';
import { estilos } from './data/styles.js';

const num = (v) => (Number.isFinite(+v) ? +v : 0);
const uid = () => Math.random().toString(36).slice(2, 8);

export function renderSheet(c, ctx) {
  const d = R.derive(c);
  const T = c.teste;
  c.atual ||= { vidaEx: null, vidaIn: null, pa: null, drama: 0 };

  // ---------- helpers de UI ----------
  const apply = (fn) => (e) => { fn(e); ctx.save(); ctx.refresh(); };
  const text = (get, set, extra) => h('input', { type: 'text', value: get(), onchange: apply((e) => set(e.target.value)), ...extra });
  const numIn = (get, set, extra) => h('input', { type: 'number', value: get(), onchange: apply((e) => set(num(e.target.value))), ...extra });
  const btn = (label, fn, cls = '') => h('button', { class: cls, onclick: apply(fn) }, label);
  const stepper = (get, set, min = 0) => h('span', { class: 'stepper' },
    btn('−', () => set(Math.max(min, get() - 1))), h('b', {}, get()), btn('+', () => set(get() + 1)));
  const card = (title, ...kids) => h('section', { class: 'card' }, h('h2', {}, title), ...kids);
  const select = (opts, val, set, empty) => h('select', { value: val, onchange: apply((e) => set(e.target.value)) },
    empty !== undefined && h('option', { value: '' }, empty), opts.map((o) => h('option', { value: o.id }, o.nome)));

  // ---------- rolagens ----------
  const profSel = () => c.proficiencias.find((p) => p.id === T.prof);
  function roll(label, attr, kind = 'geral') {
    const base = attr ? d.attrs[attr].total : 0;
    const p = profSel();
    const pb = p && (kind === 'geral' || (kind === 'ataque' && p.tipo !== 'arma')) ? R.profBonus(c, p) : 0;
    const extra = num(T.bonus);
    const useDrama = T.drama && (c.atual.drama || 0) > 0;
    const r = rollTest({ adv: num(T.adv), bonus: base + pb + extra + (useDrama ? 10 : 0) });
    const gain = R.dramaCheck(r.dice, d.dramaCat);
    c.atual.drama = (c.atual.drama || 0) - (useDrama ? 1 : 0) + (gain ? 1 : 0);
    const parts = [attr && `${R.ATTR_LABEL[attr]} ${base}`, pb && `prof. ${pb}`, extra && `bônus ${extra}`, useDrama && 'drama +10'].filter(Boolean).join(' · ');
    const advTxt = T.adv ? ` (${T.adv > 0 ? '+' : ''}${T.adv} dado${Math.abs(T.adv) > 1 ? 's' : ''})` : '';
    ctx.log({
      label: `${c.nome || 'Personagem'} — ${label}`, total: r.total,
      formula: `3d6${advTxt} + ${r.bonus}${parts ? '  [' + parts + ']' : ''}`,
      parts: [{ rolls: r.rolls, kept: r.kept, sides: 6 }],
      note: gain ? `🎭 6-6-6 (categoria ${d.dramaCat}): +1 ponto de drama!` : '',
    });
    ctx.save();
    if (useDrama || gain) ctx.refresh();
  }
  function rollExpr(label, expr, note) {
    try { const e = exprEntry(rollExpression(expr), `${c.nome || 'Personagem'} — ${label}`); e.note = note; ctx.log(e); }
    catch (err) { toast(err.message); }
  }

  // ---------- identidade ----------
  const pers = d.pers;
  const estilo = d.estilo;
  const identidade = card('Personagem',
    h('div', { class: 'grid' },
      h('label', { class: 'f' }, h('span', {}, 'Nome'), text(() => c.nome, (v) => (c.nome = v))),
      h('label', { class: 'f' }, h('span', {}, 'Jogador'), text(() => c.jogador, (v) => (c.jogador = v))),
      h('label', { class: 'f' }, h('span', {}, 'Personalidade'), select(personalidades, c.personalidadeId, (v) => (c.personalidadeId = v), '— escolher —')),
      h('label', { class: 'f' }, h('span', {}, 'Estilo de luta'), select(estilos, c.estiloId, (v) => (c.estiloId = v), '— escolher —')),
      h('div', { class: 'f' }, h('span', {}, 'Treinamentos'), stepper(() => c.treinamentos, (v) => (c.treinamentos = v))),
      h('label', { class: 'f' }, h('span', {}, 'Dinheiro'), numIn(() => c.dinheiro, (v) => (c.dinheiro = v), { min: 0 }))),
    pers && h('div', { class: 'info' }, h('b', {}, `${pers.habilidade}`), ` — “${pers.frase}” `, pers.texto,
      h('div', { class: 'muted small' }, `Bônus: +1 ${R.ATTR_LABEL[pers.bonus[0]]} e +1 ${R.ATTR_LABEL[pers.bonus[1]]} por treinamento.`)),
    estilo && h('div', { class: 'info' }, h('b', {}, estilo.nome), ` — ${estilo.resumo} `,
      h('div', { class: 'muted small' }, 'Status principais: ' + estilo.status.map((s) => R.ATTR_LABEL[s]).join(', '))));

  // ---------- status ----------
  const tracker = (label, key, max) => {
    const cur = c.atual[key] ?? max;
    const set = (v) => (c.atual[key] = Math.max(0, v));
    return h('div', { class: 'trk' },
      h('div', { class: 'row between' }, h('b', {}, label), h('span', { class: 'muted' }, `${cur} / ${max}`)),
      h('div', { class: 'bar' }, h('i', { style: `width:${max ? Math.min(100, (cur / max) * 100) : 0}%` })),
      h('div', { class: 'row wrap' }, [-10, -5, -1].map((n) => btn(String(n), () => set(cur + n), 'chip')),
        numIn(() => cur, set, { class: 'mini' }), [1, 5, 10].map((n) => btn('+' + n, () => set(cur + n), 'chip'))));
  };
  const status = card('Status',
    h('div', { class: 'grid3' }, tracker('Vida externa', 'vidaEx', d.vidaEx), tracker('Vida interna', 'vidaIn', d.vidaIn), tracker('Pontos de ação', 'pa', d.pa)),
    h('div', { class: 'row wrap' },
      h('span', {}, 'Drama: '), stepper(() => c.atual.drama || 0, (v) => (c.atual.drama = v)),
      h('span', { class: 'muted small' }, `Categoria de drama ${d.dramaCat} (Vontade ÷ 15)`),
      btn('Nova rodada (PA)', () => (c.atual.pa = null), 'ghost'),
      btn('Restaurar tudo', () => { c.atual.vidaEx = null; c.atual.vidaIn = null; c.atual.pa = null; }, 'ghost'),
      h('button', { class: 'ghost', onclick: () => ctx.toInitiative({ nome: c.nome || 'Personagem', bonus: d.attrs.agilidade.total, paMax: d.pa, vidaEx: c.atual.vidaEx ?? d.vidaEx, vidaExMax: d.vidaEx, vidaIn: c.atual.vidaIn ?? d.vidaIn, vidaInMax: d.vidaIn, tipo: 'pc' }) }, '→ Iniciativa')));

  // ---------- atributos ----------
  const profOpts = c.proficiencias.map((p) => ({ id: p.id, nome: p.nome || '(sem nome)' }));
  const testBar = h('div', { class: 'testbar' },
    h('label', { class: 'f' }, h('span', {}, 'Dados extras'), h('select', { value: String(T.adv), onchange: apply((e) => (T.adv = num(e.target.value))) },
      [[-3, 'Desvantagem ×3'], [-2, 'Desvantagem ×2'], [-1, 'Desvantagem'], [0, 'Normal'], [1, 'Vantagem'], [2, 'Vantagem ×2'], [3, 'Vantagem ×3']].map(([v, l]) => h('option', { value: String(v) }, l)))),
    h('label', { class: 'f' }, h('span', {}, 'Bônus extra'), numIn(() => T.bonus, (v) => (T.bonus = v))),
    h('label', { class: 'f' }, h('span', {}, 'Proficiência'), select(profOpts, T.prof, (v) => (T.prof = v), 'nenhuma')),
    h('label', { class: 'f check' }, h('input', { type: 'checkbox', checked: T.drama, disabled: !(c.atual.drama > 0), onchange: apply((e) => (T.drama = e.target.checked)) }), h('span', {}, 'Gastar 1 drama (+10)')));

  const attrRow = (a) => {
    const x = d.attrs[a];
    const main = estilo?.status.includes(a);
    return h('tr', { class: main ? 'main' : '' },
      h('td', {}, R.ATTR_LABEL[a], main && h('span', { class: 'tag' }, 'estilo')),
      h('td', {}, stepper(() => c.attrs[a] || 0, (v) => (c.attrs[a] = v))),
      h('td', { class: 'muted' }, x.pers ? '+' + x.pers : ''),
      h('td', { class: 'muted' }, x.merit ? (x.merit > 0 ? '+' : '') + x.merit : ''),
      h('td', {}, h('b', { class: 'big' }, x.total)),
      h('td', {}, h('button', { class: 'chip', onclick: () => roll(R.ATTR_LABEL[a], a) }, '🎲')));
  };
  const attrTable = (title, keys) => h('table', { class: 'attrs' },
    h('thead', {}, h('tr', {}, h('th', {}, title), h('th', {}, 'Base'), h('th', {}, 'Pers.'), h('th', {}, 'Mér.'), h('th', {}, 'Total'), h('th', {}, ''))),
    h('tbody', {}, keys.map(attrRow)));
  const atributos = card('Atributos',
    h('p', { class: 'muted small' }, `Pontos iniciais: 20 para distribuir, máximo 5 em cada (inicial). Soma da base agora: ${d.baseSum}.`),
    testBar,
    h('div', { class: 'grid' }, attrTable('Sociais', R.SOCIAL), attrTable('Combate', R.COMBAT)),
    h('div', { class: 'row wrap' },
      h('button', { onclick: () => roll('Iniciativa', 'agilidade') }, '🎲 Iniciativa (Agilidade)'),
      h('button', { class: 'ghost', onclick: () => roll('Teste puro') }, '🎲 3d6 puro')));

  // ---------- proficiências ----------
  const profs = card('Proficiências',
    h('p', { class: 'muted small' }, 'Bônus = treinamentos (ampla: metade). Armas somam ao dano; artes marciais somam ao acerto.'),
    c.proficiencias.map((p, i) => h('div', { class: 'row wrap item' },
      text(() => p.nome, (v) => (p.nome = v), { placeholder: 'Nome (ex: artes marciais)' }),
      select([{ id: 'geral', nome: 'Geral' }, { id: 'arma', nome: 'Arma (dano)' }, { id: 'artemarcial', nome: 'Arte marcial (acerto)' }], p.tipo || 'geral', (v) => (p.tipo = v)),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!p.ampla, onchange: apply((e) => (p.ampla = e.target.checked)) }), ' ampla'),
      h('b', {}, '+' + R.profBonus(c, p)), btn('✕', () => c.proficiencias.splice(i, 1), 'chip danger'))),
    btn('+ Proficiência', () => c.proficiencias.push({ id: uid(), nome: '', tipo: 'geral', ampla: false })));

  // ---------- habilidades ----------
  const hab = card('Habilidades',
    estilo ? h('div', {}, h('h3', {}, `Estilo: ${estilo.nome}`),
      estilo.habilidades.length ? estilo.habilidades.map((ab) => {
        const has = c.habilidadesEstilo.includes(ab.id);
        const locked = !has && d.t < ab.treinos;
        return h('label', { class: 'ability' + (locked ? ' locked' : '') },
          h('input', { type: 'checkbox', checked: has, disabled: locked, onchange: apply((e) => {
            c.habilidadesEstilo = e.target.checked ? [...c.habilidadesEstilo, ab.id] : c.habilidadesEstilo.filter((x) => x !== ab.id);
          }) }), h('span', {}, h('b', {}, `${ab.nome} `), h('span', { class: 'tag' }, `${ab.treinos} trein.`), h('br'), ab.texto));
      }) : h('p', { class: 'muted small' }, 'Habilidades deste estilo ainda não foram transcritas (js/systems/porrada-drama/data/styles.js). Use as habilidades personalizadas abaixo.'))
      : h('p', { class: 'muted small' }, 'Escolha um estilo de luta para ver as habilidades.'),
    h('h3', {}, 'Personalizadas'),
    c.habilidades.map((a, i) => h('div', { class: 'item' },
      h('div', { class: 'row wrap' }, text(() => a.nome, (v) => (a.nome = v), { placeholder: 'Nome' }), btn('✕', () => c.habilidades.splice(i, 1), 'chip danger')),
      h('textarea', { rows: 2, placeholder: 'Efeito', onchange: apply((e) => (a.texto = e.target.value)) }, a.texto || ''))),
    btn('+ Habilidade', () => c.habilidades.push({ nome: '', texto: '' })));

  // ---------- méritos ----------
  const meritList = (arr, defs, kind) => h('div', {},
    arr.map((e, i) => h('div', { class: 'item row wrap' },
      h('b', {}, `${e.nome} `), h('span', { class: 'tag' }, 'nível ' + e.nivel),
      h('span', { class: 'grow small' }, e.efeito || ''), btn('✕', () => arr.splice(i, 1), 'chip danger'))),
    h('div', { class: 'row wrap' },
      h('select', { onchange: apply((e) => {
        const def = defs.find((x) => x.id === e.target.value);
        if (def) arr.push({ ref: def.id, nome: def.nome, nivel: def.nivel, efeito: def.efeito });
      }) }, h('option', { value: '' }, `+ ${kind} da lista…`),
      defs.filter((x) => !arr.some((e) => e.ref === x.id)).map((x) => h('option', { value: x.id }, `${x.nome} (nível ${x.nivel})`))),
      btn(`+ ${kind} personalizado`, () => arr.push({ nome: 'Novo', nivel: 1, efeito: '' }), 'ghost')),
    arr.filter((e) => !e.ref).map((e) => h('div', { class: 'row wrap item' },
      text(() => e.nome, (v) => (e.nome = v)), numIn(() => e.nivel, (v) => (e.nivel = v), { min: 1, max: 4, class: 'mini' }),
      text(() => e.efeito, (v) => (e.efeito = v), { placeholder: 'Efeito' }))));
  const mer = card('Méritos e deméritos',
    h('p', { class: d.meritSpent > d.meritBudget ? 'warn' : 'muted small' }, `Pontos de mérito: ${d.meritSpent} / ${d.meritBudget} (2 iniciais + nível dos deméritos, máx. 8).`),
    d.warnings.filter((w) => !w.startsWith('Méritos gastam')).map((w) => h('p', { class: 'warn' }, '⚠ ' + w)),
    h('h3', {}, 'Méritos'), meritList(c.meritos, meritos, 'mérito'),
    h('h3', {}, 'Deméritos'), meritList(c.demeritos, demeritos, 'demérito'));

  // ---------- itens ----------
  const wb = ctx.wb || (ctx.wb = { tipo: 'cortante', alcance: 'cac', dado: 6, aumentos: 0, bonusTestes: 0, outras: 0, outrasCusto: 0, nome: '' });
  const ws = R.weaponStats(wb);
  const wbSet = (k, num_) => (e) => { wb[k] = num_ ? num(e.target.value) : e.target.value; ctx.refresh(); };
  const builder = h('details', { class: 'item' }, h('summary', {}, '⚒ Criar arma'),
    h('div', { class: 'grid' },
      h('label', { class: 'f' }, h('span', {}, 'Nome'), h('input', { value: wb.nome, onchange: wbSet('nome') })),
      h('label', { class: 'f' }, h('span', {}, 'Tipo de dano'), h('select', { value: wb.tipo, onchange: wbSet('tipo') }, R.DANO_TIPOS.map((x) => h('option', { value: x.id }, `${x.nome} (${x.custo})`)))),
      h('label', { class: 'f' }, h('span', {}, 'Alcance'), h('select', { value: wb.alcance, onchange: wbSet('alcance') }, R.ALCANCES.map((x) => h('option', { value: x.id }, `${x.nome} (${x.custo})`)))),
      h('label', { class: 'f' }, h('span', {}, 'Dado de dano'), h('select', { value: String(wb.dado), onchange: wbSet('dado', true) }, R.DADOS.map((x) => h('option', { value: String(x.sides) }, `1d${x.sides} (${x.custo})`)))),
      h('label', { class: 'f' }, h('span', {}, '+1 dado de dano (2 cada)'), h('input', { type: 'number', min: 0, value: wb.aumentos, onchange: wbSet('aumentos', true) })),
      h('label', { class: 'f' }, h('span', {}, '+2 em atributo (1 cada)'), h('input', { type: 'number', min: 0, value: wb.bonusTestes, onchange: wbSet('bonusTestes', true) })),
      h('label', { class: 'f' }, h('span', {}, 'Outras modificações (qtd)'), h('input', { type: 'number', min: 0, value: wb.outras, onchange: wbSet('outras', true) })),
      h('label', { class: 'f' }, h('span', {}, 'Custo das outras'), h('input', { type: 'number', min: 0, value: wb.outrasCusto, onchange: wbSet('outrasCusto', true) }))),
    h('p', {}, `${ws.tipo.efeito} — Custo: `, h('b', {}, ws.cost), ' dinheiros · Vida da arma: ', h('b', {}, ws.life)),
    btn('Adicionar à ficha', () => { c.itens.push({ id: uid(), tipo: 'arma', nome: wb.nome || 'Arma', arma: { ...wb }, texto: '' }); wb.nome = ''; }));

  const itemEl = (it, i) => {
    const head = h('div', { class: 'row wrap' }, text(() => it.nome, (v) => (it.nome = v)), h('span', { class: 'tag' }, it.tipo), btn('✕', () => c.itens.splice(i, 1), 'chip danger'));
    if (it.tipo === 'arma') {
      const s = R.weaponStats(it.arma);
      const pDano = profSel()?.tipo === 'arma' ? R.profBonus(c, profSel()) : 0;
      const dmg = `${s.diceCount}d${s.sides}${s.tipo.id === 'impacto' ? '+' + d.attrs.porrada.total : ''}${pDano ? '+' + pDano : ''}`;
      return h('div', { class: 'item' }, head,
        h('div', { class: 'small' }, `${s.tipo.nome} · ${R.ALCANCES.find((a) => a.id === it.arma.alcance)?.nome} · ${s.diceCount}d${s.sides} · custo ${s.cost} · vida ${s.life}`),
        h('div', { class: 'row wrap' },
          select(R.COMBAT.map((a) => ({ id: a, nome: R.ATTR_LABEL[a] })), it.atk || 'porrada', (v) => (it.atk = v)),
          h('button', { class: 'chip', onclick: () => roll(`Ataque (${it.nome})`, it.atk || 'porrada', 'ataque') }, '🎲 Atacar'),
          h('button', { class: 'chip', onclick: () => rollExpr(`Dano (${it.nome})`, dmg, s.tipo.efeito) }, `🎲 Dano ${dmg}`)),
        h('textarea', { rows: 1, placeholder: 'Notas / modificações', onchange: apply((e) => (it.texto = e.target.value)) }, it.texto || ''));
    }
    return h('div', { class: 'item' }, head, h('textarea', { rows: 2, placeholder: 'Descrição / efeito', onchange: apply((e) => (it.texto = e.target.value)) }, it.texto || ''));
  };
  const itens = card('Itens',
    c.itens.map(itemEl), builder,
    h('div', { class: 'row wrap' },
      h('select', { onchange: apply((e) => {
        const a = R.ARMADURAS.find((x) => x.id === e.target.value);
        if (a) c.itens.push({ id: uid(), tipo: 'armadura', nome: a.nome, texto: `${a.texto} (custo ${a.custo})` });
      }) }, h('option', { value: '' }, '+ Armadura…'), R.ARMADURAS.map((a) => h('option', { value: a.id }, `${a.nome} (${a.custo})`))),
      btn('+ Utensílio / outro', () => c.itens.push({ id: uid(), tipo: 'outro', nome: 'Novo item', texto: '' }), 'ghost')));

  const notas = card('Notas', h('textarea', { rows: 6, onchange: apply((e) => (c.notas = e.target.value)) }, c.notas || ''));

  return h('div', { class: 'sheet' }, identidade, status, atributos, profs, hab, mer, itens, notas);
}
