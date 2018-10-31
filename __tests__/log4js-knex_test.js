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

  it('should initialize knex correctly when insert succeeds', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure({
      knex: {
        client: 'mysql',
        connection: {
          host: 'example.com'
        }
      }
    }, layouts);
    return appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}})
      .then(() => {
        expect(insert).toBeCalledTimes(1);
        expect(connection.schema.createTable).not.toBeCalled();
      });
  });

  it('should initialize knex correctly when insert fails initially', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.reject(new Error("Missing table")));
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure({
      knex: {
        client: 'mysql',
        connection: {
          host: 'example.com'
        }
      }
    }, layouts);
    return appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}})
      .then(() => {
        expect(insert).toBeCalledTimes(2);
        expect(connection.schema.createTable).toBeCalled();
      })
  });

  it('should fail when table creation fails', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.reject(new Error("Missing table")));
    insert.mockImplementationOnce(() => Promise.resolve());
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.reject(new Error("Can't create table")))
    };
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure({
      knex: {
        client: 'mysql',
        connection: {
          host: 'example.com'
        }
      }
    }, layouts);
    
    const result = appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}})
      .then(() => {
        expect(insert).toBeCalledTimes(2);
        expect(connection.schema.createTable).toBeCalled();
      });

    return expect(result).rejects.toThrow(/Missing table/);
  });

});