/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function (pCamera) {
      var scope = this;

      var moveForwardWheel = false;
      var moveBackwardWheel = false;
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

      var onMouseWheel = function (event) {
            event.preventDefault();

            if (event.deltaY < 0) {
                  moveForwardWheel = true;
            } else if (event.deltaY > 0) {
                  moveBackwardWheel = true;
            } else {
                  moveForwardWheel = false;
                  moveBackwardWheel = false;
            }
      };

      var onMouseMove = function (event) {
            if (scope.enabled === false) return;

            var movementX =
                  event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY =
                  event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            if (!scope.wheelClick) {
                  yawObject.rotation.y -= movementX * 0.002;
                  pitchObject.rotation.x -= movementY * 0.002;

                  pitchObject.rotation.x = Math.max(-PI_2,
                        Math.min(PI_2, pitchObject.rotation.x)
                  );
            } else {
                  document.body.style.cursor = "move";
                  if (movementX > 0) {
                        moveRight = false;
                        moveLeft = true;
                  } else if (movementX < 0) {
                        moveLeft = false;
                        moveRight = true;
                  }

                  if (movementY > 0) {
                        moveDown = false;
                        moveUp = true;
                  } else if (movementY < 0) {
                        moveUp = false;
                        moveDown = true;
                  }
            }
      };

      var onMouseUp = function (event) {
            scope.wheelClick && (document.body.style.cursor = "default");

            scope.enabled = false;
            scope.wheelClick = false;

            moveRight = false;
            moveLeft = false;
            moveUp = false;
            moveDown = false;
      };

      var onMouseDown = function (event) {
            event.preventDefault();

            scope.enabled = true;

            // If the user clicks with the wheel
            event.which === 2 && (scope.wheelClick = true);
      };

      var onKeyDown = function (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
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

      var onKeyUp = function (event) {
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

      this.noRotation = function () {
            // document.body.style.cursor = "default";
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("wheel", onMouseWheel, false);
      };

      this.yesRotation = function () {
            // document.body.style.cursor = "alias";
            document.addEventListener("mousemove", onMouseMove, false);
            document.addEventListener("wheel", onMouseWheel, false);
      };

      this.dispose = function () {
            document.removeEventListener("wheel", onMouseWheel, false);
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("mouseup", onMouseUp, false);
            document.removeEventListener("mousedown", onMouseDown, false);
            document.removeEventListener("keydown", onKeyDown, false);
            document.removeEventListener("keyup", onKeyUp, false);
      };

      this.enable = function () {
            document.addEventListener("wheel", onMouseWheel, false);
            document.addEventListener("mousemove", onMouseMove, false);
            document.addEventListener("mouseup", onMouseUp, false);
            document.addEventListener("mousedown", onMouseDown, false);
            document.addEventListener("keydown", onKeyDown, false);
            document.addEventListener("keyup", onKeyUp, false);
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

      this.getObject = function () {
            return yawObject;
      };

      this.getDirection = (function () {
            // assumes the camera itself is not rotated

            var direction = new THREE.Vector3(0, 0, -1);
            var rotation = new THREE.Euler(0, 0, 0, "YXZ");

            return function (v) {
                  rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

                  v.copy(direction).applyEuler(rotation);

                  return v;
            };
      })();

      this.update = function () {
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
            var speed = moveForwardWheel || moveBackwardWheel ? 18 : 5;
            var velCoefficient = 10;

            velocity.x -= velocity.x * velCoefficient * delta;
            velocity.z -= velocity.z * velCoefficient * delta;
            velocity.y -= velocity.y * velCoefficient * delta;

            var _dir = new THREE.Vector3();
            if (moveForward) {
                  _dir = scope.getDirection(_dir);
                  velocity.add(_dir.multiplyScalar(speed * delta));
            }
            if (moveForwardWheel) {
                  _dir = scope.getDirection(_dir);
                  velocity.add(_dir.multiplyScalar(speed * delta));
                  moveForwardWheel = false;
            }
            if (moveBackward) {
                  _dir = scope.getDirection(_dir);
                  velocity.add(_dir.multiplyScalar(-speed * delta));
            }
            if (moveBackwardWheel) {
                  _dir = scope.getDirection(_dir);
                  velocity.add(_dir.multiplyScalar(-speed * delta));
                  moveBackwardWheel = false;
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