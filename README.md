# BsortoPhotos

This project was built with [Lovable](https://lovable.dev).

## Development

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/OHarelOLeviO/BsortoPhotos
cd BsortoPhotos

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

## Deployment to GitHub Pages

### Initial Setup

1. Ensure your repository settings have GitHub Pages enabled:
   - Go to your repository → Settings → Pages
   - Set the source to "GitHub Actions" or "Deploy from a branch" (main branch, `/dist` folder)

2. Configure your GitHub Pages URL in `package.json` and `vite.config.ts`:
   - The base path is already set to `/BsortoPhotos/` in `vite.config.ts`
   - Adjust this if your repository name is different

### Deploy

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

Or manually:
```bash
npm run build
npm run gh-pages -d dist
```

The site will be live at: `https://OHarelOLeviO.github.io/BsortoPhotos`

## CI/CD Deployment (Recommended)

Create `.github/workflows/deploy.yml` for automatic deployment on every push:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Built with

- TanStack Start
- TypeScript
- React 19
- Tailwind CSS
- Radix UI Components
- TanStack Router
- TanStack Query
- Supabase

## Features

- Modern React application with file-based routing
- Responsive design with Tailwind CSS
- RTL support (Hebrew)
- Component library (Radix UI)
- Form handling with React Hook Form
- Data fetching with TanStack Query
- Image signing for secure URLs

## Troubleshooting

### Build issues
- Clear `node_modules` and `dist`: `rm -rf node_modules dist && npm install`
- Check Node.js version: `node --version` (should be 18+)

### GitHub Pages not updating
- Verify the `base` path in `vite.config.ts` matches your repository name
- Check GitHub Actions tab for deployment errors
- Clear browser cache or use incognito mode

### Local development issues
- Make sure port 5173 is not in use
- Try: `npm run dev -- --port 3000`

## Development

Prefer working in Lovable? You can continue editing in the [Lovable editor](https://lovable.dev) and push changes back to this repository. Any changes made here are automatically synced back to Lovable.

```sh
# After making changes in Lovable
git pull
npm install  # if dependencies changed
npm run dev
```

## License

Private project
