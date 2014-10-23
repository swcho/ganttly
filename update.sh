#!/bin/sh
mv config.js config.js.bak
git pull origin master
mv config.js.bak config.js
