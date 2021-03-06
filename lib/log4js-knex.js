'use strict';

const Knex = require('knex');

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

  let layout = null;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  } else {
    layout = layouts.messagePassThroughLayout;
  }

  let tableName = config.table || 'log';
  let additionalFields = config.additionalFields || {};
  let knex = typeof config.knex === 'object' ? Knex(config.knex) : config.knex;

  function writeEvent(loggingEvent) {

    // Build a record to insert
    const record = Object.assign({}, {
      time: loggingEvent.startTime.valueOf(),
      data: layout(loggingEvent),
      rank: loggingEvent.level.level,
      level: loggingEvent.level.levelStr,
      category: loggingEvent.categoryName
    }, additionalFields);

    // Insert it, inside a transaction
    return knex.transaction((trx) => trx(tableName).insert(record).then(() => null));
  };

  return writeEvent;
}

exports.configure = knexAppender;
