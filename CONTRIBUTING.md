# Contributing to Petit Stay

Thank you for your interest in contributing to Petit Stay.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/petit-stay.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Start development: `npm run dev`

## Development

- The app runs in **demo mode** by default (no Firebase config needed)
- Run tests: `npm run test`
- Type check: `npx tsc --noEmit`
- Lint: `npm run lint`

## Commit Conventions

Use conventional commit messages:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, no code change
- `refactor:` code restructuring
- `test:` adding or updating tests
- `chore:` build, tooling, or dependency updates

Example: `feat(hotel): add sitter availability calendar`

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run `npm run build` to verify the build passes with zero errors
3. Run `npm run test` to ensure all tests pass
4. Open a PR against `main` with a clear description of changes
5. Link any related issues

## Code Style

- Functional components with hooks (no class components)
- Named exports for hooks, default exports for pages
- CSS Modules for styling (see `src/styles/`)
- All user-facing text must use i18n (`useTranslation` hook)
- Use existing common components from `src/components/common/`

## Important Notes

- Do not remove demo mode code
- Do not change the routing structure in `App.tsx`
- Do not install new CSS frameworks
- Only add optional props to existing component APIs
