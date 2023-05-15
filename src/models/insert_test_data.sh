#!/bin/bash

test_data_filename=$(bash get_current_version.sh)

echo "inserting: "
echo $test_data_filename

psql -d personal_budget_2 -U abndk -a -f $test_data_filename
