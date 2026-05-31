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

# On Kubernetes/OpenShift nginx's resolver does not apply search domains, so
# bare service names fail. Expand upstreams to in-namespace FQDNs.
NS_FILE=/var/run/secrets/kubernetes.io/serviceaccount/namespace
if [ -f "$NS_FILE" ]; then
  NS="$(tr -d '[:space:]' < "$NS_FILE")"
  sed -i "s|members-service:3001|members-service.${NS}.svc.cluster.local:3001|g" "$CONFIG"
  sed -i "s|bookings-service:8080|bookings-service.${NS}.svc.cluster.local:8080|g" "$CONFIG"
fi

exec nginx -g 'daemon off;' -c "$CONFIG"
