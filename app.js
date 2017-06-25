var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");



app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
seedDB();



//PASSPORT
app.use(require("express-session")({
    secret: "Once again Suki wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/",function(req, res){
    res.render("landing");
});


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
app.get("/campgrounds", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
    
});

app.post("/campgrounds", function(req, res){
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc};
    //create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");
        }
    });
});   

app.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
});

//SHOW
app.get("/campgrounds/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err){
           console.log(err);
       } else{
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
    //req.params.id
});

//Comments

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground: campground});
        }
    });
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
    //create new
});

// AUTH ROUTES
//show register form
app.get("/register", function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res, function(){
            res.redirect("/campgrounds");
        });
    });
});

//show login form
app.get("/login", function(req,res){
    res.render("login");
});

//handling login logic
app.post("/login", passport.authenticate("local", 
{ 
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function(req,res){
});

//loq out route
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
        res.redirect("/login");
    
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Server has Started!");
});