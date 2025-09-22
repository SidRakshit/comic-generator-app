# ---- Builder Stage ----
# This stage installs all dependencies (including dev) and builds the app
FROM node:20-slim AS builder
WORKDIR /app

# Install OpenSSL, which Prisma needs
RUN apt-get update -y && apt-get install -y openssl

# Copy package files and install everything
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Generate the Prisma client and build the TypeScript code
RUN npx prisma generate
RUN npm run build

# ---- Runner Stage ----
# This stage creates the final, lightweight image with only what's needed to run
FROM node:20-slim
WORKDIR /app

# Install OpenSSL here as well
RUN apt-get update -y && apt-get install -y openssl

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application, Prisma schema, and generated client from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/index.js"]