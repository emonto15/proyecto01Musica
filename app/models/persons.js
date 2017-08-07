/**
 * Created by ejrmontoya on 7/27/17.
 */
let mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let PersonSchema = new Schema({
  username: String,
  password: String
});

mongoose.model('Person', PersonSchema);
