#!/bin/sh

echo "test"
npm install
cd client
npm install
npm run build_dev
cd ..
npm run build

gnome-terminal -- mongod
gnome-terminal -- npm run buildwatch

cd client
gnome-terminal -- npm run buildwatch

cd ..
sleep 1
cd build
gnome-terminal -- nodemon main.js