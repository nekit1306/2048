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
    document.getElementsByClassName('inner-field')[0].addEventListener('touchstart', this.touchStart, false);
    document.getElementsByClassName('inner-field')[0].addEventListener('touchmove', this.touchMove, false);
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

    /* reset values */
    this.xDown = null;
    this.yDown = null;

    this.tileCreate(false);

    if (this.checkWinner()) {
        this.gameOver(0);
        return;
    }

    if (!this.checkMoves()) {
        this.gameOver(1);
    }
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
    document.getElementsByClassName('inner-field')[0].removeEventListener('touchstart', this.touchStart, false);
    document.getElementsByClassName('inner-field')[0].removeEventListener('touchmove', this.touchMove, false);
    this.HTMLRenderer.setGameOver(gameState);
};