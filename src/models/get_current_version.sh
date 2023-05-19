#!/bin/bash

### LOGIC

# will echo the current version number from current_version

current_version_filename="current_version"

version_number=$(head -n 1 $current_version_filename)

echo $version_number