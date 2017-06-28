var express = require("express");
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");

Campground.create(
    {name: "Mountain Goat's Rest",
    image: "https://www.nps.gov/shen/planyourvisit/images/Campgrounds_1.jpg",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ligula leo, porttitor eu risus auctor, dignissim vehicula lacus. Cras vitae blandit libero. Sed sit amet neque ac enim rutrum sodales. Ut lorem augue, bibendum quis luctus scelerisque, tristique id eros. Etiam vitae sapien neque. Maecenas tempus diam ut sagittis tincidunt. Vivamus fringilla ipsum enim, sed aliquet metus tempus eu."
    },
    
    function(err, campground){
        if(err){
            console.log(err);
        }else{
            console.log("NEWLY CREATED CAMPGROUND ");
            console.log(campground);
        }
    });





//Index - show all campgrounds
router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
    
});

router.post("/", isLoggedIn, function(req, res){
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: desc, author: author};
    //create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");
        }
    });
});   

router.get("/new", isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

//SHOW
router.get("/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err){
           console.log(err);
       } else{
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
    //req.params.id
});

//edit campground route
router.get("/:id/edit", function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
             res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
  
});

router.put("/:id", function(req, res){
    //find and update
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/"+ req.params.id);
        }
    })
    //redirect
})

//destroy campground route
router.delete("/:id", function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    })
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
        res.redirect("/login");
    
}

module.exports = router;