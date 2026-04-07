# Media Harvest

A YouTube video downloader Windows desktop app with a Next.js landing page.

## Project structure

### Applications
- **apps/desktop** — Electron + React + Vite desktop app (Windows only)
- **apps/web** — Next.js 14 landing page + license API

### Shared Packages
- **packages/react-shared** — React ecosystem dependencies (React, React DOM, types, Lucide icons)
- **packages/styling-shared** — Tailwind CSS, UI utilities, Radix components
- **packages/build-shared** — Build tools and TypeScript configuration
- **packages/ui** — Shared UI components
- **packages/types** — Shared TypeScript types
- **packages/license** — Shared license validation logic
- **packages/version** — Centralized version management
- **packages/theme** — Theme configuration

## Getting started

### Prerequisites
- Windows 10/11 (desktop app)
- Node.js 18+ and Bun package manager
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/media-harvest/media-harvest.git
cd media-harvest

# Install all dependencies (shared packages + apps)
bun install

# Download yt-dlp binaries for Windows
# (Automatically handled by build scripts)
```

### Development
```bash
# Run desktop app in development mode
bun dev:desktop

# Run web app in development mode  
bun dev:web

# Type check both applications
bun typecheck
```

## Environment variables

Create `.env.local` in `apps/web/`:
```env
DATABASE_URL=                    # Neon database URL
LEMON_SQUEEZY_API_KEY=         # License validation API key
LEMON_SQUEEZY_STORE_ID=         # Store ID
LEMON_SQUEEZY_WEBHOOK_SECRET=    # Webhook secret
RESEND_API_KEY=                 # Email service API key
```

## Building

### Development builds
```bash
# Build desktop app (current platform)
bun build:desktop

# Build web application
bun build:web

# Build desktop for Windows (production)
bun build:desktop:win
```

### Production builds
```bash
# Windows desktop application
bun run build:win

# Web application
bun run build:web
```

**Note:** This project is Windows-only. Linux and macOS builds are not supported.

## Usage

### Desktop Application
1. Launch the Media Harvest desktop app
2. Paste a YouTube URL or use a deep link (`mediaharvest://`)
3. Choose your preferred format and quality
4. Select download location
5. Click download to start

### Web Application
- Visit the landing page for information and downloads
- Access license management and support

## Protocol Handler

Media Harvest supports deep links for seamless integration:

```
mediaharvest://https://www.youtube.com/watch?v=VIDEO_ID
```

## Architecture

### Monorepo Structure
This project uses a monorepo with shared dependencies to eliminate duplication and ensure consistency:

- **Shared Dependencies:** React, TypeScript, Tailwind CSS, and UI components are centralized
- **Version Management:** Single source of truth for version numbers
- **Build Tools:** Shared TypeScript configuration and build utilities
- **Type Safety:** Centralized type definitions across applications

### Windows-Only Focus
- Optimized specifically for Windows desktop deployment
- Tailored build scripts and configurations
- Windows-specific installer and distribution

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test on Windows platform
5. Submit a pull request

## License

Copyright © 2026 Media Harvest

## Author

Created by [a7mdmo74](https://www.linkedin.com/in/a7mdmo74/)

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for the powerful download engine
- [Electron](https://electronjs.org/) for Windows desktop app framework
- [React](https://reactjs.org/) for the user interface
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the web application
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
