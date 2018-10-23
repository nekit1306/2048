/**
 * Created by Kasutaja on 06.10.2017.
 */

function Game() {
    this.Grid = new Grid();
    this.HTMLRenderer = new HTMLRenderer();
    this.keydownBind = this.handleKeyDown.bind(this);
    this.touchStart = this.handleTouchStart.bind(this);
    this.touchMove = this.handleTouchMove.bind(this);

    this.xDown = null;
    this.yDown = null;
}

Game.prototype.start = function() {
    this.resetGame();
    this.initEvents();
    this.tileCreate(true);
};

Game.prototype.resetGame = function () {
    this.HTMLRenderer.gameReset();
};

Game.prototype.initEvents = function() {
    window.addEventListener('keydown', this.keydownBind);
    document.getElementsByClassName('table')[0].addEventListener('touchstart', this.touchStart, false);
    document.getElementsByClassName('table')[0].addEventListener('touchmove', this.touchMove, false);
};

Game.prototype.handleKeyDown = function(e) {

    var keyMap = {37: 'left', 39: 'right', 38: 'up', 40: 'down'};

    if (keyMap[e.keyCode]) {
        e.preventDefault();

        this.move(keyMap[e.keyCode]);

        this.tileCreate(false);

        if (this.checkWinner()) {
            this.gameOver(0);
            return;
        }

        if (!this.checkMoves()) {
            this.gameOver(1);
        }
    }
};


Game.prototype.handleTouchStart = function(evt) {

    evt.preventDefault();

    this.xDown = evt.changedTouches[0].screenX;
    this.yDown = evt.changedTouches[0].screenY;
};

Game.prototype.handleTouchMove = function(evt) {

    evt.preventDefault();

    if (!this.xDown || !this.yDown ) {
        return;
    }

    var xUp = evt.changedTouches[0].screenX;
    var yUp = evt.changedTouches[0].screenY;

    var xDiff = this.xDown - xUp;
    var yDiff = this.yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            this.move('left');
        } else {
            /* right swipe */
            this.move('right');
        }
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */
            this.move('up');
        } else {
            /* down swipe */
            this.move('down');
        }
    }

    this.tileCreate(false);

    if (this.checkWinner()) {
        this.gameOver(0);
        return;
    }

    if (!this.checkMoves()) {
        this.gameOver(1);
    }
    /* reset values */
    this.xDown = null;
    this.yDown = null;
};

Game.prototype.tileCreate = function(firstMove) {
    if (this.Grid.hasEmptyCells() && this.Grid.isMoved) {

        var tile = new Tile(2, this.Grid.generateRandomCell());

        this.Grid.insertTile(tile);
        this.HTMLRenderer.addTile(tile);

        if (firstMove) {
            this.tileCreate(false);
        }
    }

};

Game.prototype.move = function(d) {

    switch (d) {
        case 'left':
            this.Grid.moveTile({x: -1, y: 0});
            break;

        case 'right':
            this.Grid.moveTile({x: 1, y: 0});
            break;

        case 'up':
            this.Grid.moveTile({x: 0, y: -1});
            break;

        case 'down':
            this.Grid.moveTile({x: 0, y: 1});
            break;
    }

};

Game.prototype.checkMoves = function() {
    return !(!this.Grid.hasEmptyCells() && !this.Grid.hasMoves());
};

Game.prototype.checkWinner = function() {

    var cells = this.Grid.cells;
    var isWinner = false;

    for(var r = 0; r < cells.length; r++) {
        for (var c = 0; c < cells[r].length; c++) {
            if (cells[r][c] && cells[r][c].size === 2048) {
                isWinner = true;
                break;
            }
        }
    }

    return isWinner;
};

Game.prototype.gameOver = function(gameState) {
    window.removeEventListener('keydown', this.keydownBind);
    this.HTMLRenderer.setGameOver(gameState);
};



function Grid() {
    this.rows = [0, 1, 2, 3];
    this.cols = [0, 1, 2, 3];
    this.cells = this.generateCells();
    this.merged = this.generateCells();
    this.HTMLRenderer = new HTMLRenderer();
    this.isMoved = true;
    this.score = 0;
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
        self.HTMLRenderer.setScore(self.score, localStorage.getItem('score'));
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
    this.pos  = {x: this.x, y: this.y};
};


Tile.prototype.savePrevPosition = function(pos) {
    this.previousPosition = {x: pos.x, y: pos.y};
};


Tile.prototype.updateSize = function(size) {
    this.size = size;
};



function HTMLRenderer() {
    this.tileContainer      = document.querySelector(".tile-container");
    this.scoreContainer     = document.querySelector('.score-container');
    this.bestScoreContainer = document.querySelector('.best-score-container');
    this.gameResult         = document.querySelector('.game-result');
    this.gameResultTitle    = document.querySelector('.game-result__title');
}

HTMLRenderer.prototype.addTile = function(tile) {

    var currentPos  = tile.previousPosition || tile.pos;
    var tileInner   = document.createElement("div");
    var tileElement = document.createElement('div');

    tileElement.classList = 'tile size-' + tile.size + ' x-' + currentPos.x + ' y-' + currentPos.y;
    tileInner.classList = 'tile-inner';
    tileInner.innerHTML = tile.size;

    tileElement.appendChild(tileInner);

    this.tileContainer.appendChild(tileElement);

    if (!tile.previousPosition) {
        tileElement.classList.add('fadeIn');
    } else {
        setTimeout(function () {
            tileElement.classList = 'tile size-' + tile.size + ' x-' + tile.x + ' y-' + tile.y;
        }, 20);
    }
};

HTMLRenderer.prototype.render = function(cells) {

    var self = this;

    while (this.tileContainer.firstChild) {
        this.tileContainer.removeChild(this.tileContainer.firstChild);
    }

    cells.forEach(function(cell) {
        cell.forEach(function (tile) {
            if (tile) {
                self.addTile(tile)
            }
        });
    });

};

HTMLRenderer.prototype.gameReset = function() {
    while (this.tileContainer.firstChild) {
        this.tileContainer.removeChild(this.tileContainer.firstChild);
    }
    this.setScore(0, localStorage.getItem('score'));
};

HTMLRenderer.prototype.setGameOver = function(gameState) {
    var self = this;

    var innerText = gameState === 0 ? 'Congrats, You have won' : 'Game Over';

    setTimeout(function () {
        self.gameResult.classList.add('show-overlay');
        self.gameResultTitle.innerHTML = innerText;
    }, 1000);
};

HTMLRenderer.prototype.setScore = function(score, bestScore) {
    this.scoreContainer.innerHTML = "Score: " + score;
    this.bestScoreContainer.innerHTML = "Best Score: " + bestScore;

    if (score > bestScore) {
        this.bestScoreContainer.innerHTML = "Best Score: " + score;
        localStorage.setItem('score', score);
    }
};