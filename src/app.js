
			var camera, scene, renderer;
			var geometry, material, mesh;
			var controls;
			var objects = [];
			var raycaster;
			var blocker = document.getElementById( 'blocker' );
			var instructions = document.getElementById( 'instructions' );
			// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
			localStorage.setItem('gravity', 'normal')

			require(['client'], function(Nes) {

			var client = new Nes.Client('ws://localhost:3000');
			client.connect(function (err) {

				var handler = function (update, flags) {
					console.log(update, flags);

					// update -> { id: 5, status: 'complete' }
					// Second publish is not received (doesn't match)
				};

				client.subscribe('/item/5', handler, function (err) { });
			});
			});
			var gravityValues = {
				low: 4.8,
				normal: 9.8,
				high: 15
			};
			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
			if ( havePointerLock ) {
				var element = document.body;
				var pointerlockchange = function ( event ) {
					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
						controlsEnabled = true;
						controls.enabled = true;
						blocker.style.display = 'none';
					} else {
						controls.enabled = false;
						blocker.style.display = '-webkit-box';
						blocker.style.display = '-moz-box';
						blocker.style.display = 'box';
						instructions.style.display = '';
					}
				};
				var pointerlockerror = function ( event ) {
					instructions.style.display = '';
				};
				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
				instructions.addEventListener( 'click', function ( event ) {
					instructions.style.display = 'none';
					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
					element.requestPointerLock();
				}, false );
			} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			}
			init();
			animate();
			var controlsEnabled = false;
			var moveForward = false;
			var moveBackward = false;
			var moveLeft = false;
			var moveRight = false;
			var canJump = false;
			var prevTime = performance.now();
			var velocity = new THREE.Vector3();
			function init() {
				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				scene = new THREE.Scene();
				scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
				var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );
				controls = new THREE.PointerLockControls( camera );
				scene.add( controls.getObject() );
				var onKeyDown = function ( event ) {
					switch ( event.keyCode ) {
						case 38: // up
						case 87: // w
							moveForward = true;
							break;
						case 37: // left
						case 65: // a
							moveLeft = true; break;
						case 40: // down
						case 83: // s
							moveBackward = true;
							break;
						case 39: // right
						case 68: // d
							moveRight = true;
							break;
						case 32: // space
							if ( canJump === true ) velocity.y += 350;
							canJump = false;
							break;
					}
				};
				var onKeyUp = function ( event ) {
					switch( event.keyCode ) {
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
					}
				};
				document.addEventListener( 'keydown', onKeyDown, false );
				document.addEventListener( 'keyup', onKeyUp, false );
				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
				// floor
				geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
				geometry.rotateX( - Math.PI / 2 );
				for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
					var vertex = geometry.vertices[ i ];
					vertex.x += Math.random() * 20 - 10;
					vertex.y += Math.random() * 2;
					vertex.z += Math.random() * 20 - 10;
				}
				for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
					var face = geometry.faces[ i ];
					face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
				}
				material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );
				// objects
				geometry = new THREE.BoxGeometry( 20, 20, 20 );
				for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
					var face = geometry.faces[ i ];
					face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
				}

				function createBlock (x, y, z) {
					material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
					var mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = x;
					mesh.position.y = y;
					mesh.position.z = z; 
					scene.add( mesh );
					material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					objects.push( mesh );
				}
				// for ( var i = 0; i < 50; i ++ ) {
				// 	material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
				// 	var mesh = new THREE.Mesh( geometry, material );
				// 	mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
				// 	mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
				// 	mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
				// 	scene.add( mesh );
				// 	material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
				// 	objects.push( mesh );
				// }

				for ( var i = 0; i < 15; i ++ ) {
					var x = 20 * i + 40;
					var y = 10 + (20 * i);
					var z = 0; 
					createBlock(x, y, z)
				}
				for ( var i = 0; i < 15; i ++ ) {
					var x = 20 * i + 60;
					var y = 10 + (20 * i);
					var z = 0; 
					createBlock(x, y, z)
				}

				for ( var i = 0; i < 6; i ++ ) {
				createBlock (140, 10 + (i * 20), 0);
				}

				for ( var i = 0; i < 5; i ++ ) {
				createBlock (470, 410 + (i * 20), 0);
				}

				createBlock (430, 310, 0);
				createBlock (450, 310, 0);
				createBlock (470, 310, 0);


				createBlock (490, 1500, 0);
				createBlock (510, 1500, 0);
				createBlock (530, 1500, 0);
				
				//
				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0xffffff );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
				//
				window.addEventListener( 'resize', onWindowResize, false );
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function animate() {
				requestAnimationFrame( animate );
				if ( controlsEnabled ) {
					raycaster.ray.origin.copy( controls.getObject().position );
					raycaster.ray.origin.y -= 10;
					var intersections = raycaster.intersectObjects( objects );
					var isOnObject = intersections.length > 0;
					var time = performance.now();
					var delta = ( time - prevTime ) / 1000;
					var gravity = gravityValues[localStorage.getItem('gravity')];
					velocity.x -= velocity.x * 10.0 * delta;
					velocity.z -= velocity.z * 10.0 * delta;
					velocity.y -= gravity * 100.0 * delta; // 100.0 = mass
					if ( moveForward ) velocity.z -= 400.0 * delta;
					if ( moveBackward ) velocity.z += 400.0 * delta;
					if ( moveLeft ) velocity.x -= 400.0 * delta;
					if ( moveRight ) velocity.x += 400.0 * delta;
					if ( isOnObject === true ) {
						velocity.y = Math.max( 0, velocity.y );
						canJump = true;
					}
					controls.getObject().translateX( velocity.x * delta );
					controls.getObject().translateY( velocity.y * delta );
					controls.getObject().translateZ( velocity.z * delta );
					if ( controls.getObject().position.y < 10 ) {
						velocity.y = 0;
						controls.getObject().position.y = 10;
						canJump = true;
					}
					prevTime = time;
				}
				renderer.render( scene, camera );
			}