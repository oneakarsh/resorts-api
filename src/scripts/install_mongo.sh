#!/bin/bash

# MongoDB Installation Script for Ubuntu 24.04 (Noble)

# 1. Import the MongoDB GPG Key
echo "Installing gnupg and curl..."
sudo apt-get update
sudo apt-get install -y gnupg curl

echo "Importing MongoDB public GPG key..."
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor --yes

# 2. Create the List File for Ubuntu 24.04 (Noble)
echo "Adding MongoDB repository to sources list..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# 3. Install MongoDB Packages
echo "Updating package database and installing MongoDB..."
sudo apt-get update
sudo apt-get install -y mongodb-org

# 4. Start and Enable Service
echo "Starting MongoDB service..."
sudo systemctl start mongod

echo "Enabling MongoDB on boot..."
sudo systemctl enable mongod

# 5. Verify Status
echo "Checking MongoDB status..."
sudo systemctl status mongod
