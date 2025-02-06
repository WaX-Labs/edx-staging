# Stage 1: Build

FROM node:20-alpine AS builder



# Set working directory

WORKDIR /app



# Copy package files

COPY package.json package-lock.json ./

COPY prisma ./prisma/



# Install dependencies

RUN npm install --frozen-lockfile



# Copy the rest of the application code

COPY . .



# Generate Prisma client

RUN npx prisma generate



# Build the application

RUN npm run build



# Stage 2: Production

FROM node:20-alpine



# Set working directory

WORKDIR /app



# Copy package files

COPY package.json package-lock.json ./

COPY prisma ./prisma/



# Install only production dependencies

RUN npm install --frozen-lockfile



# Copy built assets from builder stage

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules/.prisma/client  ./node_modules/.prisma/client



# Generate Prisma client again to ensure compatibility

RUN npx prisma generate



# Set environment variables

ENV APP_NAME="@eudox/dev" \

    APP_ENV="staging" \

    HTTP_ENABLE=true \

    HTTP_HOST="0.0.0.0" \

    HTTP_PORT=9001 \

    HTTP_VERSIONING_ENABLE=true \

    HTTP_VERSION=1 \

    ACCESS_TOKEN_SECRET_KEY="testme" \

    ACCESS_TOKEN_EXPIRED="1d" \

    REFRESH_TOKEN_SECRET_KEY="testme" \

    REFRESH_TOKEN_EXPIRED="7d" \

    RABBITMQ_URL="amqp://admin:master123@localhost:5672" \

    RABBITMQ_ICD10_QUEUE="icd10_queue" \

    DEEPSEEK_API_KEY="sk-fc628631dc2446d982b47ca613459162" \

    SOLANA_RPC_URL=https://api.devnet.solana.com \

    WALLET_PRIVATE_KEY="uAHa4bWbarh7xBKDAVQ7Cr5UNWra6ehqxgdkCrvBjyDY4ES9JMQNmMXX2HzEJds7Y7Ei6V9iemVhPJ36JyQ6CUt" \

    EUDOX_TOKEN_MINT="HqDBiQdkhb6PT4eWQFhri6dtXcwwmBhAfvKTfdpKvM5j" \

    DATABASE_URL="postgresql://eudoxdb:Master123@eudoxdb-staging.postgres.database.azure.com:5432/postgres?sslmode=require" \

    NODE_ENV=production



# Expose the configured port

EXPOSE ${HTTP_PORT}



# Add a healthcheck (optional)

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \

  CMD wget --quiet --tries=1 --spider http://localhost:${HTTP_PORT}/health || exit 1



# Run the application

CMD ["npm", "run", "start:dev"]
