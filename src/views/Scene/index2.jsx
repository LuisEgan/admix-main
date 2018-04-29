import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RouteStatus from 'components/Global/RouteStatus';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { login, signup } from 'actions/app';
import {lightBlue800} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ToggleDisplay from 'react-toggle-display';

import * as THREE from 'three';
import * as OBJLoader from 'three-obj-loader';
import React3 from 'react-three-renderer';
import ObjectModel from 'react-three-renderer-objects';
import obj from '../../../assets/obj/scene.obj';

OBJLoader(THREE);

const muiTheme = getMuiTheme({
  palette: {
    textColor: lightBlue800,
    primary1Color: lightBlue800,
    primary2Color: lightBlue800,
    primary3Color: lightBlue800
  }
});

@connect(state => ({
  asyncData: state.app.get('asyncData'),
  asyncError: state.app.get('asyncError'),
  asyncLoading: state.app.get('asyncLoading'),
  counter: state.app.get('counter'),
}))
export default class Login extends Component {

  constructor(props){
    super(props);

    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    this.state = {
      customObjectsEnabled: false,
      scene: {},
      cubeRotation: new THREE.Euler(),
      pixelRatio: 1
    };

    this._onAnimate = this._onAnimate.bind(this);    
  }

  componentDidMount(){
    const { scene } = this.refs;
    this.setState({ scene });
    
    const loader = new THREE.OBJLoader();
    loader.crossOrigin = '';

    const obj = 'http://almora.io/scene.obj';

    loader.load(obj, object => {
      this.setState({
        object,
        pixelRatio: window.devicePixelRatio
      });
    });
  }

  // componentWillReceiveProps(nextProps){
  //   const renderer = this.refs.react3.react3Renderer;

  //   if (!renderer.threeElementDescriptors.__customEnabled) {
  //     renderer.threeElementDescriptors.object3DCustom = new Object3DCustom(renderer);
  //     this.setState({ customObjectsEnabled: true });
  //     renderer.threeElementDescriptors.__customEnabled = true;
  //   }
  // }

  _onAnimate() {
    this.setState({
      cubeRotation: new THREE.Euler(
        this.state.cubeRotation.x + 0.1,
        this.state.cubeRotation.y + 0.1,
        0
      ),
    });
  };

  _onRendererUpdated(renderer) {

  }

  render() {
    const width = 500; // canvas width
    const height = 500; // canvas height
    return (
      <React3
        mainCamera="camera" // this points to the perspectiveCamera which has the name set to "camera" below
        width={width}
        height={height}
        onAnimate={this._onAnimate}
        onRendererUpdated={this._onRendererUpdated}
      >
        <scene ref="scene">
          <perspectiveCamera
            name="camera"
            fov={75}
            aspect={width / height}
            near={0.1}
            far={1000}
            position={this.cameraPosition}
          />

          {/* <mesh
            rotation={this.state.cubeRotation}
          >
            <boxGeometry
              width={1}
              height={1}
              depth={1}
            />
            <meshBasicMaterial
              color={0x00ff00}
            />
          </mesh> */}

          <group name="exampleGroup">
            {this.state.object}
          </group>
        </scene>
      </React3>
    );
  }
}



{/* <React3
  ref="react3"
  mainCamera="camera"
  width={ 500 }
  height={ 300 }
>
  {this.state.customObjectsEnabled && this.state.object && <object3DCustom object={this.state.object} />}
</React3> */}