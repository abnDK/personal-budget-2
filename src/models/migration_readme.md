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
    <version_number> is extracted from filenames. Last filename will be sent to write_version.sh
- write_version.sh:
    takes <version_number> as input and writes to file current_version
- insert_test_data.sh:
    inserts test data relating to current db version.
    uses get_current_version.sh to define 
version_number and filename containing testdata.
- get_current_version.sh:
    looks in the current_version and returns filename 
of .sql file with relevant test data to be inserted 
in db.




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

