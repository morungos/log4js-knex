const log4js = require('log4js');
const log4jsKnex = require('../lib/log4js-knex');

jest.mock('knex');

describe('log4js-knex', () => {

  const layouts = {
    messagePassThroughLayout: jest.fn((event) => "formatted: " + JSON.stringify(event.data))
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
    connection.transaction = (fn) => fn(connection);
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure(knexConfig, layouts);
    return appender({data: [], level: {level: 1000, levelStr: "HIGH"}, categoryName: "default", startTime: new Date(1234567890)})
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
    connection.transaction = (fn) => fn(connection);
    require('knex').__setMockConnection(connection);
    const modifiedLayout = jest.fn((data) => JSON.stringify(data));
    const layoutModule = {
      layout: jest.fn(() => modifiedLayout),
      messagePassThrough: jest.fn((data) => JSON.stringify(data))
    };
    const appender = log4jsKnex.configure(Object.assign({}, knexConfig, {layout: {type: "test"}}), layoutModule);
    return appender({data: [], level: {level: 1000, levelStr: "HIGH"}, categoryName: "default", startTime: new Date(1234567890)})
      .then(() => {
        expect(insert).toBeCalledTimes(1);
        expect(connection.schema.createTable).not.toBeCalled();
        expect(layoutModule.layout).toBeCalledWith("test", {type: "test"});
        expect(layoutModule.messagePassThrough).not.toBeCalled();
      });
  });

  it('should log correctly without additional columns', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    connection.transaction = (fn) => fn(connection);
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure(knexConfig, layouts);
    return appender({data: [], level: {level: 1000, levelStr: "HIGH"}, categoryName: "default", startTime: new Date(1234567890)})
      .then(() => {
        expect(insert).toBeCalledTimes(1);
        expect(connection.schema.createTable).not.toBeCalled();

        expect(insert).toBeCalledWith({
          category: "default",
          data: "formatted: []",
          level: "HIGH",
          rank: 1000,
          time: 1234567890
        });
      });
  });

  it('should log correctly with an additional column', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    connection.transaction = (fn) => fn(connection);
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure(Object.assign({}, knexConfig, {additionalFields: {tag: "aps1"}}), layouts);
    return appender({data: [], level: {level: 1000, levelStr: "HIGH"}, categoryName: "default", startTime: new Date(1234567890)})
      .then(() => {
        expect(insert).toBeCalledTimes(1);
        expect(connection.schema.createTable).not.toBeCalled();

        expect(insert).toBeCalledWith({
          category: "default",
          data: "formatted: []",
          level: "HIGH",
          rank: 1000,
          time: 1234567890,
          tag: "aps1"
        });
      });
  });

});