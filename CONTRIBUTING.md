# Contributing to @teyaproduct/teya-blocks-react

Thank you for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm

## Getting Started

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/saltpay/teya-blocks-react.git
   cd teya-blocks-react
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

## Development

### Available Scripts

| Command                    | Description                          |
| -------------------------- | ------------------------------------ |
| `npm run build`            | Build the project using tsup         |
| `npm run dev`              | Build in watch mode                  |
| `npm run type-check`       | Run TypeScript type checking         |
| `npm run test`             | Run tests                            |
| `npm run test:watch`       | Run tests in watch mode              |
| `npm run test:coverage`    | Run tests with coverage              |
| `npm run clean`            | Remove the `dist/` directory         |

### Project Structure

```
src/
├── index.ts              # Public API exports
├── components/           # React components
├── hooks/                # React hooks
├── context/              # TeyaBlocks context/provider
└── __tests__/            # Tests
```

## Making Changes

1. Create a new branch from `main`:

   ```bash
   git checkout -b your-branch-name
   ```

2. Make your changes.

3. Ensure your code passes type checks and tests:

   ```bash
   npm run type-check
   npm run test
   ```

4. Add a changeset describing your change:

   ```bash
   npx changeset
   ```

   Follow the prompts to select the change type (patch, minor, major) and provide a summary.

5. Commit your changes and push to your fork.

6. Open a pull request against `main`.

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs. Every PR that affects the published package should include a changeset.

- **patch** — Bug fixes and minor updates
- **minor** — New features (backwards compatible)
- **major** — Breaking changes

## Releasing

1. When you're ready to release, run locally:

   ```bash
   npx changeset version
   ```

   This consumes all pending changesets, bumps the version in `package.json`, and updates `CHANGELOG.md`.

2. Commit and push the version bump:

   ```bash
   git add .
   git commit -m "chore: version packages"
   git push
   ```
3. Notify ecommerce team about the PR in the #team-ecommerce slack channel
4. Create a **GitHub Release** from the `main` branch. This triggers the CI workflow that builds and publishes the package to npm.

> **Note:** If your PR doesn't need a release (e.g. docs-only changes), just merge without running `changeset version`. The package won't be published.

## Code Style

- TypeScript with strict mode enabled
- Keep the public API minimal and well-typed

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a changeset if the change affects the published package
- Add tests for any new functionality
- Ensure `npm run type-check` and `npm run test` pass
- Provide a clear description of what the PR does and why

## License

By contributing, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
