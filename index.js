// index.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path"); //provides utilities for working with file and directory paths. 
// You'll use it later to create cross-platform file paths to access view templates and static assets
const expressSession = require("express-session");
const passport = require("passport");
const auth0Strategy = require("passport-auth0");

require("dotenv").config(); // to load the environmental variables that you are storing in .env.

const authRouter = require("./auth");


/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";


/**
 * Session Configuration
 */
const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

if (app.get("env") === "production") {
    // serve secure cookies, requires HTTPS
    session.cookie.secure = true;
}


/**
 * Passport Configuration
 */
const strategy = new auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      /**
       * Access tokens are used to authorize users to an API
       * (resource server)
       * accessToken is the token to call the Auth0 API
       * or a secured third-party API
       * extraParams.id_token has the JSON Web Token
       * profile has all the information from the user
       */
      return done(null, profile);
    }
);


/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views")); // using views directory as view template
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession(session)); // session middleware configured

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// store/retrieve user data from the session
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use("/", authRouter);


/**
 * Routes Definitions
 */
app.get("/", (req, res)=>{
    res.render("index", {title: "Home"});
});
app.get("/user", (req, res) => {
    res.render("user", { title: "Profile", userProfile: { nickname: "Auth0" } });
  });


/**
 * Server Activation
 */
// start a server listening for incoming requests on port & display a confirmation
app.listen(port, ()=>{
    console.log(`Listening to requests on http://localhost:${port}`);
});