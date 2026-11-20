// Hub central: rotas, lista de sistemas e personagens.
import { h, toast, download, fmtDate } from './core/ui.js';
import * as store from './core/storage.js';
import { systems, getSystem } from './systems/registry.js';
import { mountRoller } from './core/rollerPanel.js';
import { addRoll } from './core/rollLog.js';
import { campaignsView, campaignDetail } from './campaigns.js';
import { toolsView, addToInitiative } from './tools.js';
import { backupView } from './backup.js';

const app = document.getElementById('app');
window.addEventListener('storage-error', () => toast('Sem espaço no navegador! Exporte um backup e apague imagens grandes.'));

function newCharacter(sys) {
  const item = store.save('characters', { system: sys.id, name: 'Novo personagem', data: { ...sys.newCharacter(), nome: 'Novo personagem' } });
  location.hash = `#/s/${sys.id}/c/${item.id}`;
}

function charRows(chars) {
  if (!chars.length) return h('p', { class: 'muted' }, 'Nenhum personagem ainda.');
  return h('div', { class: 'stack' }, chars.map((c) => {
    const sys = getSystem(c.system);
    return h('div', { class: 'card row wrap between' },
      h('a', { href: `#/s/${c.system}/c/${c.id}`, class: 'grow' }, h('b', {}, c.name || 'Sem nome'),
        h('div', { class: 'muted small' }, `${sys?.nome || c.system} • ${sys ? sys.summary(c.data) : ''} • ${fmtDate(c.updatedAt)}`)),
      h('div', { class: 'row wrap' },
        h('button', { class: 'chip', onclick: () => { store.duplicate('characters', c.id); render(); } }, 'Duplicar'),
        h('button', { class: 'chip', onclick: () => download(`${(c.name || 'ficha').replace(/\W+/g, '-')}.json`, JSON.stringify(store.exportData({ characters: [c.id] }), null, 2)) }, 'Exportar'),
        h('button', { class: 'chip danger', onclick: () => { if (confirm(`Excluir “${c.name}”?`)) { store.remove('characters', c.id); render(); } } }, 'Excluir')));
  }));
}

function homeView() {
  return h('div', {},
    h('h1', {}, 'Escolha um sistema'),
    h('div', { class: 'cards' }, systems.map((s) => h('div', { class: 'card' },
      h('h2', {}, `${s.emoji || '🎲'} ${s.nome}`), h('p', { class: 'muted' }, s.tagline),
      h('div', { class: 'row wrap' }, h('a', { class: 'btn', href: `#/s/${s.id}` }, 'Abrir'), h('button', { class: 'ghost', onclick: () => newCharacter(s) }, '+ Novo personagem'))))),
    h('h2', {}, 'Meus personagens'), charRows(store.list('characters')));
}

function systemView(id) {
  const s = getSystem(id);
  if (!s) return h('p', {}, 'Sistema não encontrado.');
  return h('div', {}, h('p', {}, h('a', { href: '#/' }, '← Sistemas')), h('h1', {}, `${s.emoji || ''} ${s.nome}`), h('p', { class: 'muted' }, s.tagline),
    h('div', { class: 'row wrap' }, h('button', { onclick: () => newCharacter(s) }, '+ Novo personagem'), h('a', { class: 'btn ghost', href: `#/s/${id}/biblioteca` }, '📚 Biblioteca')),
    h('h2', {}, 'Personagens'), charRows(store.list('characters', (c) => c.system === id)));
}

function libraryView(id) {
  const s = getSystem(id);
  if (!s) return h('p', {}, 'Sistema não encontrado.');
  return h('div', {}, h('p', {}, h('a', { href: `#/s/${id}` }, `← ${s.nome}`)), h('h1', {}, 'Biblioteca'),
    s.library.map((g) => h('details', { class: 'card' }, h('summary', {}, `${g.titulo} (${g.itens.length})`),
      g.itens.map((i) => h('div', { class: 'item' }, h('b', {}, i.nome), h('div', { class: 'small' }, i.texto))))));
}

function sheetView(sysId, charId) {
  const sys = getSystem(sysId);
  const item = store.get('characters', charId);
  if (!sys || !item) return h('p', {}, 'Ficha não encontrada. ', h('a', { href: '#/' }, 'Voltar'));
  const box = h('div', {});
  const ctx = {
    save: () => { item.name = item.data.nome || 'Sem nome'; store.save('characters', item); },
    refresh: () => box.replaceChildren(sys.renderSheet(item.data, ctx)),
    log: addRoll,
    toInitiative: addToInitiative,
  };
  ctx.refresh();
  return h('div', {}, h('div', { class: 'row wrap between' }, h('a', { href: `#/s/${sysId}` }, `← ${sys.nome}`),
    h('div', { class: 'row wrap' },
      h('button', { class: 'chip', onclick: () => { const c = store.duplicate('characters', charId); location.hash = `#/s/${sysId}/c/${c.id}`; } }, 'Duplicar'),
      h('button', { class: 'chip', onclick: () => download(`${(item.name || 'ficha').replace(/\W+/g, '-')}.json`, JSON.stringify(store.exportData({ characters: [charId] }), null, 2)) }, 'Exportar JSON'),
      h('button', { class: 'chip', onclick: () => window.print() }, 'Imprimir'))), box);
}

const routes = [
  [/^#?\/?$/, homeView],
  [/^#\/s\/([\w-]+)$/, systemView],
  [/^#\/s\/([\w-]+)\/biblioteca$/, libraryView],
  [/^#\/s\/([\w-]+)\/c\/([\w-]+)$/, sheetView],
  [/^#\/campanhas$/, campaignsView],
  [/^#\/campanhas\/([\w-]+)(?:\/(\w+))?$/, campaignDetail],
  [/^#\/ferramentas$/, toolsView],
  [/^#\/backup$/, backupView],
];

function render() {
  const hash = location.hash || '#/';
  for (const [re, fn] of routes) {
    const m = hash.match(re);
    if (m) { app.replaceChildren(fn(...m.slice(1))); return; }
  }
  app.replaceChildren(h('p', {}, 'Página não encontrada. ', h('a', { href: '#/' }, 'Início')));
}
let lastHash = null;
window.addEventListener('hashchange', () => { render(); if (location.hash !== lastHash) window.scrollTo(0, 0); lastHash = location.hash; });
render();
mountRoller(document.body);
