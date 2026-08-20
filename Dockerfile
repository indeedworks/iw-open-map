FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/core/package.json packages/core/package.json
COPY packages/vue2/package.json packages/vue2/package.json
COPY packages/vue3/package.json packages/vue3/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY apps/vanilla-demo/package.json apps/vanilla-demo/package.json
COPY apps/vue2-demo/package.json apps/vue2-demo/package.json
COPY apps/vue3-demo/package.json apps/vue3-demo/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_TIANDITU_TOKEN
ENV VITE_TIANDITU_TOKEN=${VITE_TIANDITU_TOKEN}
RUN pnpm build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/docs/.vitepress/dist /usr/share/nginx/html
COPY --from=builder /app/apps/vanilla-demo/dist /usr/share/nginx/html/demos/vanilla
COPY --from=builder /app/apps/vue2-demo/dist /usr/share/nginx/html/demos/vue2
COPY --from=builder /app/apps/vue3-demo/dist /usr/share/nginx/html/demos/vue3
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
