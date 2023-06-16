#!/bin/bash

### LOGIC

# will echo the current version number from current_version
relpwd=$(dirname -- "$0") # dirname commands sets relative pwd. When called from other script in other folder, this works as if pwd was called in this location
current_version_filename="$relpwd/current_version"

version_number=$(head -n 1 $current_version_filename)

echo $version_number