FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
ARG VITE_JANEQ_URL=http://localhost:8000
ENV VITE_JANEQ_URL=$VITE_JANEQ_URL
RUN npm run build

FROM nginx:alpine
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
