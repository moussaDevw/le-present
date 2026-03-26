# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development
npm run start:dev        # Watch mode
npm run start:debug      # Debug + watch mode

# Build & Production
npm run build
npm run start:prod

# Code Quality
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting

# Testing
npm run test             # Unit tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # End-to-end tests
npm run test -- --testPathPattern=users  # Run a single test file

# Database
npx prisma migrate dev   # Run migrations
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open Prisma Studio UI
```

## Architecture

This is a **NestJS + GraphQL + Prisma** backend for an insurance management platform ("assurance-present-back").

### API Layer
- **GraphQL only** via Apollo Server (`@nestjs/graphql` + `@nestjs/apollo`)
- Schema is auto-generated to `src/schema.gql` (code-first approach)
- Resolvers use `@Resolver()`, `@Query()`, `@Mutation()` decorators
- GraphQL models defined in `models/` subdirectories as `@ObjectType()` classes

### Module Structure
Each feature follows this pattern:
```
feature/
  feature.module.ts      # Module definition, imports, providers
  feature.resolver.ts    # GraphQL resolver (queries/mutations)
  feature.service.ts     # Business logic, calls PrismaService
  models/
    feature.model.ts     # GraphQL ObjectType (DTO for API responses)
```

### Database
- PostgreSQL via `@prisma/adapter-pg` (connection pooling)
- `PrismaService` (`src/prisma/`) wraps PrismaClient and is registered as a **global module** — inject it anywhere without importing PrismaModule
- `DATABASE_URL` env variable required

### Domain Model (Prisma Schema)
Key entities and their relationships:
- **User** → has Roles (DRIVER, TRANSPORTER, REFERRER, ADMIN), Vehicles, Insurances, Fleets, ReferralCodes
- **Vehicle** → belongs to User, has Insurances, FleetVehicles
- **Insurance** → links User + Vehicle + InsuranceProduct; has status lifecycle (PENDING → PAID → ACTIVE → EXPIRED/CANCELLED), InsuranceDetails (JSON), InsuranceParties, InsuranceDocuments, Payments
- **InsuranceQuote** → pre-insurance quote with raw API request/response storage
- **InsuranceCompany** → external insurer with API endpoint; has InsuranceProducts
- **Payment** → linked to Insurance; supports WAVE, ORANGE, FREE providers; has PaymentEvents audit log
- **Fleet** → groups Vehicles under a User

### Environment
- Port: `PORT` env var, defaults to `3000`
- Database: `DATABASE_URL` (PostgreSQL connection string)
