# Stage 1: Build 
FROM node:20-alpine AS builder 

# Set working directory inside the container 
WORKDIR /app

# Copy package files first 
COPY package*.json ./

# Install all dependencies  
RUN npm ci 

# Copy the rest of the source code 
COPY . .

# Compile Typescript to Javascript
RUN npm run build 

# Stage 2: Production image
FROM node:20-alpine AS production 

WORKDIR /app

# Copy package files
COPY package*.json ./

#Install production dependencies only 
RUN npm ci --only=production 

#Copy compiled Javascript from builder stage
COPY --from=builder /app/dist ./dist

#Ecpose the port the app runs on
EXPOSE 3000

# Start the compiled app
CMD ["node", "dist/server.js"]

