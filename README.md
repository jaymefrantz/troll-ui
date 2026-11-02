# Nuxt Layer Starter

Create Nuxt extendable layer with this GitHub template.

## Setup

This repository targets Nuxt 4.6.3. Use Node 22.23.1 (`nvm use` reads the
checked-in `.nvmrc`), or another runtime satisfying the `engines.node` range in
`package.json`. Node 24.10.0 is too old for this Nuxt release.

The root layer and playground have separate dependency installations. With npm,
install the playground first, then the layer (whose postinstall prepares it):

```bash
nvm use
npm install --prefix .playground
npm install
npm run dev
```

Use `npm run typecheck` for the playground's Vue/TypeScript checks. The baseline
and upgrade validation reports in `docs/` record existing failures and checks.

## Working on your theme

Your theme is at the root of this repository, it is exactly like a regular Nuxt project, except you can publish it on NPM.

The `.playground` directory should help you on trying your theme during development.

Running `pnpm dev` will prepare and boot `.playground` directory, which imports your theme itself.

## Distributing your theme

Your Nuxt layer is shaped exactly the same as any other Nuxt project, except you can publish it on NPM.

To do so, you only have to check if `files` in `package.json` are valid, then run:

```bash
npm publish --access public
```

Once done, your users will only have to run:

```bash
npm install --save your-theme
```

Then add the dependency to their `extends` in `nuxt.config`:

```ts
defineNuxtConfig({
  extends: 'your-theme'
})
```

## Development Server

Start the development server on http://localhost:3000

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Or statically generate it with:

```bash
pnpm generate
```

Locally preview production build:

```bash
pnpm preview
```

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
