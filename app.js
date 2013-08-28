/*
  Given a CSV file, upload in batches to a Cloudant database.
*/

var config = require('./config.json'),
    nano = require('nano'),
    fs = require('fs'),
    util = require('./util'),
    async = require('async'),
    _ = require('underscore');

function Uploader(opts){
  var conn = nano([
        "http://",
        opts.api_key,
        ":",
        opts.api_secret,
        "@",
        opts.user,
        ".cloudant.com"
      ].join('')),
      db = conn.use(opts.db),
      chunk_size = opts.chunk_size;

  // returns a job for async.js
  // to upload the given docs as a group
  function batch(docs){
    return function(done){
      console.log("Uploading " + docs.length + " docs...");
      db.bulk({docs: docs}, done);
    };
  }

  // chunk documents into batches
  function chunk(docs){
    var i, j, temparray, chunks = [];
    for (i=0, j=docs.length; i < j; i += chunk_size) {
        temparray = docs.slice(i, i + chunk_size);
        chunks.push(temparray);
    }
    return chunks;
  }

  return {
    batch: batch,
    chunk: chunk
  };
}

// main upload function :D
function upload(opts){
  var uploader = Uploader(opts);
  fs.readFile(config.csv, function(err, data){
    var docs = util.CSVToJSON(data.toString()),
        chunks = uploader.chunk(docs),
        jobs = chunks.map(function(chunk){
          return uploader.batch(chunk);
        });

    // run all our upload batches in parallel
    async.parallelLimit(jobs, 8, function(err, results){
      if (err) {
        console.log(err);
        throw new Error(err);
      } else {
        // get any docs we couldn't upload
        var doc_results = _.flatten(results.map(function(result){
              return result[0];
            })),
            problem_docs = doc_results.filter(function(doc){
              return doc.error;
            });
        // if any docs had problems, throw a tantrum
        if (problem_docs.length > 0) {
          console.log(problem_docs);
          throw new Error("Some docs had problems :(");
        } else {
          console.log("Done! Uploaded " + doc_results.length + " docs.");
        }
      }
    });
  });
}

upload(config);