"use strict";

// open the repo import dialog
export function repoImportDialogOpen(state = false, action) {
  if (action.type === "server/DISCOVER_REPOS") {
    return true;
  } else if (action.type === "SELECT_REPO") {
    return false;
  } else if (action.type === "server/REPO_IMPORT") {
    return true;
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
