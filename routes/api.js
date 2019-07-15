/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
var options = { useNewUrlParser: true };

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      // US4 - I can get /api/books to retrieve an aray of all books containing title, _id, & commentcount.
      MongoClient.connect(MONGODB_CONNECTION_STRING, options, function(err, connection) {
        if (err) console.log(err);
        var db = connection.db('library'); 
        // if (db) console.log("Connected to database");
        db.collection('books').find({}).toArray((err, data) => { // {} - find all 
          if (err) return res.send(err);
          if (data) {
            return res.send(data);
          } // database is empty
          else
            return res.send('no books exist');
        });
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      // US3 - I can post a title to /api/books to add a book and returned will be the object with 
      // the title and a unique _id.
      if (!title || title.length == 0) return res.send("title field missing");
      MongoClient.connect(MONGODB_CONNECTION_STRING, options, function(err, connection) {
        if (err) console.log(err);
        var db = connection.db('library'); 
        // if (db) console.log("Connected to database");
        // can check for duplicate titles b/f insert
        db.collection('books').insertOne({title: title, commentcount: 0}, (err, data) => {
          if (err) return res.send(err);
          if (data) {
            return res.json({title: data.ops[0].title, _id: data.ops[0]._id});
          } // database is empty
          else
            return res.send('no books exist');
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      // US9 - I can send a delete request to /api/books to delete all books in the database. 
      // Returned will be 'complete delete successful' if successful.
      MongoClient.connect(MONGODB_CONNECTION_STRING, options, function(err, connection) {
        var db = connection.db('library');
        if (err) console.log(err);
        // if (db) console.log("Connected to database");
        // delete documents in comments table
        db.collection('comments').deleteMany({}, (err, data) => { // {} - delete all
          if (err) return res.send(err);
          if (data) {
            // delete documents in books table
            db.collection('books').deleteMany({}, (err, data) => { // {} - delete all
              if (err) return res.send(err);
              if (data) {
                return res.send('complete delete successful');
              } // database is empty
              else
                return res.send('no books exist');
            });
          } // database is empty
          else
            return res.send('no comments exist')
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      // US5 - I can get /api/books/{_id} to retrieve a single object of a book containing title, _id, & 
      // an array of comments (empty array if no comments present).
      // US8 - If I try to request a book that doesn't exist I will get a 'no book exists' message.
      if (bookid.length < 24 || bookid.length > 24) return res.send('no book exists');
      MongoClient.connect(MONGODB_CONNECTION_STRING, options, function(err, connection) {
        if (err) console.log(err);
        var db = connection.db('library'); 
        // if (db) console.log("Connected to database");
        db.collection('books').findOne({_id: ObjectId(bookid)}, (err, data) => {
          if (err) return res.send(err);
          if (data) { 
            // console.log(data); // no comments count is 0
            if (data.commentcount == 0) return res.json({_id: data._id, title: data.title, comments: []});
            db.collection('comments').find({bookid: ObjectId(data._id)}).toArray((err, result) => {
              if (err) return res.send(err);
              var temp_arr = [];
              if (result) { 
                // console.log(result); 
                result.forEach((e) => { temp_arr.push(e.comment); });
                return res.json({_id: data._id, title: data.title, comments: temp_arr});
              } // database is empty
              else
                return res.send('no comment exists');
            });
          } // database is empty
          else
            return res.send('no book exists');
        });
      });
      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      // US6 - I can post a comment to /api/books/{_id} to add a comment to a book and returned will be 
      // the books object similar to get /api/books/{_id}.
      // US8 - If I try to request a book that doesn't exist I will get a 'no book exists' message.
      if (!comment || comment.length == 0) return res.send('missing comment field');
      if (bookid.length < 24 || bookid.length > 24) return res.send('no book exists');
      MongoClient.connect(MONGODB_CONNECTION_STRING, options, function(err, connection) {
        if (err) console.log(err);
        var db = connection.db('library'); 
        // if (db) console.log("Connected to database");
        db.collection('books').findOne({_id: ObjectId(bookid)}, (err, data) => { // if bookid exists ...
          if (err) return res.send(err);
          if (data) {
            // console.log(data); // 1) update commentcount in books table
            var update = {title: data.title, commentcount: data.commentcount + 1};
            db.collection('books').replaceOne({_id: ObjectId(data._id)}, update, (err, docs) => {
              if (err) return res.send(err);
              if (docs) {
                // console.log(docs); // 2) add a comment to comments table 
                db.collection('comments').insertOne({bookid: ObjectId(data._id), comment: comment}, (err, docs) => {
                  if (err) return res.send(err);
                  if (docs) { 
                    // console.log(docs); // 3) get all comments for a single bookid in comments table
                    db.collection('comments').find({bookid: ObjectId(data._id)}).toArray((err, result) => {
                      if (err) return res.send(err);
                      var temp_arr = [];
                      if (result) { 
                        // console.log(result); 
                        result.forEach((e) => { temp_arr.push(e.comment); }); // append comment only 
                        return res.json({_id: data._id, title: data.title, comments: temp_arr});
                      }
                    });
                  } // database is empty
                  else
                    return res.send('no comment exists');
                }); 
              } // database is empty
              else
                return res.send('no book exists');
            });
          } // database is empty
          else
            return res.send('no book exists');
        });
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      // US7 - I can delete /api/books/{_id} to delete a book from the collection. Returned will be 
      // 'delete successful' if successful.
      // US8 - If I try to request a book that doesn't exist I will get a 'no book exists' message.
      // console.log(bookid);
      if (bookid.length < 24 || bookid.length > 24) return res.send('no book exists');
      MongoClient.connect(MONGODB_CONNECTION_STRING, options, function(err, connection) {
          var db = connection.db('library');
          if (err) console.log(err);
          // if (db) console.log("Connected to database");
          // delete documents in comments table for a particular bookid
          db.collection('comments').deleteMany({bookid: ObjectId(bookid)}, (err, data) => {
            if (err) return res.send(err);
            if (data) {
              // delete document for a bookid in books table
              db.collection('books').deleteOne({_id: ObjectId(bookid)}, (err, data) => {
                if (err) return res.send(err);
                if (data) {
                  return res.send('delete successful');
                } // database is empty
                else
                  return res.send('no books exist');
              });
            } // database is empty
            else
              return res.send('no comments exist');
          });
        });
    });
  
};
