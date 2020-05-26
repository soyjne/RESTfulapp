var middlewareObj = {}
var Building = require("../models/building")
var Comment  = require("../models/comment")


middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    req.flash("error", "Debes estar logueado")
    res.redirect("/login");
};
  


middlewareObj.escreadoredificio = function (req,res,next) {
    if(req.isAuthenticated()){
        Building.findById (req.params.id, function(err, foundBuilding){
        if (err){
            req.flash("error", "El edificio no fue encontrado")
            console.log("HUBO UN ERROR " + err)
        }else{
            if(foundBuilding.author.id.equals(req.user._id)) {
                next();
            }else{
                req.flash("error", "Sin permiso. Deberías ser el usuario creador del edificio")    
                res.redirect("back");
            }
        } 
        })
    }else{
        req.flash("error", "Debes estar logueado")
        res.redirect("/login")
    };
};
  
middlewareObj.escreadorcomentario = function (req,res,next) {
    if(req.isAuthenticated()){
        Comment.findById (req.params.comment_id, function(err, foundComment){
        if (err){
            req.flash("error", "El comentario no fue encontrado")
        }else{
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            }else{
                req.flash("error", "Sin permiso. Deberías ser el usuario creador del comentario")
                res.redirect("back");
            }
        } 
        })
    }else{
        req.flash("error", "Debes estar logueado")
        res.redirect("/login")
    };
};



module.exports = middlewareObj;