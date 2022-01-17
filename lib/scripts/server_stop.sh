#!/bin/bash
tmux send-keys -t $1 "quit" Enter
tmux kill-session -t $1

exit 0
