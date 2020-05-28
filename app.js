var express          = require("express");
var app              = express();
var bodyParser       = require("body-parser"); //Para leer el body de un POST method
var expressSanitizer = require("express-sanitizer") //elimina etiquetas html dentro de un string
var mongoose         = require("mongoose") //database
var flash            = require("connect-flash")
var passport         = require("passport") //authentication
var localStrategy    = require("passport-local") //authentication
var methodOverride   = require("method-override")// Para poder usar update y delete dado que no son aceptados como methods en HTML

var User             = require("./models/user")
var Building         = require("./models/building")
var Comment          = require("./models/comment")
var middleware       = require("./middleware")


//APP CONFIG
mongoose.connect('mongodb+srv://dbsoyjne:db123456@buildingapp-0rrib.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
//Para conectar a la base de datos de MongoLab:
//mongodb+srv://dbsoyjne:db123456@buildingapp-0rrib.mongodb.net/test?retryWrites=true&w=majority
//Para conectar a la base de datos local de la Toshiba
//mongodb://localhost:27017/building_app2
//Podria reemplazar la url de la base de datos con process.env.DATABASEURL, quedando mongoose.connect(process.env.DATABASEURL)
//Pero para eso deberia configurar la variable process.env.DATABASE en el server local y en heroku:
// En heroku se configura en la seccion settings -> Config Vars -> Reveal Config Vars -> KEY tiene que ser "process.env.DATABASE" y VALUE tiene que ser la url de mongolab "mongodb+srv://dbsoyjne:db123456@buildingapp-0rrib.mongodb.net/test?retryWrites=true&w=majority"
// En el server local hay que escribir en la consola: export DATABASEURL=mongodb://localhost:27017/building_app2

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // Va despues del bodyParser. Es para evitar javascript en inputs del usuario
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());

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
  res.locals.currentUser = req.user; //Permite utilizar datos del user en las views (ejs)
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});



//RESTFUL ROUTES

app.get('/', function (req, res) {
  res.render("landing");
  //res.redirect('/buildings');
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
app.get('/buildings/new', middleware.isLoggedIn, function (req, res) {
  res.render("buildings/new");
});

// CREATE ROUTE
app.post("/buildings", middleware.isLoggedIn, function(req, res) {
  req.body.building.title = req.sanitize(req.body.building.title);
  req.body.building.image = req.sanitize(req.body.building.image);
  req.body.building.description = req.sanitize(req.body.building.description);
  req.body.building.author = { id: req.user._id, username: req.user.username}
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
      req.flash("error", "Error. El edificio no fue encontrado")
      res.redirect("/buildings")
    }else{
      res.render("buildings/show", {BuildingShowVar: foundBuilding});
    }
  });    
});

// EDIT ROUTE
app.get('/buildings/:id/edit', middleware.escreadoredificio, function (req, res) {
  Building.findById (req.params.id, function(err,foundBuilding){
    if (err){
      console.log("HUBO UN ERROR " + err)
    }else{
      res.render("buildings/edit", {BuildingShowVar: foundBuilding});
    }
  });    
});

// UPDATE ROUTE
app.put("/buildings/:id", middleware.escreadoredificio, function(req, res) {
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
app.delete('/buildings/:id', middleware.escreadoredificio, function (req, res) {
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
app.get('/buildings/:id/comments/new', middleware.isLoggedIn, function (req, res) {
  Building.findById(req.params.id, function(err, building){
    if(err){
      console.log(err)
    } else {
      res.render("comments/new", {buildingVar: building});
    }
  })
});


// CREATE COMMENT

app.post("/buildings/:id/comments", middleware.isLoggedIn, function(req, res) {
  Building.findById(req.params.id, function(err, building){
    if(err){
      console.log(err)
    } else {
      Comment.create (req.body.comment, function(err, comment){
        if (err){
          console.log(err)
        }else{
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          building.comments.push(comment);
          building.save();
          res.redirect("/buildings/" + req.params.id);         
        }  
      })
    };
  });      
});

//EDIT COMMENT
app.get('/buildings/:id/comments/:comment_id/edit', middleware.escreadorcomentario, function (req, res) {
  Building.findById(req.params.id, function(err, building){
    if (err){
      console.log("HUBO UN ERROR " + err)
    }else{
      Comment.findById(req.params.comment_id, function(err, comment){
        if (err){
          console.log(err)
        }else{
          res.render("comments/edit", {buildingVar: building, commentVar: comment});
        }      
      })
    }  
  })
});

// UPDATE COMMENT
app.put("/buildings/:id/comments/:comment_id", middleware.escreadorcomentario, function(req, res) {
  req.body.comment.text = req.sanitize(req.body.comment.text);
  Comment.findByIdAndUpdate (req.params.comment_id, req.body.comment, function(err,updatedComment){
    if (err){
      res.render("error")
    }else{
      res.redirect("/buildings/" + req.params.id);
    };
  });
});

// DELETE COMMENT
app.delete('/buildings/:id/comments/:comment_id', middleware.escreadorcomentario, function (req, res) {
  Comment.findByIdAndDelete (req.params.comment_id, function(err){
    if (err){
      res.render("error")
    }else{
      res.redirect("/buildings/" + req.params.id);
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
      return res.render("users/register", {"error": err.message});
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
              failureRedirect: "/login",
              failureFlash : true
            }), function(req, res){
});

app.get("/logout", function(req,res){
  req.logout();
  req.flash("success", "Deslogueado exitosamente")
  res.redirect("/buildings");
});




app.get('*', function (req, res) {
   res.send('Sorry, page not found. What are you doing with your life?');
});

//Para alojar en los puertos de Heroku:
//app.listen(process.env.PORT, process.env.IP);


//Para alojar de forma local:
 var server_port = 8080

 var server_ip_address = '127.0.0.1'

 app.listen(server_port, server_ip_address, function () {

   console.log( "Listening on " + server_ip_address + ", port " + server_port )

 });