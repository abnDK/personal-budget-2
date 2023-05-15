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
