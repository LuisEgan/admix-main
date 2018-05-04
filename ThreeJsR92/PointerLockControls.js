/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function(pCamera) {
   var scope = this;

   var moveForward = false;
   var moveBackward = false;
   var moveLeft = false;
   var moveRight = false;
   var moveUp = false;
   var moveDown = false;
   var velocity = new THREE.Vector3();
   var prevTime = performance.now();

   var camera = pCamera;
   camera.rotation.set(0, 0, 0);

   var pitchObject = new THREE.Object3D();
   pitchObject.add(camera);

   var yawObject = new THREE.Object3D();
   yawObject.position.y = 0;
   yawObject.add(pitchObject);

   var PI_2 = Math.PI / 2;

   //==============
   // FUNCTIONS
   //==============

   var onMouseWheel = function(event) {
      if (event.deltaY < 0) {
         moveForward = true;
      } else if (event.deltaY > 0) {
         moveBackward = true;
      } else {
         moveForward = false;
         moveBackward = false;
      }
   };

   var onMouseMove = function(event) {
      if (scope.enabled === false) return;

      var movementX =
         event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY =
         event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * 0.002;
      pitchObject.rotation.x -= movementY * 0.002;

      pitchObject.rotation.x = Math.max(
         -PI_2,
         Math.min(PI_2, pitchObject.rotation.x)
      );
   };

   var onMouseUp = function(event) {
      scope.enabled = false;
   };

   var onMouseDown = function(event) {
      console.log("event.which: ", event.which);
      scope.enabled = true;
   };

   var onKeyDown = function(event) {
      var target = event.target || event.srcElement;
      if (target.nodeName.toLowerCase() == "input") return;
      switch (event.keyCode) {
         case 38: // up
         case 87: // w
            moveForward = true;
            break;
         case 37: // left
         case 65: // a
            moveLeft = true;
            break;
         case 40: // down
         case 83: // s
            moveBackward = true;
            break;
         case 39: // right
         case 68: // d
            moveRight = true;
            break;
         case 81: // q
            moveUp = true;
            break;
         case 69: // e
            moveDown = true;
            break;
      }
   };

   var onKeyUp = function(event) {
      switch (event.keyCode) {
         case 38: // up
         case 87: // w
            moveForward = false;
            break;
         case 37: // left
         case 65: // a
            moveLeft = false;
            break;
         case 40: // down
         case 83: // s
            moveBackward = false;
            break;
         case 39: // right
         case 68: // d
            moveRight = false;
            break;
         case 81: // q
            moveUp = false;
            break;
         case 69: // e
            moveDown = false;
            break;
      }
   };

   this.noRotation = function() {
      document.removeEventListener("mousemove", onMouseMove, false);
   };

   this.yesRotation = function() {
      document.addEventListener("mousemove", onMouseMove, false);
   };

   //==============
   // EVENT LISTENERS
   //==============

   document.addEventListener("wheel", onMouseWheel, false);
   document.addEventListener("mousemove", onMouseMove, false);
   document.addEventListener("mouseup", onMouseUp, false);
   document.addEventListener("mousedown", onMouseDown, false);
   document.addEventListener("keydown", onKeyDown, false);
   document.addEventListener("keyup", onKeyUp, false);

   this.enabled = false;

   this.getObject = function() {
      return yawObject;
   };

   this.getDirection = (function() {
      // assumes the camera itself is not rotated

      var direction = new THREE.Vector3(0, 0, -1);
      var rotation = new THREE.Euler(0, 0, 0, "YXZ");

      return function(v) {
         rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

         v.copy(direction).applyEuler(rotation);

         return v;
      };
   })();

   this.update = function() {
      var time = performance.now();
      var delta = (time - prevTime) / 1000;
      var speed = 0.5;
      var velCoefficient = 3;

      velocity.x -= velocity.x * velCoefficient * delta;
      velocity.z -= velocity.z * velCoefficient * delta;
      velocity.y -= velocity.y * velCoefficient * delta;

      var _dir = new THREE.Vector3();
      if (moveForward) {
         _dir = scope.getDirection(_dir);
         velocity.add(_dir.multiplyScalar(speed * delta));
      }
      if (moveBackward) {
         _dir = scope.getDirection(_dir);
         velocity.add(_dir.multiplyScalar(-speed * delta));
      }
      if (moveLeft) {
         _dir = scope.getDirection(_dir);
         _dir.cross(new THREE.Vector3(0.0, 1.0, 0.0)).normalize();
         velocity.add(_dir.multiplyScalar(-speed * delta));
      }
      if (moveRight) {
         _dir = scope.getDirection(_dir);
         _dir.cross(new THREE.Vector3(0.0, 1.0, 0.0)).normalize();
         velocity.add(_dir.multiplyScalar(speed * delta));
      }
      if (moveUp) {
         _dir.set(0.0, 1.0, 0.0);
         velocity.add(_dir.multiplyScalar(speed * delta));
      }
      if (moveDown) {
         _dir.set(0.0, 1.0, 0.0);
         velocity.add(_dir.multiplyScalar(-speed * delta));
      }

      scope.getObject().position.add(velocity);
      // scope.getObject().translateX(velocity.x * delta);
      // scope.getObject().translateY(velocity.y * delta);
      // scope.getObject().translateZ(velocity.z * delta);

      prevTime = time;
   };
};
