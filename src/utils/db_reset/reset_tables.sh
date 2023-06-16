# Reset database for testing purposes



# reset database
./reset_database.sh

# set current_version to 0-0
./write_version.sh 0-0


# create tables again
psql -d personal_budget_2 -U abndk -a -f db_1-0.sql

# update to newest version (user should be able to specify)
./up.sh

# export data from database 
if [[ $1 = 'data' ]]
then
  ./export_import_data.sh
fi
