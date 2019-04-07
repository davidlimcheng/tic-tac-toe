'use strict';

import mainView from './src/templates/mainView.js';
import gameView from './src/templates/gameView.js';
import Game from './src/javascript/Game.js';

import { gameSpaceIds, setClickListener } from './src/util.js';

function mainMenu() {
  document.getElementById('view').innerHTML = mainView();
  setClickListener('new-game', newGame);
}

function newGame() {
  document.getElementById('view').innerHTML = gameView();
  setClickListener('quit-game', mainMenu);
  setClickListener('new-game', newGame);
  addGameSpaceListeners();
}

function addGameSpaceListeners() {
  const gameState = new Game();
  for (const id of gameSpaceIds) {
    setClickListener(id, gameState.handlePlayerTurn);
  }
}

mainMenu();