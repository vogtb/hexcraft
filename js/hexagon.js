function newHexagon(size, thickness) {
  var object = new THREE.Geometry();

  for (var i = 0; i <= 5; i++) {
    var angle = (i * 2 * Math.PI / 6);
    object.vertices.push( new THREE.Vector3( size * Math.sin(angle),  thickness, size * Math.cos(angle)));
  }
  
  for (var i = 5; i >= 0; i--) {
    var angle = (i * 2 * Math.PI / 6);
    object.vertices.push( new THREE.Vector3(size * Math.sin(angle) , 0, size * Math.cos(angle)));
  }

  object.faces.push( new THREE.Face3( 0, 1, 5) );
  object.faces.push( new THREE.Face3( 1, 2, 4) );
  object.faces.push( new THREE.Face3( 1, 4, 5) );
  object.faces.push( new THREE.Face3( 2, 3, 4) );
  
  object.faces.push( new THREE.Face3( 6, 7, 11) );
  object.faces.push( new THREE.Face3( 7, 8, 10) );
  object.faces.push( new THREE.Face3( 7, 10, 11) );
  object.faces.push( new THREE.Face3( 8, 9, 10) );

  object.faces.push( new THREE.Face3( 10, 1, 0) );
  object.faces.push( new THREE.Face3( 0, 11, 10) );
  
  object.faces.push( new THREE.Face3( 5, 6, 0) );
  object.faces.push( new THREE.Face3( 6, 11, 0) );
  
  object.faces.push( new THREE.Face3( 2, 1, 10) );
  object.faces.push( new THREE.Face3( 10, 9, 2) );
  
  object.faces.push( new THREE.Face3( 3, 2, 9) );
  object.faces.push( new THREE.Face3( 9, 8, 3) );
  
  object.faces.push( new THREE.Face3( 5, 4, 7) );
  object.faces.push( new THREE.Face3( 7, 6, 5) );
  
  object.faces.push( new THREE.Face3( 4, 3, 7) );
  object.faces.push( new THREE.Face3( 3, 8, 7) );
  
  object.faces.push( new THREE.Face3( 8, 4, 3) );
  object.faces.push( new THREE.Face3( 7, 4, 8) );
  
  object.computeFaceNormals();
  // object.computeVertexNormals();
  // object.computeBoundingSphere();
  
  return object;
}



function newFloorHexagon(size, thickness) {
  var object = new THREE.Geometry();

  for (var i = 0; i <= 5; i++) {
    var angle = (i * 2 * Math.PI / 6);
    object.vertices.push( new THREE.Vector3( size * Math.sin(angle),  thickness, size * Math.cos(angle)));
  }
  
  for (var i = 5; i >= 0; i--) {
    var angle = (i * 2 * Math.PI / 6);
    object.vertices.push( new THREE.Vector3(size * Math.sin(angle) , 0, size * Math.cos(angle)));
  }

  object.faces.push( new THREE.Face3( 0, 1, 5) );
  object.faces.push( new THREE.Face3( 1, 2, 4) );
  object.faces.push( new THREE.Face3( 1, 4, 5) );
  object.faces.push( new THREE.Face3( 2, 3, 4) );

  // object.faces.push( new THREE.Face3( 10, 1, 0) );
  // object.faces.push( new THREE.Face3( 0, 11, 10) );
  // 
  // object.faces.push( new THREE.Face3( 5, 6, 0) );
  // object.faces.push( new THREE.Face3( 6, 11, 0) );
  // 
  // object.faces.push( new THREE.Face3( 2, 1, 10) );
  // object.faces.push( new THREE.Face3( 10, 9, 2) );
  // 
  // object.faces.push( new THREE.Face3( 3, 2, 9) );
  // object.faces.push( new THREE.Face3( 9, 8, 3) );
  // 
  // object.faces.push( new THREE.Face3( 5, 4, 7) );
  // object.faces.push( new THREE.Face3( 7, 6, 5) );
  // 
  // object.faces.push( new THREE.Face3( 4, 3, 7) );
  // object.faces.push( new THREE.Face3( 3, 8, 7) );
  // 
  // object.faces.push( new THREE.Face3( 8, 4, 3) );
  // object.faces.push( new THREE.Face3( 7, 4, 8) );
  // 
  object.computeFaceNormals();
  // object.computeVertexNormals();
  // object.computeBoundingSphere();
  
  return object;
}
