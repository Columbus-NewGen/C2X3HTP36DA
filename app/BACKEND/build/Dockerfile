# ---------- BUILD STAGE ----------
  ARG GO_VERSION=1.24.2
  FROM golang:${GO_VERSION}-alpine AS builder
  
  WORKDIR /app
  RUN apk add --no-cache git ca-certificates && update-ca-certificates
  
  # copy module files
  COPY go.mod go.sum ./
  # ใช้ -mod=readonly เพื่อกัน go แก้ go.mod เองโดยไม่ตั้งใจ
  RUN go mod download
  
  # copy source code
  COPY . .
  
  # build binary (static)
  RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
      go build -trimpath -ldflags="-s -w" -o server ./main.go
  
  # ---------- RUN STAGE ----------
  FROM alpine:3.20
  RUN apk --no-cache add ca-certificates wget && update-ca-certificates
  WORKDIR /app
  
  # copy binary
  COPY --from=builder /app/server /app/server
  
  # expose port
  ARG BACKEND_PORT=8080
  EXPOSE ${BACKEND_PORT}
  
  # healthcheck
  HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD sh -c 'wget --no-verbose --tries=1 --spider http://localhost:${BACKEND_PORT:-8080}/healthz || exit 1'
  
  # run as non-root user
  RUN adduser -D -g '' appuser && chown -R appuser:appuser /app
  USER appuser
  
  ENTRYPOINT ["/app/server"]
    