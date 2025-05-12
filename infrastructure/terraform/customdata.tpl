#!/bin/bash
set -euxo pipefail

exec > >(tee /var/log/sonex-cloud-init.log|logger -t user-data -s 2>/dev/console) 2>&1

# Install Docker
apt-get update -y
apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io
systemctl enable docker
systemctl start docker
usermod -aG docker sonexadmin

echo "✅ Docker installation complete"
