#!/bin/sh
set -e

CONFIG=/tmp/nginx/nginx.conf
mkdir -p /tmp/nginx
cp /etc/nginx/nginx.conf "$CONFIG"

if [ -f /var/run/secrets/kubernetes.io/serviceaccount/namespace ]; then
  sed -i 's|resolver 127.0.0.11 valid=10s ipv6=off;|resolver dns-default.openshift-dns.svc.cluster.local valid=10s ipv6=off;|' "$CONFIG"
fi

exec nginx -g 'daemon off;' -c "$CONFIG"
