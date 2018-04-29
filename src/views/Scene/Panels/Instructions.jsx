import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class Instructions extends Component {
    static propTypes = {
        slidesManager: PropTypes.func,
        sceneClicked: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        // If true = panel is slided in
        this.state = { slidedIn: false }

        this.toggleSlide = this.toggleSlide.bind(this);
    }

    toggleSlide() {
        const { slidesManager } = this.props;
        const slidedIn = !this.state.slidedIn;
        slidesManager("Instructions");
        this.setState({ slidedIn });
    }

    componentWillReceiveProps(nextProps) {
        const { slidedIn } = this.state;
        const { sceneClicked } = nextProps;
        if ( sceneClicked && !slidedIn ) {
            this.toggleSlide();
        }
    }

    render() {
        const { slidedIn } = this.state;
        const { disableControls, enableControls, sceneClicked } = this.props;

        const slideAnim = slidedIn ? "slideOutTop" : "slideInTop";
        const arrow = slidedIn ? "▼" : "▲";

        
        return (
            <div
                className={`container ${slideAnim}`}
                id="instructions-panel"
            >
                <div className="container">
                    <div className="cc"><h3>Instructions</h3></div>

                    <hr/>

                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">1. Select your &nbsp;<strong>scene</strong>.</li>
                        <li className="list-group-item">2. Select your &nbsp;<strong>placement</strong> &nbsp;objects.</li>
                        <li className="list-group-item">3. Fill the form for each &nbsp;<strong>placement</strong> &nbsp;object.</li>
                        <li className="list-group-item">4. Once you are done, click on the finish button.</li>
                    </ul>

                    <hr/>

                    <div className="cc"><h3>Scene navigation controls</h3></div>
                    <div className="cc">MOVE mouse & press LEFT/A: rotate, MIDDLE/S: zoom, RIGHT/D: pan</div>
                </div>

                <div id="instructions-toggle-btn" className="cc" onClick={this.toggleSlide}>{arrow}</div>
            </div>
        )
    }
}