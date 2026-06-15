FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN rm -f .npmrc && echo "registry=https://registry.npmjs.org/" > .npmrc

RUN npm install --workspaces --include-workspace-root

COPY apps/api apps/api/
COPY apps/web apps/web/

RUN npm run build --workspace=apps/web
RUN npm run build --workspace=apps/api

RUN npm prune --workspaces --include-workspace-root --omit=dev

FROM node:20-bookworm-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/passos.db
ENV WEB_ROOT=/app/apps/web/dist

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY package.json ./

VOLUME ["/data"]
EXPOSE 8080

CMD ["node", "apps/api/dist/server.js"]
