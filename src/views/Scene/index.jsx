import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { routeCodes } from "../../config/routes";
import { cloneDeep, isEqual } from "lodash";
import { saveInputs } from "../../actions/";
import C from "../../utils/constants";
import STR from "../../utils/strFuncs";
import ReactTable from "react-table";
import "react-table/react-table.css";
import FormPanel from "./Panels/FormPanel";
import MenuPanel from "./Panels/MenuPanel";
import Breadcrumbs from "../../components/Breadcrumbs";
import ToggleButton from "../../components/ToggleButton";

import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { KeyboardArrowDown } from "@material-ui/icons";

import monkey from "../../assets/img/See_No_Evil_Monkey_Emoji.png";
import monkeyArrow from "../../assets/img/monkeyArrow.png";
import exportObj from "../../assets/img/exportOBJ.png";

import AdmixLoading from "../../components/SVG/AdmixLoading";
import SVG from "../../components/SVG";

import dbCategories from "./Panels/categories.json";
import dbSubCategories from "./Panels/subCategories.json";

class Scene extends Component {
   static propTypes = {
      asyncData: PropTypes.object,
      asyncError: PropTypes.string,
      asyncLoading: PropTypes.bool,
      animate: PropTypes.bool,
      userData: PropTypes.object,
      selectedApp: PropTypes.object,
      savedApps: PropTypes.array,
      dispatch: PropTypes.func,
      savedInputs: PropTypes.array
   };

   constructor(props) {
      super(props);

      this.state = {
         displayMode: "raw",
         initialSet: false,
         TJSsetup: false,

         sceneMounted: false,
         sceneLoadingError: "",
         isSceneLoading: false,
         isMouseOnPanel: false,
         status: true,
         animate: false,
         loadingProgress: 0,
         selectedScene: {},
         postProcessingSet: false,
         eventListenersSet: false,
         clickedPlacement: {},
         placementsByName: {},

         noPlacementsDataMssg: "👈 Select your scene!",
         catDropdownByPlacementId: {},
         subCatsDropdownByPlacementId: {},
         catsSelectedByPlacementId: {},
         subCatsSelectedByPlacementId: {},
         activeByPlacementId: {}
      };

      // THREEJS BASICS --------------
      this.start = this.start.bind(this);
      this.stop = this.stop.bind(this);
      this.animate = this.animate.bind(this);
      this.TJSquickSetup = this.TJSquickSetup.bind(this);
      this.TJSreset = this.TJSreset.bind(this);
      this.setCamera = this.setCamera.bind(this);
      this.setRenderer = this.setRenderer.bind(this);
      this.setScene = this.setScene.bind(this);
      this.setLights = this.setLights.bind(this);
      this.setGround = this.setGround.bind(this);

      // EVENT LISTENERS --------------
      this.onWindowResize = this.onWindowResize.bind(this);
      this.addSelectedObject = this.addSelectedObject.bind(this);
      this.checkIntersection = this.checkIntersection.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onObjectClick = this.onObjectClick.bind(this);
      this.setEventListeners = this.setEventListeners.bind(this);

      // SCENE MANIPULATION --------------
      this.setPostProcessing = this.setPostProcessing.bind(this);
      this.selectScene = this.selectScene.bind(this);
      this.loadScene = this.loadScene.bind(this);
      this.clear = this.clear.bind(this);

      // CONTROLS --------------
      this.enablePointerLockControls = this.enablePointerLockControls.bind(
         this
      );
      this.enableOrbitControls = this.enableOrbitControls.bind(this);
      this.enableTrackBallControls = this.enableTrackBallControls.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);

      // FOR CHILDREN --------------
      this.mouseOnPanel = this.mouseOnPanel.bind(this);
      this.updateClickedPlacement = this.updateClickedPlacement.bind(this);
      this.setDisplayMode = this.setDisplayMode.bind(this);

      // PANELS --------------
      this.forceCloseFormPanel = this.forceCloseFormPanel.bind(this);
      this.toggleActiveFormPanel = this.toggleActiveFormPanel.bind(this);
      this.changeDropdownValueFormPanel = this.changeDropdownValueFormPanel.bind(
         this
      );

      // RAW DATA --------------
      this.changeActive = this.changeActive.bind(this);
      this.changeDropdownValue = this.changeDropdownValue.bind(this);
      this.onSave = this.onSave.bind(this);

      // RENDER --------------
      this.renderRawDataTable = this.renderRawDataTable.bind(this);

      this.isALTdown = false;
      this.xhrCurrentTarget = "";
      this.abortedObjs = {};
      this.lastObjURL = "";
   }

   componentDidMount() {
      // this.Panels = this.Panels.getWrappedInstance();

      const { THREE } = window;

      // POST-PROCESSING
      this.composer = null;

      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
      this.selectedObjects = [];

      this.intersected = null;
   }

   componentWillUnmount() {
      const { sceneMounted } = this.state;
      this.stop();

      if (sceneMounted) {
         this.mount.removeChild(this.renderer.domElement);
         window.removeEventListener("resize", this.onWindowResize, false);
         window.removeEventListener("mousemove", this.onTouchMove);
         window.removeEventListener("touchmove", this.onTouchMove);
         window.removeEventListener("click", this.onObjectClick);
         this.controls.dispose();
      }
   }

   static getDerivedStateFromProps(nextProps, prevSate) {
      const { selectedApp } = nextProps;
      const { selectedScene, initialSet } = prevSate;
      let emptyPlacements = false;

      if (
         selectedApp.scenes &&
         selectedApp.scenes[0] &&
         selectedApp.scenes[0].placements &&
         !initialSet
      ) {
         const subCatsDropdownByPlacementId = {};
         const catsSelectedByPlacementId = {};
         const subCatsSelectedByPlacementId = {};
         const activeByPlacementId = {};
         const placementsByName = {};

         // set the placements to the selectedScene
         selectedApp.scenes.some(scene => {
            if (scene._id === selectedScene._id) {
               emptyPlacements = scene.placements.length === 0;
               selectedScene.placements = scene.placements;
               scene.placements.forEach(placement => {
                  // set placementsByName
                  placementsByName[placement.placementName] = placement;

                  // set the sub-categories dropdowns for each placement depending on their category
                  subCatsDropdownByPlacementId[placement._id] =
                     dbSubCategories[placement.category];

                  // set the values of each dropdown
                  catsSelectedByPlacementId[placement._id] = placement.category;
                  subCatsSelectedByPlacementId[placement._id] = Array.isArray(
                     placement.subCategory
                  )
                     ? placement.subCategory[0]
                     : placement.subCategory;

                  // isActive values
                  activeByPlacementId[placement._id] = placement.isActive;
               });
               return true;
            }
            return false;
         });

         return {
            initialSet: !emptyPlacements,
            selectedApp,
            selectedScene,
            placementsByName,
            subCatsDropdownByPlacementId,
            catsSelectedByPlacementId,
            subCatsSelectedByPlacementId,
            activeByPlacementId
         };
      }

      if (!isEqual(selectedApp, prevSate.selectedApp)) {
            console.log("UPDATE SA");
         return { selectedApp: { ...selectedApp } };
      }

      return null;
   }

   // THREEJS BASICS ---------------------------------------------

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
      if (this.controls) {
         this.controls.update();
      }
   }

   TJSquickSetup() {
      this.setCamera();
      this.setScene();
      this.setRenderer();
      this.setLights();
      // this.setGround();
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

   renderScene() {
      this.renderer.autoClear = true;
      this.renderer.setClearColor(0xfff0f0);
      this.renderer.setClearAlpha(0.0);
      if (this.composer) {
         this.composer.render();
      } else {
         this.renderer.render(this.scene, this.camera);
      }
   }

   setCamera() {
      const { THREE, innerWidth, innerHeight } = window;

      // CAMERA
      const camera = new THREE.PerspectiveCamera(
         75,
         innerWidth / innerHeight,
         1,
         1000
      );

      // Setting a new camera position will affect the controls rotation
      camera.position.set(0, 20, 20);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      // camera.up = new THREE.Vector3(0, 0, 1);

      this.camera = camera;
   }

   setRenderer() {
      const { THREE, innerWidth, innerHeight } = window;

      // RENDERER
      const renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setSize(innerWidth, innerHeight);
      // renderer.shadowMap.enabled = true;
      // renderer.setPixelRatio( window.devicePixelRatio );
      // renderer.setClearColor('#000000');
      this.renderer = renderer;
   }

   setScene() {
      const { THREE } = window;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcccccc);
      // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
      this.scene = scene;
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

   // EVENT LISTENERS ---------------------------------------------

   onWindowResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.composer.setSize(width, height);

      this.effectFXAA.uniforms["resolution"].value.set(
         1 / window.innerWidth,
         1 / window.innerHeight
      );
   }

   addSelectedObject(object) {
      this.selectedObjects = [];
      if (object.name.includes(C.ADMIX_OBJ_PREFIX)) {
         this.selectedObjects.push(object);
      }
      this.outlinePass.selectedObjects = this.selectedObjects;
   }

   checkIntersection() {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      return this.raycaster.intersectObjects([this.scene], true);
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

      this.mouse.x = (x / window.innerWidth) * 2 - 1;
      this.mouse.y = -(y / window.innerHeight) * 2 + 1;

      const intersects = this.checkIntersection();

      if (intersects.length > 0) {
         const selectedObject = intersects[0].object;
         this.addSelectedObject(selectedObject);
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
            if (intersected.name.includes(C.ADMIX_OBJ_PREFIX)) {
               // Change previous selected to material (if there's a previous)
               if (this.intersected) {
                  this.intersected.material = this.intersected.currentMaterial;
               }
               // Store new intersected
               this.intersected = intersected;
               this.intersected.currentMaterial = this.intersected.material;

               const material = new THREE.MeshBasicMaterial({
                  color: 0xffffff
               });
               intersected.material = material;

               // Add placement values to form
               const { selectedScene } = this.state;
               const { savedInputs } = this.props;

               let clickedPlacement = {};
               let isSaved = false;

               // Check the savedInputs in this session to load the changes done
               savedInputs.some(input => {
                  if (input.placementName === intersected.name) {
                     //    clickedPlacement = JSON.parse(JSON.stringify(input));
                     clickedPlacement = cloneDeep(input);
                     isSaved = true;
                     return true;
                  }
                  return false;
               });

               // If the object hasn't been changed, load the db info
               if (!isSaved && !!selectedScene.placements) {
                  selectedScene.placements.some(placement => {
                     // This should be placement.placementName === intersected.name
                     // With === not !== ; otherwise is for test
                     if (placement.placementName === intersected.name) {
                        clickedPlacement = cloneDeep(placement);
                        return true;
                     }
                     return false;
                  });
               }

               // this is because if the input was already saved the .placementId exists
               // if it wasn't saved, the data from the db is ._id and it has to be transformed to .placementId
               clickedPlacement.placementId = clickedPlacement.placementId
                  ? clickedPlacement.placementId
                  : clickedPlacement._id;

               this.setState({ clickedPlacement });
            }
         }
      }
   }

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

   // CONTROLS ---------------------------------------------

   //    gotta include <script src="./THREEJS/PointerLockControls.min.js"></script>   in /public/index.html for this to work
   enablePointerLockControls({
      iYawX = 0,
      iYawY = 0,
      iYawZ = 0,
      iYawRot = 0,
      iPitchRot = 0
   }) {
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
   //    enableOrbitControls({ lookAtX, lookAtY, lookAtZ }) {
   enableOrbitControls() {
      const { THREE } = window;

      // Position is given by the camera position
      // lookAt can be set by controls.target.set

      const controls = new THREE.OrbitControls(
         this.camera,
         this.renderer.domElement,
         this.scene
      );
      controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      controls.dampingFactor = 1.5;
      controls.zoomSpeed = 15;
      controls.zoomSpeedOriginal = 15;
      // controls.minDistance = 1;
      // controls.maxDistance = 500;
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

   TrackballControlsEnableWheel() {
      this.controls.startWheel();
   }

   TrackballControlsDisableWheel() {
      this.controls.stopWheel();
   }

   handleKeyDown(e) {
      const { THREE } = window;
      e.preventDefault();

      // key = ALT
      if (e.keyCode === 18 && !this.isALTdown) {
         document.body.style.cursor = "move";
         this.controls &&
            (this.controls.mouseButtons = {
               ORBIT: THREE.MOUSE.RIGHT,
               PAN: THREE.MOUSE.LEFT
            });
      }
   }
   handleKeyUp(e) {
      const { THREE } = window;
      e.preventDefault();
      // key = ALT
      if (e.keyCode === 18) {
         document.body.style.cursor = "default";
         this.controls.mouseButtons = {
            ORBIT: THREE.MOUSE.LEFT,
            PAN: THREE.MOUSE.RIGHT
         };
      }
   }

   // FOR CHILDREN ---------------------------------------------

   mouseOnPanel() {
      const isMouseOnPanel = !this.state.isMouseOnPanel;

      // this is so when the mouse is on either panel user can't rotate the scene onclick
      if (isMouseOnPanel) {
         //    this.controls && this.controls.noRotation();
      } else {
         //    this.controls && this.controls.yesRotation();
      }

      this.setState({ isMouseOnPanel });
   }

   updateClickedPlacement(newInputs) {
      this.setState({ clickedPlacement: newInputs });
   }

   setDisplayMode(displayMode) {
      const { selectedScene, sceneMounted } = this.state;
      this.setState({ displayMode }, () => {
         if (
            Object.keys(selectedScene).length > 0 &&
            displayMode === "3D" &&
            !sceneMounted
         ) {
            // this.loadScene();
         }
      });
   }

   // SCENE MANIPULATION ---------------------------------------------

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
         outlinePass.edgeGlow = 0.5;
         outlinePass.edgeThickness = 1;
         outlinePass.pulsePeriod = 0;
         outlinePass.visibleEdgeColor = new THREE.Color("#ff3300");
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

   selectScene(selectedScene) {
      const { asyncLoading } = this.props;
      this.setState({ selectedScene, initialSet: false });

      if (
         !selectedScene.placements ||
         (selectedScene.placements.length === 0 && !asyncLoading)
      ) {
         this.setState({
            noPlacementsDataMssg:
               "Your scene doesn't seem to have any placements 🤔"
         });
      }
   }

   loadScene() {
      const { xhrCurrentTarget } = this;
      const {
         TJSsetup,
         sceneMounted,
         selectedScene,
         isSceneLoading,
         placementsByName
      } = this.state;
      const { userData } = this.props;

      const { THREE } = window;

      const userId = userData._id;

      if (isSceneLoading) {
         xhrCurrentTarget.abort();
         this.abortedObjs[this.lastObjURL] = "Not loaded";
      }

      // const selectedObject = this.scene
      //    ? this.scene.getObjectByName("userLoadedScene")
      //    : null;

      // Check if there was a scene loaded
      if (TJSsetup) {
         this.clear({ loadScene: true });
         return;
      }

      this.TJSquickSetup();
      this.start();

      this.enableOrbitControls({ lookAtX: 0, lookAtY: 0, lookAtZ: 0 });

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

      // if (userData.email.value === "eganluis@gmail.com") {
      //    renderPath = "./modelTest/";
      //    objUrl = `exportObjScene1.obj`;
      //    mtlUrl = `exportObjScene1.mtl`;
      // }

      // THREE.ImageUtils.crossOrigin = "anonymous";

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
         var imgMaterial = new THREE.MeshBasicMaterial({ color: "#009900" });
         var vidMaterial = new THREE.MeshBasicMaterial({ color: "#990000" });
         object.traverse(function(child) {
            if (
               child instanceof THREE.Mesh &&
               child.name.includes(C.ADMIX_OBJ_PREFIX)
            ) {
               child.material = placementsByName[child.name]
                  ? placementsByName[child.name].placementType === "banner"
                     ? imgMaterial
                     : vidMaterial
                  : imgMaterial;
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

   clear({ loadScene }) {
      const { eventListenersSet } = this.state;
      this.stop();
      // Clear object name from form
      var selectedObject = this.scene.getObjectByName("userLoadedScene");

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
      this.scene && this.scene.remove(selectedObject);
      this.TJSreset();

      this.setState(
         {
            clickedPlacement: {},
            sceneMounted: false,
            eventListenersSet: false,
            postProcessingSet: false,
            sceneLoadingError: "",
            isSceneLoading: false
         },
         () => {
            loadScene && this.loadScene();
         }
      );
   }

   // PANELS ---------------------------------------------
   forceCloseFormPanel() {
      this.FormPanel.toggleSlide("close");
   }

   toggleActiveFormPanel() {
      this.FormPanel.toggleActive({ save: false });
   }

   changeDropdownValueFormPanel(dropdown, e) {
      this.FormPanel.changeDropdownValue(dropdown, e);
   }

   // RAW DATA ---------------------------------------------

   changeActive({ placementId, save }) {
      const { activeByPlacementId } = this.state;

      const newActives = cloneDeep(activeByPlacementId);
      newActives[placementId] = !activeByPlacementId[placementId];

      this.setState({ activeByPlacementId: newActives }, () => {
         if (save) {
            this.onSave(placementId);
            this.toggleActiveFormPanel();
         }
      });
   }

   changeDropdownValue({ dropdown, save, placementId, newValue }, e) {
      const value = newValue ? newValue : e.target.value;
      let {
         catsSelectedByPlacementId,
         subCatsSelectedByPlacementId,
         subCatsDropdownByPlacementId
      } = this.state;

      if (dropdown === "category") {
         catsSelectedByPlacementId[placementId] = value;
         subCatsDropdownByPlacementId[placementId] = dbSubCategories[value];
         subCatsSelectedByPlacementId[placementId] = "";
      } else {
         subCatsSelectedByPlacementId[placementId] = value;
      }

      this.setState(
         {
            catsSelectedByPlacementId,
            subCatsSelectedByPlacementId,
            subCatsDropdownByPlacementId
         },
         () => {
            if (save) {
               this.onSave(placementId);
               this.changeDropdownValueFormPanel({
                  dropdown,
                  newValue: value,
                  save: false
               });
            }
         }
      );
   }

   onSave(placementId) {
      const { dispatch } = this.props;
      let {
         selectedScene,
         catsSelectedByPlacementId,
         subCatsSelectedByPlacementId,
         activeByPlacementId
      } = this.state;
      const toSave = {};

      const placementPropsToSave = [
         "appId",
         "sceneId",
         "placementName",
         "placementType",
         "isActive",
         "category",
         "subCategory",
         "addedPrefix"
      ];

      selectedScene.placements &&
         selectedScene.placements.some(placement => {
            if (placement._id === placementId) {
               placementPropsToSave.forEach(prop => {
                  toSave[prop] = placement[prop];
               });
               return true;
            }
            return false;
         });

      toSave.placementId = placementId;
      toSave.category = catsSelectedByPlacementId[placementId];
      toSave.subCategory = [subCatsSelectedByPlacementId[placementId]];
      toSave.isActive = activeByPlacementId[placementId];

      dispatch(saveInputs(toSave));
   }

   // RENDER ---------------------------------------------

   renderNothingToSee() {
      return (
         <div id="nothing-to-see">
            <img id="arrow" src={monkeyArrow} alt="There" />
            <img id="monkey" src={monkey} alt="mokney" />
            <br />
            <br />
            <h2 className="st">Nothing to see here!</h2>
            <br />
            <h3 className="mb">
               To get started, select a scene of your app in the menu
            </h3>
         </div>
      );
   }

   renderRawDataTable() {
      const { asyncLoading, savedInputs } = this.props;
      const { selectedApp } = this.state;
      const {
         selectedScene,
         noPlacementsDataMssg,
         subCatsDropdownByPlacementId,
         catsSelectedByPlacementId,
         subCatsSelectedByPlacementId,
         activeByPlacementId
      } = this.state;

      const breadcrumbs = [
         {
            title: "My apps",
            route: routeCodes.MYAPPS
         },
         {
            title: selectedApp.name,
            route: routeCodes.SCENE
         }
      ];

      const isActiveToggle = (placementId, savedInputsActive = null) => {
         const label = savedInputsActive
            ? savedInputsActive
               ? "Live"
               : "Off"
            : activeByPlacementId[placementId]
               ? "Live"
               : "Off";
         return (
            <div className="table-toggles">
               <div>{label}</div>
               <div>
                  <div className="app-status mb">
                     <ToggleButton
                        inputName={placementId}
                        isChecked={
                           savedInputsActive
                              ? savedInputsActive
                              : activeByPlacementId[placementId]
                        }
                        onChange={this.changeActive.bind(null, {
                           placementId,
                           save: true
                        })}
                     />
                  </div>
               </div>
            </div>

            // <Switch
            //    checked={
            //       savedInputsActive
            //          ? savedInputsActive
            //          : activeByPlacementId[placementId]
            //    }
            //    onChange={this.changeActive.bind(null, {
            //       placementId,
            //       save: true
            //    })}
            //    value={placementId}
            //    color="primary"
            // />
         );
      };

      const renderDropdown = (
         input,
         placementId,
         savedInputsCat = null,
         savedInputsSubCat = null
      ) => {
         let value, toMap;

         if (input === "category") {
            toMap = dbCategories;
            value = savedInputsCat
               ? savedInputsCat
               : catsSelectedByPlacementId[placementId];
         } else {
            toMap = savedInputsSubCat
               ? dbSubCategories[savedInputsCat]
               : subCatsDropdownByPlacementId[placementId];
            value = savedInputsSubCat
               ? savedInputsSubCat
               : subCatsSelectedByPlacementId[placementId];
         }

         const dropdown = toMap
            ? toMap.map(item => {
                 return (
                    <MenuItem value={item} key={item} className="mb">
                       {item}
                    </MenuItem>
                 );
              })
            : "";

         return (
            <Select
               value={value}
               onChange={this.changeDropdownValue.bind(null, {
                  dropdown: input,
                  placementId,
                  save: true
               })}
               input={
                  <Input
                     name={`${input}-${placementId}`}
                     id={`${input}-${placementId}-helper`}
                  />
               }
               classes={{ root: "mui-select-root" }}
               disableUnderline={true}
               IconComponent={KeyboardArrowDown}
            >
               <MenuItem value="" className="mb">
                  <em>
                     Please select a{" "}
                     {input === "category" ? "Category" : "Sub-Category"}
                  </em>
               </MenuItem>
               {dropdown}
            </Select>
         );
      };

      const data = [];

      let dataItem = {};

      let savedInputsByPlacementId = {};

      // Check the savedInputs in this session to load the changes done
      savedInputs.forEach(input => {
         savedInputsByPlacementId[input.placementId] = {};

         savedInputsByPlacementId[input.placementId].placementName =
            input.placementName;

         savedInputsByPlacementId[input.placementId].placementType =
            input.placementType;

         savedInputsByPlacementId[input.placementId].isActive = input.isActive;

         savedInputsByPlacementId[input.placementId].category = input.category;

         savedInputsByPlacementId[
            input.placementId
         ].subCategory = Array.isArray(input.subCategory)
            ? input.subCategory[0]
            : input.subCategory;
      });

      let name, format, isActive, category, subCategory;

      selectedScene.placements &&
         selectedScene.placements.forEach(placement => {
            if (savedInputsByPlacementId[placement._id]) {
               name = STR.withoutPrefix(
                  savedInputsByPlacementId[placement._id].placementName
               );
               format = savedInputsByPlacementId[placement._id].placementType;
               isActive = savedInputsByPlacementId[placement._id].isActive;
               category = savedInputsByPlacementId[placement._id].category;
               subCategory =
                  savedInputsByPlacementId[placement._id].subCategory;
            } else {
               name = STR.withoutPrefix(placement.placementName);
               format = placement.placementType;
               isActive = null;
               category = null;
               subCategory = null;
            }
            dataItem = {
               name,
               format,
               active: isActiveToggle(placement._id, isActive),
               category: renderDropdown(
                  "category",
                  placement._id,
                  category,
                  subCategory
               ),
               subCategory: renderDropdown(
                  "subCategory",
                  placement._id,
                  category,
                  subCategory
               )
            };
            data.push(dataItem);
            dataItem = {};
         });

      const paginationPrevious = props => {
         const { disabled } = props;

         return disabled ? (
            <button {...props}>{SVG.paginationDisabled}</button>
         ) : (
            <button {...props} className="hundred80">
               {SVG.paginationEnabled}
            </button>
         );
      };

      const paginationNext = props => {
         const { disabled } = props;

         return disabled ? (
            <button {...props} className="hundred80">
               {SVG.paginationDisabled}
            </button>
         ) : (
            <button {...props}>{SVG.paginationEnabled}</button>
         );
      };

      let lastUpdatedApp = selectedApp.updatedAt
         ? STR.formatDate(new Date(selectedApp.updatedAt))
         : "";
      let lastUpdatedScene = selectedScene.updatedAt
         ? STR.formatDate(new Date(selectedScene.updatedAt))
         : "";

      return (
         <div className="rawDataTable-cont">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <div className="rawDataTable">
               <ReactTable
                  data={data}
                  noDataText={
                     asyncLoading ? "Loading..." : noPlacementsDataMssg
                  }
                  columns={[
                     {
                        Header: "Edit placement",
                        columns: [
                           {
                              Header: "Name",
                              accessor: "name",
                              minWidth: 150,
                              sortable: false,
                              className: "left mb",
                              headerClassName: "upper-left-corner"
                           },
                           {
                              Header: "Format",
                              accessor: "format",
                              sortable: false,
                              // minWidth: 50,
                              className: "mb",
                              headerClassName: "upper"
                           },
                           {
                              Header: "Category",
                              accessor: "category",
                              sortable: false,
                              className: "mb",
                              headerClassName: "upper"
                           },
                           {
                              Header: "Sub category",
                              accessor: "subCategory",
                              sortable: false,
                              className: "mb",
                              headerClassName: "upper"
                           },
                           {
                              Header: "Status",
                              headerClassName: "upper-right-corner",
                              className: "right mb",
                              sortable: false,
                              accessor: "active",
                              // minWidth: 40,
                              sortMethod: (a, b) => {
                                 return a.props.checked ? -1 : 1;
                              }
                           }
                        ]
                     }
                  ]}
                  defaultPageSize={10}
                  className="-striped -highlight"
                  PreviousComponent={paginationPrevious}
                  NextComponent={paginationNext}
               />
            </div>
            <br />
            <span className="mb">
               Last update - App: {lastUpdatedApp} - Scene: {lastUpdatedScene}
            </span>
            <br />
            <br />
            <span className="mb">
               Tip: for a better user experience, check the 'Export OBJ' option
               in the Unity plugin{" "}
               <span role="img" aria-label="wink">
                  😉
               </span>
            </span>
         </div>
      );
   }

   renderSceneLoadingError() {
      const { sceneLoadingError } = this.state;

      return (
         <div id="scene-loading-error" className="mb">
            <span className="st">404: Export not found!</span>
            <hr />
            This happens when an export has not been done. You can do it ticking
            this here: <br />
            <img src={exportObj} alt="exportObj" /> <br />
            <br />
            Note: if you <em>did</em> export it and it still not showing, please
            send us an email to{" "}
            <a href="mailto:support@admix.in">support@admix.in</a> with this
            text: <br />
            <div className="code">
               <code>
                  Scene not loaded -. <br />
                  {sceneLoadingError}
               </code>
            </div>
            <br />
            We will sort it out as fast as we can{" "}
            <span role="img" aria-label="hammer">
               🔨
            </span>
         </div>
      );
   }

   render() {
      const {
         asyncLoading,
         savedApps,
         dispatch,
         accessToken,
         savedInputs
      } = this.props;

      let {
         selectedApp,
         loadingProgress,
         selectedScene,
         isSceneLoading,
         clickedPlacement,
         sceneMounted,
         sceneLoadingError,
         displayMode
      } = this.state;
      // const barColor = "#157cc1";

      loadingProgress =
         !isFinite(loadingProgress) || isNaN(loadingProgress)
            ? 0
            : loadingProgress;

      // const renderSceneLoadingError =
      //    sceneLoadingError !== "" && displayMode === "3D";

      const renderNothingToSee = Object.keys(selectedScene).length <= 0;

      const renderRawDataTable =
         Object.keys(selectedScene).length > 0 && displayMode === "raw";

      return (
         <div
            id="webgl"
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
            tabIndex="0"
            className="mb"
         >
            <MenuPanel
               // functions
               onSave={this.onSave}
               loadScene={this.loadScene}
               selectScene={this.selectScene}
               mouseOnPanel={this.mouseOnPanel}
               setDisplayMode={this.setDisplayMode}
               forceCloseFormPanel={this.forceCloseFormPanel}
               rawDataChangeActive={this.changeActive}
               updateClickedPlacement={this.updateClickedPlacement}
               rawDataChangeDropdownValue={this.changeDropdownValue}
               // props
               asyncLoading={asyncLoading}
               isSceneLoading={isSceneLoading}
               sceneLoadingError={sceneLoadingError}
               dispatch={dispatch}
               savedInputs={savedInputs}
               selectedApp={selectedApp}
               accessToken={accessToken}
               // state
               sceneMounted={sceneMounted}
               displayMode={displayMode}
            />

            {loadingProgress !== 0 &&
               loadingProgress && (
                  <div id="scene-loading" className="progressbar-container">
                     <AdmixLoading />
                     {`${loadingProgress}% loaded`}
                  </div>
               )}

            {/* {renderSceneLoadingError && this.renderSceneLoadingError()} */}

            {renderNothingToSee && this.renderNothingToSee()}

            {renderRawDataTable && this.renderRawDataTable()}

            <div
               id="scene-webglMount"
               ref={mount => {
                  this.mount = mount;
               }}
            />

            <FormPanel
               ref={i => (this.FormPanel = i)}
               // functions
               onSave={this.onSave}
               mouseOnPanel={this.mouseOnPanel}
               rawDataChangeActive={this.changeActive}
               updateClickedPlacement={this.updateClickedPlacement}
               rawDataChangeDropdownValue={this.changeDropdownValue}
               // props
               selectedApp={selectedApp}
               dispatch={dispatch}
               selectedScene={selectedScene}
               savedApps={savedApps}
               // state
               clickedPlacement={clickedPlacement}
               sceneMounted={sceneMounted}
               displayMode={displayMode}
            />
         </div>
      );
   }
}

const mapStateToProps = state => ({
   accessToken: state.app.get("accessToken"),
   asyncData: state.app.get("asyncData"),
   asyncError: state.app.get("asyncError"),
   asyncLoading: state.app.get("asyncLoading"),
   userData: state.app.get("userData"),
   selectedApp: state.app.get("selectedApp"),
   savedApps: state.app.get("savedApps"),
   savedInputs: state.app.get("savedInputs"),
   isLoad_webgl: state.app.get("load_webgl")
});

export default connect(mapStateToProps)(Scene);
