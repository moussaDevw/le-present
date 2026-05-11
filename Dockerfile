# Stage 1: Build stage
FROM node:20 AS builder

WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies like @nestjs/cli)
RUN npm install

# Generate Prisma client (needed for building the app)
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-alpine AS runner

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies
RUN npm install --only=production

# Copy the build artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Generate Prisma client for the production environment
RUN npx prisma generate

# Set production environment
ENV NODE_ENV=production

# The port the app listens on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
