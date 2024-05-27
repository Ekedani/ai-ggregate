FROM satantime/puppeteer-node:20.11-buster-slim AS development

WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node --chmod=644 . .
USER node


FROM satantime/puppeteer-node:20.11-buster-slim AS build

WORKDIR /usr/src/app
COPY --chown=node:node --chmod=644 package*.json ./
COPY --chown=node:node --chmod=644 --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --chmod=644 . .
RUN npm run build
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
USER node

FROM satantime/puppeteer-node:20.11-buster-slim AS production

COPY --chown=node:node --chmod=644 --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --chmod=644 --from=build /usr/src/app/dist ./dist
RUN npx puppeteer browsers install chrome
EXPOSE 3000

CMD [ "node", "dist/main.js" ]
