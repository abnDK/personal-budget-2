#!/bin/bash
echo "Welcome to pb2 utilities menu"
echo
echo "Following commands are available:"
echo "1. reset database"
echo "2. reset database (preserve data)"
echo "3. insert test data"
echo "4. migrate database up to latest version"
echo "5. migrate database down to version 1-0"
echo "6. get current version"
echo "7 set version number"
echo
read choice

if [[ choice -eq "1" ]] 
then
  echo "Resetting database it is..."
  ./db_reset/reset_tables.sh
fi

if [[ choice -eq "2" ]] 
then
  echo "Resetting database while preserving your precious data.."
  ./db_reset/reset_tables.sh data
fi

if [[ choice -eq "3" ]] 
then
  echo "Inserting some testdata..."
  ./db_test/insert_test_data.sh
fi

if [[ choice -eq "4" ]] 
then
  echo "Migrating UP!"
  ./migration/up.sh
fi

if [[ choice -eq "5" ]] 
then
  echo "Migrating DOWN!"
  ./migration/down.sh
fi

if [[ choice -eq "6" ]] 
then
  ./migration/get_current_version.sh
fi

if [[ choice -eq "7" ]] 
then
  echo "New version number: "
  read version
  ./migration/write_version.sh $version
fi