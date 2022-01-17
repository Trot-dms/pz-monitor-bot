#!/bin/bash
cd $1 && tmux new -s $2 -d ./start-server.sh

exit 0
