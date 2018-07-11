import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";
import { saveInputs } from "../../actions/";
import { ADMIX_OBJ_PREFIX } from "../../utils/constants";
import ReactTable from "react-table";
import "react-table/react-table.css";

import Switch from "@material-ui/core/Switch";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import Panels from "./Panels";
// import Progress from "react-progressbar";

import monkey from "../../assets/img/See_No_Evil_Monkey_Emoji.png";
import monkeyArrow from "../../assets/img/monkeyArrow.png";

import AdmixLoading from "../../components/SVG/AdmixLoading";

import dbCategories from "./Panels/categories.json";
import dbSubCategories from "./Panels/subCategories.json";

// let TrackballControls;
// let PointerLockControls;
// let mtl;

// @connect(state => ({
//   asyncData: state.app.get("asyncData"),
//   asyncError: state.app.get("asyncError"),
//   asyncLoading: state.app.get("asyncLoading"),
//   userData: state.app.get("userData"),
//   selectedApp: state.app.get("selectedApp"),
//   savedApps: state.app.get("savedApps"),
//   savedInputs: state.app.get("savedInputs"),
//   isLoad_webgl: state.app.get("load_webgl")
// }))
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
         displayMode: "3D",
         initialSet: false,

         sceneMounted: false,
         isMouseOnPanel: false,
         status: true,
         animate: false,
         loadingProgress: 0,
         loadingError: null,
         selectedScene: {},
         postProcessingSet: false,
         eventListenersSet: false,
         clickedPlacement: {},

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

      // RAW DATA --------------
      this.changeActive = this.changeActive.bind(this);
      this.changeDropdownValue = this.changeDropdownValue.bind(this);
      this.onSave = this.onSave.bind(this);

      // RENDER --------------
      this.renderRawDataTable = this.renderRawDataTable.bind(this);

      this.isALTdown = false;
   }

   componentDidMount() {
      const { THREE, innerWidth, innerHeight } = window;

      // CAMERA
      const camera = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         1,
         1000
      );

      // Setting a new camera position will affect the controls rotation
      camera.position.set(0, 20, 20);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      // camera.up = new THREE.Vector3(0, 0, 1);

      // RENDERER
      const renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setSize(innerWidth, innerHeight);
      renderer.shadowMap.enabled = true;
      // renderer.setPixelRatio( window.devicePixelRatio );
      // renderer.setClearColor('#000000');

      // SCENE
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcccccc);
      scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
      // scene.add(new THREE.AxesHelper(20));

      // LIGHTS
      var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
      light.position.set(0.5, 1, 0.75);
      scene.add(light);

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

      // POST-PROCESSING
      const composer = null;

      const selectedObjects = [];
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();

      this.camera = camera;
      this.scene = scene;

      this.mouse = mouse;
      this.raycaster = raycaster;
      this.selectedObjects = selectedObjects;
      this.intersected = null;
      this.composer = composer;
      this.renderer = renderer;

      // this.enableControls();

      this.start();
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
      console.log('selectedScene._id: ', selectedScene._id);
      console.log('initialSet: ', initialSet);

      if (selectedApp.scenes[0].placements && !initialSet) {
         const subCatsDropdownByPlacementId = {};
         const catsSelectedByPlacementId = {};
         const subCatsSelectedByPlacementId = {};
         const activeByPlacementId = {};

         // set the placements to the selectedScene
         selectedApp.scenes.some(scene => {
            if (scene._id === selectedScene._id) {
               selectedScene.placements = scene.placements;
               scene.placements.forEach(placement => {
                  // set the sub-categories dropdowns for each placement depending on their category
                  subCatsDropdownByPlacementId[placement._id] =
                     dbSubCategories[placement.category];

                  // set the values of each dropdown
                  catsSelectedByPlacementId[placement._id] = placement.category;
                  subCatsSelectedByPlacementId[placement._id] =
                     placement.subCategory[0];

                  // isActive values
                  activeByPlacementId[placement._id] = placement.isActive;
               });
               return true;
            }
            return false;
         });

         console.log("here");
         console.log('catsSelectedByPlacementId: ', catsSelectedByPlacementId);

         return {
            initialSet: true,
            selectedScene,
            subCatsDropdownByPlacementId,
            catsSelectedByPlacementId,
            subCatsSelectedByPlacementId,
            activeByPlacementId
         };
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
      if (!!this.controls) {
         this.controls.update();
      }
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
      if (object.name.includes(ADMIX_OBJ_PREFIX)) {
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
            if (intersected.name.includes(ADMIX_OBJ_PREFIX)) {
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
                     clickedPlacement = _.cloneDeep(input);
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
                        clickedPlacement = _.cloneDeep(placement);
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
         this.controls.mouseButtons = {
            ORBIT: THREE.MOUSE.RIGHT,
            PAN: THREE.MOUSE.LEFT
         };
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
      this.setState({ displayMode });
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
      const { displayMode, sceneMounted, selectedScene } = this.state;
      const { userData } = this.props;

      if (displayMode === "3D") {
         const userId = userData._id;

         const { THREE } = window;

         const selectedObject = this.scene.getObjectByName("userLoadedScene");

         // Check is there was a scene loaded
         if (selectedObject) {
            this.clear();
            this.loadScene();
            return;
         }

         // this.enablePointerLockControls({
         //    iYawX: 0,
         //    iYawY: 0,
         //    iYawZ: 0,
         //    iYawRot: 0,
         //    iPitchRot: 0
         // });

         this.enableOrbitControls({ lookAtX: 0, lookAtY: 0, lookAtZ: 0 });

         if (!sceneMounted) {
            this.mount.appendChild(this.renderer.domElement);
            this.setEventListeners();
            this.setPostProcessing();
         }

         // LOAD OBJECT
         const onProgress = xhr => {
            const loadingProgress = Math.round((xhr.loaded / xhr.total) * 100);
            this.setState({ loadingProgress });
         };

         const onError = error => {
            const loadingProgress = null;
            const loadingError = "Error! Scene could not be loaded";
            this.setState({ loadingProgress, loadingError });
         };

         const onLoad = object => {
            // Disable loading feedback
            const loadingProgress = 0;
            const loadingError = null;

            object.name = "userLoadedScene";
            object.position.set(0, 0, 0);
            var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            object.traverse(function(child) {
               if (
                  child instanceof THREE.Mesh &&
                  child.name.includes(ADMIX_OBJ_PREFIX)
               ) {
                  child.material = material;
               }
            });

            this.scene.add(object);
            this.setState({
               loadingProgress,
               loadingError,
               sceneMounted: true
            });
         };

         // GET .OBJ AND .MTL URL
         const dns = "https://s3.us-east-2.amazonaws.com/advirbucket";
         let renderPath = `${dns}/${userId}/${selectedScene._id}/`;

         let objUrl = `${selectedScene.name}.obj`;
         let mtlUrl = `${selectedScene.name}.mtl`;

         if (userData.email.value === "eganluis@gmail.com") {
            renderPath = "./modelTest/";
            objUrl = `exportObjScene1.obj`;
            mtlUrl = `exportObjScene1.mtl`;
         }

         // THREE.ImageUtils.crossOrigin = "anonymous";

         const mtlLoader = new THREE.MTLLoader();
         mtlLoader.setPath(renderPath);
         mtlLoader.setCrossOrigin(true);

         mtlLoader.load(mtlUrl, materials => {
            materials.preload();
            const objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(renderPath);

            objLoader.load(
               objUrl,
               onLoad.bind(this),
               onProgress.bind(this),
               onError.bind(this)
            );
         });
      }
   }

   clear() {
      // Clear object name from form
      this.controls.dispose();
      this.setState({ clickedPlacement: {}, sceneMounted: false });
      var selectedObject = this.scene.getObjectByName("userLoadedScene");
      this.scene.remove(selectedObject);
   }

   // RAW DATA ---------------------------------------------

   changeActive(placementId, event) {
      const { activeByPlacementId } = this.state;

      const newActives = _.cloneDeep(activeByPlacementId);
      newActives[placementId] = event.target.checked;

      this.setState({ activeByPlacementId: newActives });
      this.onSave(placementId);
   }

   changeDropdownValue(input, placementId, e) {
      const { value } = e.target;
      let {
         catsSelectedByPlacementId,
         subCatsSelectedByPlacementId,
         subCatsDropdownByPlacementId
      } = this.state;

      if (input === "category") {
         catsSelectedByPlacementId[placementId] = value;
         subCatsDropdownByPlacementId[placementId] = dbSubCategories[value];
         subCatsSelectedByPlacementId[placementId] = "";
      } else {
         subCatsSelectedByPlacementId[placementId] = value;
      }

      this.setState({
         catsSelectedByPlacementId,
         subCatsSelectedByPlacementId,
         subCatsDropdownByPlacementId
      });

      this.onSave(placementId);
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
      const {
         selectedScene,
         noPlacementsDataMssg,
         subCatsDropdownByPlacementId,
         catsSelectedByPlacementId,
         subCatsSelectedByPlacementId,
         activeByPlacementId
      } = this.state;

      const isActiveToggle = placementId => {
         return (
            <Switch
               checked={activeByPlacementId[placementId]}
               onChange={this.changeActive.bind(null, placementId)}
               value={placementId}
               color="primary"
            />
         );
      };

      const renderDropdown = (input, placementId) => {
         let value, toMap;

         if (input === "category") {
            toMap = dbCategories;
            value = catsSelectedByPlacementId[placementId];
         } else {
            toMap = subCatsDropdownByPlacementId[placementId];
            value = subCatsSelectedByPlacementId[placementId];
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
            <FormControl className="fw">
               <Select
                  value={value}
                  onChange={this.changeDropdownValue.bind(
                     null,
                     input,
                     placementId
                  )}
                  input={
                     <Input
                        name={`${input}-${placementId}`}
                        id={`${input}-${placementId}-helper`}
                     />
                  }
                  className="mb"
               >
                  <MenuItem value="" className="mb">
                     <em>
                        Please select a{" "}
                        {input === "category" ? "Category" : "Sub-Category"}
                     </em>
                  </MenuItem>
                  {dropdown}
               </Select>
            </FormControl>
         );
      };

      const data = [];

      let dataItem = {};

      selectedScene.placements &&
         selectedScene.placements.forEach(placement => {
            dataItem = {
               name: placement.placementName,
               format: placement.placementType,
               active: isActiveToggle(placement._id),
               category: renderDropdown("category", placement._id),
               subCategory: renderDropdown("subCategory", placement._id)
            };
            data.push(dataItem);
            dataItem = {};
         });

      return (
         <div id="rawDataTable-cont">
            <div id="rawDataTable">
               <ReactTable
                  data={data}
                  noDataText={`${noPlacementsDataMssg}`}
                  columns={[
                     {
                        Header: "Edit placement",
                        columns: [
                           {
                              Header: "Name",
                              accessor: "name"
                           },
                           {
                              Header: "Format",
                              accessor: "format"
                           },
                           {
                              Header: "Active",
                              accessor: "active"
                           },
                           {
                              Header: "Category",
                              accessor: "category"
                           },
                           {
                              Header: "Sub category",
                              accessor: "subCategory"
                           }
                        ]
                     }
                  ]}
                  defaultPageSize={10}
                  className="-striped -highlight"
               />
            </div>
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

   render() {
      let {
         loadingProgress,
         loadingError,
         selectedScene,
         clickedPlacement,
         sceneMounted,
         displayMode
      } = this.state;
      // const barColor = "#157cc1";

      loadingProgress =
         !isFinite(loadingProgress) || isNaN(loadingProgress)
            ? 0
            : loadingProgress;

      return (
         <div
            id="webgl"
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
            tabIndex="0"
         >
            <Panels
               mouseOnPanel={this.mouseOnPanel}
               loadScene={this.loadScene}
               selectScene={this.selectScene}
               selectedScene={selectedScene}
               onSave={this.onSave}
               clickedPlacement={clickedPlacement}
               sceneMounted={sceneMounted}
               updateClickedPlacement={this.updateClickedPlacement}
               setDisplayMode={this.setDisplayMode}
            />

            {loadingProgress && (
               <div id="scene-loading" className="progressbar-container">
                  {/* <Progress completed={loadingProgress} color={barColor} /> */}
                  <AdmixLoading />
                  {`${loadingProgress}% loaded`}
               </div>
            )}

            {loadingError && (
               <div id="scene-loading" className="progressbar-container">
                  {`${loadingError}`}
               </div>
            )}

            {!sceneMounted && displayMode === "3D" && this.renderNothingToSee()}

            {displayMode === "raw" && this.renderRawDataTable()}

            <div
               className="placemeni-img"
               ref={mount => {
                  this.mount = mount;
               }}
            />
         </div>
      );
   }
}

const mapStateToProps = state => ({
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
