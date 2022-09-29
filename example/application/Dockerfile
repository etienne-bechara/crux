FROM node:18-alpine as app
WORKDIR /app
EXPOSE 8080

# Copy source code
COPY . /app/

# Install dependencies
RUN npm i -g pnpm
RUN pnpm i --frozen-lockfile

# Build and run application
RUN pnpm build
CMD [ "pnpm", "start" ]
