#!/bin/bash

# Update and install Docker
apt-get update -y
apt-get install -y docker.io git

# Enable Docker on boot
systemctl start docker
systemctl enable docker

# Clone your repo (update the URL)
REPO_DIR="/opt/sonex"
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git $REPO_DIR

cd $REPO_DIR

# Create .env from variables (insert them securely below or use a secret management solution)
cat <<EOF > .env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_production_database_url
JWT_SECRET=supersecretvalue
# Add more environment variables here
EOF

# Build and run Docker (assumes Dockerfile is in root of the repo)
docker build -t sonex-app .
docker run -d --env-file .env -p 80:3000 --restart always sonex-app