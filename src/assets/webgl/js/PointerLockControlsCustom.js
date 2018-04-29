/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function(pCamera, pScene, pCbItemClickListener) {
  var scope = this;

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var moveUp = false;
  var moveDown = false;
  var velocity = new THREE.Vector3();
  var prevTime = performance.now();

  var mouse = new THREE.Vector2();
  var INTERSECTED;
  var SELECTED;
  var SELECTED_currentHex;
  var raycaster = new THREE.Raycaster();
  var camera = pCamera;
  var scene = pScene;
  var cbItemClickListener = pCbItemClickListener;

  camera.rotation.set(0, 0, 0);
  var cameraPos = camera.position.clone();
  console.log("cameraPos: ", cameraPos);

  var pitchObject = new THREE.Object3D();
  pitchObject.add(camera);

  var yawObject = new THREE.Object3D();

  // yawObject.position = cameraPos;
  yawObject.position.y = 0;
  yawObject.position.x = 0;
  yawObject.rotation.y = -Math.PI * 0.5;
  yawObject.add(pitchObject);

  var PI_2 = Math.PI / 2;

  var element = document.body;
  // var element = document.getElementById("webgl");

  var pointerlockchange = function(event) {
    if (
      document.pointerLockElement === element ||
      document.mozPointerLockElement === element ||
      document.webkitPointerLockElement === element
    ) {
      scope.enabled = true;

      prevTime = performance.now();
      velocity.set(0.0, 0.0, 0.0);

      // document.addEventListener( 'mousemove', onMouseMove, false );
    } else {
      scope.enabled = false;

      // document.removeEventListener( 'mousemove', onMouseMove, false );
    }
  };
  var pointerlockerror = function(event) {};

  var clickIsValid = true;
  var dontClick = function() {
    clickIsValid = false;
    // when mouse down.
    // element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    // element.requestPointerLock();
    scope.enabled = true;

    prevTime = performance.now();
    velocity.set(0.0, 0.0, 0.0);
  };
  var cancelClick;

  var onMouseDown = function(event) {
    var target = event.target || event.srcElement;
    if (target.nodeName.toLowerCase() != "canvas") return;

    cancelClick = setTimeout(dontClick, 100);
  };

  var onMouseMove = function(event) {
    // if ( scope.enabled === false ) return;
    if (scope.enabled) {
      var movementX =
        event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY =
        event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * 0.002;

      // pitchObject.rotation.x -= movementY * 0.002;

      // pitchObject.rotation.x = Math.max(
      //   -PI_2,
      //   Math.min(PI_2, pitchObject.rotation.x)
      // );
    } else {
      // mouse.x =
      //   (event.pageX - $(element).offset().left) / $(element).innerWidth() * 2 -
      //   1;
      // mouse.y =
      //   -((event.pageY - $(element).offset().top) / $(element).innerHeight()) *
      //     2 +
      //   1;
    }
  };

  var onMouseUp = function(event) {
    clearTimeout(cancelClick);
    if (clickIsValid) {
      // when clicked.
      if (cbItemClickListener && INTERSECTED) {
        cbItemClickListener(INTERSECTED);

        // console.log(INTERSECTED.name + ':' + SELECTED.name);

        if (INTERSECTED == SELECTED) {
          SELECTED = null;
          INTERSECTED.currentHex = SELECTED_currentHex;
        } else {
          if (SELECTED) SELECTED.material.color.setHex(SELECTED_currentHex);
          SELECTED = INTERSECTED;
          SELECTED_currentHex = INTERSECTED.currentHex;
        }
      }
    } else {
      // when mouse up.
      // document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
      // document.exitPointerLock();

      scope.enabled = false;
    }
    clickIsValid = true;
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

  // element.addEventListener("mousemove", onMouseMove, false);
  element.addEventListener("mousedown", onMouseDown, false);
  element.addEventListener("mouseup", onMouseUp, false);

  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("pointerlockchange", pointerlockchange, false);
  document.addEventListener("mozpointerlockchange", pointerlockchange, false);
  document.addEventListener(
    "webkitpointerlockchange",
    pointerlockchange,
    false
  );
  document.addEventListener("pointerlockerror", pointerlockerror, false);
  document.addEventListener("mozpointerlockerror", pointerlockerror, false);
  document.addEventListener("webkitpointerlockerror", pointerlockerror, false);

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

  this.dispose = function() {
    document.removeEventListener("mousemove", onMouseMove, false);
  };

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

    prevTime = time;

    camera.updateMatrixWorld();
    if (scope.enabled) {
      /*
			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			// velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
			// velocity.y -= velocity.y * 10.0 * delta; // 100.0 = mass
			if ( moveForward ) velocity.z -= 100.0 * delta;
			if ( moveBackward ) velocity.z += 100.0 * delta;
			if ( moveLeft ) velocity.x -= 100.0 * delta;
			if ( moveRight ) velocity.x += 100.0 * delta;

			scope.getObject().translateX( velocity.x * delta );
			// controls.getObject().translateY( velocity.y * delta );
			scope.getObject().translateZ( velocity.z * delta );

			prevTime = time;
			*/
    } else {
      // find intersections
      // raycaster.setFromCamera(mouse, camera);
      // var intersects = raycaster.intersectObjects(scene.children, true);
      // var advirObj_id = -1;
      // for (var i = 0; i < intersects.length; i++) {
      //   if (
      //     intersects[i].object.type == "Mesh" &&
      //     intersects[i].object.name.includes("__advirObj__")
      //   ) {
      //     advirObj_id = i;
      //     break;
      //   }
      // }
      // if (advirObj_id != -1) {
      //   if (INTERSECTED != intersects[advirObj_id].object) {
      //     if (INTERSECTED && INTERSECTED != SELECTED) {
      //       INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      //     }
      //     INTERSECTED = intersects[advirObj_id].object;
      //     INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      //     INTERSECTED.material.color.setHex(0xff0000);
      //   }
      // } else {
      //   if (INTERSECTED && INTERSECTED != SELECTED) {
      //     INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      //   }
      //   INTERSECTED = null;
      // }
    }
  };
};
