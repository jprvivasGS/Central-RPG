// Méritos e deméritos (lista PARCIAL — complete com o resto do PDF).
// mods: bônus fixos em atributos. contra: id do mérito/demérito que contradiz este.
// pa: função (totais) => pontos de ação extras.
export const meritos = [
  { id: 'forte', nome: 'Forte', nivel: 1, efeito: '+2 de Porrada.', mods: { porrada: 2 }, contra: 'fraco' },
  { id: 'rapido', nome: 'Rápido', nivel: 1, efeito: '+2 de Agilidade.', mods: { agilidade: 2 }, contra: 'lento' },
  { id: 'mente-fertil', nome: 'Mente fértil', nivel: 1, efeito: '+1 de Cachola e Criatividade.', mods: { cachola: 1, criatividade: 1 } },
  { id: 'carismatico', nome: 'Carismático', nivel: 1, efeito: '+2 de Papo.', mods: { papo: 2 } },
  { id: 'versatil', nome: 'Versátil', nivel: 1, efeito: 'Ganha 1 proficiência extra.' },
  { id: 'filho-do-vento', nome: 'Filho do Vento', nivel: 2, efeito: 'Após se locomover, recebe +3 de Agilidade em um teste à sua escolha.' },
  { id: 'convincente', nome: 'Convincente', nivel: 2, efeito: 'Para cada teste de Papo bem sucedido, +2 no próximo teste, acumulando até +8. Cessa ao falhar.' },
  { id: 'primeiros-socorros', nome: 'Primeiros Socorros', nivel: 2, efeito: 'Cura a vida externa de um alvo em Cachola + Criatividade.' },
  { id: 'provocador', nome: 'Provocador', nivel: 2, efeito: 'Como reação, força um oponente corpo a corpo a te atacar.' },
  { id: 'veloz', nome: 'Veloz', nivel: 3, efeito: '+1 ponto de ação; a cada 20 de Agilidade, +1 ponto de ação.', pa: (T) => 1 + Math.floor(T('agilidade') / 20) },
  { id: 'pes-leves', nome: 'Pés leves', nivel: 3, efeito: '+5 em testes de furtividade; se o alvo tem condição que inibe a visão, sua categoria de furtividade sobe +1.' },
  { id: 'genio', nome: 'Gênio', nivel: 4, efeito: 'Ao ser bem sucedido em um treinamento, recebe 1 status extra à sua escolha.' },
];

export const demeritos = [
  { id: 'fraco', nome: 'Fraco', nivel: 1, efeito: '-2 de Porrada.', mods: { porrada: -2 }, contra: 'forte' },
  { id: 'lento', nome: 'Lento', nivel: 1, efeito: '-2 de Agilidade.', mods: { agilidade: -2 }, contra: 'rapido' },
  { id: 'preguicoso', nome: 'Preguiçoso', nivel: 1, efeito: 'Ao falhar em um teste de Vontade, recebe -1 no próximo; encerra após o primeiro sucesso.' },
];
