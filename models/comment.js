var mongoose         = require("mongoose")

//MONGOOSE MODEL CONFIG
var commentSchema = new mongoose.Schema({
    text: String,
    author: String,
  });
  
  module.exports = mongoose.model("Comment", commentSchema);