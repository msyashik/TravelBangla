var express    = require("express");
var router     = express.Router();
var passport   = require("passport");
var User       = require("../models/user");
var Campground = require("../models/campground");

//root route
router.get("/",function(req,res){
    res.render("landing",{currentUser: req.user});
});

// show register form
router.get("/register", function(req,res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req,res){
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email : req.body.email,
            avatar : req.body.avatar
        });
    //eval(require('locus'));
    if(req.body.adminCode === "secretcode123")
    {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err,user){
        if(err)
        {
            req.flash("error", err.message);
            res.redirect("/register");
        }
        else
        {
        req.flash("success","Welcome to TravelBangla " + user.username);
        passport.authenticate("local")(req,res, function(){
            res.redirect("/campgrounds");
        });
        }  
    });
});

//show login form
router.get("/login",function(req,res){
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", 
{
    successRedirect : "/campgrounds",
    failureRedirect : "/login"
}),function(req,res){

});

//log out route
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

//USER PROFILE
router.get("/users/:id", function(req,res){
    User.findById(req.params.id, function(err,foundUser){
        if(err)
        {
            req.flash("error", "Something went wrong");
            res.redirect("/");
        }
        else
        {
            Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
                if(err)
                {
                    req.flash("error", "Something went wrong");
                    res.redirect("/");
                }
                else
                {
                    res.render("users/show", {user: foundUser, campgrounds: campgrounds});
                }
            })
        }
    });
});

module.exports = router;