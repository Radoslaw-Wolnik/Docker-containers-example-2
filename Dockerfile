# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create upload directory
RUN mkdir -p /app/public/uploads

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]