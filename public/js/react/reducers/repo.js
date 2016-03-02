"use strict";

// open the repo import dialog
export function repoImportDialogOpen(state = false, action) {
  if (action.type === "server/DISCOVER_REPOS") {
    return true;
  } else if (action.type === "SELECT_REPO") {
    return false;
  } else if (action.type === "server/REPO_IMPORT") {
    return false;
  } else {
    return state;
  }
}

// only handles the repos part of the state
export function repos(state = [], action) {
  switch(action.type) {

    // initialize all repos at start
    case "server/INIT":
      return action.repos;

    // update the repo
    case "PUT_REPO":
    case "server/PUT_REPO":
      if (typeof action.index === "undefined") {
        return state.concat([action.repo]);
      } else {
        state[action.index] = action.repo;
        return state;
      }

    default:
      return state;
  }
}

// make a new repo active in the sidebar selector
export function activeRepo(state = null, action) {
  if (action.type === "SELECT_REPO") {
    return action.index;

  // when importing a new repo, deselect the current entry
  } else if (action.type === "server/DISCOVER_REPOS") {
    return null;

  // when an external route change happens
  // } else if (action.type === "@@router/LOCATION_CHANGE") {
  //   return 0;
  } else {
    return state;
  }
}

export function discoveredRepos(state = [], action) {
  if (action.type === "server/REPOS_DISCOVERED") {
    return action.repos;
  } else {
    return state;
  }
}

export function repoDetails(state = {branch: null}, action) {
  if (action.type === "CHANGE_BRANCH") {
    return Object.assign({}, state, {
      branch: action.branch,
      timecard: null, // reset the timecard so the view reloads
    });

  // on repo change, set the branch to the default
  // and copy the branches into the repo details
  } else if (action.type === "SELECT_REPO") {
    return Object.assign({}, state, {
      branch: null,
      branches: null,
      timecard: null,
    });

  // the current repo's branches
  } else if (action.type === "server/BRANCHES_FOR") {
    return Object.assign({}, state, {branches: action.branches});

  // the timecard assosiated with a repository
  } else if (action.type === "server/TIMECARD") {
    if (
      action.user === state._comesfrom[0] &&
      action.repo === state._comesfrom[1] &&
      action.branch === state._comesfrom[2]
    ) {
      // merge the new repo query and the old, since they belong to the same repo
      return Object.assign({}, state, {
        timecard: Object.assign({}, action.timecard, {
          card: state.timecard.card.concat(action.timecard.card),
        }),
        users: state.users.concat(action.users),

        // the page we are on, and whether we can advance to the next page
        _page: action.page,
        _canpaginateforward: action.canpaginateforward,
      });
    } else {
      // the repo that we are referencing changed, so update atomically
      return Object.assign({}, state, {
        timecard: action.timecard,
        users: action.users,

        _comesfrom: [action.user, action.repo, action.branch], // mark what timecard this comes from for later
        _page: action.page || 0,
        _canpaginateforward: action.canpaginateforward,
      });
    }

  } else {
    return state;
  }
}
