/**
 * Created by Kasutaja on 06.10.2017.
 */


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

    this.updateScore(0);
    this.updateBestScore(localStorage.getItem('score') || 0)
};

HTMLRenderer.prototype.setGameOver = function(gameState) {
    var self = this;

    var innerText = gameState === 0 ? 'Congrats, You have won' : 'Game Over';

    setTimeout(function () {
        self.gameResult.classList.add('show-overlay');
        self.gameResultTitle.innerHTML = innerText;
    }, 1000);
};

HTMLRenderer.prototype.updateScore  = function(score) {
    this.scoreContainer.innerHTML = "Score: " + score;
};

HTMLRenderer.prototype.updateBestScore  = function(score) {
    this.bestScoreContainer.innerHTML = "Best score: " + score;

    localStorage.setItem('score', score);
};

