var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    methodOverride = require("method-override"),
    seedDB      = require("./seeds");

var commentRoutes        = require("./routes/comments"),
    campgroundRoutes     = require("./routes/campgrounds"),
    indexRoutes          = require("./routes/index");

app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
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


app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.get("/",function(req, res){
    res.render("landing");
});








app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Server has Started!");
});