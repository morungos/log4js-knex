log4js-knex
===========

This is a node [log4js](https://github.com/nomiddlename/log4js-node) appender that 
uses [knex](http://knexjs.org/) as a database connection interface. 

You can use it with a standard configuration as follows:

```
var log4js = require('log4js');
log4js.configure({
    appenders: {
        database: {
            "type": "log4js-knex",
            "table": "log",
            "knex": {
                "client": "sqlite",
                "connection": {
                    "filename": "./log.sqlite3"
                },
                "useNullAsDefault": true
            },
            "additionalFields": {
                "serverName": "www.google.ca"
            }
        }
    },
    categories: { default: { appenders: ['database'], level: 'debug' } }
})

var logger = log4js.getLogger();
logger.debug("Added debug");
```

The default table name is `log`, although that can be overridden by passing the `table`
option as shown above. The appender does not attempt to create this table.
This is a change from previous versions, but it's more sensible for security reasons 
to limit permissions to those needed to manage data insertion only. If you're using
Knex.js, one extra migration is simple anyway. In Knex.js, a schema change like this 
can be used:

    return knex.schema.createTable(tableName, function (table) {
      table.increments();
      table.timestamp('time').notNullable();
      table.string('data', 4096).notNullable();
      table.integer('rank').notNullable();
      table.string('level', 12).notNullable();
      table.string('category', 64).notNullable();
      table.index('time');
    });

The `additionalFields` property allows you to set some fields that get merged into
every log record as additional columns. They're handy in tracing sources. Normally
you are unlikely to need these, however. 


Author
------

[Stuart Watt](https://github.com/morungos)

License 
-------

The MIT License (MIT)

Copyright (c) 2014-2018 Stuart Watt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

