#!/bin/sh
set -e

mkdir -p /tmp/nginx /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp
cp /etc/nginx/conf.d/default.conf /tmp/nginx/app.conf

# nginx "resolver" needs a DNS server IP, not a hostname. Use the first
# nameserver from /etc/resolv.conf so this works on Docker and OpenShift.
RESOLVER_IP="$(awk '/^nameserver/ {print $2; exit}' /etc/resolv.conf)"
if [ -n "$RESOLVER_IP" ]; then
  sed -i "s|resolver 127.0.0.11 valid=10s ipv6=off;|resolver ${RESOLVER_IP} valid=10s ipv6=off;|" /tmp/nginx/app.conf
fi

# On Kubernetes/OpenShift nginx's resolver does not apply search domains, so
# bare service names fail. Expand upstreams to in-namespace FQDNs.
NS_FILE=/var/run/secrets/kubernetes.io/serviceaccount/namespace
if [ -f "$NS_FILE" ]; then
  NS="$(tr -d '[:space:]' < "$NS_FILE")"
  sed -i "s|api-gateway:8080|api-gateway.${NS}.svc.cluster.local:8080|g" /tmp/nginx/app.conf
  sed -i "s|mobile-gateway:8081|mobile-gateway.${NS}.svc.cluster.local:8081|g" /tmp/nginx/app.conf
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
