const log4js = require('log4js');
const Knex = require('knex');
const log4jsKnex = require('../lib/log4js-knex');

describe('log4js-knex', () => {

  it('should initialize correctly', () => {
    expect(log4jsKnex.configure).toBeInstanceOf(Function);
    expect(log4jsKnex.appender).toBeInstanceOf(Function);
  });

});