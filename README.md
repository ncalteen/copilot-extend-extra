# Copilot Extend Extra

A web-based game built with Next.js, React, and TypeScript, showcasing modern
web development practices and responsive design.

## Play the Game

**[Play Game Online](https://ncalteen.github.io/copilot-extend-extra/)**

### Prerequisites

- Node.js 24+ (see `.node-version`)
- `npm` or similar package manager

### Development Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ncalteen/copilot-extend-extra.git
   cd copilot-extend-extra
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**: Navigate to
   [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build static export for deployment
npm run build

# The built files will be in the `out/` directory
```

### Testing

```bash
# Install test dependencies (Playwright browsers)
npx playwright install

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed
```

## 🚀 Deployment

### GitHub Pages (Automatic)

The game is automatically deployed to GitHub Pages when changes are merged to
the `main` branch.

### Manual Deployment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Deploy the `out/` directory** to any static hosting service

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the code style**: Run `npm run lint` and `npm run format:check`
4. **Add tests**: Ensure your changes are covered by tests
5. **Update documentation**: Update README if needed
6. **Submit a pull request**: With a clear description of changes

### Development Guidelines

- Follow TypeScript strict mode
- Use provided ESLint and Prettier configurations
- Write comprehensive tests for new features
- Ensure accessibility compliance
- Test on multiple browsers and devices
