'use strict';

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

function knexAppender(config, layouts) {

  if (! config.knex) {
    throw new Error('knex.js connection parameters are missing');
  }

  var layout = null;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  } else {
    layout = layouts.messagePassThroughLayout;
  }

  var tableName = config.table || 'log';
  var knex = typeof config.knex === 'object' ? Knex(config.knex) : config.knex;

    const formatted = layout(loggingEvent);
  function writeEvent(loggingEvent) {
    return knex(tableName).insert({
      time: loggingEvent.startTime,
      data: formatted,
      rank: loggingEvent.level.level,
      level: loggingEvent.level.levelStr,
      category: loggingEvent.logger.category
    });
  };

  return writeEvent;
}

exports.configure = knexAppender;
