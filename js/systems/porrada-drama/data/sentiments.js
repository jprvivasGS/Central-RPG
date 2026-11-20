// Sentimentos (só consulta na biblioteca por enquanto). Cada nível: [1, 2, 3].
export const sentimentos = [
  { nome: 'Felicidade (+)', texto: 'Empolgação crescente: cada ação dá 1 PA e +1 em todos os testes (acumula até +3 / +5 / +10 e +3 PA no nível 3; no nível 3 é +2 por ação). Distração: -1 / -2 / -3 dados (desvantagem) em testes de análise ou esquiva.' },
  { nome: 'Foco (+)', texto: 'Atenção máxima: 1 / 2 / 3 vantagens em testes de análise e esquiva. Anular: não pode receber outros sentimentos positivos.' },
  { nome: 'Amor (+)', texto: 'Poder do Amor: ao entrar, recebe treinamentos + 5 / ×2 / ×3 como vida externa (1 vez por cena). Melhor Lado: -5 / -10 / -15 em testes de Maldade ou Criatividade por 3 rodadas.' },
  { nome: 'Calma (+)', texto: 'Otimizar ações: habilidades custam -1 / -2 / -2 PA (mínimo 1) e +2 / +8 / +16 para resistir a efeitos sentimentais externos. Reduzir potência: -5 / -25 / -50 de dano em todos os ataques.' },
  { nome: 'Determinação (+)', texto: 'Vontade inabalável: +1 / +2 / +3 dados em testes para se manter consciente (1 / 2 / 3 vezes por cena; nível 2 cura 30 de vida, nível 3 cura 100 e dá 1 ponto de drama). Determinação corrosiva: cada falha dá -2 / -4 / -5 em todos os testes (máx. -8 / -12 / -20).' },
  { nome: 'Raiva (−)', texto: 'Fúria crescente: cada dano recebido = 1 acúmulo de dor; cada acúmulo dá +1 / +3 / +6 de dano nos ataques. Ira cegante: escolhe um alvo e só ataca ele até chegar à metade da vida externa / zerar a vida externa / morrer.' },
  { nome: 'Nervosismo (−)', texto: 'Pressa: +1 / +2 / +3 PA, mas -2 / -5 / -10 em todos os testes. Esquecimento: rola um dado igual à quantidade de habilidades; esquece a habilidade sorteada e precisa de teste de Cachola (DT 15 / 30 / 45) para lembrar.' },
  { nome: 'Tristeza (−)', texto: 'Pessimismo: +3 / +6 / +9 em testes de defesa. Desânimo: -1 / -2 no limite de PA; no nível 3 gasta +3 PA em todas as habilidades.' },
  { nome: 'Tédio (−)', texto: 'Introspecção: +3 / +5 / +10 em testes de Cachola e Análise. Resistência nula: recebe +5 / +15 / +30 de dano.' },
  { nome: 'Medo (−)', texto: 'Luta ou fuga: vantagem em todos os testes de Porrada ou Agilidade. Enfrentar medos: teste de Vontade (DT 10 + papo, porrada ou maldade da fonte) para agir contra o objeto do medo; no nível 2 falhar deixa Abalado por 1 rodada, no nível 3 deixa paralisado por 1 rodada.' },
];
