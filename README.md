# GrowAGram 🪴 Track Your Grow 📜

[![Version](https://img.shields.io/badge/Version-0.9.0--beta.1-blue?style=for-the-badge&logo=npm&logoColor=white)](https://github.com/henningsieh/growagram-v2)

GrowAGram is a modern social platform for plant enthusiasts to document and share their growing journeys. Built with clean architecture principles and modern tech stack, it provides a scalable foundation for the growing community.

## 🌱 Key Features

- 🖋️ **Grow Journal System** - Detailed tracking with timeline views
- 🌿 **Plant Database** - Comprehensive plant information management
- 👥 **Social Features** - Follow, like, comment, and notification systems
- 📊 **Analytics Dashboard** - Growing statistics and insights
- 🔔 **Real-time Notifications** - Factory-based notification system
- 🌍 **Internationalization** - Multi-language support (German/English)
- 📱 **Mobile-First Design** - Responsive across all devices
- 🔒 **Security** - Comprehensive authentication and authorization

## 🛠️ Tech Stack

<!-- Static badges for private repository - manually maintained -->

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?style=for-the-badge&logo=typescript&logoColor=white)](https://trpc.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-Latest-green?style=for-the-badge&logo=postgresql&logoColor=white)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-5-orange?style=for-the-badge&logo=auth0&logoColor=white)](https://next-auth.js.org/)

<!-- Framework and library badges -->

[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-ff4154?style=for-the-badge&logo=react&logoColor=white)](https://tanstack.com/query/latest)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![next-intl](https://img.shields.io/badge/next--intl-3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://next-intl-docs.vercel.app/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Latest-black?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![MinIO](https://img.shields.io/badge/MinIO-S3%20Compatible-c72c48?style=for-the-badge&logo=minio&logoColor=white)](https://min.io)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

### Frontend

- ⚛️ React 19
- 📱 Next.js 15
- 🎨 Tailwind CSS v4 + shadcn/ui
- 🌐 next-intl for i18n

### Backend

- 🔐 Auth.js (NextAuth) for authentication
- 🔄 tRPC for type-safe APIs
- 📊 PostgreSQL with Drizzle ORM
- 🖼️ S3-compatible MinIO Instance in Hetzner Cloud

## 🚀 Deployment & DevOps

- 🐳 **Docker** containerization
- 🔄 **CI/CD** via [Coolify](https://coolify.io/) for automated deployment
- 📦 **Self-hosted** on [Hetzner Cloud](https://www.hetzner.com/cloud)

**Beta instance:** [beta.growagram.com](https://beta.growagram.com)

## 📊 Project Status

⚧️ **Active Development** | Phase 1 Complete, Phase 2 in Progress

**Recent Achievements:**

- ✅ **Notifications System Refactored** - Replaced monolithic code with clean factory-based architecture
- ✅ **Badge System Improved** - Automated GitHub integration for real-time dependency tracking
- ✅ **Image Infrastructure** - Migrated to self-hosted MinIO for better performance and control

## 🖋️ Roadmap and Tasks

### Legend

- ⏳ Planned
- 🔨 In Progress
- ✅ Completed

### Phase 1: Core Platform (90% Complete)

#### Core Features

- ✅ User authentication
- ✅ Basic CRUD operations
- ✅ Image management
- ✅ Public timeline Posts (reference Grows, Plants or Fotos)
- ✅ User banning system with Edge-compatible implementation
- ✅ **Factory-based notifications system** - Clean, extensible architecture
- 🔨 Additional features for Admin role (content moderation)
- 🔨 Activity feeds/timelines for Users, Grows and Plants
- 🔨 Follow system with Following timeline
- ✅ User profile enhancements

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
- ✅ **Notifications system** - Factory-based architecture with real-time updates
- ⏳ User mentions in posts/comments
- ⏳ Advanced search features
- ⏳ Private messaging
- ⏳ Chat rooms

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
