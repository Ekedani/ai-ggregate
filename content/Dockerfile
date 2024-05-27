FROM node:20-alpine AS development

WORKDIR /usr/src/app
COPY --chown=node:node --chmod=755 package*.json ./
RUN npm ci
COPY --chown=node:node --chmod=755 . .
USER node


FROM node:20-alpine AS build

WORKDIR /usr/src/app
COPY --chown=node:node --chmod=755 package*.json ./
COPY --chown=node:node --chmod=755 --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --chmod=755 . .
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
USER node

FROM node:20-alpine AS production

COPY --chown=node:node --chmod=755 --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --chmod=755 --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "node", "dist/main.js" ]
