/**
 * Created by Kasutaja on 12.05.2018.
 */

var btnHide = document.getElementsByClassName('btn-hide')[0];
var btnOpen = document.getElementsByClassName('btn-open')[0];

var newGameBtn = document.getElementsByClassName('game-result__new-game')[0];

btnOpen.addEventListener("click", function () {

    var wrapperElement =  document.getElementsByClassName('wrapper')[0];

     wrapperElement.classList.add('menu-active');
});

btnHide.addEventListener("click", function () {

    var wrapperElement =  document.getElementsByClassName('wrapper')[0];

    wrapperElement.classList.remove('menu-active');
});

newGameBtn.addEventListener("click", function () {
    var gameResult = document.getElementsByClassName('game-result')[0];

    gameResult.classList.remove('show-overlay');

    var game = new Game();
    game.start();
});