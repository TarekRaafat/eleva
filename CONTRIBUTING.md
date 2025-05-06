# Contributing to Eleva

Thank you for your interest in contributing to Eleva! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the Issues section
2. If not, create a new issue with a clear title and description
3. Include steps to reproduce the bug
4. Add any relevant screenshots or error messages
5. Specify your environment (browser, OS, etc.)

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with a clear title and description
3. Explain why this feature would be useful
4. Provide any relevant examples or use cases

### Pull Requests

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Update documentation if necessary
7. Submit a pull request

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/TarekRaafat/eleva.git
   cd eleva
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Coding Standards

- Follow the existing code style
- Use meaningful variable and function names
- Write clear comments for complex logic
- Keep functions small and focused
- Write tests for new features
- Update documentation as needed

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for maintenance tasks

Example:
```
feat: add support for custom middleware
```

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting a PR
- Update tests when modifying existing features
- Aim for good test coverage

### Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation
- Include examples for new features

## Review Process

1. All pull requests will be reviewed by maintainers
2. Feedback will be provided if changes are needed
3. Once approved, your PR will be merged

## Getting Help

- Check the [documentation](docs/index.md)
- Join our [Discord community](https://discord.gg/Dg7cMKpvyZ)
- Open an issue for questions

## License

By contributing to Eleva, you agree that your contributions will be licensed under the project's MIT License.
