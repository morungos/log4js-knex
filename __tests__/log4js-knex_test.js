const log4js = require('log4js');
const log4jsKnex = require('../lib/log4js-knex');

jest.mock('knex');

describe('log4js-knex', () => {

  const layouts = {
    messagePassThrough: {}
  };

  it('should initialize correctly', () => {
    expect(log4jsKnex.configure).toBeInstanceOf(Function);
  });

  it('should throw an error with no configuration set', () => {
    expect(() => log4js.addAppender(log4jsKnex.configure({}))).toThrow(/connection parameters are missing/);
  });

  it('should initialize knex correctly', () => {
    const handler = {
      insert: jest.fn(() => Promise.resolve())
    }
    const connection = jest.fn(() => handler);
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure({
      knex: {
        client: 'mysql',
        connection: {
          host: 'example.com'
        }
      }
    }, layouts);
    appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}});
  });

});