FROM node AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
ARG ENV
RUN npm run build
RUN ls -l /usr/src/app/dist/google-calendar
RUN ls -l /usr/src/app/dist/google-calendar/browser

FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /etc/nginx/ssl
COPY --from=build /usr/src/app/dist/google-calendar/browser /usr/share/nginx/html