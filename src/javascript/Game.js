import { emptyGameSpaceMap, gameSpaceIds, getLines, reduceLinesToSums } from '../util.js';

export default class Game {
  constructor() {
    this.currentTurn = 1;
    this.firstTurn = true;
    this.gameSpaceMap = {...emptyGameSpaceMap};
    this.gameOver = false;
    this.handlePlayerTurn = this.handlePlayerTurn.bind(this);
    this.totalTurns = 0;
  }

  handlePlayerTurn(event) {
    if (this.currentTurn == 1) {
      const id = event.target.id;
      this.updateGameState(id);
    }
  }

  updateGameState(id) {
    this.gameSpaceMap[id] = this.currentTurn;

    if (this.firstTurn) {
      document.getElementById('message').innerHTML = 'Good luck! You are X.';
      this.firstTurn = false;
    }

    const mark = this.currentTurn == 1 ? 'X' : 'O';
    const button = document.getElementById(id);
    button.innerHTML = mark;
    button.disabled = true;

    this.totalTurns++;
    this.checkForGameEnd();

    if (!this.gameOver) {
      this.currentTurn = this.currentTurn * -1;
      if (this.currentTurn == -1) this.takeComputerTurn();
    }
  }

  takeComputerTurn() {
    // Before there are 3 turns, there are no possible "near-loss" or "near-win" scenarios
    const id = this.totalTurns < 3 ? this.anyAvailableSpaceId() : this.bestAvailableSpaceId();
    this.updateGameState(id);
  }

  anyAvailableSpaceId() {
    const available = Object.entries(this.gameSpaceMap).reduce((availableSpaces, [id, spaceValue]) => {
      return spaceValue == 0 ? availableSpaces.concat(id) : availableSpaces;
    }, []);

    const max = available.length - 1;
    const randomIndex = Math.floor(Math.random() * (max + 1));
    return available[randomIndex];
  }

  bestAvailableSpaceId() {
    let possibleLossIndex, possibleWinIndex = false;
    const lineObject = getLines(this.gameSpaceMap);
    const { rows, cols, diags } = lineObject
    const sumObject = {rows: reduceLinesToSums(rows), cols: reduceLinesToSums(cols), diags: reduceLinesToSums(diags)};

    // When there have been only three turns, a win is not yet possible
    if (this.totalTurns == 3) {
      possibleLossIndex = this.possibleLoss(sumObject);
    } else {
      possibleWinIndex = this.possibleWin(sumObject);
      possibleLossIndex = !possibleWinIndex ? this.possibleLoss(sumObject) : false;
    }

    const bestMove = possibleWinIndex || possibleLossIndex;
    return bestMove ? this.getIdFromPossibleIndex(lineObject, bestMove) : this.anyAvailableSpaceId();
  }

  getIdFromPossibleIndex(lineObject, moveIndex) {
    const [lineType, lineIndex] = moveIndex;
    const line = lineObject[lineType][lineIndex];
    for (const moveObject of line) {
      const [id, spaceValue] = Object.entries(moveObject)[0];
      if (spaceValue === 0) return id;
    }
  }

  possibleLoss(lineSums) {
    for (const [id, line] of Object.entries(lineSums)) {
      const possibleLossIndex = line.indexOf(2);
      if (possibleLossIndex !== -1) {
        return [id, possibleLossIndex];
      }
    }
    return false;
  }

  possibleWin(lineSums) {
    for (const [id, line] of Object.entries(lineSums)) {
      const possibleWinIndex = line.indexOf(-2);
      if (possibleWinIndex !== -1) {
        return [id, possibleWinIndex];
      }
    }
    return false;
  }

  checkForGameEnd() {
    // There are no possible wins with less than 5 total turns
    if (this.totalTurns < 5) {
      return;
    } else if (this.totalTurns < 9) {
      const lines = getLines(this.gameSpaceMap);
      const { rows, cols, diags } = lines;
      const sumObject = { rows: reduceLinesToSums(rows), cols: reduceLinesToSums(cols), diags: reduceLinesToSums(diags) };

      const winningLineIndex = this.checkForWinner(sumObject);
      if (winningLineIndex) this.endGameForWin(lines, winningLineIndex);
    } else {
      this.endGameForDraw();
    }
  }

  checkForWinner(sumLines) {
    for (const [id, line] of Object.entries(sumLines)) {
      // Check for player wins
      let winningIndex = line.indexOf(3);
      // Check for computer wins if there are no player wins
      winningIndex = winningIndex === -1 ? line.indexOf(-3) : winningIndex;

      if (winningIndex !== -1) {
        return [id, winningIndex];
      }
    }
    return false;
  }

  endGameForDraw() {
    gameSpaceIds.forEach(id => document.querySelector(`div.${id}`).classList.add('draw-game'));
    document.getElementById('message').innerHTML = 'Looks like a draw game. Try again!';

    this.gameOver = true;
  }

  endGameForWin(lines, winningLineIndex) {
    const [lineType, lineIndex] = winningLineIndex;
    const winningLine = lines[lineType][lineIndex];
    const winningLineIds = winningLine.map(lineObject => Object.keys(lineObject)[0]);

    const endgameClass = this.currentTurn === 1 ? 'player-win' : 'computer-win';
    winningLineIds.forEach((id) => {
      document.querySelector(`div.${id}`).classList.add(endgameClass);
    });

    gameSpaceIds.forEach(id => document.getElementById(id).disabled = true);

    const message = this.currentTurn === 1 ? 'Great job! You did it.' : 'So close! Try again.';
    document.getElementById('message').innerHTML = message;
    this.gameOver = true;
  }
};
