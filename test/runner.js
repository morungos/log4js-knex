'use strict';

var fs = require('fs');
var log4js = require('log4js');
var log4jsKnex = require('../lib/log4js-knex');

var should = require('chai').should();
var Knex = require('knex');

describe('log4js-knex', function () {

    var log4jsConfig = {table: 'log', knex: {client: 'sqlite', connection: {filename: './test.db'}}}

    before(function(done) {
        fs.unlink('./test.db', function(err) {
            done();
        });
    });

    beforeEach(function (done) {
        log4js.clearAppenders();
        done();
    });

    it('should be initialized correctly', function () {
        (typeof log4jsKnex.configure).should.be.a.Function;
        (typeof log4jsKnex.appender).should.be.a.Function;
    });


    it('should throw an Error when there\'s no configuration set', function () {

        (function () { return log4js.addAppender(log4jsKnex.appender()); }).should.throw();
    });

    it('should log to the database when initialized through the configure function', function (done) {
        log4js.addAppender(log4jsKnex.configure(log4jsConfig));
        log4js.getLogger().info('Ready to log!');

        // Can't immediately finish the test, as database writing is asynchronous. Wait a short while for
        // promises to resolve. 
        setTimeout(function () {
            var knex = Knex({client: 'sqlite', connection: {filename: './test.db'}});
            knex('log')
                .where('data', 'Ready to log!')
                .exec(function(err, rows) {
                    should.not.exist(err);
                    should.exist(rows);
                    rows.should.be.instanceof(Array).and.have.lengthOf(1);
                    rows[0].should.have.property('rank', 20000)
                    rows[0].should.have.property('category', '[default]')
                    rows[0].should.have.property('level', 'INFO')
                    done();
                });
        }, 100);
    });

    it('should log to the database when initialized with an existing connection', function (done) {
        var knex = Knex({client: 'sqlite', connection: {filename: './test.db'}});
        var config = {table: 'log', knex: knex}
        log4js.addAppender(log4jsKnex.configure(config));
        log4js.getLogger().debug('Second logging call!');

        // Can't immediately finish the test, as database writing is asynchronous. Wait a short while for
        // promises to resolve. 
        setTimeout(function () {
            knex('log')
                .orderBy('time', 'desc')
                .exec(function(err, rows) {
                    should.not.exist(err);
                    should.exist(rows);
                    rows.should.be.instanceof(Array).and.have.lengthOf(2);
                    rows[0].should.have.property('rank', 10000)
                    rows[0].should.have.property('category', '[default]')
                    rows[0].should.have.property('level', 'DEBUG')
                    rows[0].should.have.property('data', 'Second logging call!')
                    done();
                });
        }, 100);
    });
});
