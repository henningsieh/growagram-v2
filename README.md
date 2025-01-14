# GrowAGram 🪴

GrowAGram is a modern social media platform for plant enthusiasts, focusing on documenting and sharing plant growing journeys. It enables users to track their plants' progress, share experiences, and connect with other growers.

## Project Status

🚧 **Currently in Development** 🚧

The project is in active development, with core features being implemented. While the basic infrastructure is in place, many features are still under construction.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Core**: React 19 (Server Actions & Server Components)
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Image Storage**: Cloudinary
- **API**: tRPC
- **Internationalization**: next-intl

## Getting Started

1. Clone the repository:
```
git clone https://github.com/your-username/growagram.git
cd growagram
```

2. Install dependencies:
```
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the necessary environment variables. Refer to `.env.example` for the required variables.

4. Run the development server:
```
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction) - learn about authentication in Next.js.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - learn about using Drizzle ORM with PostgreSQL.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about styling with Tailwind CSS.
- [shadcn/ui Documentation](https://ui.shadcn.dev/docs) - learn about using shadcn/ui components.
- [Cloudinary Documentation](https://cloudinary.com/documentation) - learn about image storage and management.
- [tRPC Documentation](https://trpc.io/docs) - learn about building APIs with tRPC.
- [next-intl Documentation](https://next-intl-docs.vercel.app) - learn about internationalization in Next.js.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Developer TODOs

### Authentication & User Management
- [x] Social authentication implementation
- [ ] User profile completeness indicator
- [ ] Email verification system
- [ ] Password reset flow
- [ ] User roles and permissions

### Core Features
- [x] Basic CRUD for grows
- [x] Plant management system
- [x] Growing phase tracking
- [ ] Automated timeline generation
- [ ] Environmental data logging
- [ ] Strain database integration

### Image Management
- [x] Cloudinary integration
- [x] Bulk upload functionality
- [ ] Image optimization pipeline
- [x] EXIF data extraction
- [ ] Auto-tagging system

### Social Features
- [x] Like system
- [x] Comments
- [ ] Follow system
- [ ] User mentions in comments
- [ ] Activity feed
- [ ] Notifications

### Technical Improvements
- [ ] Unit test coverage (>80%)
- [ ] E2E tests with Playwright
- [ ] Performance optimization
- [ ] API documentation
- [ ] Error boundary implementation
- [ ] Progressive Web App (PWA) support

### DevOps
- [x] CI/CD pipeline setup
- [x] Docker containerization
- [ ] Automated backups
- [ ] Monitoring & alerting
- [ ] Load testing
- [ ] Security audit
