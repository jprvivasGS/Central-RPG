// Estilos de luta (classes). Só o Pugnace está transcrito; os outros têm os status principais.
// Para completar: copie as habilidades do PDF no mesmo formato ({ id, treinos, nome, texto }).
export const estilos = [
  { id: 'pugnace', nome: 'Pugnace', status: ['porrada', 'resistencia', 'vontade', 'agilidade'],
    resumo: 'Corpo a corpo, geralmente desarmado: capoeira, karatê, jiu-jitsu, krav magá, boxe.',
    habilidades: [
      { id: 'porradeiro', treinos: 1, nome: 'Porradeiro', texto: 'Golpes desarmados causam 1d6 de dano (a cada 10 de Porrada: 1d8 / 1d10 / 1d12 / 1d20 / 2d20 / 3d20).' },
      { id: 'marcial', treinos: 1, nome: 'Marcial', texto: 'Proficiência em artes marciais para quaisquer ações de combate.' },
      { id: 'esmaga-ossos', treinos: 5, nome: 'Esmaga ossos', texto: 'Para cada 6 ou maior num dado de ataque, adiciona 1 dado bônus de dano (quantidade de 6).' },
      { id: 'tanque', treinos: 5, nome: 'Tanque', texto: 'RD passivo igual à metade da Resistência.' },
      { id: 'precisao', treinos: 10, nome: 'Precisão aplicada', texto: 'Ao tirar 6 em ataque, pode armazenar o resultado (até 3 seis) para usar como dados adicionais depois. Não geram drama.' },
      { id: 'armas-manuais', treinos: 10, nome: 'Armas manuais', texto: 'Ataques desarmados recebem bônus de acessórios e modificações de até 5 dinheiros em conjunto.' },
      { id: 'devolucao', treinos: 10, nome: 'Devolução', texto: 'Ao ativar, armazena o dano recebido na rodada e soma ao dano do próximo ataque.' },
      { id: 'punhos-ageis', treinos: 10, nome: 'Punhos ágeis', texto: 'Um ataque extra por turno, sem gastar PA.' },
      { id: 'tecnica-perfeicao', treinos: 15, nome: 'Técnica para perfeição', texto: 'Uma habilidade extra por turno sem gastar PA.' },
      { id: 'debilitador', treinos: 15, nome: 'Debilitador', texto: 'Ao tirar 6 num dado de ataque, teste de Porrada contra a Vontade do alvo: se ganhar, aplica lesão nível 1 num membro à escolha (até nível 2).' },
      { id: 'contra-peso', treinos: 15, nome: 'Contra Peso', texto: 'Ao bloquear um ataque, pode usar uma reação para derrubar ou agarrar o agressor.' },
      { id: 'spacing', treinos: 15, nome: 'Spacing', texto: 'Ao atacar, pode se afastar uma categoria de distância sem gastar PA.' },
      { id: 'coliseu', treinos: 20, nome: 'COLISEU', texto: 'Gastando 3 PA, puxa um alvo para um duelo 1x1 que só você pode interromper. Dentro dele, seus dados d6 viram d10, ganha 1 dado de bônus e metade da Resistência como RD. (Texto completo no PDF.)' },
    ] },
  { id: 'assassino', nome: 'Assassino', status: ['agilidade', 'analise', 'maldade', 'porrada'],
    resumo: 'Finalizar combates o mais rápido possível: armas de fogo, brancas, venenos, armadilhas ou as próprias mãos.', habilidades: [] },
  { id: 'malandro', nome: 'Malandro', status: ['maldade', 'cachola', 'papo', 'analise'],
    resumo: 'Quebra as convenções com táticas e improvisos para neutralizar (ou irritar) o inimigo.', habilidades: [] },
  { id: 'armeiro', nome: 'Armeiro', status: ['agilidade', 'porrada', 'vontade', 'criatividade'],
    resumo: 'Porta uma ou várias armas, convencionais ou não.', habilidades: [] },
];
