var express        = require("express");
var app            = express();
var bodyParser     = require("body-parser");
var mongoose       = require("mongoose")

//APP CONFIG
mongoose.connect('mongodb://localhost:27017/building_app', { useNewUrlParser: true, useUnifiedTopology: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//MONGOOSE MODEL CONFIG
var buildingSchema = new mongoose.Schema({
  title: String,
  image: String,
  description: String,
  created: {type: Date, default: Date.now}
});

var Building = mongoose.model("Building", buildingSchema);

// Building.create ({
//     title: "Test Building",
//     image: "https://images.freeimages.com/images/large-previews/58f/edificios-1230443.jpg",
//     description: "Este es el edificio",
// }, function(err,building){
//   if (err){
//     console.log("HUBO UN ERROR")
//   }else{
//     console.log("EDIFICIO AGREGADO")
//   };
// });

//RESTFUL ROUTES

app.get('/', function (req, res) {
  res.redirect('/buildings');
});


app.get("/buildings", function(req, res) {
    Building.find ({}, function(err, buildings){
        if (err){
          console.log("HUBO UN ERROR")
        }else{
          res.render("index", {buildingsVar: buildings});
        };
    });    
  });

// Consultar friends

// Friend.find ({}, function(err,friends){
//   if (err){
//     console.log("HUBO UN ERROR")
//   }else{
//     console.log("FRIENDS ENCONTRADOS")
//     console.log(friends)
//   };
// });




// app.post("/addFriend", function(req, res) {
//     var newFriend = req.body.newfriend;
//     var newAge = req.body.newage;
//     var newSkill = req.body.newskill;
//     // Add newFriend to to the db
//     Friend.create ({
//       name: newFriend,
//       age: newAge,
//       temperament: newSkill
//     }, function(err,friend){
//       if (err){
//         console.log("HUBO UN ERROR"n)
//       }else{
//         res.redirect("/friends");
//       };
//     });
// });



// //SHOW GET
// app.get("/friends/:id", function(req, res) {
//   Friend.findById (req.params.id, function(err,foundFriend){
//     if (err){
//       console.log("HUBO UN ERROR " + err)
//     }else{
//       res.render("show", {friendsVar: foundFriend});
//     }
//   });    
// });


// app.get('*', function (req, res) {
//   res.send('Sorry, page not found. What are you doing with your life?');
// });

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function () {

  console.log( "Listening on " + server_ip_address + ", port " + server_port )

});