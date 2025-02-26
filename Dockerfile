FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Expose API port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
