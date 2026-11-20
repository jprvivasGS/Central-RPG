// Regras de Porrada & Drama. Tudo que é fórmula fica aqui, para ajustar fácil.
// SUPOSIÇÕES (confirme com o PDF e edite aqui se necessário):
//  - Teste = 3d6 + atributo total (+ proficiência + bônus). Vantagem = +1 dado d6 mantendo os 3 melhores; desvantagem, os 3 piores.
//  - Personagem novo começa com 1 treinamento (senão vida = 0).
//  - Iniciativa = 3d6 + Agilidade.
import { personalidades } from './data/personalities.js';
import { meritos, demeritos } from './data/merits.js';
import { estilos } from './data/styles.js';

export const SOCIAL = ['cachola', 'papo', 'vontade', 'maldade'];
export const COMBAT = ['porrada', 'resistencia', 'agilidade', 'analise', 'criatividade'];
export const ALL = [...SOCIAL, ...COMBAT];
export const ATTR_LABEL = { cachola: 'Cachola', papo: 'Papo', vontade: 'Vontade', maldade: 'Maldade', porrada: 'Porrada', resistencia: 'Resistência', agilidade: 'Agilidade', analise: 'Análise', criatividade: 'Criatividade' };
export const START_POINTS = 20;
export const START_MAX = 5;

export const DANO_TIPOS = [
  { id: 'cortante', nome: 'Cortante', custo: 2, efeito: 'Ao tirar 6 num dado de ataque, causa sangramento.' },
  { id: 'impacto', nome: 'Impacto', custo: 2, efeito: 'Soma sua Porrada ao dano.' },
  { id: 'perfuracao', nome: 'Perfuração', custo: 2, efeito: 'Ignora o bloqueio de um alvo.' },
  { id: 'balistico', nome: 'Balístico', custo: 2, efeito: 'Metade do dano atinge a vida real do alvo.' },
];
export const ALCANCES = [
  { id: 'cac', nome: 'Corpo a corpo', custo: 0 }, { id: 'curto', nome: 'Curto', custo: 1 }, { id: 'medio', nome: 'Médio', custo: 3 },
  { id: 'longo', nome: 'Longo', custo: 5 }, { id: 'extremo', nome: 'Extremo', custo: 10 },
];
export const DADOS = [{ sides: 4, custo: 0 }, { sides: 6, custo: 1 }, { sides: 8, custo: 2 }, { sides: 10, custo: 3 }, { sides: 12, custo: 4 }];
export const ARMADURAS = [
  { id: 'leve', nome: 'Armadura Leve', custo: 3, texto: '3 RD para dano normal ou especial. Sem desvantagem. Até 2 modificações.' },
  { id: 'media', nome: 'Armadura Média', custo: 6, texto: '10 RD geral + 5 RD contra dano normal/especial. Lerdo e -10 em furtividade (20 de Porrada anula). Até 4 modificações.' },
  { id: 'pesada', nome: 'Armadura Pesada', custo: 12, texto: '25 RD geral + 15 RD contra dano normal/especial. Lerdo e -20 em agilidade (30 de Porrada anula). Até 6 modificações.' },
];

export const findPersonalidade = (id) => personalidades.find((p) => p.id === id);
export const findEstilo = (id) => estilos.find((e) => e.id === id);
const defOf = (e) => (e.ref ? [...meritos, ...demeritos].find((x) => x.id === e.ref) : null);

export function newCharacter() {
  return {
    nome: '', jogador: '', personalidadeId: '', estiloId: '', treinamentos: 1, dinheiro: 5,
    attrs: Object.fromEntries(ALL.map((a) => [a, 0])),
    proficiencias: [], habilidadesEstilo: [], habilidades: [], meritos: [], demeritos: [], itens: [], notas: '',
    atual: { vidaEx: null, vidaIn: null, pa: null, drama: 0 },
    teste: { adv: 0, bonus: 0, prof: '', drama: false },
  };
}

export const profBonus = (c, p) => (p.ampla ? Math.floor((c.treinamentos || 0) / 2) : (c.treinamentos || 0));

export function derive(c) {
  const t = Math.max(0, +c.treinamentos || 0);
  const pers = findPersonalidade(c.personalidadeId);
  const attrs = {};
  for (const a of ALL) attrs[a] = { base: +c.attrs?.[a] || 0, pers: pers?.bonus.includes(a) ? t : 0, merit: 0 };
  for (const e of [...(c.meritos || []), ...(c.demeritos || [])]) {
    const def = defOf(e);
    if (def?.mods) for (const [k, v] of Object.entries(def.mods)) attrs[k].merit += v;
  }
  for (const a of ALL) attrs[a].total = attrs[a].base + attrs[a].pers + attrs[a].merit;
  const T = (a) => attrs[a].total;

  let pa = 2 + Math.floor(t / 10) + Math.floor(T('agilidade') / 15);
  for (const e of c.meritos || []) { const def = defOf(e); if (def?.pa) pa += def.pa(T); }

  const demLevels = (c.demeritos || []).reduce((s, e) => s + (+e.nivel || 0), 0);
  const meritBudget = Math.min(8, 2 + demLevels);
  const meritSpent = (c.meritos || []).reduce((s, e) => s + (+e.nivel || 0), 0);

  const warnings = [];
  if (meritSpent > meritBudget) warnings.push(`Méritos gastam ${meritSpent} pontos, mas o orçamento é ${meritBudget}.`);
  const refs = new Set([...(c.meritos || []), ...(c.demeritos || [])].map((e) => e.ref).filter(Boolean));
  for (const e of [...(c.meritos || []), ...(c.demeritos || [])]) {
    const def = defOf(e);
    if (def?.contra && refs.has(def.contra)) warnings.push(`${def.nome} contradiz outro mérito/demérito escolhido.`);
  }
  return {
    t, attrs, pers, estilo: findEstilo(c.estiloId), pa,
    vidaEx: T('resistencia') * t,
    vidaIn: Math.floor((T('vontade') / 2) * t),
    dramaCat: Math.floor(T('vontade') / 15),
    meritBudget, meritSpent, warnings,
    baseSum: ALL.reduce((s, a) => s + attrs[a].base, 0),
  };
}

// Pontos de drama: 6-6-6 na categoria base; categorias maiores facilitam.
const DRAMA_REQ = [[6, 6, 6], [6, 6, 5], [6, 5, 5], [5, 5, 5], [5, 5, 4]];
export function dramaCheck(dice, categoria = 0) {
  const s = [...dice].sort((a, b) => b - a);
  const req = DRAMA_REQ[Math.min(Math.max(categoria, 0), 4)];
  return s.length >= 3 && req.every((v, i) => s[i] >= v);
}

export function weaponStats(w) {
  const tipo = DANO_TIPOS.find((x) => x.id === w.tipo) || DANO_TIPOS[0];
  const ai = Math.max(0, ALCANCES.findIndex((x) => x.id === w.alcance));
  const di = Math.max(0, DADOS.findIndex((x) => x.sides === +w.dado));
  const aum = +w.aumentos || 0, bon = +w.bonusTestes || 0, outras = +w.outras || 0, outrasCusto = +w.outrasCusto || 0;
  const cost = tipo.custo + ALCANCES[ai].custo + DADOS[di].custo + 2 * aum + bon + outrasCusto;
  const points = 1 + (ai + 1) + (di + 1) + aum + bon + outras; // suposição: tier de alcance começa em 1
  return { tipo, cost, points, life: points * 20, diceCount: 1 + aum, sides: DADOS[di].sides };
}
