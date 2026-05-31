#!/bin/sh
set -e

mkdir -p /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp
cp /etc/nginx/conf.d/default.conf /tmp/nginx/app.conf

if [ -f /var/run/secrets/kubernetes.io/serviceaccount/namespace ]; then
  sed -i 's|resolver 127.0.0.11 valid=10s ipv6=off;|resolver dns-default.openshift-dns.svc.cluster.local valid=10s ipv6=off;|' /tmp/nginx/app.conf
fi

cat > /tmp/nginx/nginx.conf <<'EOF'
pid /tmp/nginx/nginx.pid;

events {}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  keepalive_timeout 65;
  client_body_temp_path /tmp/client_temp;
  proxy_temp_path /tmp/proxy_temp;
  fastcgi_temp_path /tmp/fastcgi_temp;
  uwsgi_temp_path /tmp/uwsgi_temp;
  scgi_temp_path /tmp/scgi_temp;
  include /tmp/nginx/app.conf;
}
EOF

exec nginx -g 'daemon off;' -c /tmp/nginx/nginx.conf
