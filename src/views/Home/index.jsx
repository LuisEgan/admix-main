import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { action, async, getApps, getUserData } from 'actions/app';
import CircleSvg from '../../../assets/svg/circle.svg';
import SquareSvg from '../../../assets/svg/square.svg';
import TriangleSvg from '../../../assets/svg/triangle.svg';
import bookImg from '../../../assets/img/book2.jpg';
import { routeCodes } from 'config/routes';

@connect(state => ({
  asyncData: state.app.get('asyncData'),
  asyncError: state.app.get('asyncError'),
  asyncLoading: state.app.get('asyncLoading'),
  counter: state.app.get('counter'),
  accessToken: state.app.get('accessToken'),
  userData: state.app.get('userData'),
  isLoggedIn: state.app.get('isLoggedIn'),
}))
export default class Home extends Component {
  static propTypes = {
    asyncData: PropTypes.object,
    asyncError: PropTypes.string,
    asyncLoading: PropTypes.bool,
    counter: PropTypes.number,
    accessToken: PropTypes.string,
    userData: PropTypes.object,
    isLoggedIn: PropTypes.bool,
    // from react-redux connect
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.handleAsyncButtonClick = this.handleAsyncButtonClick.bind(this);
    this.handleTestButtonClick = this.handleTestButtonClick.bind(this);
  }

  // componentDidMount() {
  //   const { dispatch, accessToken } = this.props;
    
  //   dispatch(getUserData(accessToken));
  //   dispatch(getApps(accessToken));
  // }

  handleAsyncButtonClick() {
    const { dispatch } = this.props;

    dispatch(async());
  }

  handleTestButtonClick() {
    const { dispatch } = this.props;

    dispatch(action());
  }

  render() {
    const {
      asyncData,
      asyncError,
      asyncLoading,
      counter,
      userData,
      isLoggedIn,
      location
    } = this.props;

    if (isLoggedIn) { 
			return <Redirect to={{
				pathname: routeCodes.SETUP,
				state: { from: location }
			}}/>
    }
    
    return (
      <div className="banner-index">
        <div className="container">
          <div className="home-banner-content ht">
            <h1> Welcome, {userData.name} </h1>
            <h2>Your connected apps will appear here.</h2>
            <div className="index-btns">
              <a href="#" className="btn-blue">Download Advir for Unreal</a>
              <NavLink
                exact to={ routeCodes.SETUP }
                className="btn-green"
              >
                Get started
              </NavLink>
              <span></span>
            </div>
          </div>
        </div>
     </div>
    );
  }
}

