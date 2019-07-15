/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var temp_id;

// US10 - All 6 functional tests required are complete and passing.

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
         chai.request(server)
          .post('/api/books')
          .send({
            title: 'Title - functional post test title filled in'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body); 
            temp_id = res.body._id;
            assert.isObject(res.body);
            assert.equal(res.body.title, 'Title - functional post test title filled in');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
         chai.request(server)
          .post('/api/books')
          .send({
            title: null
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body);  
            assert.equal(res.text, 'title field missing');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
        });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/xyz')
        .end(function(err, res){
          // console.log(res.body);  
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/' + temp_id)
        .end(function(err, res){
          // console.log(res.body);  
          assert.equal(res.status, 200);
          assert.equal(res.body.title, 'Title - functional post test title filled in');
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/' + temp_id)
          .send({
            comment: 'comment - functional post test comment filled in'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            // console.log(res.body); 
            assert.isObject(res.body);
            assert.equal(res.body.comments[0], 'comment - functional post test comment filled in');
            done();
          });
      });
      
    });

  });

}); 
