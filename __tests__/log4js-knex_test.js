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
    const appender = log4jsKnex.configure(knexConfig, layouts);
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
    const appender = log4jsKnex.configure(knexConfig, layouts);
    
    const result = appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}})
      .then(() => {
        expect(insert).toBeCalledTimes(2);
        expect(connection.schema.createTable).toBeCalled();
      });

    return expect(result).rejects.toThrow(/Missing table/);
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

  it('should throw the original error if needed', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.reject(new Error("Unexpected error")));
    insert.mockImplementationOnce(() => Promise.reject(new Error("Something else")));
    const handler = {insert: insert};
    const connection = jest.fn(() => handler);
    connection.schema = {
      createTable: jest.fn(() => Promise.resolve())
    };
    require('knex').__setMockConnection(connection);
    const appender = log4jsKnex.configure(knexConfig, layouts);
    const result = appender({data: [], level: {level: "HIGH"}, logger: {category: "default"}});

    return expect(result).rejects.toThrow(/Unexpected error/);
  });

  it('should handle the table creation', () => {
    const insert = jest.fn();
    insert.mockImplementationOnce(() => Promise.reject(new Error("Missing table")));
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
        expect(insert).toBeCalledTimes(2);
        expect(connection.schema.createTable).toBeCalledWith('log', expect.any(Function));
        
        const callback = connection.schema.createTable.mock.calls[0][1];
        expect(callback).toBeInstanceOf(Function);

        const table = {};
        table.increments = jest.fn();
        table.timestamp = jest.fn(() => table);
        table.string = jest.fn(() => table);
        table.integer = jest.fn(() => table);
        table.notNullable = jest.fn(() => table);

        return callback(table);
      })
  });
});