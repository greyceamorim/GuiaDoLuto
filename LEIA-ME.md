# Guia do Luto

**O que fazer quando alguém da família morre.** Um passo a passo gratuito, em linguagem simples, para famílias de baixa renda: o que fazer nas primeiras 24 horas, na primeira semana, no primeiro mês e nos meses seguintes, com os prazos e os direitos da família.

Com 7 perguntas simples, o guia mostra só os passos que servem para aquela família. Cada passo pode ser marcado como feito, e a lista pode ser enviada pelo WhatsApp.

**Situação atual:** protótipo. As informações estão sendo revisadas por advogado. O site avisa isso no topo e no rodapé.

## Princípios

- De graça, sem cadastro, sem anúncios e sem cookies.
- Não pede nome, CPF nem nenhum dado de quem faleceu. As respostas ficam só no celular e somem ao fechar a página.
- Tom acolhedor: um passo de cada vez, sem julgar a família.
- Orientação, não garantia. Quem confirma é sempre o INSS, o CRAS ou a Defensoria Pública.

## Arquivos

| Arquivo | Para que serve | Precisa mexer? |
|---|---|---|
| `index.html` | A página | Quase nunca |
| `app.js` | As perguntas, os passos, os textos e o feedback | Quando um texto ou regra mudar |
| `style.css` | Cores e letras | Só para mudar o visual |
| `_headers` | Proteções de segurança | Não |
| `functions/api/feedback.js` | Recebe o "Este guia ajudou?" e o comentário opcional | Não |

Os textos de cada passo estão no `app.js`, dentro da função `montar()`. As linhas curtas que vão para o WhatsApp estão logo acima, na lista `Z`.

## Feedback

No fim do resultado aparece "Este guia ajudou?", com dois botões de texto (sem carinhas, por respeito ao momento). Depois, uma caixa opcional: "Faltou algum passo ou alguma coisa ficou confusa?", com no máximo 300 letras e o aviso para não escrever nomes, telefone, CPF nem detalhes sobre quem faleceu.

O que é guardado: sim ou não, os códigos dos passos que apareceram, o comentário opcional e a data. **As respostas das perguntas não são guardadas.** O IP não é guardado. Como proteção extra, sequências longas de números no comentário (CPF, telefone) são apagadas antes de gravar.

### Configurar (uma vez)

1. **Criar o banco.** Cloudflare › **Storage & Databases › D1 SQL Database › Create**. Nome: `luto-feedback`.
2. **Ligar ao site.** **Workers & Pages ›** este projeto **› Settings › Bindings › Add › D1 database**. Variable name: `DB`; banco: `luto-feedback`. Save.
3. **Republicar.** Deployments › clique no último › **Retry deployment** (ou faça qualquer commit).

**Não precisa rodar nenhum SQL:** na primeira resposta, a função cria as tabelas sozinha.

### Ver as respostas

No **Console** do banco `luto-feedback`:

```sql
SELECT criado_em, voto, beneficios AS passos, comentario FROM feedback ORDER BY id DESC;
```

Boa prática de privacidade: apague respostas com mais de um ano.

```sql
DELETE FROM feedback WHERE criado_em < datetime('now', '-1 year');
```

## Publicar

Repositório no GitHub ligado ao Cloudflare Pages: Framework preset **None**, Build command e Build output directory **vazios**. Cada commit publica sozinho.

## Segurança

- Sem login e sem dados pessoais guardados.
- Política de conteúdo (CSP) no `_headers`: o navegador só aceita código deste site e a fonte do Google.
- A página não pode ser embutida em outros sites, e o HTTPS é obrigatório.
- Verificação em duas etapas no GitHub e na Cloudflare.
