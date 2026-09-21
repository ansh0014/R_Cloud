# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cached when only src changes)
COPY package*.json ./
RUN npm ci

# Declare build-time env vars — passed via docker-compose or docker build --build-arg
# All VITE_* vars are baked into the static bundle at build time by Vite.
ARG VITE_API_GATEWAY_URL=http://localhost:8080
ARG VITE_WS_URL=ws://localhost:8080/ws
ARG VITE_AUTH_URL=http://localhost:8081
ARG VITE_AI_AGENT_URL=http://localhost:8087
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_APP_NAME="R Agent Cloud"
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENV=production

ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_AI_AGENT_URL=$VITE_AI_AGENT_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_ENV=$VITE_ENV

COPY . .
RUN npm run build

# ── Stage 2: Serve ─────────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config: redirect all routes to index.html for React Router SPA
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
