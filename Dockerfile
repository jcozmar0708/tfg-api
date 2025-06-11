FROM node:20-alpine AS builder

RUN yarn global add yarn@1.22.22

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:20-alpine

RUN yarn global add yarn@1.22.22

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package.json yarn.lock ./
RUN yarn install --production

CMD ["yarn", "start:prod"]
