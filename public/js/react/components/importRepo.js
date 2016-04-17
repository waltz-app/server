import React from 'react';
import {connect} from 'react-redux';
import _ from "underscore";
import {RepoComponent} from './repo';
import {
  importFromGithubRepo,
  requestAllUserRepos,
  askUserToCreateNewTimecard,
  changeStagingTimecardData,
} from '../actions/repo';
import {Modal, Button, Input} from 'react-bootstrap';
import Loading from './loading';
import {reduxForm} from 'redux-form';
import {CompactPicker as ColorPicker} from 'react-color';

export function createNewTimecardModal({
  confirm_timecard_for,
  timecard_template,

  confirmNewTimecard,
  changeStagingTimecardData,
  importNewRepo,
}) {
  return <Modal
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
        <div className="modal-new-timecard">
          <img src="/img/add_timecard_web.svg" className="center-block" />
          <p>
            We'll make a commit to this repository's <strong>
              {confirm_timecard_for.default_branch}
            </strong> branch with a base timecard that you can customize below.
          </p>

          {/* edit the timecard name and description before adding */}
          <Input
            type="text"
            placeholder={confirm_timecard_for.repo}
            label="Project Name"
            onChange={changeStagingTimecardData("name")}
          />
          <Input
            type="text"
            placeholder={confirm_timecard_for.desc}
            label="Project Tagline"
            onChange={changeStagingTimecardData("tagline")}
          />

          {/* Primary and Secondary Colors */}
          <div className="color-picker">
            <label>Primary Color</label>
            <ColorPicker
              color={timecard_template.primaryColor}
              onChangeComplete={changeStagingTimecardData("primaryColor")}
            />
          </div>

          {/* Create a timecard on the default branch */}
          <Button bsStyle="primary" onClick={importNewRepo(confirm_timecard_for, true, timecard_template)}>
            Create new timecard
          </Button>
      </div>
    </Modal.Body>
  </Modal>;
}

const ImportRepoComponent = ({
  discovered_repos,
  confirm_timecard_for,
  repo_import_page,
  new_timecard_staging,
  user,
  organisations,

  importNewRepo,
  toImportRepoPage,
  confirmNewTimecard,
  changeStagingTimecardData,
}) => {
  {/* confirm adding a new timecard to a repository */}
  let newTimecardModal;
  if (confirm_timecard_for) {
    newTimecardModal = createNewTimecardModal({
      confirm_timecard_for,
      /*
         The data that will be used to formulate the new timecard.
         By default, start with info that is within the current repo and extend
         it as needed to include user-included data.
         */
      timecard_template: {
        name: new_timecard_staging.name || confirm_timecard_for.repo,
        tagline: new_timecard_staging.tagline || confirm_timecard_for.desc,
        primaryColor: new_timecard_staging.primaryColor || confirm_timecard_for.primaryColor || "#51c4c4",
        secondaryColor: new_timecard_staging.secondaryColor || confirm_timecard_for.secondaryColor,
      },

      changeStagingTimecardData,
      importNewRepo,
      confirmNewTimecard,
    });
  }

  let body;
  if (_.isEmpty(discovered_repos)) {
    body = <Loading spinner />
  } else {
    body = <div>
      <img className="header" src="/img/import_repo_header.svg" />

      <ul className="repos">
        {discovered_repos.map((repo, ct) => {
          return <RepoComponent
            key={ct}
            repo={repo}
            selected={false}
          >
            {
              repo.has_timecard ? 
                <button
                  className="btn btn-success btn-pick-me"
                  onClick={importNewRepo(repo)}
                >
                  <i className="fa fa-plus-square" />
                </button>
              :
                <button
                  className="btn btn-info btn-pick-me"
                  onClick={confirmNewTimecard(repo.user, repo.repo)}
                >
                  <i className="fa fa-upload" />
                </button>
            }
          </RepoComponent>;
        })}
      </ul>
      <button
        className="btn btn-primary btn-load-more"
        onClick={toImportRepoPage(_.isEmpty(discovered_repos) ? 0 : ++repo_import_page)}
      >Load More Repositories</button>
    </div>;
  }

  return <div className="repo-details repo-details-import">
    {newTimecardModal}
    {body}
  </div>;
}

let ImportRepo = connect((store, ownProps) => {
  // first, filter out all ther repos that already are added
  let filtered_discovered_repos = store.discovered_repos.filter((repo) => {
    return !store.repos.some((i) => {
      return i.user === repo.user && i.repo === repo.repo;
    });
  });

  return {
    // group the discovered repos by their respective user
    discovered_repos: filtered_discovered_repos,
    repo_import_page: store.discovered_repos_page,

    // for repos that don't already have a timecard, give the user an option to
    // add one.
    confirm_timecard_for: filtered_discovered_repos.find((i) => {
      return (
        store.discovered_repo_new_timecard &&
        i.user === store.discovered_repo_new_timecard[0] &&
        i.repo === store.discovered_repo_new_timecard[1]
      );
    }),
    new_timecard_staging: store.new_timecard_staging,
    user: store.user,
  };
}, (dispatch, ownProps) => {
  return {
    importNewRepo(repo, createTimecard, timecardTempl) {
      return () => dispatch(importFromGithubRepo(repo, createTimecard, timecardTempl));
    },
    toImportRepoPage(page) {
      return () => dispatch(requestAllUserRepos(page));
    },
    confirmNewTimecard(user, repo) {
      return () => dispatch(askUserToCreateNewTimecard(user, repo));
    },
    changeStagingTimecardData(name) {
      return (event) => {
        if (event.target && event.target.value) { // text inputs
          dispatch(changeStagingTimecardData(name, event.target.value));
        } else if (event.hex) { // color pickers
          dispatch(changeStagingTimecardData(name, `#${event.hex}`));
        } else {
          dispatch(changeStagingTimecardData(name, event));
        }
      };
    },
  };
})(ImportRepoComponent);

export default ImportRepo;
