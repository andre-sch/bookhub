#!/bin/bash

echo "Deploy started at $(date)"

cd $APP_DIR || exit

git pull origin main

npm install

pm2 restart bookhub

echo "Deploy finished at $(date)"
