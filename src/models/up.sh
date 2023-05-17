#!/bin/bash

# get upfiles
filename="upfiles"

# here we need to find current_version of db
current_version=$(cat current_version)
IFS="-"
echo "IFS = '$IFS'"
read -r -a array <<< "$current_version"
current_major=${array[0]}
current_minor=${array[1]}

# iterate each filename
while read -r  line

do
echo "line: $line"



# check if version is above current version, only run psql if
# if version in $line is: (compared to <current_version>
# major  eq  eq  eq  gt  gt  gt  lt  lt  lt
# minor  eq  gt  lt  eq  gt  lt  eq  gt  lt
# do     sk  rn  sk  rb  rn  rn  sk  sk  sk

# only run line if:
#  - major is equal, minor is greater
#  - major is greater


IFS="_."
echo "IFS = '$IFS'"
read -r -a line_array <<< "$line"
next_version=${line_array[3]}
echo "next version pre array: $next_version"
IFS="- "
echo "IFS = '$IFS'"
read -r -a version_array <<< $next_version
echo "version_array: $version_array"
next_major=${version_array[0]}
next_minor=${version_array[1]}

echo "next major: $next_major"
echo "next minor: $next_minor"


# if [ $current_major > 

# write migration to db tables
# psql -d personal_budget_2 -U abndk -a -f "$line"

# extract version number
IFS="_. "
echo "IFS = '$IFS'"
read -a array <<< $line

if [ "$line" != "" ]
then
   version_number=${array[3]}
fi

done < "$filename"

# write new version number to file current_version
bash write_version.sh $version_number

