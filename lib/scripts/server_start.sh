#!/bin/bash
cd $1 && screen -dmS $2 ./start-server.sh

exit 0
