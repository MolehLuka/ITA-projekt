FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN rm -f /etc/nginx/conf.d/default.conf \
  && mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp /tmp/nginx \
  && chown -R 101:0 /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp /tmp/nginx \
  && chmod -R g+rwX /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp /tmp/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint-openshift.sh
RUN sed -i 's/\r$//' /docker-entrypoint-openshift.sh \
  && chmod +x /docker-entrypoint-openshift.sh

USER 101

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint-openshift.sh"]
