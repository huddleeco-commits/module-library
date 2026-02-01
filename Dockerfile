# Dockerfile for the Blink Monorepo
# This file is located at the project root (module-library).

# Use a specific Node.js version
FROM node:18-alpine

# Set the working directory for the entire application
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json from the UI service
COPY module-assembler-ui/package*.json ./module-assembler-ui/

# Set the working directory to the UI service to run npm install
WORKDIR /usr/src/app/module-assembler-ui

# Install dependencies for the UI service
RUN npm install

# Set the working directory back to the root
WORKDIR /usr/src/app

# Copy the rest of the application source code
COPY . .

# Set the final working directory for the running container
WORKDIR /usr/src/app/module-assembler-ui

# Expose the server port
EXPOSE 3001

# The default command to run the application
CMD [ "npm", "start" ]