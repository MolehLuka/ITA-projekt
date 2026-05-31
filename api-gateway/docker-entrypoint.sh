#!/bin/sh
set -e

# OpenShift/Kubernetes vs Docker Compose DNS for variable proxy_pass.
if [ -f /var/run/secrets/kubernetes.io/serviceaccount/namespace ]; then
  sed -i 's|resolver 127.0.0.11 valid=10s ipv6=off;|resolver dns-default.openshift-dns.svc.cluster.local valid=10s ipv6=off;|' /etc/nginx/nginx.conf
fi

exec /docker-entrypoint.sh nginx -g 'daemon off;'
