"use strict";
const repo = require("../repo"),
      card = require("../card"),
      async = require("async"),
      _ = require("underscore"),
      user_model = require("../models/user"),
      uuid = require("uuid"),
      TIMECARD_PAGE_LENGTH = 20; // the amount of times that are returned per request,

// server/GET_TIMECARD
module.exports = function getTimecard(action, socket) {
  return new Promise((resolve, reject) => {
    repo.getFileFromRepo(action.user, action.repo, null, action.branch, socket.request.user)
    .then((timecard) => {
      if (card.assertIsCard(timecard)) {
        // paginate according to the passed info
        if (typeof action.page !== "undefined") {
          let start = action.page * TIMECARD_PAGE_LENGTH;
          // return them in reverse so they are sorted in
          // reverse-chronological order
          timecard.card = timecard.card.reverse().slice(start, start + TIMECARD_PAGE_LENGTH);
        }

        // get all users in the timecard
        let all_users = timecard.card.map((day) => {
          return day.times.map((t) => t.by);
        });
        let reduced_users = _.compact(_.uniq(_.flatten(all_users)));

        // get all user details
        async.map(reduced_users, (username, done) => {
          repo.getUserMetaFor({user: socket.request.user}, username)
          .then((user) => done(null, user))
          .catch(done);
        }, (err, user_models) => {
          if (err) {
            throw new Error(err);
          } else {
            resolve({
              type: "server/TIMECARD",
              user: action.user,
              repo: action.repo,
              branch: action.branch,
              timecard: timecard,
              users: user_models, // user models that are associated

              page: action.page,
              canpaginateforward: timecard.card.length >= TIMECARD_PAGE_LENGTH,
            });
          }
        });
      } else {
        // uhh, the timecard doesn't validate
        throw new Error("Timecard isn't a timecard.");
      }
    }, (err) => {
      throw new Error(err);
    });
  });
}