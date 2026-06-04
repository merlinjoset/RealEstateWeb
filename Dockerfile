# --- Stage 1: build the React/Vite bundle --------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# Install deps first (better Docker cache hit-rate when only source changes)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: serve the static files with nginx --------------------------
FROM nginx:1.27-alpine AS runtime

# Drop the default landing config
RUN rm /etc/nginx/conf.d/default.conf

# Place our config as a *template*. The official nginx:alpine image's
# entrypoint runs `envsubst` on every file in /etc/nginx/templates/
# at container start, writing the rendered file to /etc/nginx/conf.d/.
# This is how we substitute the $PORT variable Render injects.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

# Standard nginx entrypoint handles template substitution + starts nginx
CMD ["nginx", "-g", "daemon off;"]
