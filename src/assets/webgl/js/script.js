var container, stats;
var camera, scene, renderer;
var controls;

var composer, effectFXAA, outlinePass, renderPass;

$(document).ready( function() {
	init();
	animate();
} );

function init() {

	// container = document.createElement( 'div' );
	// container = document.getElementById( 'webgl' );
	container = $('#webgl');
	// document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );

	// scene

	scene = new THREE.Scene();

	scene.fog = new THREE.Fog( 0xffffff, 1, 100 );
	scene.fog.color.setHSL( 0.6, 0, 1 );	

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( $(container).innerWidth(), $(container).innerHeight() );
	// renderer.setClearColor( new THREE.Color( 0xffffff ) );
	// container.appendChild( renderer.domElement );
	$( renderer.domElement ).css( 'position', 'absolute' );
	container.prepend( renderer.domElement );

	// postprocessing
	composer = new THREE.EffectComposer( renderer );

	renderPass = new THREE.RenderPass( scene, camera );
	composer.addPass( renderPass );

	outlinePass = new THREE.OutlinePass( new THREE.Vector2( $(container).innerWidth(), $(container).innerHeight() ), scene, camera);
	outlinePass.edgeStrength = 10;
	outlinePass.edgeGlow = 0;
	outlinePass.edgeThickness = 1;
	outlinePass.pulsePeriod = 0;
	outlinePass.visibleEdgeColor = new THREE.Color("#ff0000");
	outlinePass.hiddenEdgeColor = new THREE.Color("#190a05");
	composer.addPass( outlinePass );

	effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
	effectFXAA.uniforms['resolution'].value.set(1 / $(container).innerWidth(), 1 / $(container).innerHeight() );
	effectFXAA.renderToScreen = true;
	composer.addPass( effectFXAA );

	var ambient = new THREE.AmbientLight( 0x444444 );
	scene.add( ambient );

	// setting light.
	var RAD = 3.14 * 180.0;

	var backLight = new THREE.DirectionalLight( 0x7799b6, 0.3 );
	backLight.position.set( 0, 0, -1 ).applyEuler( new THREE.Euler( -148.20 * RAD, -36.54 * RAD, 98.42 * RAD ) ).normalize();
	scene.add( backLight );

	var fillLight = new THREE.DirectionalLight( 0xe5d4b4, 0.1 );
	fillLight.position.set( 0, 0, -1 ).applyEuler( new THREE.Euler( -90 * RAD, 50.87 * RAD, -50.87 * RAD ) ).normalize();
	scene.add( fillLight );

	var keyLight = new THREE.DirectionalLight( 0xfffbf4, 0.3 );
	keyLight.position.set( 0, 0, -1 ).applyEuler( new THREE.Euler( -51.57 * RAD, -31.85 * RAD, 15.70 * RAD ) ).normalize();
	scene.add( keyLight );

	var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 500, 0 );
	scene.add( hemiLight );

	// GROUND

	var groundGeo = new THREE.PlaneBufferGeometry( 1000, 1000 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
	groundMat.color.setHSL( 0.095, 1, 0.75 );

	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	ground.position.y = -0.5;
	scene.add( ground );

	// SKYDOME

	var vertexShader = 'varying vec3 vWorldPosition; void main() { vec4 worldPosition = modelMatrix * vec4( position, 1.0 ); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }';
	var fragmentShader = 'uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main() { float h = normalize( vWorldPosition + offset ).y; gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 ); }';
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xffffff ) },
		offset:      { value: 0 },
		exponent:    { value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );

	scene.fog.color.copy( uniforms.bottomColor.value );

	var skyGeo = new THREE.SphereGeometry( 300, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );

	controls = new THREE.PointerLockControls( camera, scene, onObjectClick );
	scene.add( controls.getObject() );

	// model

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) { };

	// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( 'webgl/model/' );
	mtlLoader.load( 'exportObjScene1.mtl', function( materials ) {

		materials.preload();

		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( 'webgl/model/' );
		objLoader.load( 'exportObjScene1.obj', function ( object ) {

			scene.add( object );
			var tempMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
			object.traverse( function( obj ) {
				if ( obj instanceof THREE.Mesh && obj.name.includes( '__advirObj__' ) ) {
					obj.material = tempMat.clone();

					outlinePass.selectedObjects.push( obj );
				}
			} );

		}, onProgress, onError );

	});

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
	var width = $(container).innerWidth();
	var height = $(container).innerHeight();
	// camera.aspect = window.innerWidth / window.innerHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	// renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( width, height );
	composer.setSize( width, height );
	effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height );
}

function animate() {

	requestAnimationFrame( animate );
	controls.update();
	render();

}

function render() {
	renderer.autoClear = true;
	renderer.setClearColor( 0xfff0f0 );
	renderer.setClearAlpha( 0.0 );
	composer.render();
	// renderer.render( scene, camera );

}

function onObjectClick( obj ) {
	$('#selected-obj-name').val( obj.name );
}