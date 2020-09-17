# Workspace
FROM node AS workspace
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .

CMD [ "yarn", "dev" ]


# Builder
FROM node AS builder
WORKDIR /usr/src/app
ENV NODE_ENV production

COPY --from=workspace /usr/src/app ./
RUN yarn build && \
    yarn install


# Production
FROM node:alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.env ./
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 80
CMD [ "yarn", "start" ]
