Board = function (width, depth, height) {

	this.height = height;
  this.width = width;
  this.depth = depth;
  
  this.Board = new Array(width);
  for (var x = 0; x < this.Board.length; x++) {
    this.Board[x] = new Array(depth);
    for (var z = 0; z < this.Board[x].length; z++) {
      this.Board[x][z] = new Array(height);
      for (var y = 0; y < this.Board[x][z].length; y++) {
        this.Board[x][z][y] = null;
      }
    }
  }
  
  this.getHexagon = function(coordinates) {
    return this.Board[coordinates.x][coordinates.z][coordinates.y];
  }
  
  this.setHexagon = function(coordinates, color) {
    this.Board[coordinates.x][coordinates.z][coordinates.y] = color;
  }
  
  this.unsetHexagon = function(coordinates) {
    this.Board[coordinates.x][coordinates.z][coordinates.y] = null;
  }
  
  this.topMostHexagon = function(coordinates) {
    for (var i = coordinates.y; i < height; i++) {
      if (this.getHexagon({x:coordinates.x, z:coordinates.z, y:i}) == null) {
        return i;
      }
    }
  }
  
  this.clear = function() {
    for (var z = 0; z < this.height; z++) {
      for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.depth; y++) {
          this.unsetHexagon({x:x, y:y, z:z});
        }
      }
    }
  }

  this.getActiveTiles = function() {
    var active = new Array();
    var temp;
    for (var z = 0; z < this.height; z++) {
      for (var x = 0; x < this.width; x++) {
        for (var y = 1; y < this.depth; y++) {
          temp = this.getHexagon({x:x, y:y, z:z});
          if (temp !== null) {
            active.push({x:x, y:y, z:z, color: temp});
          }
        }
      }
    }
    return active;
  }
  
}