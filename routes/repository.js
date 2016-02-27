"use strict";
const repo = require("../lib/repo"),
      ejs = require("ejs"),
      isAuthenticated = require("../lib/is_authenticated"),
      card = require("../lib/card");

// get the repo that is being specified.
function getRepo(req, res, next) {
  if (req.params.username && req.params.repo) {
    repo.getRepoDetails(req, req.params.username, req.params.repo).then((data) => {
      req.parent_repo = data;
      next();
    }).catch((err) => {
      req.parent_repo = {error: true, data: err};
      next();
    });
  } else {
    next();
  }
}

function doError(res, code) {
  return (err) => {
    if (err.code === 404) {
      res.render("error", {
        title: "Error",
        msg: "Either the repository isn't on GitHub, the theme you've specified doesn't exist, or there isn't a <code>.timecard.json</code> file in this repo (on the master branch).<br/>Private repos require a logged-in user, which you can do on our home page."
      });
    } else {
      console.error(err);
      res.status(code).render("error", {
        title: "Error",
        msg: err,
      });
    }
  };
}

    /* GET home page. */
function index(req, res) {
  if (req.user) {
    res.redirect("/app");
    // repo.getUserRepos(req).then((repos) => {
    //   res.render('index_auth', {
    //     title: 'Waltz',
    //     user: req.user,
    //     repos: repos,
    //   });
    // }).catch(doError);
  } else {
    res.render('index', {
      title: 'Waltz',
      user: req.user,
    });
  }
}

// render the page that will load the report in a frame.
function renderReportTemplate(req, res) {
  let ref = req.params.ref || req.parent_repo.default_branch || "master";
  repo.getFileFromRepo(
    req.params.username,
    req.params.repo,
    null,
    ref,
    req.user
  ).then((timecard) => {
    if (card.assertIsCard(timecard)) {
      res.render("report", {
        title: `Invoice for ${req.params.username}/${req.params.repo}`,
        repo: req.parent_repo.error ? {
          full_name: `${req.params.username}/${req.params.repo}`,
        } : req.parent_repo,
        current_ref: ref,
        user: req.user,
      });
    } else {
      res.status(400).send({
        error: "Timecard is malformed.",
      });
    }
  }).catch(doError(res, 404));
}

// get a repo
function doReport(req, res) {
  let ref = req.params.ref || req.parent_repo.default_branch || "master";
  repo.getFileFromRepo(
    req.params.username,
    req.params.repo,
    null,
    ref,
    req.user
  ).then((timecard) => {
    if (card.assertIsCard(timecard)) {
      // make the report
      card.getReportTemplate(timecard.reportFormat || "default").then((template) => {
        let ejs_data = card.getTimecardRenderDetails(timecard),
            report = ejs.render(template, ejs_data),
            rendered_report = report
        res.send(rendered_report);
      }).catch(doError(res, 400));
    } else {
      res.status(400).send({
        error: "Timecard is malformed.",
      });
    }
  }).catch(doError(res, 404));
}

module.exports = {
  getRepo: getRepo,
  doError: doError,
  index: index,
  doReport: doReport,
  renderReportTemplate: renderReportTemplate,
}
