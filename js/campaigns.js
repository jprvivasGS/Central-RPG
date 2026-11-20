// Central de campanhas: NPCs, inimigos, mapas, enigmas e jogadores.
import { h, toast, imageToDataURL, fmtDate } from './core/ui.js';
import * as store from './core/storage.js';
import { getSystem } from './systems/registry.js';
import { addToInitiative } from './tools.js';

const KINDS = {
  npc: { label: 'NPCs', novo: 'Novo NPC', fields: [
    { k: 'nome', l: 'Nome' }, { k: 'papel', l: 'Papel / função' }, { k: 'descricao', l: 'Descrição', t: 'area' }, { k: 'segredos', l: 'Segredos (só o mestre)', t: 'area' }] },
  enemy: { label: 'Inimigos', novo: 'Novo inimigo', fields: [
    { k: 'nome', l: 'Nome' }, { k: 'vidaEx', l: 'Vida externa', t: 'num' }, { k: 'vidaIn', l: 'Vida interna', t: 'num' }, { k: 'pa', l: 'Pontos de ação', t: 'num' },
    { k: 'bonusIni', l: 'Bônus de iniciativa', t: 'num' }, { k: 'habilidades', l: 'Atributos e habilidades', t: 'area' }, { k: 'notas', l: 'Notas', t: 'area' }] },
  map: { label: 'Mapas', novo: 'Novo mapa', fields: [{ k: 'nome', l: 'Nome' }, { k: 'imagem', l: 'Imagem', t: 'img' }, { k: 'notas', l: 'Notas', t: 'area' }] },
  puzzle: { label: 'Enigmas', novo: 'Novo enigma', fields: [
    { k: 'nome', l: 'Nome' }, { k: 'enunciado', l: 'Enunciado / cena', t: 'area' }, { k: 'solucao', l: 'Solução', t: 'area' }, { k: 'pistas', l: 'Pistas', t: 'area' }, { k: 'resolvido', l: 'Resolvido', t: 'check' }] },
};
const TABS = [['resumo', 'Resumo'], ['jogadores', 'Jogadores'], ...Object.entries(KINDS).map(([k, v]) => [k, v.label])];

export function campaignsView() {
  const nome = h('input', { placeholder: 'Nome da nova campanha' });
  const create = () => {
    if (!nome.value.trim()) return toast('Dê um nome à campanha.');
    const c = store.save('campaigns', { name: nome.value.trim(), data: { notas: '', characterIds: [] } });
    location.hash = `#/campanhas/${c.id}`;
  };
  const camps = store.list('campaigns');
  return h('div', {}, h('h1', {}, 'Campanhas'),
    h('div', { class: 'row wrap' }, nome, h('button', { onclick: create }, '+ Criar campanha')),
    h('div', { class: 'cards' }, camps.length ? camps.map((c) => h('a', { class: 'card link', href: `#/campanhas/${c.id}` },
      h('h2', {}, c.name), h('div', { class: 'muted small' }, `Atualizada em ${fmtDate(c.updatedAt)}`),
      h('div', { class: 'small' }, `${store.list('entities', (e) => e.campaignId === c.id).length} registros`))) : h('p', { class: 'muted' }, 'Nenhuma campanha ainda.')));
}

export function campaignDetail(id, tab = 'resumo') {
  const camp = store.get('campaigns', id);
  if (!camp) return h('p', {}, 'Campanha não encontrada. ', h('a', { href: '#/campanhas' }, 'Voltar'));
  const body = h('div', {});
  const draw = () => body.replaceChildren(tab === 'resumo' ? resumo(camp) : tab === 'jogadores' ? jogadores(camp, draw) : entities(camp, tab, draw));
  draw();
  return h('div', {}, h('p', {}, h('a', { href: '#/campanhas' }, '← Campanhas')), h('h1', {}, camp.name),
    h('nav', { class: 'tabs' }, TABS.map(([k, l]) => h('a', { href: `#/campanhas/${id}/${k}`, class: k === tab ? 'on' : '' }, l))), body);
}

function resumo(camp) {
  return h('section', { class: 'card' },
    h('label', { class: 'f' }, h('span', {}, 'Nome'), h('input', { value: camp.name, onchange: (e) => { camp.name = e.target.value || camp.name; store.save('campaigns', camp); } })),
    h('label', { class: 'f' }, h('span', {}, 'Anotações do mestre (sessões, ganchos, regras da casa)'),
      h('textarea', { rows: 12, onchange: (e) => { camp.data.notas = e.target.value; store.save('campaigns', camp); } }, camp.data.notas || '')),
    h('button', { class: 'ghost danger', onclick: () => { if (confirm('Excluir a campanha e todos os NPCs, inimigos, mapas e enigmas dela?')) { store.remove('campaigns', camp.id); location.hash = '#/campanhas'; } } }, 'Excluir campanha'));
}

function jogadores(camp, redraw) {
  const chars = store.list('characters');
  const sel = new Set(camp.data.characterIds || []);
  const toggle = (id, on) => { on ? sel.add(id) : sel.delete(id); camp.data.characterIds = [...sel]; store.save('campaigns', camp); redraw(); };
  const mine = chars.filter((c) => sel.has(c.id));
  return h('section', { class: 'card' }, h('h2', {}, 'Personagens da campanha'),
    chars.length ? chars.map((c) => h('label', { class: 'row item' },
      h('input', { type: 'checkbox', checked: sel.has(c.id), onchange: (e) => toggle(c.id, e.target.checked) }),
      h('a', { href: `#/s/${c.system}/c/${c.id}` }, c.name || 'Sem nome'),
      h('span', { class: 'muted small' }, getSystem(c.system)?.summary(c.data) || ''))) : h('p', { class: 'muted' }, 'Crie personagens em algum sistema para vinculá-los aqui.'),
    mine.length ? h('button', { onclick: () => { mine.forEach((c) => { const sys = getSystem(c.system); if (sys?.initiativeEntry) addToInitiative(sys.initiativeEntry(c.data)); }); } }, '→ Enviar todos para a iniciativa') : null);
}

function entities(camp, kind, redraw) {
  const K = KINDS[kind];
  const items = store.list('entities', (e) => e.campaignId === camp.id && e.kind === kind);
  const add = () => { store.save('entities', { kind, campaignId: camp.id, name: K.novo, data: { nome: K.novo } }); redraw(); };
  return h('div', {}, h('button', { onclick: add }, '+ ' + K.novo),
    h('div', { class: 'stack' }, items.length ? items.map((e, i) => entityCard(e, K, redraw, i === 0 && Date.now() - e.createdAt < 4000)) : h('p', { class: 'muted' }, 'Nada aqui ainda.')));
}

function entityCard(e, K, redraw, open) {
  const persist = () => { e.name = e.data.nome || K.novo; store.save('entities', e); };
  const fields = K.fields.map((f) => {
    const v = e.data[f.k];
    if (f.t === 'area') return h('label', { class: 'f' }, h('span', {}, f.l), h('textarea', { rows: 3, onchange: (ev) => { e.data[f.k] = ev.target.value; persist(); } }, v || ''));
    if (f.t === 'num') return h('label', { class: 'f' }, h('span', {}, f.l), h('input', { type: 'number', value: v ?? 0, onchange: (ev) => { e.data[f.k] = +ev.target.value; persist(); } }));
    if (f.t === 'check') return h('label', { class: 'f check' }, h('input', { type: 'checkbox', checked: !!v, onchange: (ev) => { e.data[f.k] = ev.target.checked; persist(); redraw(); } }), h('span', {}, f.l));
    if (f.t === 'img') return h('div', { class: 'f' }, h('span', {}, f.l), v && h('img', { class: 'map', src: v, alt: e.name }),
      h('input', { type: 'file', accept: 'image/*', onchange: async (ev) => { const file = ev.target.files[0]; if (!file) return; try { e.data[f.k] = await imageToDataURL(file); persist(); redraw(); } catch (err) { toast('Não consegui ler a imagem.'); } } }));
    return h('label', { class: 'f' }, h('span', {}, f.l), h('input', { value: v || '', onchange: (ev) => { e.data[f.k] = ev.target.value; persist(); redraw(); } }));
  });
  const actions = h('div', { class: 'row wrap' },
    h('button', { class: 'ghost', onclick: () => { store.duplicate('entities', e.id); redraw(); } }, 'Duplicar'),
    e.kind === 'enemy' && h('button', { class: 'ghost', onclick: () => addToInitiative({ nome: e.data.nome || 'Inimigo', bonus: e.data.bonusIni || 0, paMax: e.data.pa ?? 2, vidaEx: e.data.vidaEx || 0, vidaIn: e.data.vidaIn || 0, tipo: 'enemy' }) }, '→ Iniciativa'),
    h('button', { class: 'ghost danger', onclick: () => { if (confirm(`Excluir “${e.name}”?`)) { store.remove('entities', e.id); redraw(); } } }, 'Excluir'));
  return h('details', { class: 'card', open }, h('summary', {}, (e.data.resolvido ? '✓ ' : '') + (e.name || K.novo)), h('div', { class: 'grid' }, fields), actions);
}
