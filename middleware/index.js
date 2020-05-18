var middlewareObj = {}
var Building = require("../models/building")
var Comment  = require("../models/comment")


middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login");
};
  


middlewareObj.escreadoredificio = function (req,res,next) {
    if(req.isAuthenticated()){
        Building.findById (req.params.id, function(err, foundBuilding){
        if (err){
            console.log("HUBO UN ERROR " + err)
        }else{
            if(foundBuilding.author.id.equals(req.user._id)) {
            next();
            }else{
            alert("NO SOS EL USUARIO CREADOR DE ESTE EDIFICIO")
            res.redirect("back");
            }
        } 
        })
    }else{
        res.redirect("/login")
    };
};
  
middlewareObj.escreadorcomentario = function (req,res,next) {
    if(req.isAuthenticated()){
        Comment.findById (req.params.comment_id, function(err, foundComment){
        if (err){
            console.log("HUBO UN ERROR " + err)
        }else{
            if(foundComment.author.id.equals(req.user._id)) {
            next();
            }else{
            alert("NO SOS EL USUARIO CREADOR DE ESTE COMENTARIO")
            res.redirect("back");
            }
        } 
        })
    }else{
        res.redirect("/login")
    };
};



module.exports = middlewareObj;