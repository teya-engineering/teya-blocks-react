# Contributing to Teya Blocks React

Thank you for your interest in contributing to Teya Blocks React! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```sh
   git clone https://github.com/saltpay/teya-blocks-react.git
   cd teya-blocks-react
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Create a branch for your changes:
   ```sh
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

```sh
npm run dev        # Watch mode for development
npm run build      # Build CJS + ESM + type declarations
npm run type-check # TypeScript type checking
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
```

### Before Submitting

1. Ensure all tests pass: `npm run test`
2. Ensure type checking passes: `npm run type-check`
3. Build successfully: `npm run build`
4. Add a changeset (see below)

## Changesets

This project uses [changesets](https://github.com/changesets/changesets) for versioning and changelogs. Every PR that changes user-facing behavior must include a changeset.

To add a changeset:

```sh
npx changeset
```

You will be prompted to select a semver bump type and write a summary. This creates a markdown file in `.changeset/` that should be committed with your PR.

- **patch** - Bug fixes, dependency updates
- **minor** - New features, non-breaking changes
- **major** - Breaking changes

If your change doesn't affect the published package (e.g. docs, tests, CI), you can skip the changeset.

## Pull Request Process

1. Update documentation if your changes affect the public API.
2. Add tests for any new functionality.
3. Include a changeset for user-facing changes.
4. Ensure all CI checks pass.
5. Write a clear PR description explaining the **what** and **why** of your changes.
6. Link any relevant issues.

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (React version, browser, OS)

## License

By contributing to Teya Blocks React, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
