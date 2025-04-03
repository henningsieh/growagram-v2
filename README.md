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

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.1-38bdf8.svg)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-000000.svg)](https://ui.shadcn.com)
[![tRPC](https://img.shields.io/badge/tRPC-11.0.1-2596be.svg)](https://trpc.io)
[![@tanstack/react-query](https://img.shields.io/badge/@tanstack/react--query-5.71.5-ff4154.svg)](https://tanstack.com/query/latest)
[![Auth.js](https://img.shields.io/badge/Auth.js-5.0.0--beta.25-000000.svg)](https://authjs.dev)
[![framer-motion](https://img.shields.io/badge/framer--motion-11.18.2-0055FF.svg)](https://www.framer.com/motion/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192.svg)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.35.3-c5f74f.svg)](https://orm.drizzle.team)
[![next-intl](https://img.shields.io/badge/next--intl-3.26.5-black.svg)](https://next-intl-docs.vercel.app/)
[![MinIO](https://img.shields.io/badge/MinIO-S3--compatible-c72c48.svg)](https://min.io)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ed.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### Frontend

- ⚛️ React 19 (Server Components)
- 📱 Next.js 15 (App Router)
- 🎨 Tailwind CSS v4 + shadcn/ui
- 🌐 next-intl for i18n

### Backend

- 🔐 Auth.js (NextAuth) for authentication
- 🔄 tRPC for type-safe APIs
- 📊 PostgreSQL with Drizzle ORM
- 🖼️ S3-compatible MinIO Instance in Hetzner Cloud

### DevOps

- 🐳 Docker containerization
- 🔄 CI/CD with GitHub Actions
- 📦 Self-hosted in Hetzner Cloud via Coolify

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
- ✅ Public timeline Posts (reference Grows, Plants or Fotos)
- 🔨 Features for Admin role (delete crap, ban users)
- 🔨 Activity feeds/timelines for Users, Grows and Plants
- 🔨 Follow system with Following timeline
- ⏳ User profile enhancements

#### Image Management and Storage Infrastructure

- ✅ Migrated from Cloudinary to self-hosted MinIO Instance
- ✅ Secure photo storage in Hetzner Cloud
- ✅ S3-compatible API for scalable object storage
- ✅ Bulk upload functionality
- ✅ EXIF data extraction
- ✅ Many-to-Many relations: Grows <-> Plants <-> Photos

### Phase 2: Social Features

#### Community Features

- ✅ Comments system
- ✅ Like functionality
- ⏳ User mentions in posts/comments
- ⏳ Advanced search features
- ✅ Notifications
- ⏳ Private messaging

### Phase 3: Advanced Features

#### Monetization & Analytics

- ⏳ Sponsoring opportunities for breeders and manufacturers
- ⏳ AI conversations with your plants :)
- 🔨 Analytics dashboard
- ⏳ Premium Features

#### Technical Improvements

- ⏳ Unit test coverage (≥80%)
- ⏳ Performance optimization
- ⏳ API documentation
- ⏳ Error boundaries
