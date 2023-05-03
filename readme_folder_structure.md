# Info on folder structure for Express.js app

In the following paragraph, this folder structure will be discussed:

root
-- node_modules
--- src
---- configs
---- controllers
---- middlewares
---- models
---- routes
---- services
---- utils
------ helper.util.js
--- test
---- integration 
---- unit
------ helper.util.test.js
-- .gitignore
-- index.js

Link to source: 
https://blog.logrocket.com/organizing-express-js-project-structure-better-productivity/

## Folders

In the image above, you will see two main folders: src houses the source code, and 
test has all the testing code in it. Time to dig a bit deeper into the src 
subfolders.

First, we have the configs folder, which keeps all the configs needed for the 
application. For example, if the app connects to a database, the configuration for 
the database (like database name and username) can be put in a file like 
db.config.js. Similarly, other configurations like the number of records to show on 
each page for pagination can be saved in a file named general.config.js inside this 
configs folder.

In the image above, you will see two main folders: src houses the source code, and 
test has all the testing code in it. Time to dig a bit deeper into the src 
subfolders.

First, we have the configs folder, which keeps all the configs needed for the 
application. For example, if the app connects to a database, the configuration for 
the database (like database name and username) can be put in a file like 
db.config.js. Similarly, other configurations like the number of records to show on 
each page for pagination can be saved in a file named general.config.js inside this 
configs folder.

The next folder is controllers, which will house all the controllers needed for the 
application. These controller methods get the request from the routes and convert 
them to HTTP responses with the use of any middleware as necessary.

Subsequently, the middlewares folder will segregate any middleware needed for the 
application in one place. There can be middleware for authentication, logging, or 
any other purpose.

Next up, we have the routes folder that will have a single file for each logical 
set of routes. For example, there can be routes for one type of resource. It can be 
further broken down by versions like v1 or v2 to separate the route files by the 
version of the API.

After that, the models folder will have data models required for the application. 
This will also depend on the datastore used if it is a relational or a 
non-relational (NoSQL) database. Contents of this folder will also be defined by 
the use of an Object Relational Mapping (ORM) library. If an ORM like Sequelize or 
Prisma is used, this folder will have data models defined as per its requirement.

Consequently, the services folder will include all the business logic. It can have 
services that represent business objects and can run queries on the database. 
Depending on the need, even general services like a database can be placed here.

Last but not the least, we have the utils directory that will have all the 
utilities and helpers needed for the application. It will also act as a place to 
put shared logic, if any. For example, a simple helper to calculate the offset for 
a paginated SQL query can be put in a helper.util.js file in this folder.

The test folder has subfolders like unit and integration for unit and integration 
tests.

