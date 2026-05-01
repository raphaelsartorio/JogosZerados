# Jogos Zerados

Aplicação web local em Vue 3 + Vite para explorar uma planilha de jogos zerados com:

- lista paginada com filtros e ordenação
- dashboard com estatísticas e gráficos
- página de detalhes
- tema claro/escuro persistido em `localStorage`
- backup e restore em `.json`
- armazenamento local no navegador via IndexedDB (`Dexie`)

## Rodando

```bash
npm install
npm run dev
```

## Fonte inicial de dados

Na primeira execução, a aplicação faz seed automático com `public/seed-jogos.xlsx`.

Também é possível:

- importar outro `.xlsx`
- exportar todos os dados para `.json`
- importar um backup `.json`

## Estrutura

```text
src/
  components/
  pages/
  store/
  services/
  utils/
  assets/
```
