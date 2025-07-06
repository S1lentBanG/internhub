FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/profile-pics

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 