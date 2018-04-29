import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import { routeCodes } from 'config/routes';
import PropTypes from 'prop-types';
import { placement } from 'actions/app';


@connect(state => ({
    selectedApp: state.app.get('selectedApp')
}))
export default class Placement extends Component {
    static propTypes = {
        dispatch: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.setPlacement = this.setPlacement.bind(this);
    }

    setPlacement(placementOpt) {
        const { dispatch } = this.props;
        dispatch(placement(placementOpt));
    }

    render() {
        const { selectedApp, location } = this.props;

        if ( !!(selectedApp.placementOpt) ) {
			return <Redirect to={{
				pathname: routeCodes.SCENE,
				state: { from: location }
            }}/>
        }
        
        return (
            <div className="my-app-section placement-section">
                <div className="container">
                    <h2>Select ad source for <b>Escape Room VR</b></h2>
                    <div className="row">
                        <div className="col-md-5 col-md-offset-1">
                            <div className="public">
                                <h3>Public (recommended) &nbsp;<i className="fa fa-question-circle-o" aria-hidden="true"></i></h3>
                                <p>Connect to trusted 3rd party advertising or affiliate networks. Ideal for small or indie developers.</p>
                                <a href="#" onClick={this.setPlacement.bind(null, 'public')}>Go to Setup</a>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="public private ">
                                <h3>Private  &nbsp;<i className="fa fa-question-circle-o" aria-hidden="true"></i></h3>
                                <p>Create your own marketplace and sell directly to your own advertisers. Ideal for agencies and large developers.</p>
                                <a href="#" onClick={this.setPlacement.bind(null, 'private')}>Go to Setup</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
  }
}
