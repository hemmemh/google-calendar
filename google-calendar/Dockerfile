FROM node AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --only=production --legacy-peer-deps
COPY . .
ARG ENV
RUN npm run build:${ENV:-test}


FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /etc/nginx/ssl
COPY --from=build /usr/src/app/dist/frontend_name /usr/share/nginx/html