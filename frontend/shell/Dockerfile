FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN rm -f /etc/nginx/conf.d/default.conf \
  && mkdir -p /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp \
  && chown -R 101:0 /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp \
  && chmod -R g+rwX /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint-openshift.sh
RUN sed -i 's/\r$//' /docker-entrypoint-openshift.sh \
  && chmod +x /docker-entrypoint-openshift.sh

COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R 101:0 /usr/share/nginx/html \
  && chmod -R g+rX /usr/share/nginx/html

USER 101

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint-openshift.sh"]
