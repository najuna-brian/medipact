FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code (includes adapter directory)
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Start the application
CMD ["npm", "start"]

