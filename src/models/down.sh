#!/bin/bash

# get downfiles
filename="downfiles"

# iterate each filename
while read -r  line

do

# write migration to db tables
psql -d personal_budget_2 -U abndk -a -f "$line"

# extract version number
IFS="_. "

read -a array <<< $line

if [ "$line" != "" ]
then
   version_number=${array[3]}
fi

done < "$filename"

# write version number to file current_version
bash write_version.sh $version_number
