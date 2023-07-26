require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: process.env.SECRET_STRING,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    facebookId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture,
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "https://login-page-c3m9.onrender.com/auth/google/success",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log(profile);
            User.findOrCreate({ username: profile.displayName, googleId: profile.id }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.APP_ID,
            clientSecret: process.env.APP_SECRET,
            callbackURL: "https://login-page-c3m9.onrender.com/auth/facebook/success",
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log(profile);
            User.findOrCreate({ username: profile.displayName, facebookId: profile.id }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

const sHeading = "Congratulations!";
const sPara = "You are successfully logged in.";
const fHeading = "Oops, Something went wrong!";
const fPara = "The email and password you entered did not match our records. Please double-check and try again.";
const dupPara = "This email id is already registered. Please try again with a new email id.";
const delHeading = "Sorry to see you go :(";
const delPara = "Your account was deleted successfully";
const fDelPara = "Your account wasn't deleted successfully";

app.get("/", (req, res) => {
    res.render("home", { title: "Login", oppoTitle: "Signup", word: "Don't", link: "", oppoLink: "signup" });
});
app.get("/signup", (req, res) => {
    res.render("home", { title: "Signup", oppoTitle: "Login", word: "Already", link: "signup", oppoLink: "" });
});
app.get("/failure", (req, res) => {
    res.render("message", { title: "Failure", heading: fHeading, para: fPara });
});
app.get("/success", (req, res) => {
    if (req.isAuthenticated())
        res.render("message", { title: "Success", heading: sHeading, para: sPara, userInfo: req.user.id });
    else res.redirect("/");
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});
app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
app.get("/auth/google/success", passport.authenticate("google", { failureRedirect: "/failure" }), function (req, res) {
    res.redirect("/success");
});

app.get("/auth/facebook", passport.authenticate("facebook"));
app.get(
    "/auth/facebook/success",
    passport.authenticate("facebook", { failureRedirect: "/failure" }),
    function (req, res) {
        res.redirect("/success");
    }
);

app.post("/success", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.body.userId);
        res.render("message", { title: "Failure", heading: delHeading, para: delPara });
    } catch (err) {
        res.render("message", { title: "Success", heading: fHeading, para: fDelPara });
    }
});

app.post("/signup", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("message", { title: "Failure", heading: fHeading, para: dupPara });
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/success");
            });
        }
    });
});
app.post("/", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local", { failureRedirect: "/failure" })(req, res, function () {
                res.redirect("/success");
            });
        }
    });
});

let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});
