#!/bin/sh
set -e

CONFIG=/tmp/nginx/nginx.conf
mkdir -p /tmp/nginx
cp /etc/nginx/nginx.conf "$CONFIG"

# nginx "resolver" needs a DNS server IP, not a hostname. Use the first
# nameserver from /etc/resolv.conf so this works on Docker and OpenShift.
RESOLVER_IP="$(awk '/^nameserver/ {print $2; exit}' /etc/resolv.conf)"
if [ -n "$RESOLVER_IP" ]; then
  sed -i "s|resolver 127.0.0.11 valid=10s ipv6=off;|resolver ${RESOLVER_IP} valid=10s ipv6=off;|" "$CONFIG"
fi

exec nginx -g 'daemon off;' -c "$CONFIG"
