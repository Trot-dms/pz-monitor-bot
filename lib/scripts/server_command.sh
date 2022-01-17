#!/bin/bash
tmux send-keys -t "$@" Enter

exit 0