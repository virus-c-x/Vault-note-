# Contributing to Vault Note

Thank you for your interest in contributing to Vault Note!

## Guiding Principles

1. **Zero-Knowledge First**: Never introduce network dependencies, remote logging, or unencrypted storage mechanisms.
2. **Minimal & Lean**: Keep dependencies lightweight and lean. Rely on native Web standards (Web Crypto, IndexedDB, Service Workers) whenever possible.
3. **Type Safety**: Maintain 100% strict TypeScript types and zero runtime exceptions.

## Development Workflow

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Check linting and build before submitting a PR:
   ```bash
   npm run build
   ```

## Pull Request Guidelines

- Ensure your code follows the established formatting and naming conventions.
- Keep commits clear and descriptive.
- Add test coverage or verification notes for any cryptographic or data serialization changes.
