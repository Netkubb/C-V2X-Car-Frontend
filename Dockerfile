# Use official Node.js LTS (Long Term Support) image as base
FROM node:20.6.1-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 (React)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]