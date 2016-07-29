const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const app = require('../lib/app');
require( '../lib/mongoose-setup' );

chai.use(chaiHttp);

describe('series endpoints', () => {

  const request = chai.request(app);

  let testSeries = { name: 'test-series3', type: 'low' };
  let testSeries1 = { name: 'test-series1', type: 'low' };
  let testSeries2 = { name: 'test-series4', type: 'low' };

  it('returns 404 for bad path', done => {
    request
      .get('/badpath')
      .end((err, res) => {
        assert.ok(err);
        assert.equal(res.statusCode, 404);
        done();
      });
  });

  it('returns endpoint list on api root route', done => {
    request
      .get('/api')
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        assert.include(res.text, 'GET /api/series');
        done();
      });
  });

  it('/POST method completes successfully', done => {
    request
      .post('/api/series')
      .send(testSeries1)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        let result = JSON.parse(res.text);
        assert.equal(result.name, testSeries1.name);
        assert.equal(result.type, testSeries1.type);
        testSeries1 = result;
        done();
      });
  });

  it('/GET on series id returns series data', done => {
    request
      .get(`/api/series/${testSeries1._id}`)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        let result = JSON.parse(res.text);
        assert.deepEqual(result, testSeries1);
        done();
      });
  });    

  it('/POST method gives error with bad json in request', done => {
    request
      .post('/api/series')
      .send('{"invalid"}')
      .end( (err,res) => {
        if(err) {
          let error = JSON.parse(err.response.text);
          assert.equal(error.status, 400);
          assert.include(error.message, 'problem parsing');
          return done();
        } else {
          return done(res);
        }
      });
  });

  it('/PUT method completes successfully', done => {
    testSeries.name = 'test-put';
    const putUrl = `/api/series/${testSeries._id}`;
    request
      .put(putUrl)
      .send(testSeries)
      .end((err, res) => {
        if (err) return done(err);
        let result = JSON.parse(res.text);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        assert.equal(result.name, testSeries.name, JSON.stringify(result));
        done();
      });
  });

  it('/GET on recently updated series returns correct changes', done => {
    request
      .get(`/api/series/${testSeries._id}`)
      .end((err, res) => {

        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        let result = JSON.parse(res.text);
        assert.equal(result.name, testSeries.name, res.text);
        done();
      });
  });

  it('/DELETE method removes series', done => {
    request
      .delete(`/api/series/${testSeries._id}`)
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        let result = JSON.parse(res.text);
        assert.deepEqual(result, testSeries);
        done();
      });
  });

  it('/GET on recently deleted series returns no data', done => {
    request
      .get(`/api/series/${testSeries._id}`)
      .end((err, res) => {
        assert.equal(res.header['content-length'], 0);
        done();
      });
  });

  before( done => {
    request
      .post('/api/series')
      .send(testSeries)
      .end((err, res) => {
        if (err) return done(err);
        let result = JSON.parse(res.text);
        testSeries = result;
        request
          .post('/api/series')
          .send(testSeries2)
          .end((err, res) => {
            if (err) return done(err);
            let result = JSON.parse(res.text);
            testSeries2 = result;
            done();
          });
      });
  });

  it('/GET on root route returns all', done => {
    request
      .get('/api/series')
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.statusCode, 200);
        assert.include(res.header['content-type'], 'application/json');
        let result = JSON.parse(res.text);
        assert.isAbove(result.length, 1);
        done();
      });
  });

  // cleanup
  after( done => {
    request
      .delete(`/api/series/${testSeries._id}`)
      .end( err => {
        if (err) done(err);
        request
          .delete(`/api/series/${testSeries1._id}`)
          .end( err => {
            if (err) done(err);
            request
              .delete(`/api/series/${testSeries2._id}`)
              .end( err => {
                if (err) done(err);
                return done(); 
              });
          });
      });
  });

});
