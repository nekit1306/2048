/**
 * Created by Kasutaja on 06.10.2017.
 */


function Tile(size, pos) {
    this.size = size;
    this.x = pos.x;
    this.y = pos.y;
    this.pos  = {x: this.x, y: this.y};
    this.previousPosition = null;
}

Tile.prototype.updatePos = function(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.pos = {x: this.x, y: this.y};
};


Tile.prototype.savePrevPosition = function(pos) {
    this.previousPosition = {x: pos.x, y: pos.y};
};


Tile.prototype.updateSize = function(size) {
    this.size = size;
};
