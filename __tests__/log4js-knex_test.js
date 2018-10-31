const log4js = require('log4js');
const log4jsKnex = require('../lib/log4js-knex');

jest.mock('knex');

describe('log4js-knex', () => {

  const layouts = {
    messagePassThroughLayout: jest.fn((data) => JSON.stringify(data))
  };

  const knexConfig = {
    knex: {
      client: 'mysql',
      connection: {
        host: 'example.com'
      }
    }
  };

  it('should initialize correctly', () => {
    expect(log4jsKnex.configure).toBeInstanceOf(Function);
  });

  it('should throw an error with no configuration set', () => {
    expect(() => log4js.addAppender(log4jsKnex.configure({}))).toThrow(/connection parameters are missing/);
  });

  it('should initialize knex correctly when insert succeeds', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure(knexConfig, layouts);
    return appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}})
      .then(() => {
        expect(insert).toBeCalledTimes(1);
        expect(connection.schema.createTable).not.toBeCalled();
      });
  });

  it('should handle a configured layout', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    require('knex').__setMockConnection(connection);
    const modifiedLayout = jest.fn((data) => JSON.stringify(data));
    const layoutModule = {
      layout: jest.fn(() => modifiedLayout),
      messagePassThrough: jest.fn((data) => JSON.stringify(data))
    };
    const appender = log4jsKnex.configure(Object.assign({}, knexConfig, {layout: {type: "test"}}), layoutModule);
    return appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}})
      .then(() => {
        expect(insert).toBeCalledTimes(1);
        expect(connection.schema.createTable).not.toBeCalled();
        expect(layoutModule.layout).toBeCalledWith("test", {type: "test"});
        expect(layoutModule.messagePassThrough).not.toBeCalled();
      });
  });

});