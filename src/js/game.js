/**
 * Created by Kasutaja on 06.10.2017.
 */


function Game() {
    this.Board = new Board();
    this.HTMLActuator = new HTMLActuator();
    this.allowMove = true;
}

Game.prototype.start = function() {
    this.initEvents();
    this.squareCreate(true);
};

Game.prototype.initEvents = function() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
};

Game.prototype.handleKeyDown = function(e) {

    var self = this;
    var keyMap = {37: 'left', 39: 'right', 38: 'up', 40: 'down'};

    if (keyMap[e.keyCode] && this.allowMove) {
        this.allowMove = false;

        this.move(keyMap[e.keyCode]);
        this.squareCreate(false);
        this.checkMoves();

        setTimeout(function() {
            self.allowMove = true;
        },100)
    }
};

Game.prototype.squareCreate = function(firstTime) {
    if (this.Board.hasEmptyCells() && this.Board.isMoved) {

        var square = new Square(2, this.Board.generateRandomCell());

        this.Board.insertSquare(square);
        this.HTMLActuator.addSquare(square);

        if (firstTime) this.squareCreate(false);

    }

};

Game.prototype.move = function(d) {

    switch (d) {
        case 'left':
            this.Board.moveSquare({x: -1, y: 0});
            break;

        case 'right':
            this.Board.moveSquare({x: 1, y: 0});
            break;

        case 'up':
            this.Board.moveSquare({x: 0, y: -1});
            break;

        case 'down':
            this.Board.moveSquare({x: 0, y: 1});
            break;
    }

};

Game.prototype.checkMoves = function() {
    if (!this.Board.hasEmptyCells() && !this.Board.hasMoves()) {
        setTimeout(function(){
            alert('game over');
        },1000);
    }
};



function Board() {
    this.rows = [0, 1, 2, 3];
    this.cols = [0, 1, 2, 3];
    this.cells = [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
    this.merged = [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]];
    this.HTMLActuator = new HTMLActuator();
    this.isMoved = true;
}

Board.prototype.generateRandomCell = function() {

    do {
        var x = Math.floor(Math.random() * 4);
        var y = Math.floor(Math.random() * 4);
    } while (!this.cellIsAvailable({x: x, y: y}));

    return {x: x, y: y};
};

Board.prototype.insertSquare = function(square) {
    this.cells[square.x][square.y] = square;
};

Board.prototype.addMerged = function(square) {
    this.merged[square.x][square.y] = this.cells[square.x][square.y];
};

Board.prototype.removeMerged = function() {
    for (var i = 0; i < this.merged.length; i++) {
        for (var j = 0; j < this.merged[i].length; j++) {
            this.merged[i][j] = null;
        }
    }
};

Board.prototype.updateCell = function(square, tPos) {
    this.cells[square.x][square.y] = null;
    this.cells[tPos.x][tPos.y] = square;
};

Board.prototype.moveSquare = function(vector) {

    this.isMoved = false;
    var self = this;

    self.removeMerged();

    var traverseX = (vector.x === 1) ? self.cols.slice().reverse() : self.cols;
    var traverseY = (vector.y === 1) ? self.rows.slice().reverse() : self.rows;

    traverseX.forEach(function(c) {
        traverseY.forEach(function(r) {
            var currentCell = self.cells[c][r];
            if (currentCell) {
                var targetPos = self.getTargetPos(vector, currentCell.pos);
                var next = targetPos.prev;

                if (self.cells[targetPos.next.x] &&
                    self.cells[targetPos.next.x][targetPos.next.y] &&
                    self.cells[targetPos.next.x][targetPos.next.y].size === currentCell.size &&
                    self.merged[targetPos.next.x][targetPos.next.y] == null)
                {
                    next = targetPos.next;

                    currentCell.updateSize(2* currentCell.size);
                    self.addMerged(next);

                    self.HTMLActuator.setSize(currentCell.pos, currentCell.size);
                    self.HTMLActuator.removeSquare(next);

                }
                if (!self.hasEqualPos(currentCell.pos, next)) {
                    self.HTMLActuator.move(currentCell.pos, next);

                    self.updateCell(currentCell, next);
                    currentCell.updatePos(next);

                    self.isMoved = true;

                }
            }
        });
    });


};

Board.prototype.getTargetPos = function (v, cc) {

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

Board.prototype.cellInBounds = function (next) {
    return next.x >= 0 && next.x < 4 &&
           next.y >= 0 && next.y < 4;
};

Board.prototype.cellIsAvailable = function (cell) {
    return this.cells[cell.x][cell.y] == null;
};

Board.prototype.hasEmptyCells = function () {
    return this.cells.filter(function(i){
            return i.indexOf(null) > -1;
        }).length > 0;
};

Board.prototype.hasMoves = function () {
    for (var r = 0; r < this.cells.length; r++) {
        for (var i = 0; i < this.cells[r].length-1; i++) {
            if ((i + 1) < 4 && this.cells[r][i].size === this.cells[r][i + 1].size ||
                (r + 1) < 4 && this.cells[r][i].size === this.cells[r + 1][i].size)
            {
                return true
            }
        }
    }
    return false;
};

Board.prototype.hasEqualPos = function (firstPos, secondPos) {
    return JSON.stringify(firstPos) === JSON.stringify(secondPos);
};




function Square(size, pos) {
    this.size = size;
    this.pos  = {x: pos.x, y: pos.y};
    this.previousPosition = null;
}

Square.prototype.updatePos = function(pos) {
    this.pos  = {x: pos.x, y: pos.y};
};


Square.prototype.savePrevPosition = function(pos) {
    this.previousPosition = {x: pos.x, y: pos.y};
};


Square.prototype.updateSize = function(s) {
    this.size = s;
};




function HTMLActuator() {
    this.cell             = document.querySelectorAll("tr");
    this.cellContainer    = document.querySelector(".inner-field");
}

HTMLActuator.prototype.addSquare = function(s) {

    var square = document.createElement('div');
    square.innerHTML = s.size;
    square.style.top = this.cell[s.y].children[s.x].offsetTop + 'px';
    square.style.left = this.cell[s.y].children[s.x].offsetLeft + 'px';
    square.classList = 'square size-2 x-' + s.x + ' y-' + s.y;

    this.cellContainer.appendChild(square);

    setTimeout(function() {
        square.classList.add('fadeIn');
    }, 10);
};

HTMLActuator.prototype.move = function(sPos,tPos) {

    var square = this.getNode(sPos);
    console.log(square);
    var classes = square.className.split(' ');

    square.style.top  = this.cell[tPos.y].children[tPos.x].offsetTop + 'px';
    square.style.left = this.cell[tPos.y].children[tPos.x].offsetLeft + 'px';
    classes[2] = 'x-' + tPos.x;
    classes[3] = 'y-' + tPos.y;
    square.classList = classes.join(' ');

};

HTMLActuator.prototype.removeSquare = function(sPos) {

    var square = this.getNode(sPos);
    var self = this;

    square.classList.remove('fadeIn');
    setTimeout(function(){self.cellContainer.removeChild(square);}, 100);
};

HTMLActuator.prototype.setSize = function(sPos, size) {

    var square = this.getNode(sPos);
    var classes = square.className.split(' ');

    classes[1] = 'size-' + size;
    square.classList = classes.join(' ');

    square.innerHTML = size;

};


HTMLActuator.prototype.getNode = function(s) {

    return document.querySelector(".square.fadeIn.x-" + s.x + '.y-' + s.y);

};