# Use the Node.js LTS base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy only package files first for optimized caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the React app will run on
EXPOSE 3000

# Command to start the React development server
CMD ["npm", "start"]
