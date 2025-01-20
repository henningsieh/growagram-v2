# GrowAGram 🪴 Track Your Grow 📜

GrowAGram is a modern social platform for plant enthusiasts to document and share their growing journeys. Users can track plant progress, share experiences, and connect with like-minded growers.

## 🌱 Key Features

- 🖋️ Detailed grow diary tracking
- 🔗 Plant-to-grow connections
- 👥 Social community features
- 📊 Growing statistics and analytics
- 🌍 Multi-language support
- 📱 Responsive design

## 🛠️ Tech Stack

[![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8.svg)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-000000.svg)](https://ui.shadcn.com)
[![tRPC](https://img.shields.io/badge/tRPC-11.0.0--rc.700-2596be.svg)](https://trpc.io)
[![@tanstack/react-query](https://img.shields.io/badge/@tanstack/react--query-5.64.2-ff4154.svg)](https://tanstack.com/query/latest)
[![Auth.js](https://img.shields.io/badge/Auth.js-5.0.0--beta.25-000000.svg)](https://authjs.dev)
[![framer-motion](https://img.shields.io/badge/framer--motion-11.18.0-0055FF.svg)](https://www.framer.com/motion/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192.svg)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.35.3-c5f74f.svg)](https://orm.drizzle.team)
[![next-intl](https://img.shields.io/badge/next--intl-3.26.3-black.svg)](https://next-intl-docs.vercel.app/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-2.5.1-4285f4.svg)](https://cloudinary.com)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ed.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### Frontend

- ⚛️ React 19 (Server Components)
- 📱 Next.js 15 (App Router)
- 🎨 Tailwind CSS + shadcn/ui
- 🌐 next-intl for i18n

### Backend

- 🔐 Auth.js (NextAuth) for authentication
- 🔄 tRPC for type-safe APIs
- 📊 PostgreSQL with Drizzle ORM
- 🖼️ Cloudinary for image storage

### DevOps

- 🐳 Docker containerization
- 🔄 CI/CD with GitHub Actions
- 📦 Self-hosted on Hetzner Cloud via Coolify

## 🚀 Deployment

This application is self-hosted on [Hetzner Cloud](https://www.hetzner.com/cloud) using [Coolify](https://coolify.io/). Deployment is automated with Coolify’s Git integration and container orchestration.

**Beta instance:** [beta.growagram.com](https://beta.growagram.com)

## 📊 Project Status

⚧️ **Active Development** | Phase 1 of 3

## 🖋️ Roadmap and Tasks

### Legend

- ⏳ Planned
- 🔨 In Progress
- ✅ Completed

### Phase 1: Core Platform (70% Complete)

#### Core Features

- ✅ User authentication
- ✅ Basic CRUD operations
- ✅ Image management
- 🔨 Enhanced social features
- 🔨 User profile enhancements
- 🔨 Activity feed for Users, Grows, Plants and Photos
- 🔨 Follow system with timeline
- ✅ Public timeline Posts (reference Grows, Plants or Photos)

#### Image Management

- ✅ Cloudinary integration
- ✅ Bulk upload functionality
- ✅ EXIF data extraction
- ✅ Many-to-Many relations: Grows <-> Plants <-> Photos

#### Technical Improvements

- ⏳ Unit test coverage (≥80%)
- ⏳ Performance optimization
- ⏳ API documentation
- ⏳ Error boundaries

### Phase 2: Social Features

#### Community Features

- ✅ Comments system
- ✅ Like functionality
- ⏳ User mentions in posts/comments
- ⏳ Advanced search features
- ⏳ Notifications
- ⏳ Private messaging

### Phase 3: Advanced Features

#### Monetization & Analytics

- ⏳ Sponsoring opportunities for breeders and manufacturers
- ⏳ AI plant recognition
- ⏳ Analytics dashboard
- ⏳ Premium Features
