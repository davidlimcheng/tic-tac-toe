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

  /**
   * @desc Randomly chooses and returns the ID of any available space on the game board.
   * 
   * Convert gameSpaceMap to array of ['top-l', 1] subarrays using Object.entries
   * Ex. [['top-l', 1], ['top-c', 0], [...]]
   * Filter out any subarray that does not have a 0 value
   * Randomly choose one of the remaining ids and return it
   */
  anyAvailableSpaceId() {
    const available = Object.entries(this.gameSpaceMap).reduce((availableSpaces, [id, spaceValue]) => {
      return spaceValue == 0 ? availableSpaces.concat(id) : availableSpaces;
    }, []);
    // choose a random integer between 0 and length of array - 1
    const max = available.length - 1;
    const randomIndex = Math.floor(Math.random() * (max + 1));
    return available[randomIndex];
  }

  /**
   * @desc Finds the best available space.  Prioritize in the following order:
   * 1. Winning - any row with sum of -2
   * 2. Not Losing - any row with sum of 2
   * 3. Random Space
   * 
   * Find any lines with sum of -2
   *  Return the id of any available space in any of those lines
   * Find any lines with sum of 2
   *  Return the id of any available space in any of those lines
   * If neither of the above exist, call anyAvailableSpace()
   * 
   * Only start looking for wins after this.totalTurns > 4
   */
  bestAvailableSpaceId() {
    let possibleLossIndex, possibleWinIndex = false;
    const lineObject = getLines(this.gameSpaceMap);
    const { rows, cols, diags } = lineObject
    const sumObject = {rows: reduceLinesToSums(rows), cols: reduceLinesToSums(cols), diags: reduceLinesToSums(diags)};

    // When there have been three turns, we only need to check for possibleLoss, not win.
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

  possibleLoss(lines) {
    for (const [id, line] of Object.entries(lines)) {
      const possibleLossIndex = line.indexOf(2);
      if (possibleLossIndex !== -1) {
        return [id, possibleLossIndex];
      }
    }
    return false;
  }

  possibleWin(lines) {
    for (const [id, line] of Object.entries(lines)) {
      const possibleWinIndex = line.indexOf(-2);
      if (possibleWinIndex !== -1) {
        return [id, possibleWinIndex];
      }
    }
    return false;
  }

  /**
   * @desc  Handles a click by the user on any game space. Does nothing if it is not the player's turn.
   */
  handlePlayerTurn(event) {
    if (this.currentTurn == 1) {
      const id = event.target.id;
      this.updateGameState(id);
    }
  }

  /**
   * @desc Handles the logic for each computer turn. We don't want this to be too easy, so we will
   * apply logic that plays basic defense. We also don't want it to be too difficult, so whenever there is no
   * chance of losing, we'll just pick a random available space. 
   * If there is a chance of winning though, we should choose the winning space.
   * 
   * Furthermore, we should only check for possible losses when this.totalTurns >= 3. That is when opponent will have two out,
   * since they always go first.
   * Can start checking for possible wins when this.totalTurns >= 6
   * 
   * Can start checking for actual wins/losses when this.totalTurns >= 5. This is when opponent will have 3 out.
   *   Actually we want to check for win/loss in updateGameState()
   * 
   * If totalTurns == 9, that's a draw
   */
  takeComputerTurn() {
    let id;
    if (this.totalTurns < 3) {
      id = this.anyAvailableSpaceId();
    } else if (this.totalTurns < 9) {
      id = this.bestAvailableSpaceId();
    }
    this.updateGameState(id);
  }

  checkForGameEnd() {
    if (this.totalTurns < 5) {
      return;
    } else if (this.totalTurns < 9) {
      const lines = getLines(this.gameSpaceMap);
      const { rows, cols, diags } = lines;
      const sumObject = { rows: reduceLinesToSums(rows), cols: reduceLinesToSums(cols), diags: reduceLinesToSums(diags) };
      // check for any wins
      const winningLineIndex = this.checkForWinner(sumObject);
      if (winningLineIndex) this.endGameForWin(lines, winningLineIndex);
    } else {
      // draw game
      this.endGameForDraw();
    }
  }

  checkForWinner(sumLines) {
    for (const [id, line] of Object.entries(sumLines)) {
      let winningIndex = line.indexOf(3);
      winningIndex = winningIndex === -1 ? line.indexOf(-3) : winningIndex;

      if (winningIndex !== -1) {
        return [id, winningIndex];
      }
    }
    return false;
  }

  endGameForDraw() {
    // Style whole board
    gameSpaceIds.forEach(id => document.querySelector(`div.${id}`).classList.add('draw-game'));

    // change the message
    document.getElementById('message').innerHTML = 'Looks like a draw game. Try again!';

    this.gameOver = true;
  }

  endGameForWin(lines, winningLineIndex) {
    const [lineType, lineIndex] = winningLineIndex;
    const winningLine = lines[lineType][lineIndex];
    const winningLineIds = winningLine.map(lineObject => Object.keys(lineObject)[0]);

    // Style the winning line
    const endgameClass = this.currentTurn === 1 ? 'player-win' : 'computer-win';
    winningLineIds.forEach((id) => {
      document.querySelector(`div.${id}`).classList.add(endgameClass);
    });

    // Disables all buttons
    gameSpaceIds.forEach(id => document.getElementById(id).disabled = true);

    // Change the message
    const message = this.currentTurn === 1 ? 'Great job! You did it.' : 'So close! Try again.';
    document.getElementById('message').innerHTML = message;
    this.gameOver = true;
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
};
