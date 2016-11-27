var express = require('express');
var mongo = require('mongodb').MongoClient;
var bing = require('node-bing-api') ({accKey: process.env.BING_API_KEY})
const path = require('path');

var app = express();
const url = process.env.MONGOLAB_URI;

app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
  app.use(express.static('views'));
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/api/imagesearch/', function(req, res) {
  var offset = (req.query.offset != undefined) ? req.query.offset : 10;
  bing.images(req.query.q, {top: offset}, function(err, response, body) {
    var responseArray = []
    for (var i = 0; i < body.value.length; i++) {
      var image = body.value[i]
      responseArray.push({url: image.contentUrl, snippet: image.name,
         thumbnail: image.thumbnailUrl, context: image.hostPageDisplayUrl});
    }
    logSearch(req.query.q);
    res.json(responseArray);
  });
});

app.get('/api/latest/imagesearch/', function(req, res) {
  mongo.connect(url, function(err, db) {
    if (err) throw err;
    var collection = db.collection('searches');
    collection.find({ }, {_id: 0}).toArray(function(err, docs) {
      if (err) throw err;
      res.json(docs);
      db.close();
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Image search app listening on port ' + app.get('port'));
});

function logSearch(queryTerm) {
  mongo.connect(url, function(err, db) {
    if (err) throw err;
    var document = {query: queryTerm, time: Math.floor(new Date().getTime()/1000)};
    var collection = db.collection('searches');
    collection.insert(document, function(err, data) {
      if (err) throw err;
      console.log("Document was successfully inserted into database");
      db.close();
    });
  });
}
