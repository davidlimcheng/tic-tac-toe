const gameSpaceIds = ['top-l', 'top-c', 'top-r', 'mid-l', 'mid-c', 'mid-r', 'bot-l', 'bot-c', 'bot-r'];

const emptyGameSpaceMap = gameSpaceIds.reduce((map, id) => {
  map[id] = 0;
  return map;
}, {});

/**
 * Given the state of the gameSpace, returns an array of arrays that signify the position and value of each space.
 * Ex. [[{top-l: 1}, {top-c: 0}, {top-l: null}], [...], [...]]
 * 
 * Bottleneck here is using l, c, and r.  Better would be 1, 2, and 3, and programmatically build these arrays.
 * That would allow the game to increase in size according to a configurable value, without the need for any refactoring
 * 
 * Styling could also be added programmatically, possibly with template literals.
 */
const getLines = (gameSpaceMap) => {
  const rows = [['top-l', 'top-c', 'top-r'], ['mid-l', 'mid-c', 'mid-r'], ['bot-l', 'bot-c', 'bot-r']];
  const cols = [['top-l', 'mid-l', 'bot-l'], ['top-c', 'mid-c', 'bot-c'], ['top-r', 'mid-r', 'bot-r']];
  const diags = [['top-l', 'mid-c', 'bot-r'], ['top-r', 'mid-c', 'bot-l']];

  return {
    rows: mapWithValues(rows, gameSpaceMap),
    cols: mapWithValues(cols, gameSpaceMap),
    diags: mapWithValues(diags, gameSpaceMap)
  }
}

const mapWithValues = (lines, gameSpaceMap) => {
  return lines.map(row => {
    return row.map(id => {
      return {[id]: gameSpaceMap[id]}
    });
  });
}

const reduceLinesToSums = (lines) => {
  return lines.map((line) => {
    return line.reduce((sum, gameSpace) => {
      return sum += Object.values(gameSpace).pop();
    }, 0);
  });
}

function setClickListener(id, callback) {
  document.getElementById(id).addEventListener('click', event => {
    callback(event);
  });
}

export { emptyGameSpaceMap, gameSpaceIds, getLines, reduceLinesToSums, setClickListener };
