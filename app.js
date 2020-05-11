var express          = require("express");
var app              = express();
var bodyParser       = require("body-parser"); //Para leer el body de un POST method
var expressSanitizer = require("express-sanitizer") //elimina etiquetas html dentro de un string
var mongoose         = require("mongoose") //database
var passport         = require("passport") //authentication
var localStrategy    = require("passport-local") //authentication
var methodOverride   = require("method-override")// Para poder usar update y delete dado que no son aceptados como methods en HTML

var User             = require("./models/user")
var Building         = require("./models/building")
var Comment          = require("./models/comment")


//APP CONFIG
mongoose.connect('mongodb://localhost:27017/building_app', { useNewUrlParser: true, useUnifiedTopology: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // Va despues del bodyParser. Es para evitar javascript en inputs del usuario
app.use(express.static("public"));
app.use(methodOverride("_method"));

//PASSPORT CONFIG - USER AUTHENTICATION
app.use(require("express-session")({
  secret: "El secreto",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

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
    console.log(req.params.id);
    console.log(foundBuilding);
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
app.get('/buildings/:id/comments/new', isLoggedIn, function (req, res) {
  Building.findById(req.params.id, function(err, building){
    if(err){
      console.log(err)
    } else {
      res.render("comments/new", {buildingVar: building});
    }
  })
});


// CREATE COMMENT

app.post("/buildings/:id/comments", isLoggedIn, function(req, res) {
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


//------------------------
//USERS ROUTES
//------------------------

app.get("/register", function(req, res){
  res.render("users/register");
});

app.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){ //registro del usuario
    if(err){
      console.log(err)
      return res.render("users/register")
    }
    passport.authenticate("local")(req, res, function(){ //logueo del usuario
      res.redirect("/buildings");
    });
  });
});

app.get("/login", function(req, res){
  res.render("users/login");
});

app.post("/login", passport.authenticate("local",
            {
              successRedirect: "/buildings",
              failureRedirect: "/login"
            }), function(req, res){
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/buildings");
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/login");
};


app.get('*', function (req, res) {
   res.send('Sorry, page not found. What are you doing with your life?');
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

app.listen(server_port, server_ip_address, function () {

  console.log( "Listening on " + server_ip_address + ", port " + server_port )

});