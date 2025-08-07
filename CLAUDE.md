# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check Prettier formatting
- `pnpm check:all` - Run both format check and lint

## Architecture Overview

This is Alexis Wei's personal portfolio website built with Next.js 15+ using the App Router architecture.

### Key Technologies

- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS v4 with custom design system
- **Animation**: GSAP, Motion (Framer Motion), React Three Fiber
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **UI Components**: Radix UI primitives with custom styling
- **Analytics**: PostHog
- **Icons**: Unplugin Icons with auto-import

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components organized by feature
  - `archive/` - Archive page components with 3D Saturn model
  - `bts/` - Behind-the-scenes experimental components and animations
  - `home/` - Home page components
  - `portfolio/` - Portfolio showcase components
  - `ui/` - Base UI components (buttons, accordions, sliders)
- `src/lib/` - Utility functions and shared logic
- `public/` - Static assets including 3D models, animations, and media
- `portfolio/` - Portfolio content and data

### Design System

- **Colors**: Custom royal blue palette (`royal`, `royal-medium`, `royal-light`)
- **Typography**: Plus Jakarta Sans (primary), Libre Baskerville (serif), IBM Plex Mono (monospace)
- **Animations**: Custom blur-fade-in animations and GSAP-powered interactions

### Key Features

- **Dynamic Routing**: Uses `[slug]` pages for flexible content routing
- **3D Integration**: Saturn model and various 3D experiments in archive section
- **Animation Experiments**: Behind-the-scenes section with SVG morphing, shader animations
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities

### Build Configuration

- **Icons**: Auto-imported with unplugin-icons (prefix: `Icon`, JSX format)
- **Auto-imports**: Configured for icon resolution with TypeScript definitions
- **Image Optimization**: Next.js Image component with Cloudflare R2 remote patterns
- **Webpack**: Custom fallback configuration for Node.js modules
- **Styling**: Tailwind CSS v4 configured via CSS @theme directive in globals.css

### Content Management

- Portfolio projects and BTS experiments are component-based
- Static assets organized by feature in public directory
- Typography and spacing follow consistent design tokens
