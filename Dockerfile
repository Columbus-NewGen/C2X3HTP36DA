FROM node:20-alpine AS frontend-builder

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /src
RUN pnpm config set node-linker hoisted
ENV CI=true

COPY app/FRONTEND_WEBAPP/ ./
RUN rm -rf node_modules
RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm vite build

FROM golang:1.24.2-alpine AS backend-builder

WORKDIR /src
COPY app/BACKEND/go.mod app/BACKEND/go.sum ./
RUN go mod download
COPY app/BACKEND/ ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /out/backend ./main.go
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /out/migrate ./cmd/migrate
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /out/seed ./cmd/seed

FROM postgres:18.2-alpine

RUN apk add --no-cache nginx supervisor curl

RUN mkdir -p /run/nginx /var/log/supervisor /usr/share/nginx/html \
  && mkdir -p /app/logs \
  && printf '2026-03-29 admin opened app.log\n' > /app/logs/app.log \
  && rm -f /etc/nginx/http.d/default.conf

COPY --from=frontend-builder /src/dist /usr/share/nginx/html
COPY app/FRONTEND_WEBAPP/.env /usr/share/nginx/html/.env
COPY --from=frontend-builder /src/nginx.conf /etc/nginx/http.d/default.conf

COPY --from=backend-builder /out/backend /usr/local/bin/backend
COPY --from=backend-builder /out/migrate /usr/local/bin/migrate
COPY --from=backend-builder /out/seed /usr/local/bin/seed
COPY app/BACKEND/migrations /app/migrations

COPY app/entrypoint.sh /entrypoint.sh
COPY app/supervisord.conf /etc/supervisord.conf
RUN sed -i 's/\r$//' /entrypoint.sh /etc/supervisord.conf \
  && chmod +x /entrypoint.sh

EXPOSE 4000 8080

CMD ["/entrypoint.sh"]
