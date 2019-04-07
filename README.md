# Tic-Tac-Toe
This is my implementation of the game tic-tac-toe with the following requirements:
- Has a user interface
- Enforces the basic rules, and determines the outcome of the game
- Ability to start the game
- Ability to take turns with a computer player to play the game
- Ability to evaluate the winner
- Ability to stop an ongoing game at any point
- Proper messaging in appropriate state changes

## Demo & Installation
The game is currently hosted using Github Pages and is accessible from https://davidlimcheng.github.io/tic-tac-toe/.

To install and run the game on a local development environment:
- Clone the repository
- Install dependencies
- Run the `server` script defined in `package.json`:
```
npm install
npm run server
```
The application will be available on `localhost:8080`.

## Overview
For the technical implementation, my priority was to develop an application that was as lean as possible, which is why I chose to go with HTML and Javascript. The implementation mainly relies on using ES6 modules, DOM traversal, and classes for state management.

As for computer difficulty, I aimed to strike a balance between a computer that was challenging, but still beatable the majority of the time. To do this, I prioritized computer moves in the following order:
1. Winning
2. Not losing
3. Any available space

In other words, the computer should play to win if it sees any openings. It should play defense if it sees any "near-losses". If neither scenarios exist, it will randomly pick any available space.

## Technical Details

### DOM Management
The application relies on native DOM traversal functions to replace HTML based on user actions. It uses `eventListeners` at each space on the game board to react to user inputs, checking for end-game scenarios, occupying a space if none exist. 

There are two views: `mainView` and `gameView`. These are both managed in the entrypoint, `application.js`, which switches between the two based on user input.

### State Management
Game state is encapsulated in the `Game` class. This class also holds all logic for computer strategy.

`eventListeners` are placed on each game space, using the `handlePlayerTurn` function as a callback. Each player turn updates the state, which is a collection of class instance properties.

The most important property is `gameSpaceMap`, which manages the state of the game board. It is an object consisting of mappings between the game space ID and its value, with `1` signifying a player-held space and `-1` signifying a computer-held space.
```
{
  'top-l': 0,
  'top-c': 0,
  'top-r': 1,
  'mid-l': 0, 
  'mid-c': 0, 
  'mid-r': 0, 
  'bot-l': -1, 
  'bot-c': 0, 
  'bot-r': 0
}
```
Would map to a game board with the state of:
```
_|_|X 
_|_|_
O| |
```
Other instance properties include booleans for messaging management, and additional booleans along with a `totalTurns` counter to allow for finer control of logic flow.

#### Computer Logic
Knowing that a player space is occupied by a `1` and a computer space is occupied by a `-1`, we can deduce "hot-spots", or any spots that would be crucial to winning or losing by creating an array of each "line" and its values, and summing over them. 

For example, take the following board:
```
X|_|X 
_|_|_
 |O|
```
The top "line" would be defined as `['top-l', 'top-c', 'top-r']`. Transforming this to an array with the actual player values, we'd get `[1, 0, 1]`. Reducing this by sum gives us a value of `2`, which we know is a "near-loss" spot, allowing us to prioritize the importance of playing that spot for the next turn.

The same idea applies to "near-win" spots, we would just look for any summations with a value of `-2`.

We can also use this same algorithm to check for actual winners, looking instead for `3` or `-3` values.

## Opportunities For Improvement

- Accessibility
- Error handling
- Responsiveness
- Testing
- Making game board size configurable
  - Programmatically build game space IDs
  - Would allow for difference size game board on the fly
- Making "win" amount configurable
  - Ex. on a 5x5 board we can allow 4 consecutive spaces to win instead of 5
- Computer difficulty
  - Can make computer more difficult by leveraging a tree structure to search through possible moves
  - Can also incorporate an opening move dictionary on larger game boards