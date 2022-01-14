#!/bin/bash
cd $1
DATE=`date +%Y-%m-%d_%H-%M-%S`
mkdir -p pzserver
cd pzserver/
tar -czf configs_$DATE.tar.gz -P ~/Zomboid/Saves/ ~/Zomboid/Server/
find -name "*.gz" -mtime 2 -exec rm -f {} \;

exit 0
