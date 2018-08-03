import React, { Component } from "react";
import PropTypes from "prop-types";
import C from "../../utils/constants";

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
         eventListenersSet: false
      };

      // THREEJS BASICS
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
      this.enableOrbitControls = this.enableOrbitControls.bind(this);
      this.addEventListeners = this.addEventListeners.bind(this);
      this.disposeEventListeners = this.disposeEventListeners.bind(this);

      // SCENE
      this.selectScene = this.selectScene.bind(this);
      this.loadScene = this.loadScene.bind(this);
      this.renderScene = this.renderScene.bind(this);
      this.clear = this.clear.bind(this);

      // POST-PROCESSING
      this.checkIntersection = this.checkIntersection.bind(this);
      this.addSelectedObject = this.addSelectedObject.bind(this);

      // VARIABLES
      this.xhrCurrentTarget = "";
      this.abortedObjs = {};
      this.lastObjURL = "";
   }

   componentDidMount() {
      const { THREE } = window;

      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      this.selectedObjects = [];

      this.intersected = null;
   }

   componentWillUnmount() {
      this.unmountWebGL();
   }

   // THREEJS BASICS ------------------------------------

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

   renderScene() {
      // this.renderer.autoClear = true;
      // this.renderer.setClearColor(0xfff0f0);
      // this.renderer.setClearAlpha(0.0);
      this.scene.updateMatrixWorld();
      if (this.composer) {
         this.composer.render();
      } else {
         this.renderer.render(this.scene, this.camera);
      }
   }

   TJSquickSetup() {
      this.setCamera();
      this.setScene();
      this.setRenderer();
      this.setLights();
      this.setGround();
      this.setState({ TJSsetup: true });
   }

   TJSreset() {
      const { THREE } = window;
      this.camera = null;
      this.scene = null;
      this.renderer = null;
      this.composer = null;
      this.frameId = null;
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      this.selectedObjects = [];
      this.intersected = null;
      this.setState({ TJSsetup: false });
   }

   setCamera() {
      const { THREE, innerWidth, innerHeight } = window;

      const camera = new THREE.PerspectiveCamera(
         75,
         innerWidth / innerHeight,
         1,
         1000
      );

      // Setting a new camera position will affect the controls rotation
      camera.position.set(0, 20, 20);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      this.camera = camera;
   }

   setScene() {
      const { THREE } = window;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcccccc);
      scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
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

   setLights() {
      const { THREE } = window;

      // LIGHTS
      var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
      light.position.set(0.5, 1, 0.75);
      this.scene.add(light);
   }

   setGround() {
      const { THREE } = window;

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
      this.scene.add(ground);
   }

   // EVENT LISTENERS ------------------------------------

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

      this.mouse.x = (x / (window.innerWidth * this.windowMultiplier)) * 2 - 1;
      this.mouse.y =
         -(y / (window.innerHeight * this.windowMultiplier)) * 2 + 1;

      const intersects = this.checkIntersection();

      if (intersects.length > 0) {
         //  const selectedObject = intersects[0].object;
         // this.addSelectedObject(selectedObject);
      }
   }

   onObjectClick(e) {
      const { THREE } = window;

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

               const material = new THREE.MeshBasicMaterial({
                  color: "#FF0000"
               });
               intersected.material = material;
            }
         }
      }
   }

   // SETUP ------------------------------------

   setEventListeners() {
      const { eventListenersSet } = this.state;

      if (!eventListenersSet) {
         window.addEventListener("resize", this.onWindowResize, false);
         window.addEventListener("mousemove", this.onTouchMove);
         window.addEventListener("touchmove", this.onTouchMove);
         window.addEventListener("click", this.onObjectClick);
         this.setState({ eventListenersSet: true });
      }
   }

   setPostProcessing() {
      const { THREE, innerWidth, innerHeight } = window;
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

   // CONTROLS ------------------------------------

   //    gotta include <script src="./THREEJS/PointerLockControls.min.js"></script>   in /public/index.html for this to work
   enablePointerLockControls({ iYawX, iYawY, iYawZ, iYawRot, iPitchRot }) {
      const { THREE } = window;

      // Position is given by the yawObject position, the camera doesn't move! (it must be at (0,0,0))
      // lookAt can be set by

      const controls = new THREE.PointerLockControls(this.camera, {
         iYawX,
         iYawY,
         iYawZ,
         iYawRot,
         iPitchRot
      });

      this.scene.add(controls.getYawObject());

      this.controls = controls;
      this.arePointerControlsEnabled = true;
   }

   //    gotta include <script src="./THREEJS/OrbitControls.min.js"></script> in /public/index.html for this to work
   enableOrbitControls() {
      const { THREE } = window;

      // Position is given by the camera position
      // lookAt can be set by controls.target.set

      const controls = new THREE.OrbitControls(
         this.camera,
         undefined,
         this.scene
      );
      controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      controls.dampingFactor = 1.5;
      controls.zoomSpeed = 5;
      controls.zoomSpeedOriginal = 5;
      controls.target.set(0, 0, 0);
      this.controls = controls;
   }

   //    gotta include <script src="./THREEJS/TrackballControls.min.js"></script>   in /public/index.html for this to work
   enableTrackBallControls() {
      const { THREE } = window;

      const camera = new THREE.PerspectiveCamera(
         60,
         window.innerWidth / window.innerHeight,
         1,
         1000
      );
      camera.position.z = 5;

      const controls = new THREE.TrackballControls(camera);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.noZoom = false;
      controls.noPan = false;
      controls.staticMoving = true;
      controls.dynamicDampingFactor = 0.3;
      controls.keys = [65, 83, 68];

      this.controls = controls;
      this.camera = camera;
      this.areTrackBallControlsEnabled = true;
   }

   addEventListeners() {
      this.controls && this.controls.addEventListeners();
   }

   disposeEventListeners() {
      this.controls && this.controls.dispose();
   }

   // SCENE ------------------------------------
   selectScene(selectedScene) {
      this.setState({ selectedScene });
   }

   loadScene(selectedScene) {
      const { xhrCurrentTarget } = this;
      const { THREE } = window;

      const {
         userData,
         confirmSceneLoaded,
         isLoadingScene,
         progressLoadingScene
      } = this.props;

      const { TJSsetup, sceneMounted, isSceneLoading } = this.state;

      if (isSceneLoading) {
         xhrCurrentTarget.abort();
         this.abortedObjs[this.lastObjURL] = "Not loaded";
      }

      const userId = userData._id;

      // Check if there was a scene loaded
      if (TJSsetup) {
         this.clear({ loadScene: true, selectedScene });
         confirmSceneLoaded(false);
         return;
      }

      this.TJSquickSetup();
      this.start();

      // this.enablePointerLockControls(PLControlsConfig);
      this.enableOrbitControls({ lookAtX: 70, lookAtY: 0, lookAtZ: 0 });

      // GET .OBJ AND .MTL URL
      const dns = "https://s3.us-east-2.amazonaws.com/advirbucket";
      let renderPath = `${dns}/${userId}/${selectedScene._id}/`;

      let objTimestamp = Date.now();

      let objUrl = `${selectedScene.name}.obj`;
      const objUrlWithoutTimestamp = objUrl;
      let mtlUrl = `${selectedScene.name}.mtl`;

      if (this.abortedObjs[objUrlWithoutTimestamp]) {
         if (this.abortedObjs[objUrl] === "Not loaded") {
            // new timestamp for fetching a 'new' url
            objUrl += `?${objTimestamp}`;
         } else {
            // if the obj was once aborted but its value is a string, then that's the timesptamp that was used for fully load (the second time the object was attempted to load)
            objUrl += `?${this.abortedObjs[objUrlWithoutTimestamp]}`;
         }
      }

      this.lastObjURL = objUrlWithoutTimestamp;

      if (userData.email.value === "eganluis@gmail.com") {
         renderPath = "./modelTest/";
         objUrl = `exportObjScene1.obj`;
         mtlUrl = `exportObjScene1.mtl`;
      }

      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.setPath(renderPath);
      mtlLoader.setCrossOrigin(true);

      // MTL LOADER FUNCTIONS

      const MTLonLoad = materials => {
         materials.preload();
         const objLoader = new THREE.OBJLoader();
         objLoader.setMaterials(materials);
         objLoader.setPath(renderPath);

         objLoader.load(
            objUrl,
            OBJonLoad.bind(this),
            OBJonProgress.bind(this),
            OBJonError.bind(this)
         );
      };

      const MTLonProgress = xhr => {
         isLoadingScene(true);
         this.setState({ isSceneLoading: true, sceneLoadingError: "" });
      };

      const MTLonError = sceneLoadingError => {
         const loadingProgress = null;
         sceneLoadingError = `
        Email: ${userData.email.value} --
        sid: ${selectedScene._id} --
        On: .mtl --
        Status: ${sceneLoadingError.currentTarget.status} --
        Mssg: ${sceneLoadingError.currentTarget.statusText}`;
         isLoadingScene(false);

         this.setState({
            loadingProgress,
            sceneLoadingError,
            isSceneLoading: false,
            displayMode: "raw"
         });
      };

      // OBJ LOADER FUNCTIONS
      const OBJonProgress = xhr => {
         const loadingProgress = Math.round((xhr.loaded / xhr.total) * 100);
         this.xhrCurrentTarget = xhr.currentTarget;
         progressLoadingScene(loadingProgress);

         this.setState({
            loadingProgress,
            sceneLoadingError: ""
         });
      };

      const OBJonError = sceneLoadingError => {
         const loadingProgress = null;
         sceneLoadingError = `
      Email: ${userData.email.value} --
      sid: ${selectedScene._id} --
      On: .obj --
      Status: ${sceneLoadingError.currentTarget.status} --
      Mssg: ${sceneLoadingError.currentTarget.statusText}`;
         isLoadingScene(false);

         this.setState({
            loadingProgress,
            sceneLoadingError,
            isSceneLoading: false,
            displayMode: "raw"
         });
      };

      const OBJonLoad = object => {
         // Disable loading feedback
         const loadingProgress = 0;

         object.name = "userLoadedScene";
         object.position.set(0, 0, 0);
         var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
         object.traverse(function(child) {
            if (
               child instanceof THREE.Mesh &&
               child.name.includes(C.ADMIX_OBJ_PREFIX)
            ) {
               child.material = material;
            }
         });

         this.scene.add(object);

         if (!sceneMounted) {
            this.mount && this.mount.appendChild(this.renderer.domElement);
            this.setEventListeners();
            this.setPostProcessing();
         }

         if (this.abortedObjs[objUrlWithoutTimestamp]) {
            // if the obj was finally let to load, store the timestamp for quick load using cache
            this.abortedObjs[objUrlWithoutTimestamp] = objTimestamp;
         }

         // For parent
         isLoadingScene(false);
         confirmSceneLoaded(true);

         this.setState({
            loadingProgress,
            sceneLoadingError: "",
            sceneMounted: true,
            isSceneLoading: false
         });
      };

      mtlLoader.load(
         mtlUrl,
         MTLonLoad.bind(this),
         MTLonProgress.bind(this),
         MTLonError.bind(this)
      );
   }

   clear({ loadScene, selectedScene }) {
      const { eventListenersSet } = this.state;
      this.stop();
      
      // Clear object name from form
      if(this.scene) {
        var selectedObject = this.scene.getObjectByName("userLoadedScene");
        this.scene.remove(selectedObject);        
      }

      if (eventListenersSet) {
         window.removeEventListener("resize", this.onWindowResize, false);
         window.removeEventListener("mousemove", this.onTouchMove);
         window.removeEventListener("touchmove", this.onTouchMove);
         window.removeEventListener("click", this.onObjectClick);
      }

      if (this.mount && this.renderer) {
         if (this.renderer.domElement.parentNode === this.mount) {
            this.mount.removeChild(this.renderer.domElement);
         }
      }

      this.controls && this.controls.dispose();
      this.TJSreset();

      this.setState(
         {
            sceneMounted: false,
            eventListenersSet: false,
            postProcessingSet: false,
            sceneLoadingError: "",
            isSceneLoading: false
         },
         () => {
            loadScene && this.loadScene(selectedScene);
         }
      );
   }

   moveCamera(selectedPlacement) {
      const { THREE } = window;

      selectedPlacement = "__advirObj__banner1";

      this[selectedPlacement].material.color.setHex(0xff0000);
      const material = new THREE.MeshBasicMaterial({ color: "#FF0000" });
      this[selectedPlacement].material = material;

      const placementPos = new THREE.Vector3().copy(
         this[selectedPlacement].position
      );

      const controlsCurrentPos = this.controls.getObject().position;

      // +1 on the X axis to set the camera just beside the placement
      let transalteInX =
         Number(placementPos.x - controlsCurrentPos.x).toFixed(1) + 1;
      let transalteInY = Number(placementPos.y - controlsCurrentPos.y).toFixed(
         1
      );
      let transalteInZ = Number(placementPos.z - controlsCurrentPos.z).toFixed(
         1
      );

      // The controls object must NOT have any rotation for proper movement
      this.controls.getObject().rotation.y = 0;
      this.controls.getObject().children[0].rotation.x = 0;

      this.controls.getObject().translateX(transalteInX);
      this.controls.getObject().translateY(transalteInY);
      this.controls.getObject().translateZ(transalteInZ);

      // After movement, turn to the placement
      this.controls.getObject().rotation.y = -1.5708;
   }

   // POST-PROCESSING ------------------------------------

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

   mountWebGL() {
      const { THREE } = window;

      this.setScene();
      this.setCamera();
      this.setRenderer();

      this.selectedObjects = [];
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();

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
         this.controls.dispose();
         this.setState({ sceneMounted: false });
      }
   }

   render() {
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

// const selectedObject = this.scene.getObjectByName("userLoadedScene");

// // Check is there was a scene loaded
// if (selectedObject) {
//    this.clear();
//    this.loadScene(selectedScene);
//    confirmSceneLoaded(false);

//    return;
// }

// if (!sceneMounted) {
//    this.mount.appendChild(this.renderer.domElement);
//    this.setEventListeners();
// }
// this.setPostProcessing();

// LOAD OBJECT
// const onProgress = xhr => {
//    const loadingProgress = Math.round((xhr.loaded / xhr.total) * 100);
//    progressLoadingScene(loadingProgress);
//    isLoadingScene(true);
//    this.setState({ loadingProgress });
// };

// const onError = error => {
//    const loadingProgress = null;
//    const loadingError = "Error! Scene could not be loaded";
//    this.setState({ loadingProgress, loadingError });
// };

// const onLoad = object => {
//    const loadingProgress = 0;
//    const loadingError = null;

//    object.name = "userLoadedScene";
//    object.position.set(0, 0, 0);
//    object.traverse(
//       function(child) {
//          if (child.name.includes("__advirObj__")) {
//             let material = new THREE.MeshBasicMaterial({
//                color: 0xffff00
//             });
//             child.material = material;
//             this[child.name] = child;
//          }
//       }.bind(this)
//    );

//    //  this.controls.noRotation();
//    this.setState({ loadingProgress, loadingError, sceneMounted: true });
//    confirmSceneLoaded(true);
//    isLoadingScene(false);
//    this.scene.add(object);
// };

// mtlLoader.load(mtlUrl, materials => {
//    materials.preload();
//    const objLoader = new THREE.OBJLoader();
//    objLoader.setMaterials(materials);
//    objLoader.setPath(renderPath);
//    objLoader.load(
//       objUrl,
//       onLoad.bind(this),
//       onProgress.bind(this),
//       onError.bind(this)
//    );
// });
