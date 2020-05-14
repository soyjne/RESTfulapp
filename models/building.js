var mongoose         = require("mongoose")

//MONGOOSE MODEL CONFIG
var buildingSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    created: {type: Date, default: Date.now},
    author: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
  });
  
  module.exports = mongoose.model("Building", buildingSchema);