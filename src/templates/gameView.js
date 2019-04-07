export default function gameView(state) {
  return `
    <div id="message" class="console">
      <p>Click any available space to start the game.</p>
    </div>
    <div class="game">
      <div class="top-l game-space">
        <button id="top-l" type="button"></button>
      </div>
      <div class="top-c game-space">
        <button id="top-c" type="button"></button>
      </div>
      <div class="top-r game-space">
        <button id="top-r" type="button"></button>
      </div>
      <div class="mid-l game-space">
        <button id="mid-l" type="button"></button>
      </div>
      <div class="mid-c game-space">
        <button id="mid-c" type="button"></button>
      </div>
      <div class="mid-r game-space">
        <button id="mid-r" type="button"></button>
      </div>
      <div class="bot-l game-space">
        <button id="bot-l" type="button"></button>
      </div>
      <div class="bot-c game-space">
        <button id="bot-c" type="button"></button>
      </div>
      <div class="bot-r game-space">
        <button id="bot-r" type="button"></button>
      </div>
    </div>
    <div class="options">
      <button id="new-game">New Game</button>
      <button id="quit-game">Quit</button>
    </div>
  `;
}