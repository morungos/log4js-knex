log4js-knex
===========

This is a node [log4js](https://github.com/nomiddlename/log4js-node) appender that 
uses [knex](http://knexjs.org/) as a database connection interface. 

You can use it either with a set of connection values:

```
var log4js = require('log4js');
var log4jsKnex = require('log4js-knex');

log4js.addAppender(
    log4jsKnex.appender({table: 'log', knex: {client: 'sqlite', connection: {filename: './test.db'}}})
);

var logger = log4js.getLogger();
logger.debug("Added debug");
```

Or, if you have an existing `knex` connection, you can pass that directly:

```
var log4js = require('log4js');
var log4jsKnex = require('log4js-knex');
var knex = require('knex')(...);

log4js.addAppender(
    log4jsKnex.appender({table: 'log', knex: knex});
);

var logger = log4js.getLogger();
logger.warn("You have been warned");
```

The default table name is `log`, and if there's an error when writing, the appender 
will attempt to create the table before having a second attempt at writing. This 
should create the table for you if it doesn't already exist. 

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

