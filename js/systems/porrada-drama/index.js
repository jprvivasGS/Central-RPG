// Definição do sistema Porrada & Drama para o hub.
import { newCharacter, derive, ATTR_LABEL } from './rules.js';
import { renderSheet } from './sheet.js';
import { personalidades } from './data/personalities.js';
import { sentimentos } from './data/sentiments.js';
import { meritos, demeritos } from './data/merits.js';
import { estilos } from './data/styles.js';

export default {
  id: 'porrada-drama',
  nome: 'Porrada & Drama',
  tagline: 'Sistema 3d6 de lutas esportivas, sentimentos e drama.',
  emoji: '🥊',
  newCharacter,
  renderSheet,
  summary(c) {
    const d = derive(c);
    return [d.pers?.nome, d.estilo?.nome, `${d.t} treinamento${d.t === 1 ? '' : 's'}`].filter(Boolean).join(' • ');
  },
  // Entrada da ferramenta de iniciativa a partir de uma ficha.
  initiativeEntry(c) {
    const d = derive(c);
    return { nome: c.nome || 'Personagem', bonus: d.attrs.agilidade.total, paMax: d.pa, vidaEx: d.vidaEx, vidaExMax: d.vidaEx, vidaIn: d.vidaIn, vidaInMax: d.vidaIn, tipo: 'pc' };
  },
  // Biblioteca de consulta (aba "Biblioteca" do sistema).
  library: [
    { titulo: 'Personalidades', itens: personalidades.map((p) => ({ nome: `${p.nome} — ${p.habilidade}`, texto: `${p.texto} (Bônus: ${p.bonus.map((b) => ATTR_LABEL[b]).join(' e ')})` })) },
    { titulo: 'Sentimentos', itens: sentimentos },
    { titulo: 'Méritos', itens: meritos.map((m) => ({ nome: `${m.nome} (nível ${m.nivel})`, texto: m.efeito })) },
    { titulo: 'Deméritos', itens: demeritos.map((m) => ({ nome: `${m.nome} (nível ${m.nivel})`, texto: m.efeito })) },
    { titulo: 'Estilos de luta', itens: estilos.flatMap((e) => [{ nome: e.nome, texto: `${e.resumo} Status: ${e.status.map((s) => ATTR_LABEL[s]).join(', ')}.` }, ...e.habilidades.map((a) => ({ nome: `${e.nome} · ${a.nome} (${a.treinos} trein.)`, texto: a.texto }))]) },
  ],
};
