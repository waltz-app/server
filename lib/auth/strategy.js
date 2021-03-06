"use strict";
const User = require("../models/user"),
      uuid = require("uuid"),
      mixpanelHelpersMaker = require("../mixpanel"),
      GithubStrategy = require("passport-github2");

// github strategy
module.exports = function(mixpanel) {
  const mixpanelHelpers = mixpanelHelpersMaker(mixpanel);
  return new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  }, function(access_token, refresh_token, profile, done) {
    let user = {
      github_id: profile.id,
      access_token: access_token,
      refresh_token: refresh_token,
      username: profile.username,
      provider: profile.provider,
      profile_url: profile.profileUrl,
      badge_token: uuid.v4(), // generate a badge token to stand in for auth
      email: profile.emails ? profile.emails[0].value : profile.email,
      name: profile.displayName,
      avatar: profile._json.avatar_url,
    };

    User.findOne({github_id: profile.id}, (err, existing_user) => {
      if (err) {
        return done(err);
      } else if (existing_user) {
        return done(null, existing_user);
      } else {
        (new User(user)).save((err, new_user) => {
          // track new signups
          mixpanelHelpers.trackOAuthCallback(new_user);

          // send a welcome mailer
          User.sendWelcomeMailer(new_user);
          return done(err, new_user);
        });
      }
    });
  });
}
