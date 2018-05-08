import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";

import Panels from "./Panels";
import Progress from "react-progressbar";

import monkey from "../../assets/img/See_No_Evil_Monkey_Emoji.png";
import monkeyArrow from "../../assets/img/monkeyArrow.png";

let TrackballControls;
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

      this.start = this.start.bind(this);
      this.stop = this.stop.bind(this);
      this.animate = this.animate.bind(this);

      this.state = {
         sceneMounted: false,
         isMouseOnPanel: false,
         status: true,
         animate: false,
         loadingProgress: 0,
         loadingError: null,
         selectedScene: {},
         postProcessingSet: false,
         eventListenersSet: false,
         clickedPlacement: {}
      };
      this.handleInput = this.handleInput.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.addSelectedObject = this.addSelectedObject.bind(this);
      this.checkIntersection = this.checkIntersection.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);
      this.onObjectClick = this.onObjectClick.bind(this);
      this.setPostProcessing = this.setPostProcessing.bind(this);
      this.setEventListeners = this.setEventListeners.bind(this);
      this.selectScene = this.selectScene.bind(this);
      this.loadScene = this.loadScene.bind(this);
      this.clear = this.clear.bind(this);
      this.enableControls = this.enableControls.bind(this);
      this.enablePointerLockControls = this.enablePointerLockControls.bind(
         this
      );
      this.disableControls = this.disableControls.bind(this);
      this.mouseOnPanel = this.mouseOnPanel.bind(this);
      this.updateClickedPlacement = this.updateClickedPlacement.bind(this);

      // window.THREE = THREE;
      // window.THREE.Pass = Pass;
      // if (!props.isLoad_webgl) {
      // }
   }

   handleInput(e) {
      this.setState({
         format: e.target.value
      });
   }

   componentWillMount() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.setState({
         windowW: width,
         windowH: height
      });

      // if (!isLoad_webgl) {
      // LOAD SCRIPTS
      // const scripts = [
      //    "CopyShader",
      //    "FXAAShader",
      //    "EffectComposer",
      //    "RenderPass",
      //    "ShaderPass",
      //    "PointerLockControls",
      //    "OutlinePass"
      // ];

      // let scriptPath;

      // scripts.forEach(script => {
      //    const s = document.createElement("script");
      //    scriptPath = `../../../threeJsScripts/${script}.js`;
      //    console.log("scriptPath: ", scriptPath);
      //    //    s.src = require(scriptPath);
      //    s.src = scriptPath;
      //    s.async = true;
      //    document.body.appendChild(s);
      // });
      // dispatch(load_webgl());
      // }
   }

   componentDidMount() {
      const { THREE, innerWidth, innerHeight } = window;

      // const PointerLockControls = require('three-pointerlock');
      TrackballControls = require("../../assets/webgl/modules/three-trackballcontrols");

      // CAMERA
      const camera = new THREE.PerspectiveCamera(
         75,
         innerWidth / innerHeight,
         1,
         1000
      );
      // Setting a new camera position will affect the controls rotation
      // camera.position.set(0, 10, 10);
      // camera.lookAt(scene.position);
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

      const group = new THREE.Group();
      const selectedObjects = [];
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();

      this.camera = camera;
      this.scene = scene;
      this.group = group;
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
         // this.TrackballControlsDisableWheel();
      }
   }

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

   onTouchMove(event) {
      let x, y;

      if (event.changedTouches) {
         x = event.changedTouches[0].pageX;
         y = event.changedTouches[0].pageY;
      } else {
         x = event.clientX;
         y = event.clientY;
      }

      this.mouse.x = x / window.innerWidth * 2 - 1;
      this.mouse.y = -(y / window.innerHeight) * 2 + 1;

      const intersects = this.checkIntersection();

      if (intersects.length > 0) {
         const selectedObject = intersects[0].object;
         this.addSelectedObject(selectedObject);
      }
   }

   addSelectedObject(object) {
      this.selectedObjects = [];
      if (object.name.includes("__advirObj__")) {
         this.selectedObjects.push(object);
      }
      this.outlinePass.selectedObjects = this.selectedObjects;
   }

   addSelectedObjectOnLoad(object) {
      this.selectedObjects.push(object);
      this.outlinePass.selectedObjects = this.selectedObjects;
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
                     clickedPlacement = _.clone(input);
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
                        clickedPlacement = _.clone(placement);
                        return true;
                     }
                     return false;
                  });
               }

               clickedPlacement.placementId = clickedPlacement._id;

               this.setState({ clickedPlacement });
            }
         }
      }
   }

   checkIntersection() {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      return this.raycaster.intersectObjects([this.scene], true);
   }

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

   selectScene(selectedScene) {
      this.setState({ selectedScene });
   }

   loadScene() {
      const { THREE } = window;

      // Check is there was a scene loaded
      if (!!this.group) {
         this.clear();
      }

      this.enablePointerLockControls();

      const { sceneMounted, selectedScene } = this.state;
      const { userData } = this.props;
      const userId = userData._id;
      // const { THREE, innerWidth, innerHeight } = window;

      if (!sceneMounted) {
         this.mount.appendChild(this.renderer.domElement);
         this.setEventListeners();
      }
      this.setPostProcessing();

      const obj3d = new THREE.Object3D();

      // userData.userObjects.some(obj => {
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

         object.name = "scene 1";
         object.position.set(0, 0, 0);
         obj3d.add(object);
         // this.scene.add(object);
         var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
         object.traverse(function(child) {
            if (
               child instanceof THREE.Mesh &&
               child.name.includes("__advirObj__")
            ) {
               child.material = material;
               // outlinePass.selectedObjects.push( child );
               // this.addSelectedObjectOnLoad( child );
            }
         });

         this.setState({ loadingProgress, loadingError, sceneMounted: true });
      };

      // LOAD MTL FILE
      // const obj = require(`../../assets/obj/scene.obj`);
      // LOAD MTL FILE
      // const mtl = require(`../../assets/obj/scene.mtl`);

      // const obj = "http://almora.io/scene.obj";
      // const obj = require(`../../assets/webgl/modelTest/exportObjScene1.obj`);
      // const mtl = require(`../../assets/webgl/modelTest/exportObjScene1.mtl`);

      // const obj = "Scene.obj";
      // const mtl = "Scene.mtl";
      // const renderPath = "https://s3.us-east-2.amazonaws.com/advirbucket/8f7e892d-7726-480b-8b27-c1e38205b72d/9ca489a9-9f30-49ab-a599-25fbe565e720/";

      // console.log(mtl);

      // {s3 server address}/{userId}/{sceneId}/{sceneName}.obj

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

      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.setPath(renderPath);
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

      this.scene.add(this.group);
      this.group.add(obj3d);
   }

   clear() {
      const { scene } = this;
      var selectedObject = scene.getObjectByName("scene 1");
      scene.remove(selectedObject);

      // Clear object name from form
      this.setState({ clickedPlacement: {} });
   }

   disableControls() {
      this.controls = null;
   }

   enableControls() {
      const controls = new TrackballControls(this.camera);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.noZoom = false;
      controls.noPan = false;
      controls.staticMoving = true;
      controls.dynamicDampingFactor = 0.3;
      controls.keys = [65, 83, 68];

      this.controls = controls;
   }

   enablePointerLockControls() {
      const { THREE } = window;

      const { scene, camera } = this;
      const controls = new THREE.PointerLockControls(camera);

      scene.add(controls.getObject());

      this.controls = controls;
      this.scene = scene;
   }

   TrackballControlsEnableWheel() {
      this.controls.startWheel();
   }

   TrackballControlsDisableWheel() {
      this.controls.stopWheel();
   }

   mouseOnPanel() {
      const isMouseOnPanel = !this.state.isMouseOnPanel;

      // this is so when the mouse is on either panel user can't rotate the scene onclick
      if (isMouseOnPanel) {
         this.controls && this.controls.noRotation();
      } else {
         this.controls && this.controls.yesRotation();
      }

      this.setState({ isMouseOnPanel });
   }

   updateClickedPlacement(newInputs) {
      this.setState({ clickedPlacement: newInputs });
   }

   render() {
      let {
         loadingProgress,
         loadingError,
         selectedScene,
         clickedPlacement,
         sceneMounted
      } = this.state;
      const barColor = "#157cc1";

      loadingProgress =
         !isFinite(loadingProgress) || isNaN(loadingProgress)
            ? 0
            : loadingProgress;

      return (
         <div id="webgl">
            <Panels
               mouseOnPanel={this.mouseOnPanel}
               loadScene={this.loadScene}
               selectScene={this.selectScene}
               selectedScene={selectedScene}
               onSave={this.onSave}
               clickedPlacement={clickedPlacement}
               sceneMounted={sceneMounted}
               updateClickedPlacement={this.updateClickedPlacement}
            />

            {loadingProgress && (
               <div id="scene-loading" className="progressbar-container">
                  <Progress completed={loadingProgress} color={barColor} />
                  {`${loadingProgress}% loaded`}
               </div>
            )}

            {loadingError && (
               <div id="scene-loading" className="progressbar-container">
                  {`${loadingError}`}
               </div>
            )}

            {!sceneMounted && (
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
            )}

            <div
               className="placemeni-img"
               ref={mount => {
                  this.mount = mount;
               }}
            />

            {sceneMounted && (
               <div id="controls">
                  <h5>
                     {/* <b>Hold click and drag = </b>rotate. <b>Hold 'S' = </b>zoom.
              <b>Hold 'D' = </b>pan. */}
                     <b>Q</b> - Up |&nbsp;
                     <b>E</b> - Down |&nbsp;
                     <b>W / ↑ </b> - Forward |&nbsp;
                     <b>A / ← </b> - Left |&nbsp;
                     <b>S / ↓ </b> - Backwards |&nbsp;
                     <b>D / → </b> - Right |&nbsp;
                     <b>Click and drag</b> - Rotate
                  </h5>
               </div>
            )}
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
