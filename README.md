# RE:ACT — Chain Reaction Arcade

An original browser arcade game inspired by the positioning and self-detonation
mechanics of [Every Extend](https://en.wikipedia.org/wiki/Every_Extend), built
with Next.js, React, TypeScript, and HTML canvas. All visuals and synthesized
audio are generated locally; no original game assets are used.

## How to Play

You start with **90 seconds and five stock**. Move into a cluster of enemies,
then detonate yourself. Each destroyed enemy creates another blast, propagating
a chain reaction. You return when all the explosions finish.

| Action                | Controls                                                  |
| --------------------- | --------------------------------------------------------- |
| Move                  | WASD, arrow keys, or mouse; drag on touch screens         |
| Charge a larger blast | Hold Space, a primary mouse click, or the Detonate button |
| Detonate              | Release the charge control                                |
| Pause / resume        | P, Escape, or the pause button                            |
| Restart               | Reset, then Start Reaction; Try Again after a run         |

Each detonation costs one stock. Chain hits award 10, 20, 40, and so on, capped
at 2,560 points per hit. Earn an extra stock at 15,000 points; later extend
thresholds increase. Your final chain can earn you back into the game even if
you detonate your last stock. Collisions cost one stock and five seconds, with a
brief protective shield afterward. The run ends when time expires, or when there
is no stock and the last chain has finished.

Special enemies leave collectible drops: green bonuses start at 800 points and
increase by 800 for each collected without detonating or colliding; purple
quickens increase enemy speed and density (up to five levels); yellow time
extends add ten seconds. Pink pulse enemies create a 1.8× wider blast instead of
a drop. Collect drops by moving near them after a chain ends, before they expire
in fourteen seconds.

**Standard** offers a measured pace; **Overdrive** spawns faster, more frequent
waves. Difficulty can be changed before a run. High scores persist in browser
storage. Audio is optional and starts only when enabled. Leaving the window
automatically pauses play. The game works entirely client-side and exports
statically for GitHub Pages.

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

# Use a different port if another project is running on port 3000
PLAYWRIGHT_PORT=3127 npm test
```

## 🚀 Deployment

### GitHub Pages (Automatic)

One-time repository setup:

1. Open **Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions**.
3. Ensure GitHub Actions is enabled for the repository and that the
   `github-pages` environment permits deployments from `main`. If the
   environment requires approval, approve the pending deployment when prompted.

The **Continuous Delivery** workflow
(`.github/workflows/continuous-delivery.yml`) runs on every push to `main`,
including merged pull requests and Dependabot updates. It installs the locked
dependencies using the Node.js version in `.node-version`, builds the static
site, uploads `out/` as a Pages artifact, and deploys it to the `github-pages`
environment. No personal access token or additional repository secret is needed.

To redeploy manually, open **Actions → Continuous Delivery → Run workflow** and
select `main`. Manual runs from other branches are skipped. The deployment job
provides the published site URL:

**<https://ncalteen.github.io/copilot-extend-extra/>**

`next.config.ts` enables static export, unoptimized images, and trailing
slashes. Production asset URLs include `/copilot-extend-extra`, configured in
`src/lib/config.ts`; local development uses `/`. If the repository is renamed or
moved to a custom domain, update that base path and the site URLs accordingly.
Next.js's internal build files and cache stay in `.next/`; only `out/` is
published. `public/.nojekyll` is included in the export to preserve `_next/`
assets if the export is also published through branch-based Pages hosting.

### Manual Deployment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Deploy the contents of `out/`**, including `.nojekyll`, to a static host
   serving the `/copilot-extend-extra/` path. For a domain-root deployment,
   change the production base path in `src/lib/config.ts` to an empty string
   before building.

GitHub Pages does not run a Node.js server; do not deploy `.next/` or use
`npm start` to serve the exported site.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the code style**: Run `npm run lint` and `npm run format:check`
4. **Add tests**: Ensure your changes are covered by tests
5. **Update documentation**: Update README if needed
6. **Submit a pull request**: With a clear description of changes

### Development Guidelines

- Next.js 16 uses Turbopack by default for development and production builds.
- Keep `next` and `eslint-config-next` on the same version, and update React and
  React DOM together with their TypeScript definitions.
- ESLint uses the native Next.js flat configs plus Prettier; run `npm run lint`
  separately because Next.js 16 does not run linting during builds.
- Existing game, theme, and zoom contexts retain a scoped
  `react-hooks/set-state-in-effect` exception for their state synchronization.
- Automatic Next.js agent-rule generation is disabled to preserve the
  repository's maintained instructions and avoid generated formatting changes.
- Follow TypeScript strict mode
- Use provided ESLint and Prettier configurations
- Write comprehensive tests for new features
- Ensure accessibility compliance
- Test on multiple browsers and devices
