import React, { Component } from "react";
import PropTypes from "prop-types";
import Progress from "react-progressbar";

import { load_webgl } from "../../actions/app";

import * as THREE from "three";
import * as OBJLoader from "three-obj-loader";
import * as MTLLoader from "three-mtl-loader";
import { Pass } from "postprocessing";

import TrackballControls from "../../../assets/webgl/modules/three-trackballcontrols";

export default class WebGLScene extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    isLoad_webgl: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.windowMultiplier = 1;

    this.state = {
      sceneMounted: false,
      isMouseOnPanel: false,
      status: true,
      animate: false,
      loadingProgress: null,
      loadingError: null,
      selectedScene: {},
      postProcessingSet: false,
      eventListenersSet: false,
      clickedPlacement: {}
    };

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.mountWebGL = this.mountWebGL.bind(this);
    this.unmountWebGL = this.unmountWebGL.bind(this);

    //EVENT LISTENERS
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onObjectClick = this.onObjectClick.bind(this);

    // SETUP
    this.setCamera = this.setCamera.bind(this);
    this.setScene = this.setScene.bind(this);
    this.setRenderer = this.setRenderer.bind(this);
    this.setEventListeners = this.setEventListeners.bind(this);
    this.setPostProcessing = this.setPostProcessing.bind(this);

    //CONTROLS
    this.enableControls = this.enableControls.bind(this);
    this.disableControls = this.disableControls.bind(this);

    // SCENE
    this.selectScene = this.selectScene.bind(this);
    this.loadScene = this.loadScene.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.clear = this.clear.bind(this);

    // POST-PROCESSING
    this.checkIntersection = this.checkIntersection.bind(this);
    this.addSelectedObject = this.addSelectedObject.bind(this);

    // if (!props.isLoad_webgl) {
    window.THREE = THREE;
    window.THREE.Pass = Pass;
    // }
  }

  componentWillMount() {
    const { dispatch, isLoad_webgl } = this.props;

    // if (!isLoad_webgl) {
    // LOAD SCRIPTS
    const scripts = [
      "CopyShader.js",
      "FXAAShader.js",
      "EffectComposer.js",
      "RenderPass.js",
      "ShaderPass.js",
      "PointerLockControls.js",
      "OutlinePass.js"
    ];

    scripts.forEach(script => {
      const s = document.createElement("script");
      s.src = require(`!!url-loader!../../../assets/webgl/js/${script}`);
      s.async = true;
      document.body.appendChild(s);
    });
    // dispatch(load_webgl());
    // }
  }

  /////////////////////////////////////
  /////////////////////////////////////

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
    if (!!this.controls) {
      this.controls.update();
    }
  }

  /////////////////////////////////////
  /////////////////////////////////////

  // =====================
  // <EVENT LISTENERS>
  // =====================
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer &&
      this.renderer.setSize(
        width * this.windowMultiplier,
        height * this.windowMultiplier
      );
    this.composer &&
      this.composer.setSize(
        width * this.windowMultiplier,
        height * this.windowMultiplier
      );

    this.effectFXAA &&
      this.effectFXAA.uniforms["resolution"].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
      );
  }

  onTouchMove(event) {
    let x, y;

    if (event.changedTouches) {
      x = event.changedTouches[0].pageX;
      y = event.changedTouches[0].pageY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    this.mouse.x = x / (window.innerWidth * this.windowMultiplier) * 2 - 1;
    this.mouse.y = -(y / (window.innerHeight * this.windowMultiplier)) * 2 + 1;

    const intersects = this.checkIntersection();

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      // this.addSelectedObject(selectedObject);
    }
  }

  onObjectClick(e) {
    e.stopImmediatePropagation();
    const { isMouseOnPanel } = this.state;

    // Check if mouse is on one of the side panels and avoid clicking on an object if so
    if (!isMouseOnPanel) {
      const intersects = this.checkIntersection();

      if (intersects.length > 0 && !!intersects[0].object.material.color) {
        const intersected = intersects[0].object;
        if (intersected.name.includes("__advirObj__")) {
          // Change previous intersected to original material (if there's a previous)
          if (this.intersected) {
            this.intersected.material = this.intersected.currentMaterial;
          }
          // Store new intersected
          this.intersected = intersected;
          this.intersected.currentMaterial = this.intersected.material;

          const material = new THREE.MeshBasicMaterial({ color: "#FF0000" });
          intersected.material = material;
        }
      }
    }
  }
  // =====================
  // </EVENT LISTENERS>
  // =====================

  /////////////////////////////////////
  /////////////////////////////////////

  // =====================
  // <SETUP>
  // =====================
  setCamera() {
    const { THREE, innerWidth, innerHeight } = window;
    const camera = new THREE.PerspectiveCamera(
      45,
      innerWidth / innerHeight,
      0.1,
      100
    );
    // camera.position.set(-4.1, 7.2, 4.2);
    this.camera = camera;
  }

  setScene() {
    const { THREE } = window;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    // LIGHTS
    scene.add(new THREE.AmbientLight(0xaaaaaa, 0.2));
    const light = new THREE.DirectionalLight(0xddffdd, 0.6);
    light.position.set(1, 1, 1);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    const d = 10;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;
    scene.add(light);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    // GROUND
    const groundGeo = new THREE.PlaneBufferGeometry(1000, 1000);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x050505
    });
    groundMat.color.setHSL(0.095, 1, 0.75);

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // SKYDOME
    const vertexShader =
      "varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }";
    const fragmentShader =
      "uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main() { float h = normalize( vWorldPosition + offset ).y; gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 ); }";
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 0 },
      exponent: { value: 0.6 }
    };
    uniforms.topColor.value.copy(hemiLight.color);

    scene.fog.color.copy(uniforms.bottomColor.value);

    const skyGeo = new THREE.SphereGeometry(300, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    this.scene = scene;
  }

  setRenderer() {
    const { THREE, innerWidth, innerHeight } = window;
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(
      innerWidth * this.windowMultiplier,
      innerHeight * this.windowMultiplier
    );
    this.renderer = renderer;
  }

  setEventListeners() {
    const { eventListenersSet } = this.state;

    if (!eventListenersSet) {
      window.addEventListener("resize", this.onWindowResize, false);
      window.addEventListener("mousemove", this.onTouchMove);
      window.addEventListener("touchmove", this.onTouchMove);
      // window.addEventListener("click", this.onObjectClick);
      this.setState({ eventListenersSet: true });
    }
  }

  setPostProcessing() {
    // const { THREE, innerWidth, innerHeight } = window;
    const { postProcessingSet } = this.state;

    if (!postProcessingSet) {
      this.composer = new THREE.EffectComposer(this.renderer);

      const renderPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      const outlinePass = new THREE.OutlinePass(
        new THREE.Vector2(innerWidth, innerHeight),
        this.scene,
        this.camera
      );
      outlinePass.edgeStrength = 10;
      outlinePass.edgeGlow = 0;
      outlinePass.edgeThickness = 1;
      outlinePass.pulsePeriod = 0;
      outlinePass.visibleEdgeColor = new THREE.Color("#ff0000");
      outlinePass.hiddenEdgeColor = new THREE.Color("#190a05");
      this.outlinePass = outlinePass;
      this.composer.addPass(outlinePass);

      const effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
      effectFXAA.uniforms["resolution"].value.set(
        1 / innerWidth,
        1 / innerHeight
      );
      effectFXAA.renderToScreen = true;
      this.effectFXAA = effectFXAA;
      this.composer.addPass(effectFXAA);

      this.setState({ postProcessingSet: true });
    }
  }
  // =====================
  // </SETUP>
  // =====================

  /////////////////////////////////////
  /////////////////////////////////////

  // =====================
  // <CONTROLS>
  // =====================
  enableControls() {
    const controls = new TrackballControls(this.camera);
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    controls.panSpeed = 1.2;
    controls.noZoom = false;
    controls.noPan = false;
    controls.dampingFactor = 1.25;
    controls.staticMoving = true;
    controls.keys = [65, 83, 68];
    // controls.enableDamping = true;
    // controls.dynamicDampingFactor = 0.8;

    // const radius = 5;
    // controls.minDistance = radius * 1.1;
    // controls.maxDistance = radius * 100;
    controls.target = new THREE.Vector3(0, 0, -1);
    this.controls = controls;
    this.TrackballControlsDisableWheel();
    // this.controls = null;
  }

  disableControls() {
    this.controls.dispose();
    this.controls = null;
  }

  TrackballControlsEnableWheel() {
    this.controls.startWheel();
  }

  TrackballControlsDisableWheel() {
    this.controls.stopWheel();
  }

  enablePointerLockControls() {
    const { scene, camera } = this;

    const controls = new THREE.PointerLockControls(camera, scene);

    scene.add(controls.getObject());

    this.controls = controls;
    this.scene = scene;
  }

  noPointerLockControlsRotation() {
    this.controls && this.controls.noRotation();
  }
  yesPointerLockControlsRotation() {
    this.controls && this.controls.yesRotation();
  }
  // =====================
  // </CONTROLS>
  // =====================

  /////////////////////////////////////
  /////////////////////////////////////

  // =====================
  // <SCENE>
  // =====================
  selectScene(selectedScene) {
    this.setState({ selectedScene });
  }

  loadScene() {
    const { THREE, innerWidth, innerHeight } = window;
    const { sceneMounted, selectedScene } = this.state;
    const { isSceneLoaded, isLoadingScene } = this.props;
    // const { userData: { userObjects }, selectedApp: { scenes } } = this.props;
    this.enablePointerLockControls();

    // Check is there was a scene loaded
    if (!!this.group) {
      this.clear();
    }

    if (!sceneMounted) {
      this.mount.appendChild(this.renderer.domElement);
      this.setEventListeners();
    }
    // this.setPostProcessing();

    const obj3d = new THREE.Object3D();

    // GET .OBJ AND .MTL URL
    // const dns = "https://s3.us-east-2.amazonaws.com/advirbucket";
    // let url =
    //   "+ /userId + ?/appId? + /sceneId <- Material folder for each scene";
    // let objUrl = "",
    //   mtlUrl = "";
    // userObjects.some(obj => {
    //   if (obj.includes(selectedScene.name)) {
    //     objUrl = obj;
    //     return true;
    //   }
    // });
    // mtlUrl = objUrl.split(".")[0] + ".mtl";

    // LOAD OBJECT
    const onProgress = xhr => {
      const loadingProgress = Math.round(xhr.loaded / xhr.total * 100);
      this.setState({ loadingProgress });
      isLoadingScene(true);
    };

    const onError = error => {
      const loadingProgress = null;
      const loadingError = "Error! Scene could not be loaded";
      this.setState({ loadingProgress, loadingError });
    };

    const onLoad = object => {
      // Disable loading feedback
      const loadingProgress = null;
      const loadingError = null;

      this["sceneParentObj"] = object;

      object.name = "scene 1";
      object.position.set(0, 0, 0);
      // obj3d.add(object);
      this.scene.add(object);
      object.traverse(
        function(child) {
          if (
            child instanceof THREE.Mesh &&
            child.name.includes("__advirObj__")
          ) {
            let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            child.material = material;
            this[child.name] = child;
            // outlinePass.selectedObjects.push( child );
            // this.addSelectedObjectOnLoad( child );
          }
        }.bind(this)
      );

      this.setState({ loadingProgress, loadingError, sceneMounted: true });
      isLoadingScene(false);
      isSceneLoaded();
    };

    const obj = `exportObjScene1.obj`;
    const mtl = `exportObjScene1.mtl`;
    const renderPath = `../../../assets/webgl/modelTest/`;

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(renderPath);
    mtlLoader.load(mtl, materials => {
      materials.preload();
      const objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(renderPath);
      objLoader.load(
        obj,
        onLoad.bind(this),
        onProgress.bind(this),
        onError.bind(this)
      );
    });

    // this.group.add(obj3d);
    // this.scene.add(this.group);
  }

  renderScene() {
    this.renderer.autoClear = true;
    this.renderer.setClearColor(0xfff0f0);
    this.renderer.setClearAlpha(0.0);
    this.scene.updateMatrixWorld();
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  clear() {
    const { scene } = this;
    var selectedObject = scene.getObjectByName("scene 1");
    scene.remove(selectedObject);
  }

  moveCamera(selectedPlacement) {
    this.sceneParentObj.updateMatrixWorld();

    this["__advirObj__banner1"].material.color.setHex(0xff0000);
    const material = new THREE.MeshBasicMaterial({ color: "#FF0000" });
    this["__advirObj__banner1"].material = material;

    // this["__advirObj__banner1"].translateX(5);

    this["__advirObj__banner1"].updateMatrixWorld();

    // const newPosition = new THREE.Vector3();
    // newPosition.setFromMatrixPosition(this["__advirObj__banner1"].matrixWorld);
    // this.controls.target = this["__advirObj__banner1"].getWorldPosition();

    // this["__advirObj__banner1"].updateMatrixWorld();

    let position = new THREE.Vector3().copy(
      this["__advirObj__banner1"].position
    );
    this["__advirObj__banner1"].localToWorld(position);
    this.group.updateMatrixWorld();
    this.camera.lookAt(this["__advirObj__banner1"].getWorldPosition());
    this.camera.lookAt(this["__advirObj__banner1"]);
  }
  // =====================
  // </SCENE>
  // =====================

  /////////////////////////////////////
  /////////////////////////////////////

  // =====================
  // <POST-PROCESSING>
  // =====================

  checkIntersection() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects([this.scene], true);
  }

  addSelectedObject(object) {
    this.selectedObjects = [];
    if (object.name.includes("__advirObj__")) {
      this.selectedObjects.push(object);
    }
    this.outlinePass.selectedObjects = this.selectedObjects;
  }

  // =====================
  // </POST-PROCESSING>
  // =====================

  /////////////////////////////////////
  /////////////////////////////////////

  componentDidMount() {
    this.mountWebGL();
  }

  mountWebGL() {
    const { THREE, innerWidth, innerHeight } = window;

    OBJLoader(THREE);
    MTLLoader(THREE);

    this.setScene();
    this.setCamera();
    this.setRenderer();

    this.group = new THREE.Group();
    this.selectedObjects = [];
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    // this.enableControls();

    this.start();
  }

  unmountWebGL() {
    const { sceneMounted } = this.state;
    this.stop();

    if (sceneMounted) {
      this.mount.removeChild(this.renderer.domElement);
      window.removeEventListener("resize", this.onWindowResize, false);
      window.removeEventListener("mousemove", this.onTouchMove);
      window.removeEventListener("touchmove", this.onTouchMove);
      window.removeEventListener("click", this.onObjectClick);
      // this.TrackballControlsDisableWheel();
      this.setState({ sceneMounted: false });
    }
  }

  componentWillUnmount() {
    this.unmountWebGL();
  }

  render() {
    const {
      loadingProgress,
      loadingError,
      selectedScene,
      clickedPlacement,
      sceneMounted
    } = this.state;

    const barColor = "#157cc1";

    return (
      <div className="WebGLScene">
        {/* {loadingProgress && (
          <div id="scene-loading" className="progressbar-container">
            <Progress completed={loadingProgress} color={barColor} />
            {`${loadingProgress}% loaded`}
          </div>
        )}

        {loadingError && (
          <div id="scene-loading" className="progressbar-container">
            {`${loadingError}`}
          </div>
        )} */}

        <div
          ref={mount => {
            this.mount = mount;
          }}
        />
      </div>
    );
  }
}
