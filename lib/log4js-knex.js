'use strict';

var log4js = require('log4js');
var Knex = require('knex');

/**
 * Returns a function to log data in knex.
 *
 * @param {Object} config The configuration object.
 * @param {string} config.connectionString The connection string to the mongo db.
 * @param {string=} config.layout The log4js layout.
 * @param {string=} config.write The write mode.
 * @returns {Function}
 */

function knexAppender(config) {

    if (! config.knex) {
        throw new Error('knex.js connection parameters are missing');
    }

    var layout = config.layout || log4js.layouts.messagePassThroughLayout;
    var tableName = config.table;
    var knex = typeof config.knex === 'object' ? Knex(config.knex) : config.knex;

    // Solution to the performance issues of testing for an existing table before logging
    // is to write the damn row and check after. This is probably (definitely) a bit of a 
    // risk for portability, but loggers aren't that good for one-off configuration, and 
    // reaally, it should be a decent solution.

    // The naive logic is as follows. If we get an error on insert -- any error -- then we
    // try to add a table. If we fail to do that, throw the original error. If we succeed,
    // try a second time to add the row, but this time without any safety net.

    // Logically, there could be a timing issue here on startup. If two processes attempt 
    // to log, both fail, and both attempt to create, one will signal an error. 

    function createTableIfNeeded(loggingEvent, originalError) {
        return knex.schema.createTable(tableName, function (table) {
            table.increments();
            table.timestamp('time').notNullable();
            table.string('data', 4096).notNullable();
            table.integer('level').notNullable();
            table.string('levelString', 12).notNullable();
            table.string('category', 64).notNullable();
        }).exec(function(err, data) {
            if (err) {
                throw originalError;
            } else {
                writeEvent(loggingEvent, originalError);
            }
        });
    }

    function writeEvent(loggingEvent, originalError) {
        if (Object.prototype.toString.call(loggingEvent.data[0]) === '[object String]') {
            loggingEvent.data = layout(loggingEvent);
        } else if (loggingEvent.data.length === 1) {
            loggingEvent.data = loggingEvent.data[0];
        }

        return knex(tableName).insert({
            time: loggingEvent.startTime,
            data: loggingEvent.data,
            level: loggingEvent.level.level,
            levelString: loggingEvent.level.levelStr,
            category: loggingEvent.logger.category
        }).exec(function(err, data) {
            if (err) {
                if (originalError) {
                    throw originalError
                } else {
                    createTableIfNeeded(loggingEvent, err);                    
                }
            }
        });
    };

    return writeEvent;
}

function configure (config) {
    if (config.layout) {
        config.layout = log4js.layouts.layout(config.layout.type, config.layout);
    }

    return knexAppender(config);
}

exports.appender = knexAppender;
exports.configure = configure;
