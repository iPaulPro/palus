# Palus

Palus is a social app built on Lens and a fork of [Hey](https://github.com/bigint/hey) maintained by [Paul Burke](https://github.com/iPaulPro/).

## Requirements

To start working with the Palus monorepo, ensure the following tools are installed:

- [Node.js](https://nodejs.org/en/download/) (>=18.x <=22.x) – the JavaScript runtime used in this project.
- [pnpm](https://pnpm.io/installation) – the package manager used throughout this repository.

## Installation

This repository uses [pnpm workspaces](https://pnpm.io/workspaces) to manage multiple packages within a monorepo structure.

### Clone the Repository

```bash
git clone git@github.com:ipaulpro/palus.git
```

### Install NVM and pnpm

On macOS, you can install both with Homebrew:

```bash
brew install nvm pnpm
```

### Install Node.js

Use `nvm` to install the required Node.js version:

```bash
nvm install
```

### Install Dependencies

From the repository root, install dependencies with pnpm:

```bash
pnpm install
```

### Start the Development Server

To run the application in development mode:

```bash
pnpm dev
```

## Build

### Build the application

Compile the application:

```bash
pnpm build
```

### Type-check the project

Validate the codebase with the TypeScript type checker:

```bash
pnpm typecheck
```

### Lint and Format Code

Check code quality and formatting with Biome:

```bash
pnpm biome:check
```

Automatically fix linting and formatting issues:

```bash
pnpm biome:fix
```

### Maintenance Scripts

Convenient Node.js helpers are in the `script` directory:

- `node script/clean.mjs` removes all `node_modules`, `.next` directories,
  `pnpm-lock.yaml`, and `tsconfig.tsbuildinfo` files.
- `node script/update-dependencies.mjs` updates packages across the monorepo,
  removes old installs and commits the changes in a new branch.
- `node script/sort-package-json.mjs` sorts all `package.json` files in the
  repository.

## License

This project is licensed under GPLv3, as provided in the original repository’s LICENSE file.
The original README references AGPLv3, but no AGPL license text is included upstream.
