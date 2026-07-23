# Sustainable XJTLU

## Quick preview

Double-click `run-dev.command` in Finder. A Terminal window opens the local development server; then visit [http://localhost:5173](http://localhost:5173).

Alternatively, from this folder run:

```zsh
./run-dev.command
```

## Recommended permanent setup

Install the current Node.js LTS from [nodejs.org](https://nodejs.org), then install pnpm once:

```zsh
corepack enable
corepack prepare pnpm@latest --activate
```

After that, the usual workflow is simply:

```zsh
pnpm dev
```

The site uses data from `public/data/content.json`, loaded with the mock API in `src/api/contentApi.js`.
