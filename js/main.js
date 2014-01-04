//Scene variables
var camera, scene, renderer;
var mesh, light;
var dirLight, hemiLight;
var controls;
var delta;
var projector, raycaster, intersects;
var mouse = new THREE.Vector2(), INTERSECTED;
var clock = new THREE.Clock();

//Hexagon constants
var SIZE = 12;
var THICKNESS = 5;
var HEIGHT = SIZE*2;
var WIDTH = (Math.sqrt(3)/2) * HEIGHT;

//Board Constants
var xCount = 40;
var yCount = 40;
var zCount = 40;
var board;

//Tools
var TOOLS = {
  add: 0,
  remove: 1
};
var currentTool = TOOLS.add;
var currentHexagonPosition = {x:0, y:0, z:0};
var phantomHexagon;
var hexcount = 0;
var currentGame;

//Game element to stamp out in the DOM
var gameElement = $('.modal-body.list').html();

//Colors
var COLORS = [0xFFFFFF, 0xFAFAFA, 0xF6F6F6, 0xF1F1F1, 0xEDEDED, 0xE8E8E8];
var currentColor = 0xE32818;
var sky = 0xBFE6FF;
var ground = 0x333333;

//Set the draw div to be the height of the window
$('#draw').css('height', window.innerWidth - $('.nav').height());

init();
hud();
animate();
firstLoad();

//Places the heads up display
function hud() {
  var hud = $('.hud');
  hud.css('left', ((window.innerWidth/2) - (hud.width()/2)));
  hud.find('.center').css('width', hud.width()-24)
  hud.show();
}

function firstLoad() {
  //If this is a first time user, trigger the welcome modal.
  if (localStorage.hex == undefined) {
    $('#welcomeModal').modal('toggle');
  }
  //Find which game we'll be saving to
  for (var i = 1; i < 30; i++) {
    var name = 'game' + i;
    if (!localStorage.hasOwnProperty(name)) {
      currentGame = name;
      break;
    }
  }
}

function init() {
  //WebGL detection and redirection
  if (!Detector.webgl) {
    window.location = "http://get.webgl.org";
  }

  //Camera initialization
  camera = new THREE.PerspectiveCamera( 39, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.eulerOrder = "YXZ"
  camera.position.z = 200;
  camera.position.y = 40;
  camera.position.x = 100;
  camera.lookAt(getHexagonPositionFromLocation(Math.floor(xCount/2), 0, Math.floor(zCount/2)));

  //Controls
  controls = new THREE.FlyControls(camera);
  controls.movementSpeed = 70;
  controls.domElement = draw;
  controls.rollSpeed = Math.PI / 7;
  controls.autoForward = false;
  controls.dragToLook = false;

  //Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 500, 1200);

  //Lights
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  scene.add( hemiLight );
  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL( 0.1, 1, 0.95 );
  dirLight.position.set( -1, 1.75, 1 );
  dirLight.position.multiplyScalar( 50 );
  scene.add( dirLight );
  dirLight.castShadow = true;
  dirLight.shadowMapWidth = 2048;
  dirLight.shadowMapHeight = 2048;
  var d = 50;
  dirLight.shadowCameraLeft = -d;
  dirLight.shadowCameraRight = d;
  dirLight.shadowCameraTop = d;
  dirLight.shadowCameraBottom = -d;
  dirLight.shadowCameraFar = 3500;
  dirLight.shadowBias = -0.0001;
  dirLight.shadowDarkness = 0.35;


  //Ground
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(50000, 50000), new THREE.MeshPhongMaterial({ambient: ground, color: ground, specular: ground}) );
  ground.name = 'ground';
  ground.rotation.x = -Math.PI/2;
  ground.position.y = 0;
  scene.add( ground );
  ground.receiveShadow = true;

  //Board to store hexagon colors for loading, saving
  board = new Board(xCount, zCount, yCount);

  //Initializing floor hexagons
  for (var x = 0; x < board.width; x++) {
    for (var z = 0; z < board.depth; z++) {
      var hexagon = newFloorHexagon(SIZE, THICKNESS);
      var mesh = new THREE.Mesh(hexagon, new THREE.MeshLambertMaterial(
        { color: COLORS[Math.floor(Math.random()*6)], shading: THREE.FlatShading, ambient: 0xffffff, wireframe: false }));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.boardLocation = {x: x, z: z, y: 0};
      mesh.name = "floor";
      board.setHexagon({x: x, z: z, y: 0}, mesh.material.color);
      scene.add(mesh);
      mesh.position = getHexagonPositionFromLocation(x, 0, z);
    }
  }
  
  //Phantom hexagon to act as selector for adding and removing.
  var hexagon = newHexagon(SIZE, THICKNESS);
  phantomHexagon = new THREE.Mesh(hexagon, new THREE.MeshNormalMaterial( { color: currentColor, emissive: currentColor, ambient: currentColor, transparent: true, opacity: 0 } ));
  scene.add(phantomHexagon);
  phantomHexagon.name = 'phantomHexagon';
  
  //Projector and raycaster for instersection with mouse location
  projector = new THREE.Projector();
  raycaster = new THREE.Raycaster();
  
  //Bind events
  bindEvents();
  
  //Engage the rendered
  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  draw.appendChild( renderer.domElement );
  renderer.setClearColor( sky, 1 );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.physicallyBasedShading = true;
  renderer.shadowMapEnabled = false;
  renderer.shadowMapCullFace = THREE.CullFaceBack;
  document.body.appendChild( renderer.domElement );
}

//Binding common mouse events
function bindEvents() {
  //Handle apsect ratios when the user resizes
  window.addEventListener('resize', onWindowResize, false);
  //Change location of phantom hexagon on mouse move
  $('#draw').on('mousemove', onDocumentMouseMove);
  //Handle mouse clicks
  $('#draw').on('click', onDocumentMouseClick);
  
  //Select 'add hexagon' tool
  $('.button.add').on('click', function(e) {
    //remove is not active
    var button = $('.button.remove');
    var classes = button.attr('class');
    classes = classes.replace(' active', '');
    button.attr('class', classes);
    //add is active
    button = $('.button.add');
    var classes = button.attr('class');
    if (classes.search(' active') == -1) {
      classes = classes + ' active';
      button.attr('class', classes);
    }
    currentTool = TOOLS.add;
  });
  
  //Select 'remove hexagon' tool
  $('.button.remove').on('click', function(e) {
    //add is not active
    var button = $('.button.add');
    var classes = button.attr('class');
    classes = classes.replace(' active', '');
    button.attr('class', classes);
    //remove is active
    button = $('.button.remove');
    var classes = button.attr('class');
    if (classes.search('active') == -1) {
      classes = classes + ' active';
      button.attr('class', classes);
    }
    currentTool = TOOLS.remove;
  });
  
  //Save the current scene to local storage
  $('.button.save').on('click', function(e) {
    localStorage.hex = true;
    var game = {tiles: board.getActiveTiles(), date: moment().format('MMMM Do YYYY, h:mm a')};
    localStorage[currentGame] = JSON.stringify(game);
  });
  
  //Trigger the load modal, and populated it with saved games
  $('.button.load').on('click', function(e) {
    $('.modal-body.list').empty();
    for (var i = 1; i < 30; i++) {
      var name = 'game' + i.toString();
      if (localStorage.hasOwnProperty(name)) {
        $('.modal-body.list').append(gameElement);
        var game = JSON.parse(localStorage[name]);
        var single = $('.modal-body.list').children().last();
        single.find('.how-many').text(game.tiles.length.toString() + ' hexagons');
        single.find('.date').text(game.date);
        single.find('.loadme a').attr('id', name).on('click', function(event) {
          currentGame = event.target.id;
          var game = JSON.parse(localStorage[currentGame]);
          loadGame(game.tiles);
          $('#loadModal').modal('hide');
        });
      } else {
        break;
      }
    }
    $('#loadModal').modal('toggle');
  });
  
  //Wipe the current game, start a new localStorage game
  $('.button.new').on('click', function(e) {
    clearScene();
    resetScene();
    for (var i = 1; i < 30; i++) {
      var name = 'game' + i;
      if (!localStorage.hasOwnProperty(name)) {
        currentGame = name;
        break;
      }
    }
  });
  
  //Show welcome modal for more information
  $('.button.info').on('click', function(e) {
    $('#welcomeModal').modal('show');
  });
  
  //Load demo game
  $('.demo').on('click', function(e) {
    $('#welcomeModal').modal('hide');
    clearScene();
    resetScene();
    loadGame(demos[event.target.id].tiles);
  });
  
  //Bind mouse wheel for zoom/perspective control
  $("#draw").bind('mousewheel', function (e) { 
   if(e.originalEvent.wheelDelta /120 > 0) {
     if (camera.fov < 60)
       camera.projectionMatrix.makePerspective( camera.fov += 2, window.innerWidth / window.innerHeight, 1, 2000 );
   }
   else {
     if (camera.fov > 30)
       camera.projectionMatrix.makePerspective( camera.fov -= 2, window.innerWidth / window.innerHeight, 1, 2000 );
   }
  });
  
  //Binding the enter key to add a hexagon
  $(document).on('keypress', function (event) {
    if (event.keyCode == 13) {
      switch (currentTool) {
        case TOOLS.remove:
          removeHexagon();
          break;
        case TOOLS.add:
          addHexagon();
          break;
      }
    }
  });
  
  //Binding the collor picker
  $('.picker').colorpicker({color: '#0066cc'})
  .on('changeColor', function(ev) {
    currentColor = parseInt(ev.color.toHex().replace('#', '0x'));
    $('.picker polygon.color').css('fill', currentColor.toString(16));
    $('.picker polygon.drop').css('fill', currentColor.toString(16));
  });


  //Tool tips
  $('[data-toggle="tooltip"]').tooltip({
      'placement': 'bottom'
  });
}

//Handling mouse moves
function onDocumentMouseMove( event ) {
  //When the mouse is over the game, and not the color picker, hide color picker
  $('.picker').colorpicker('hide');
  event.preventDefault();
  //Capture mouse location
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

//Routing mouse click events based on tool
function onDocumentMouseClick() {
  switch (currentTool) {
    case TOOLS.remove:
      removeHexagon();
      break;
    case TOOLS.add:
      addHexagon();
      break;
  }
}

//Reset the 'floor' hexagons for a new scene
function resetScene() {
  for (var x = 0; x < board.width; x++) {
    for (var z = 0; z < board.depth; z++) {
      var hexagon = newFloorHexagon(SIZE, THICKNESS);
      var mesh = new THREE.Mesh(hexagon, new THREE.MeshLambertMaterial(
        { color: COLORS[Math.floor(Math.random()*6)], shading: THREE.FlatShading, ambient: 0xffffff, wireframe: false }));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.boardLocation = {x: x, z: z, y: 0};
      mesh.name = "floor";
      board.setHexagon({x: x, z: z, y: 0}, mesh.material.color);
      scene.add(mesh);
      mesh.position = getHexagonPositionFromLocation(x, 0, z);
    }
  }
}

//Load a saved game
function loadGame(tiles) {
  clearScene();
  resetScene();

  //Add the hexagons one by one
  for (var i = 0; i < tiles.length; i++) {
    var hexagon = newHexagon(SIZE, THICKNESS);
    var mesh = new THREE.Mesh(hexagon, new THREE.MeshLambertMaterial(
      { color: tiles[i].color, shading: THREE.FlatShading, ambient: 0xffffff, wireframe: false }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.name = 'tile';
    mesh.position = getHexagonPositionFromLocation(tiles[i].x, tiles[i].y, tiles[i].z);
    mesh.boardLocation = {x: tiles[i].x, y: tiles[i].y, z:tiles[i].z};
    board.setHexagon({x: tiles[i].x, y: tiles[i].y, z:tiles[i].z}, tiles[i].color);
    
    updateHexcount(hexcount+1);
  }
}

//Clears an entire scene, including the floor.
function clearScene() {
  board = new Board(xCount, zCount, yCount);
  var removeList = [];
  for (var i = 0; i < scene.children.length; i++) {
    if (scene.children[i].name == 'tile' || scene.children[i].name == 'floor') {
      removeList.push(scene.children[i])
    }
  }
  for (var i = 0; i < removeList.length; i++) {
    scene.remove(removeList[i]);
  }
  updateHexcount(0);
}

//Push the hexagon count to the HUD
function updateHexcount(number) {
  hexcount = number;
  $('.hexcount').text(hexcount + ' hexagons');
}

//Remove the selected hexagon
function removeHexagon() {
  if ((INTERSECTED.name != 'ground' && INTERSECTED.name != 'floor') && intersects[1].object.name !== 'phantomHexagon') {
    scene.remove(intersects[1].object);
    phantomHexagon.material.opacity = 0;
    phantomHexagon.position = new THREE.Vector3(-100, -100, -100);
    board.unsetHexagon({x: currentHexagonPosition.x, y: currentHexagonPosition.y, z:currentHexagonPosition.z});
    updateHexcount(hexcount-1);
  }
}

//Add a hexagon at the appropriate location
function addHexagon() {
  if (INTERSECTED.name != 'ground') {
    var hexagon = newHexagon(SIZE, THICKNESS);
    var mesh = new THREE.Mesh(hexagon, new THREE.MeshLambertMaterial(
      { color: currentColor, shading: THREE.FlatShading, ambient: 0xffffff, wireframe: false }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.name = 'tile';
    mesh.position = getHexagonPositionFromLocation(currentHexagonPosition.x, currentHexagonPosition.y, currentHexagonPosition.z);
    mesh.boardLocation = {x: currentHexagonPosition.x, y: currentHexagonPosition.y, z:currentHexagonPosition.z};
    board.setHexagon({x: currentHexagonPosition.x, y: currentHexagonPosition.y, z:currentHexagonPosition.z}, currentColor);
    phantomHexagon.position.y += THICKNESS;
    currentHexagonPosition.y++;
    updateHexcount(hexcount+1);
  }
}

//Places the phantomHexagon at the appropriate location, and keeps track of the foremost intersected hexagon
function selector() {
  var mouseVector = new THREE.Vector3(mouse.x, mouse.y, 1);
  projector.unprojectVector(mouseVector, camera);
  raycaster.set(camera.position, mouseVector.sub(camera.position).normalize());
  intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    INTERSECTED = intersects[0].object;
    if (INTERSECTED.name != 'ground' && INTERSECTED.name != 'phantomHexagon') {
      switch (currentTool) {
        case TOOLS.remove:
          phantomHexagon.material.opacity = 1;
          setPhantomPosition(INTERSECTED.position.x, INTERSECTED.position.y, INTERSECTED.position.z);
          currentHexagonPosition = INTERSECTED.boardLocation;
          break;
        case TOOLS.add:
          var topY = board.topMostHexagon({x: INTERSECTED.boardLocation.x, y: INTERSECTED.boardLocation.y, z: INTERSECTED.boardLocation.z});
          phantomHexagon.material.opacity = 0.5;
          phantomHexagon.position = getHexagonPositionFromLocation(INTERSECTED.boardLocation.x, topY, INTERSECTED.boardLocation.z);
          currentHexagonPosition = {x: INTERSECTED.boardLocation.x, y: topY, z:INTERSECTED.boardLocation.z};
          break;
      }
    }
    if (INTERSECTED.name == 'ground') {
      phantomHexagon.material.opacity = 0;
    }
  } else {
    INTERSECTED = null;
    phantomHexagon.material.opacity = 0;
  }
}

//Set the phantomHexagons board location
function setPhantomPosition(x, y, z) {
  phantomHexagon.position.x = x;
  phantomHexagon.position.y = y;
  phantomHexagon.position.z = z;
}

//Get a hexagons real-world position based upon its board location
function getHexagonPositionFromLocation(x, y, z) {
  var position = new THREE.Vector3();
  if (z % 2 == 0) {
    position.x = x*WIDTH;
    position.z = z*0.75*HEIGHT;
  } else {
    position.x = x*WIDTH + 0.5*WIDTH;
    position.z = z*0.75*HEIGHT;
  }
  position.y = y*THICKNESS;
  return position;
}

//Ensures the user doesn't fly the camera below the board, or too far in any direction.
function checkCameraBoundries() {
  // //Y Boundries.
  if (camera.position.y < 10) {
    camera.position.y = 10;
  } else {
    if (camera.position.y > 720) {
      camera.position.y = 720;
    }
  }
  //X Boundries
  if (camera.position.x < -350) {
    camera.position.x = -350;
  } else {
    if (camera.position.x > 1300) {
      camera.position.x = 1300;
    }
  }
  //Z Boundries
  if (camera.position.z < -350) {
    camera.position.z = -350;
  } else {
    if (camera.position.z > 1300) {
      camera.position.z = 1300;
    }
  }
}

//When the user resizes the window, we handle the camera's aspect ratio
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

//Perform selector update, control update, camera boundry checks, and render
function animate() {
  selector();
  delta = clock.getDelta();
  controls.update(delta);
  checkCameraBoundries();
  requestAnimationFrame(animate);
  render();
}

//Render
function render() {
  renderer.render(scene, camera);
}