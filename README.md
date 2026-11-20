# Mesa Central — hub de TTRPG

Site estático (HTML + JavaScript puro, **sem build**) para hospedar no GitHub Pages.
Fichas, campanhas (NPCs, inimigos, mapas, enigmas), iniciativa e dados customizados.
Os dados ficam no navegador (localStorage); use **Backup** para exportar/importar JSON.

## Rodar localmente
Módulos ES não funcionam abrindo o `index.html` direto (file://). Use um servidor local:

    python3 -m http.server 8000     # depois abra http://localhost:8000

## Publicar no GitHub Pages
1. Crie um repositório e envie estes arquivos na raiz.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. O site abre em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Estrutura
    index.html            página única; rotas por hash (#/s/porrada-drama/c/ID)
    css/style.css
    js/main.js            hub, rotas, lista de personagens
    js/campaigns.js       central de campanhas
    js/tools.js           iniciativa + rolagens salvas
    js/backup.js
    js/core/              dados (dice.js), armazenamento, painel de dados, helpers de UI
    js/systems/registry.js        lista de sistemas disponíveis
    js/systems/porrada-drama/     o primeiro sistema
        rules.js          fórmulas (vida, PA, drama, armas) — suposições comentadas no topo
        sheet.js          interface da ficha
        data/             personalidades, sentimentos, méritos, estilos de luta

## Adicionar um sistema novo
1. Copie `js/systems/porrada-drama/` para `js/systems/<novo-id>/`.
2. Em `index.js` exporte `{ id, nome, tagline, emoji, newCharacter, renderSheet, summary, library }`
   (opcional: `initiativeEntry(dados)`).
3. Registre em `js/systems/registry.js`. Ele aparece no hub com criar/salvar/duplicar/exportar prontos.

## Pendências conhecidas (Porrada & Drama)
- Habilidades de Assassino, Malandro e Armeiro (e o resto do Coliseu) ainda não foram transcritas: `data/styles.js`.
- Méritos/deméritos: lista parcial em `data/merits.js`.
- Próteses/modificações cibernéticas, terrenos, condições e lesões: ainda só no PDF.
