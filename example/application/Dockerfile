FROM node:18-alpine as app
WORKDIR /app
EXPOSE 8080

# Copy source code
COPY . /app/

# Install dependencies
RUN npm i -g pnpm
RUN pnpm i --frozen-lockfile

# Build application
RUN pnpm build

# Copy distributable files to root
RUN cp -a /app/dist/. /app/
RUN rm -rf /app/dist

# Run application
CMD [ "pnpm", "start" ]
