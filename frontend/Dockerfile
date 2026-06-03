FROM node:22-alpine AS members-mfe
WORKDIR /app
COPY members-mfe/package*.json ./
RUN npm ci
COPY members-mfe ./
RUN npm run build

FROM node:22-alpine AS facilities-mfe
WORKDIR /app
COPY facilities-mfe/package*.json ./
RUN npm ci
COPY facilities-mfe ./
RUN npm run build

FROM node:22-alpine AS bookings-mfe
WORKDIR /app
COPY bookings-mfe/package*.json ./
RUN npm ci
COPY bookings-mfe ./
RUN npm run build

FROM node:22-alpine AS shell
WORKDIR /app
COPY shell/package*.json ./
RUN npm ci
COPY shell ./
RUN mkdir -p public/mf/members public/mf/facilities public/mf/bookings
COPY --from=members-mfe /app/dist/ public/mf/members/
COPY --from=facilities-mfe /app/dist/ public/mf/facilities/
COPY --from=bookings-mfe /app/dist/ public/mf/bookings/
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN rm -f /etc/nginx/conf.d/default.conf \
  && mkdir -p /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp \
  && chown -R 101:0 /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp \
  && chmod -R g+rwX /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

COPY shell/nginx.conf /etc/nginx/conf.d/default.conf
COPY shell/docker-entrypoint.sh /docker-entrypoint-openshift.sh
RUN sed -i 's/\r$//' /docker-entrypoint-openshift.sh \
  && chmod +x /docker-entrypoint-openshift.sh

COPY --from=shell /app/dist /usr/share/nginx/html
RUN chown -R 101:0 /usr/share/nginx/html \
  && chmod -R g+rX /usr/share/nginx/html

USER 101
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint-openshift.sh"]
