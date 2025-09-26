# Development Dockerfile for Medusa
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install all dependencies using yarn
RUN corepack enable

RUN yarn install

# Copy source code
COPY . .

# RUN chown -R node:node /app
# USER node
# Expose the port Medusa runs on
EXPOSE 9000

# Start with migrations and then the development server
CMD ["sh", "./start.sh"]