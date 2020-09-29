var express    = require("express");
const campground = require("../models/campground");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX route - show call campgrounds
router.get("/",function(req,res){
    var noMatch = null;
    if(req.query.search)
    {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //Get all campgrounds from DB
        Campground.find({name: regex},function(err,allCampgrounds){
            if(err)
            {
                console.log(err);
            }
            else{
                if(allCampgrounds.length < 1)
                {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser : req.user, noMatch : noMatch});
            }
        })
    }
    else
    {
        //Get all campgrounds from DB
        Campground.find({},function(err,allCampgrounds){
            if(err)
            {
                console.log(err);
            }
            else{
                res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser : req.user, noMatch: noMatch});
            }
        })
    }
});

// CREATE - add new campgrounds
router.post("/", middleware.isLoggedIn, function(req,res){
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var image = req.body.image;
    var newCampground = {name: name, price: price, image: image, description: desc, author : author};
    //Create a new a campground and save to DB
    Campground.create(newCampground,function(err,newlyCreated)
    {
        if(err)
        {
            console.log(err);
        }
        else{
            console.log(newlyCreated);
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new",{currentUser : req.user});
});

//SHOW - shows more info about one campground
router.get("/:id",function(req,res){ 
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err)
        {
            console.log(err);
        }
        else{
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show",{campground: foundCampground, currentUser: req.user});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
        Campground.findById(req.params.id,function(err,foundCampground){
            res.render("campgrounds/edit", {campground : foundCampground});
        });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
        if(err)
        {
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err,deletedCampground){
        if(err)
        {
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;