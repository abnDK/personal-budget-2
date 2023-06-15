#!/bin/bash

### LOGIC

# Will check wether a filename with 
# test data relating to the current version
# of the db exists. If it does, the test data
# will be run with the psql command.

# get the current version number and define test data filename
version_number=$(./get_current_version.sh)

current_version_test_data="test_data_$version_number.sql"

# check if correct file is available in same folder
# run if found.
filenames="./*"

found=$(ls $filenames |grep -w ./$current_version_test_data)

if [[ -z $found ]]
    then
        echo "No testdata found for current version ($version_number)"
    else
        psql -d personal_budget_2 -a -f "$current_version_test_data"
        echo "Test data written for db version $version_number"
    fi

