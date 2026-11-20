import { h, toast, download, pickFile } from './core/ui.js';
import * as store from './core/storage.js';

export function backupView() {
  const usage = h('span', {}, `${(store.usageBytes() / 1024).toFixed(0)} KB usados (limite do navegador ≈ 5 MB)`);
  return h('div', {}, h('h1', {}, 'Backup'),
    h('section', { class: 'card' },
      h('p', {}, 'Seus dados ficam só neste navegador. Exporte um arquivo para guardar, levar a outro aparelho ou mandar uma ficha para outra pessoa.'),
      h('p', { class: 'muted small' }, usage),
      h('div', { class: 'row wrap' },
        h('button', { onclick: () => download(`mesa-central-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(store.exportData(), null, 2)) }, '⬇ Exportar tudo'),
        h('button', { class: 'ghost', onclick: async () => {
          const txt = await pickFile('.json,application/json'); if (!txt) return;
          try { const s = store.importData(JSON.parse(txt)); toast(`Importado: ${s.added} novos, ${s.updated} atualizados, ${s.skipped} ignorados.`); setTimeout(() => location.reload(), 900); }
          catch (e) { toast(e.message); }
        } }, '⬆ Importar'),
        h('button', { class: 'ghost danger', onclick: () => { if (confirm('Apagar TODOS os dados deste navegador? Exporte antes!') && confirm('Tem certeza? Isso não pode ser desfeito.')) { store.wipe(); location.hash = '#/'; location.reload(); } } }, 'Apagar tudo'))));
}
