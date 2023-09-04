#!/bin/bash

### LOGIC

# onyl run psql with filename, if version is greater than current_version

# When to run psql command with filename from upfiles:
# NEXT MAJOR  |  eq    |  gt        |
# NEXT MINOR  |  gt    |  x         |
# DO          |  run   |  run       |


# define user for performing migrations to the db
postgresuser="andersbusk"

# path to migration files
migration_path="$(pwd)/../models/migration"

# get upfiles
upfiles="upfiles"
upfiles_full_path="$migration_path/$upfiles"

# get current_version and set major and minor variable
current_version_string=$(cat $(pwd)/migration/current_version)


IFS="-"
read -r -a current_version_array <<< "$current_version_string"

current_major=${current_version_array[0]}
current_minor=${current_version_array[1]}

unset IFS
# iterate each filename in upfiles
while read -r filename
do

# add relative path from ./ to filename
filename_full_path="$migration_path/$filename"

# skip filename if filename string is empty
if [[ ${filename:0:1} == "" ]]
then
  continue
fi




# analyzing next_version and set to variables
IFS="_."
read -r -a filename_array <<< "$filename"
next_version=${filename_array[3]}

IFS="- "
read -r -a next_version_array <<< $next_version
next_major=${next_version_array[0]}
next_minor=${next_version_array[1]}
unset IFS

# if next major is greater than current major, run psql
if [[ $next_major -gt $current_major ]]
then

  # write migration to db tables
  psql -d pb2 -U "$postgresuser" -a -f "$filename_full_path"

fi


# if next major is equal to current major, but next minor is greater than current minor, run psql
if [[ $next_major -eq $current_major ]] && [[ $next_minor -gt $current_minor ]]
then

  # write migration to db tables

  psql -d pb2 -U "$postgresuser" -a -f "$filename_full_path"

fi

# extract version number from last filename in upfiles
version_number="${next_major}-${next_minor}"
echo "db tables migrated to version: $version_number"

done < "$upfiles_full_path"

# write new version number to file current_version
$(pwd)/migration/write_version.sh $version_number


