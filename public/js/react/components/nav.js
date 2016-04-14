import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {requestAllUserRepos} from '../actions/repo';

export const NavComponent = ({title, logged_in_user, importNewRepo}) => {
  let login_controls = logged_in_user ? <ul className="nav navbar-nav pull-right">
    <li className="dropdown">
      <a
        href="#"
        className="dropdown-toggle"
        data-toggle="dropdown"
        role="button"
        aria-haspopup="true"
        aria-expanded="false"
      >
      {logged_in_user.username} <span className="caret"></span>
      </a>
      <ul className="dropdown-menu">
        <li>
          <Link to="/app/settings">Settings</Link>
        </li>
        <li><a href="/auth/logout">Logout</a></li>
      </ul>
    </li>
  </ul> : <ul className="nav navbar-nav pull-right">
    <li><a href="/login">Login</a></li>
  </ul>;

  return <nav className="navbar">
    <div className="container-fluid">
      <div className="navbar-header">
        <button
          type="button"
          className="navbar-toggle collapsed"
          data-toggle="collapse"
          data-target="#bs-example-navbar-collapse-1"
          aria-expanded="false"
        >
          <span className="sr-only">Toggle navigation</span>
          <i className="fa fa-bars" />
        </button>
        <span className="navbar-brand">
          <Link to="/app/">
            <img src="/img/logo.svg" />
          </Link>
        </span>
      </div>

      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
        <ul className="nav navbar-nav">
          <li><a href="/">Home</a></li>
           <li><Link to="/app/">Repo List</Link></li>
           <li><Link to="/app/import" onClick={importNewRepo}>Import Repo</Link></li>
        </ul>
        {login_controls}
      </div>
    </div>
  </nav>;
}

const Nav = connect((store, props) => {
  return {
    title: "Waltz",
    logged_in_user: store.user,
  };
}, (dispatch, props) => {
  return {
    importNewRepo() {
      dispatch(requestAllUserRepos());
    },
  };
})(NavComponent);

export default Nav;
