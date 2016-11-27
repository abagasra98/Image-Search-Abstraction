var express = require('express');
var mongo = require('mongodb').MongoClient;
const path = require('path');

var app = express();
const url = process.env.MONGOLAB_URI

app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
  app.use(express.static('views'));
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/api/imagesearch/', function(req, res) {
  console.log('Query: ' + req.query.q);
  console.log('Offset: ' + req.query.offset); // req.query.offset != undefined;
  res.send(req.path);
});

app.get('/api/latest/imagesearch/', function(req, res) {
  mongo.connect(url, function(err, db) {
    if (err) throw err;
    var document = {_id: 'test'.hashCode(), query: 'test', time: Math.floor(new Date().getTime()/1000)};
    var collection = db.collection('searches');
    collection.find({ }, {_id: 0}).toArray(function(err, docs) {
      if (err) throw err;
      res.json(docs);
      db.close();
    });
  });
});

// INSERT CODE
// collection.insert(document, function(err, data) {
//   if (err) throw err;
//   console.log('Document successfully inserted into document');
//   db.close();
// })


app.listen(app.get('port'), function() {
  console.log('Image search app listening on port ' + app.get('port'));
});

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
