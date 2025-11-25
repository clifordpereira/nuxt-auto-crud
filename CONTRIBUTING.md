# Contributing to Nuxt Ghost API

Thank you for your interest in contributing to Nuxt Ghost API! 🎉

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/clifordpereira/nuxt-ghost-api.git
   cd nuxt-ghost-api
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Generate type stubs:
   ```bash
   bun run dev:prepare
   ```

## Development Workflow

### Running the Playground

The playground is the best way to test your changes:

```bash
bun run dev
```

This will start the playground at `http://localhost:3000`

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the `src/` directory

3. Test your changes using the playground

4. Run linting:
   ```bash
   bun run lint
   ```

5. Run tests:
   ```bash
   bun run test
   ```

### Project Structure

```
nuxt-ghost-api/
├── src/
│   ├── module.ts                    # Main module definition
│   └── runtime/
│       └── server/
│           ├── api/                 # CRUD API handlers
│           │   └── [model]/
│           │       ├── index.get.ts    # List all
│           │       ├── index.post.ts   # Create
│           │       ├── [id].get.ts     # Get by ID
│           │       ├── [id].patch.ts   # Update
│           │       └── [id].delete.ts  # Delete
│           └── utils/
│               └── modelMapper.ts   # Model detection & mapping
├── playground/                      # Demo application
│   ├── server/
│   │   └── database/
│   │       └── schema.ts           # Sample schema
│   ├── app.vue                     # Demo UI
│   └── nuxt.config.ts              # Playground config
└── test/                           # Tests
```

### Testing

- **Unit Tests**: Run `bun run test`
- **Type Tests**: Run `bun run test:types`
- **Manual Testing**: Use the playground

### Code Style

- We use ESLint for code quality
- Run `bun run lint` before committing
- Follow the existing code style

## Submitting Changes

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `chore:` - Maintenance tasks
   - `refactor:` - Code refactoring
   - `test:` - Test updates

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Update the CHANGELOG.md if applicable

## Reporting Issues

When reporting issues, please include:

- Nuxt version
- Node/Bun version
- Steps to reproduce
- Expected vs actual behavior
- Any error messages or logs

## Questions?

Feel free to open an issue for questions or join discussions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
