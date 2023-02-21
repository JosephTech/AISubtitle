#!/bin/bash

#echo 'hello world'
cd ../vad_and_decode/ || exit

pwd
#echo "======================================================="
#echo "$1"
#echo "$2"

bash run.sh "$1" "$2"

exit
