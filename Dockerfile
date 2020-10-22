FROM node:12-alpine as builder
WORKDIR /app
COPY ./package.json ./package.json
RUN npm install --registry=https://registry.npm.taobao.org
COPY . .
RUN npm run build

FROM node
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "8001", "-s", "."]
