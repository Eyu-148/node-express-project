// auth.js

/**
 * Required External Modules
 */
const express = require("express");
const router = express.Router();
const passport = require("passport");
const querystring = require("querystring");

require("dotenv").config();

/**
 * Routes Definitions
 */
router.get( "/login",
    passport.authenticate("auth0", {
      scope: "openid email profile"
    }),
    (req, res) => {
      res.redirect("/");
    }
);

// a bridge between application and Auth0 authentication server
// after server identifies & validates the user, GET/callback is called
// which is the final step of authentication
router.get("/callback", (req, res, next) => {
    passport.authenticate("auth0", (err, user, info) => {
      if (err) { // error if a user is defined
        return next(err);
      }
      if (!user) { // if authentication fails, redirect to login page
        return res.redirect("/login");
      }
      // successful auth...
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const returnTo = req.session.returnTo; // page before authentication occurs
        delete req.session.returnTo;
        res.redirect(returnTo || "/");
      });
    })(req, res, next);
});


router.get("/logout", (req, res) => {
    req.logOut();
  
    let returnTo = req.protocol + "://" + req.hostname;
    const port = req.connection.localPort;
  
    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo =
        process.env.NODE_ENV === "production"
          ? `${returnTo}/`
          : `${returnTo}:${port}/`;
    }
  
    const logoutURL = new URL(
      `https://${process.env.AUTH0_DOMAIN}/v2/logout`
    );
  
    const searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;
  
    res.redirect(logoutURL);
  });

/**
 * Module Exports
 */
module.exports = router;