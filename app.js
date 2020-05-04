var express          = require("express");
var app              = express();
var bodyParser       = require("body-parser");
var expressSanitizer = require("express-sanitizer")
var mongoose         = require("mongoose")
var methodOverride   = require("method-override")
var Building         = require("./models/building")
var Comment          = require("./models/comment")


//APP CONFIG
mongoose.connect('mongodb://localhost:27017/building_app', { useNewUrlParser: true, useUnifiedTopology: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // Va despues del bodyParser. Es para evitar javascript en inputs del usuario
app.use(express.static("public"));
app.use(methodOverride("_method"));


//RESTFUL ROUTES

app.get('/', function (req, res) {
  res.redirect('/buildings');
});


//------------------
// BUIlDINGS ROUTES
//------------------


// INDEX ROUTE
app.get("/buildings", function(req, res) {
    Building.find ({}, function(err, buildings){
        if (err){
          console.log("HUBO UN ERROR")
        }else{
          res.render("buildings/index", {buildingsVar: buildings});
        };
    });    
});

// NEW ROUTE
app.get('/buildings/new', function (req, res) {
  res.render("buildings/new");
});

// CREATE ROUTE

app.post("/buildings", function(req, res) {
  req.body.building.title = req.sanitize(req.body.building.title);
  req.body.building.image = req.sanitize(req.body.building.image);
  req.body.building.description = req.sanitize(req.body.building.description);
  // Add newBuilding to to the db
    Building.create (req.body.building, function(err,newBuilding){
      if (err){
        res.render("buildings/new")
      }else{
        res.redirect("/buildings");
      };
    });
});

// SHOW ROUTE NORMAL
// app.get('/buildings/:id', function (req, res) {
//   Building.findById (req.params.id, function(err,foundBuilding){
//     if (err){
//       console.log("HUBO UN ERROR " + err)
//     }else{
//       res.render("show", {BuildingShowVar: foundBuilding});
//     }
//   });    
// });

// SHOW ROUTE + SHOW COMMENTS DEL BUILDING
app.get('/buildings/:id', function (req, res) {
  Building.findById (req.params.id).populate("comments").exec(function(err,foundBuilding){
    if (err){
      console.log("HUBO UN ERROR " + err)
    }else{
      res.render("buildings/show", {BuildingShowVar: foundBuilding});
    }
  });    
});

// EDIT ROUTE
app.get('/buildings/:id/edit', function (req, res) {
  Building.findById (req.params.id, function(err,foundBuilding){
    if (err){
      console.log("HUBO UN ERROR " + err)
    }else{
      res.render("buildings/edit", {BuildingShowVar: foundBuilding});
    }
  });    
});

// UPDATE ROUTE

app.put("/buildings/:id", function(req, res) {
  req.body.building.title = req.sanitize(req.body.building.title);
  req.body.building.image = req.sanitize(req.body.building.image);
  req.body.building.description = req.sanitize(req.body.building.description);
  Building.findByIdAndUpdate (req.params.id, req.body.building, function(err,updatedBuilding){
    if (err){
      res.render("error")
    }else{
      res.redirect("/buildings/" + req.params.id);
    };
  });
});


// DELETE ROUTE

app.delete('/buildings/:id', function (req, res) {
  Building.findByIdAndDelete (req.params.id, function(err){
    if (err){
      res.render("error")
    }else{
      res.redirect("/buildings");
    };
  });
});

//------------------
// COMMENTS ROUTES
//------------------

//NEW COMMENT
app.get('/buildings/:id/comments/new', function (req, res) {
  Building.findById(req.params.id, function(err, building){
    if(err){
      console.log(err)
    } else {
      res.render("comments/new", {buildingVar: building});
    }
  })
});


// CREATE COMMENT

app.post("/buildings/:id/comments", function(req, res) {
  Building.findById(req.params.id, function(err, building){
    if(err){
      console.log(err)
    } else {
      Comment.create (req.body.comment, function(err, comment){
        if (err){
          console.log(err)
        }else{
          building.comments.push(comment);
          building.save();
          res.redirect("/buildings/" + building._id);         
        }  
      })
    };
  });      
});

app.get('*', function (req, res) {
   res.send('Sorry, page not found. What are you doing with your life?');
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function () {

  console.log( "Listening on " + server_ip_address + ", port " + server_port )

});