/**
 * Created by Kasutaja on 06.10.2017.
 */


function Grid() {
    this.rows = [0, 1, 2, 3];
    this.cols = [0, 1, 2, 3];
    this.cells = this.generateCells();
    this.merged = this.generateCells();
    this.HTMLRenderer = new HTMLRenderer();
    this.isMoved = true;
    this.score = 0;
    this.bestScore = localStorage.getItem('score') || 0;
}

Grid.prototype.generateCells = function () {

    var emptyCells = [];

    for(var r = 0; r < 4; r++) {
        emptyCells[r] = [];
        for (var c = 0; c < 4; c++) {
            emptyCells[r][c] = null;
        }
    }

    return emptyCells;
};

Grid.prototype.generateRandomCell = function() {

    do {
        var x = Math.floor(Math.random() * 4);
        var y = Math.floor(Math.random() * 4);
    } while (!this.cellIsAvailable({x: x, y: y}));

    return {x: x, y: y};
};

Grid.prototype.insertTile = function(tile) {
    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.addMerged = function(tile) {
    this.merged[tile.x][tile.y] = this.cells[tile.x][tile.y];
};

Grid.prototype.removeMerged = function() {
    for (var i = 0; i < this.merged.length; i++) {
        for (var j = 0; j < this.merged[i].length; j++) {
            this.merged[i][j] = null;
        }
    }
};

Grid.prototype.updateCell = function(tile, tPos) {
    this.cells[tile.x][tile.y] = null;
    this.cells[tPos.x][tPos.y] = tile;
};

Grid.prototype.moveTile = function(vector) {

    var self = this;

    self.isMoved = false;

    self.removeMerged();

    var traverseX = (vector.x === 1) ? self.cols.slice().reverse() : self.cols;
    var traverseY = (vector.y === 1) ? self.rows.slice().reverse() : self.rows;

    traverseX.forEach(function(c) {
        traverseY.forEach(function(r) {
            var currentCell = self.cells[c][r];
            if (currentCell) {
                currentCell.savePrevPosition(self.cells[c][r].pos);

                var targetPos = self.getTargetPos(vector, currentCell.pos);
                var next = targetPos.prev;

                if (self.cells[targetPos.next.x] &&
                    self.cells[targetPos.next.x][targetPos.next.y] &&
                    self.cells[targetPos.next.x][targetPos.next.y].size === currentCell.size &&
                    self.merged[targetPos.next.x][targetPos.next.y] === null)
                {
                    next = targetPos.next;

                    currentCell.updateSize(2* currentCell.size);
                    self.addMerged(next);

                    self.score = self.score + currentCell.size;

                }
                if (!self.hasEqualPos(currentCell.pos, next)) {

                    self.updateCell(currentCell, next);
                    currentCell.updatePos(next);

                    self.isMoved = true;

                }
            }
        });
    });
    if (self.isMoved) {
        self.HTMLRenderer.render(self.cells);
        self.HTMLRenderer.updateScore(self.score);

        if (self.score > self.bestScore) {
            self.HTMLRenderer.updateBestScore(self.score);
        }
    }

};

Grid.prototype.getTargetPos = function (v, cc) {

    var prev = null;
    var next = {x: cc.x, y: cc.y};

    do {
        prev = next;
        next = {x: next.x + v.x, y: next.y + v.y};
    } while (this.cellInBounds(next) && this.cellIsAvailable(next));

    return {
        prev: prev,
        next: next
    }
};

Grid.prototype.cellInBounds = function (next) {
    return next.x >= 0 && next.x < 4 &&
        next.y >= 0 && next.y < 4;
};

Grid.prototype.cellIsAvailable = function (cell) {
    return this.cells[cell.x][cell.y] == null;
};

Grid.prototype.hasEmptyCells = function () {
    for (var r = 0; r < this.cells.length; r++) {
        for (var i = 0; i < this.cells[r].length; i++) {
            if (this.cells[r][i] === null) {
                return true;
            }
        }
    }
    return false;
};

Grid.prototype.hasMoves = function () {
    for (var r = 0; r < this.cells.length; r++) {
        for (var i = 0; i < this.cells[r].length; i++) {
            if ((i + 1) < 4 && this.cells[r][i].size === this.cells[r][i + 1].size ||
                (r + 1) < 4 && this.cells[r][i].size === this.cells[r + 1][i].size)
            {
                return true
            }
        }
    }
    return false;
};

Grid.prototype.hasEqualPos = function (firstPos, secondPos) {
    return JSON.stringify(firstPos) === JSON.stringify(secondPos);
};

