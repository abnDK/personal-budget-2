#!/bin/bash



echo "Writing $1 as the current version"

echo $1 > "$(pwd)/migration/current_version"


