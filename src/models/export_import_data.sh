#!/bin/bash

# copies data from _old databse into newly created database with tables but no data

# exporting current relevant tablenames from db
./get_tablenames.sh
echo "current tablenames:"
cat tablenames

# before exporting data from tables, tablenames are sorted
# in order to secure insertion of data where parent comes 
# before children in Foreign Key relationships.
# Thus we first export the fkey con relationships
# then use that to sort the tables.
./order_tables.sh
echo "after ordering tablenames:"
cat tablenames

# read tablenames as an array
tablenames_file="tablenames"


# for each tablename copy rows from db to filename
read -r -a tablenames_array <<< "$tablenames_file"

while read -r tablename

do

echo "====> copying from $tablename <===="

# export data from each table in _old database
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

