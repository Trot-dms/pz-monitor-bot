#!/bin/bash

PID=("$(pgrep -u $1 ProjectZomboid)")
STATUS="offline"
for PD in ${PID[@]}; do
    LINK="$(readlink "/proc/${PD}/fd/0")"
    if [ "${LINK}" != "/dev/null" ]; then
        STATUS="online"
    fi
done
echo $STATUS

exit 0