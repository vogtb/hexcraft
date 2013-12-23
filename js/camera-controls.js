/**
 * Modified from James Baicoianu's example at http://threejs.org/examples/js/controls/FlyControls.js
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {
	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', -1 );

	this.movementSpeed = 8.0;
	this.rollSpeed = 0.005;

	this.dragToLook = false;
	this.autoForward = false;

	this.tmpQuaternion = new THREE.Quaternion();

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new THREE.Vector3( 0, 0, 0 );
	this.rotationVector = new THREE.Vector3( 0, 0, 0 );

	this.handleEvent = function ( event ) {
		if ( typeof this[ event.type ] == 'function' ) {
			this[ event.type ]( event );
		}
	};

	this.keydown = function( event ) {

		if ( event.altKey ) {
			return;
		}

		//event.preventDefault();

		switch ( event.keyCode ) {
			case 87: /*W*/ this.moveState.forward = 1; break;
			case 83: /*S*/ this.moveState.back = 1; break;

			case 65: /*A*/ this.moveState.left = 1; break;
			case 68: /*D*/ this.moveState.right = 1; break;

			case 82: /*R*/ this.moveState.up = 1; break;
			case 70: /*F*/ this.moveState.down = 1; break;

			case 38: /*up*/ this.moveState.pitchUp = 1; break;
			case 40: /*down*/ this.moveState.pitchDown = 1; break;

			case 37: /*left*/ this.moveState.yawLeft = 1; break;
			case 39: /*right*/ this.moveState.yawRight = 1; break;

      case 84: this.reset = 1; break;
		}

		this.updateMovementVector();
		this.updateRotationVector();
	};

	this.keyup = function( event ) {
		switch( event.keyCode ) {
			case 87: /*W*/ this.moveState.forward = 0; break;
			case 83: /*S*/ this.moveState.back = 0; break;

			case 65: /*A*/ this.moveState.left = 0; break;
			case 68: /*D*/ this.moveState.right = 0; break;

			case 82: /*R*/ this.moveState.up = 0; break;
			case 70: /*F*/ this.moveState.down = 0; break;

			case 38: /*up*/ this.moveState.pitchUp = 0; break;
			case 40: /*down*/ this.moveState.pitchDown = 0; break;

			case 37: /*left*/ this.moveState.yawLeft = 0; break;
			case 39: /*right*/ this.moveState.yawRight = 0; break;

      case 84: this.reset = 0; break;
		}

		this.updateMovementVector();
		this.updateRotationVector();
	};

	this.update = function( delta ) {
		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;

    this.object.translateX( this.moveVector.x * moveMult );
    this.object.translateZ( this.moveVector.z * moveMult );
    
    this.object.position.y += this.moveVector.y *moveMult;

    this.object.rotation.x += this.rotationVector.x * rotMult;
    this.object.rotation.y += this.rotationVector.y * rotMult;
    this.object.rotation.z = 0;
	};

	this.updateMovementVector = function() {
		var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;
		this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
		this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
		this.moveVector.z = ( -forward + this.moveState.back );
	};

	this.updateRotationVector = function() {
		this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
    this.rotationVector.y = ( -this.moveState.yawRight  + this.moveState.yawLeft );
	};

	this.getContainerDimensions = function() {
		if ( this.domElement != document ) {
			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};
		} else {
			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};
		}
	};

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'keydown', bind( this, this.keydown ), false );
	this.domElement.addEventListener( 'keyup',   bind( this, this.keyup ), false );

	this.updateMovementVector();
	this.updateRotationVector();
};