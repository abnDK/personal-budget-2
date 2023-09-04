#!/bin/bash

### LOGIC

# Will check wether a filename with 
# test data relating to the current version
# of the db exists. If it does, the test data
# will be run with the psql command.


# get the current version number and define test data filename
version_number="$(pwd)/migration/get_current_version.sh"
echo "version number $($version_number)"



current_version_test_data_path="$(pwd)/db_test/test_data_$($version_number).sql"



# check if correct file is available in same folder
# run if found.
filenames="$(pwd)/db_test/*"

found=$(ls $filenames |grep -w $current_version_test_data_path)
ls $filenames
echo "looking for"
echo $current_version_test_data_path


if [[ -z $found ]]
    then
        echo "No testdata found for current version ($($version_number))"
    else
        psql -d pb2 -a -f "$current_version_test_data_path"
        echo "Test data written for db version $($version_number)"
    fi

