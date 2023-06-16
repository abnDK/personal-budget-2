#!/bin/bash

### LOGIC

# When to run psql command with filename from downfiles:
# NEXT MAJOR   |  lt   |   eq   |
# NEXT MINOR   |  x    |   lt   |
# DO           |  run  |   run  |

# define user for performing migrations to the db
postgresuser="andersbusk"

# get downfiles
downfiles="downfiles"

# get current_version and set major and minor variable
current_version_string=$(cat current_version)

IFS="-"
read -r -a current_version_array <<< "$current_version_string"

current_major=${current_version_array[0]}
current_minor=${current_version_array[1]}

unset IFS

# iterate each filename
while read -r filename

do

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
if [[ $next_major -lt $current_major ]]
then

  # write migration to db tables
  psql -d personal_budget_2 -U "$postgresuser" -a -f "$filename"

fi


# if next major is equal to current major, but next minor is greater than current minor, run psql
if [[ $next_major -eq $current_major ]] && [[ $next_minor -lt $current_minor ]]
then

  # write migration to db tables
  psql -d personal_budget_2 -U "$postgresuser" -a -f "$filename"

fi


# extract version number from last filename in upfiles
version_number="${next_major}-${next_minor}"

echo "db tables down migrated to $version_number"

done < "$downfiles"

# write version number to file current_version
./write_version.sh $version_number
