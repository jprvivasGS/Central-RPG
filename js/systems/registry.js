// Registro de sistemas. Para adicionar um sistema novo: crie a pasta em js/systems/<id>/,
// exporte um objeto com { id, nome, tagline, emoji, newCharacter, renderSheet, summary, library }
// e acrescente uma linha aqui.
import porradaDrama from './porrada-drama/index.js';

export const systems = [porradaDrama];
export const getSystem = (id) => systems.find((s) => s.id === id);
