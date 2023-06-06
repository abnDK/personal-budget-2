#!/bin/bash

# read tablenames as an array
tablenames_file="tablenames"


# for each tablename copy rows from db to filename
read -r -a tablenames_array <<< "$tablenames_file"

while read -r tablename

do

echo $tablename
copy_to_statement="COPY (SELECT * FROM $tablename) TO STDOUT WITH (FORMAT 
csv, DELIMITER ';')"
psql -d personal_budget_2_old -c "$copy_to_statement" > tabledata

echo "following data written to tabledata"
cat tabledata


# import each file into equivalent table in new db
copy_from_statement="COPY $tablename FROM STDIN WITH (FORMAT csv, 
DELIMITER ';')"
psql -d personal_budget_2 -c "$copy_from_statement" < tabledata


done < $tablenames_array


# finally: delete file with data (to preserve space)
