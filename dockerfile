FROM node:18-alpine as builder

WORKDIR /app
COPY ./*.json .
RUN npm ci

COPY ./src ./src
COPY ./public/ ./public
COPY ./index.html .
COPY ./vite.config.ts .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]