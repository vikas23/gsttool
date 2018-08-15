const {
  MongoClient,
} = require('mongodb');

const state = {};

exports.connect = (url, done) => {
  if (state.db) {
    return done();
  }
  MongoClient.connect(url, {
    useNewUrlParser: true,
  }, (err, client) => {
    if (err) {
      return done(err);
    }
    state.db = client;
    return done();
  });
  return false;
};

exports.getDB = dbname => state.db.db(dbname);
