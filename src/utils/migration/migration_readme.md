# Readme on how to up / down migrate db

Migration can be done using "bash up.sh" or "bash down.sh"
Script will run through either upfiles or downfiles, which holds
the names of relevant migrations files from original db
model to newest db model.

When updating the db model to a new version, create 
a .sql file with the changes made in relation to
the latest version. Also make a reverse file changing 
the db from the new version to the current version.
Name the files db_<version-number>_<up/down>_<version-number>.sql
and add the names to upfiles and downfiles.

Flow of data:
- upfiles/downfiles:
    contains lines of filenames to be run with psql-command in order to migrate db from start to newest version and the reverse.
- current_version:
    holds <version_number> of db. Is updated with each migration up or down.
- up.sh/down.sh: 
    reads upfiles/downfiles and runs each filename on the psql -f command
    <version_number> is extracted from filenames. Version number of last filename will be sent to write_version.sh
- write_version.sh:
    takes <version_number> as input and writes to file current_version
- get_current_version.sh:
    looks in the current_version and returns filename 
of .sql file with relevant test data to be inserted 
in db.



### On resetting database
- resetting database and preserving data

reset_tables.sh
- calls reset_database.sh
  - oldifies current data - naming database = pb2_old
  - create new database = pb2
- writes current_version = '0-0'
- creates tables equivalent to db version 1-0
- calls up.sh
  - migrates tables etc to highest version
- if 'data' is given as param $1
  - call export_tables.sh
    - reads file "tablenames"
    - copies all data from each table in tablenames in _old 
database to file "tabledata"
    - imports all data into pb2 database




TODO:

- make it possible to reset db? 
- automate somewhat insertion of test data - how? 
- when up or down-migrating, check for current version, and only 
run .sql files above/below <current_version> 
- add section in upfiles and downfiles (the files 
referenced, not the list) that takes care of 
datamigration as well. Especially when creating 
not-null columns and add/removing foreign-key 
relationships.

