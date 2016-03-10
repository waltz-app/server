import React from 'react';
import {connect} from 'react-redux';
import _ from "underscore";
import {RepoComponent} from './repo';
import {
  importFromGithubRepo,
  requestAllUserRepos,
  askUserToCreateNewTimecard,
} from '../actions/repo';
import {Modal, Button} from 'react-bootstrap';

const ImportRepoComponent = ({
  discovered_repos,
  confirm_timecard_for,
  repo_import_page,

  importNewRepo,
  toImportRepoPage,
  confirmNewTimecard,
}) => {
  {/* confirm adding a new timecard to a repository */}
  let createNewTimecardModal;
  if (confirm_timecard_for) {
    createNewTimecardModal = <Modal
      show={confirm_timecard_for !== null}
      onHide={confirmNewTimecard(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Create a new timecard in&nbsp;
          {confirm_timecard_for.user}/
          <strong>{confirm_timecard_for.repo}</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Create a timecard on the default branch */}
        <Button onClick={importNewRepo(confirm_timecard_for, true)}>
          Create a new timecard on branch <strong>{confirm_timecard_for.default_branch}</strong>
        </Button>
      </Modal.Body>
    </Modal>
  }

  return <div className="repo-details repo-details-import">
    <h2>Import a new Repository</h2>
    {createNewTimecardModal}

    <ul className="repos">
      {Object.keys(discovered_repos).map((key, ct) => {
        return <div key={ct}>
          <h4>{key}</h4>
          {discovered_repos[key].map((repo, ct) => {
            return <RepoComponent
              key={ct}
              repo={repo}
              selected={false}
            >
              {
                repo.has_timecard ? 
                <button className="btn btn-success btn-pick-me" onClick={importNewRepo(repo)}>Import</button> :
                <button
                  className="btn btn-warning disabled btn-pick-me"
                  data-toggle="tooltip"
                  data-placement="left"
                  title="No timecard was found in the default branch. Please run `waltz init` in the repo to create a new timecard."
                  onClick={confirmNewTimecard(ct)}
                >No Timecard</button>
              }
            </RepoComponent>
          })}
        </div>;
      })}
    </ul>

    <button
      className="btn btn-primary btn-load-more"
      onClick={toImportRepoPage(++repo_import_page)}
    >Load More Repositories</button>
  </div>;
}

const ImportRepo  = connect((store, ownProps) => {
  return {
    // group the discovered repos by their respective user
    discovered_repos: _.groupBy(
      // first, filter out all ther repos that already are added
      store.discovered_repos.filter((repo) => {
        return !store.repos.some((i) => {
          return i.user === repo.user && i.repo === repo.repo;
        });
      })
    // then, sort by owner
    , (repo) => repo.user),
    repo_import_page: store.discovered_repos_page,

    // for repos that don't already have a timecard, give the user an option to
    // add one.
    confirm_timecard_for: (Number.isFinite(store.discovered_repo_new_timecard) ?
      store.discovered_repos[store.discovered_repo_new_timecard] :
      null
    )
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo, createTimecard) {
      return () => dispatch(importFromGithubRepo(repo, createTimecard));
    },
    toImportRepoPage(page) {
      return () => dispatch(requestAllUserRepos(page));
    },
    confirmNewTimecard(ct) {
      return () => dispatch(askUserToCreateNewTimecard(ct));
    },
  };
})(ImportRepoComponent);

export default ImportRepo;