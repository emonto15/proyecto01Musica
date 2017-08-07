// Example model

let mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let SongsSchema = new Schema({
  title: String,
  artist: String,
  album: String,
  genre: String,
  owner: Schema.Types.ObjectId,
  private: Boolean,
  sharedWith: [String]
});

mongoose.model('Songs', SongsSchema);

