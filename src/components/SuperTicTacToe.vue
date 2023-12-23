<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';


type CellValue = 'X' | 'O' | '';
type ThreeTimesThreeMatrix = CellValue[][];
type BigThreeTimesThreeMatrix = ThreeTimesThreeMatrix[][];
interface WinData {
  won: boolean;
  index: number;
}
interface TheConfig {
  isXTurn: boolean,
  hasWon: boolean[][],
  hasWonAll: CellValue | "draw",
  ThreeTimesThree: ThreeTimesThreeMatrix,
  BigThreeTimesThree: BigThreeTimesThreeMatrix,
  background: string[][][][],
  lastClick: number[],
  winnerBackground: string[][]
  availableCells: number[][]
}
const isTwoplayer: Ref<boolean> = ref((true))
const config: Ref<TheConfig> = ref({
  isXTurn: true,
  hasWon: [],
  hasWonAll: '',
  lastClick: [-1, -1],
  ThreeTimesThree: [],
  BigThreeTimesThree: [
  ],
  background: [

  ],
  winnerBackground: [],
  availableCells: [],
})


const reset = () => {
  config.value.isXTurn = true
  config.value.hasWonAll = ""
  config.value.lastClick = [-1, -1]
  config.value.BigThreeTimesThree = []
  config.value.background = []
  config.value.ThreeTimesThree = []
  config.value.winnerBackground = []
  config.value.hasWon = []
  config.value.availableCells = []

  for (let x = 0; x < 3; x++) {
    let bigRow: ThreeTimesThreeMatrix[] = []
    let bigRowbg = []
    let row2: CellValue[] = []
    let winnerbg = []
    let won = []
    for (let y = 0; y < 3; y++) {
      let smallMatrix: ThreeTimesThreeMatrix = []
      let smallMatrixbg = []
      row2.push("")
      winnerbg.push("grey")
      won.push(false)
      for (let i = 0; i < 3; i++) {
        let row: CellValue[] = []
        let rowbg = []
        for (let j = 0; j < 3; j++) {
          config.value.availableCells.push([x, y, i, j])
          row.push("")
          rowbg.push("black")
        }
        smallMatrix.push(row)
        smallMatrixbg.push(rowbg)
      }
      bigRow.push(smallMatrix)
      bigRowbg.push(smallMatrixbg)
    }
    config.value.BigThreeTimesThree.push(bigRow)
    config.value.background.push(bigRowbg)
    config.value.ThreeTimesThree.push(row2)
    config.value.winnerBackground.push(winnerbg)
    config.value.hasWon.push(won)
  }

}
reset()

const updateConfig = (x: number, y: number, i: number, j: number): void => {
  const currentSign: CellValue = config.value.isXTurn ? 'X' : 'O';
  config.value.BigThreeTimesThree[x][y][i][j] = currentSign;
  config.value.isXTurn = !config.value.isXTurn;
  config.value.lastClick = [i, j];

  config.value.hasWon[x][y] = checkWin(config.value.BigThreeTimesThree[x][y], x, y);
  if (config.value.hasWon[x][y]) {
    config.value.availableCells = config.value.availableCells.filter(cell => !(cell[0] === x && cell[1] === y));
  }
  const [row, col, diag] = checkGameStatus(config.value.ThreeTimesThree);

  config.value.hasWonAll = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : (config.value.ThreeTimesThree.map((row, i) => row.some(c => c === "") ? row.map((c, j) => c === "" ? config.value.BigThreeTimesThree[i][j] : -1) : -1).flat().filter(x => x != -1).flat().flat().some(val => val === '') ? '' : 'draw');
  config.value.availableCells = config.value.availableCells.filter(cell => !(cell[0] === x && cell[1] === y && cell[2] === i && cell[3] === j));
}
const putASign = (x: number, y: number, i: number, j: number): void => {
  const canPlaceSign =
    !config.value.BigThreeTimesThree[x][y][i][j] &&
    !config.value.hasWon[x][y] &&
    !config.value.hasWonAll &&
    (
      (config.value.lastClick[0] === x && config.value.lastClick[1] === y) ||
      (config.value.lastClick[0] === -1 && config.value.lastClick[1] === -1) ||
      config.value.hasWon[config.value.lastClick[0]][config.value.lastClick[1]] ||
      !config.value.BigThreeTimesThree[config.value.lastClick[0]][config.value.lastClick[1]].flat().flat().some(val => val === '')
    );
  if (canPlaceSign) {
    updateConfig(x, y, i, j)
    if (!isTwoplayer.value) {
      const AIPLAYER = config.value.isXTurn ? 'O' : 'X'
      const [x2, y2, i2, j2] = getBestMove(i, j, AIPLAYER)
      updateConfig(x2, y2, i2, j2)
    }
  }
};


const getBestMove3x3 = (availableMoves: number[][], i: number, j: number, AIPLAYER: CellValue): { bestMove: number[], bestScore: number } => {
  let bestMove = [-1, -1, -1, -1];
  let bestScore = -Infinity;
  if (availableMoves.some(x => (x[0] == i && x[1] == j && x[2] == 1 && x[3] == 1))) {
    return { bestMove: [i, j, 1, 1], bestScore: 5 }
  }
  else {
    for (const move of availableMoves) {
      const newBoard = JSON.parse(JSON.stringify(config.value.BigThreeTimesThree[j][j]));
      newBoard[move[2]][move[3]] = AIPLAYER;
      const score = minimax(newBoard, 8, false, AIPLAYER); // Depth set to 8 for Tic-tac-toe
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { bestMove, bestScore };
  }
}

const getBestMove = (i: number, j: number, AIPLAYER: CellValue): number[] => {
  const availableMoves = config.value.availableCells.filter(cell => (cell[0] === i && cell[1] === j))
  if (availableMoves.length > 0) {
    return getBestMove3x3(availableMoves, i, j, AIPLAYER).bestMove
  }
  else {
    const uniquePairs: Set<string> = new Set();

    config.value.availableCells.forEach((innerArray: number[]) => {
      const pairString = innerArray.slice(0, 2).join(',');
      uniquePairs.add(pairString);
    });
    let verybestMove: number[] = []
    let verybestScore = -Infinity
    uniquePairs.forEach(index => {
      let [x, y] = index.split(',').map(Number)
      let newavailableMoves = config.value.availableCells.filter(cell => (cell[0] == x && cell[1] == y))
      const { bestMove, bestScore } = getBestMove3x3(newavailableMoves, x, y, AIPLAYER)
      if (bestScore > verybestScore) {
        verybestScore = bestScore
        verybestMove = bestMove
      }
    })
    return verybestMove
  }
}

const markValidArea = (x: number, y: number) => {
  if (config.value.hasWonAll) {
    return 'gray'
  }
  else {
    if (!config.value.hasWon[x][y] && ((config.value.lastClick[0] === x && config.value.lastClick[1] === y) ||
      (config.value.lastClick[0] === -1 && config.value.lastClick[1] === -1) ||
      config.value.hasWon[config.value.lastClick[0]][config.value.lastClick[1]] ||
      !config.value.BigThreeTimesThree[config.value.lastClick[0]][config.value.lastClick[1]].flat().flat().some(val => val === ''))) {
      return "available"
    }
    else {
      return "blocked"
    }
  }
}
const checkRows = (matrix: ThreeTimesThreeMatrix): WinData => {
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    if (row[0] !== '' && row.every(val => val === row[0])) {
      return { won: true, index: i };
    }
  }
  return { won: false, index: -1 };
}

const checkColumns = (matrix: ThreeTimesThreeMatrix): WinData => {
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[0][i] !== "") {
      let columnSame = true;
      for (let j = 1; j < matrix.length; j++) {
        if (matrix[j][i] !== matrix[0][i]) {
          columnSame = false;
          break;
        }
      }
      if (columnSame) {
        return { won: true, index: i };
      }
    }
  }
  return { won: false, index: -1 };
}

const checkDiagonals = (matrix: ThreeTimesThreeMatrix): WinData => {
  const topLeftBottomRight = matrix[0][0] !== "" && matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2];
  const topRightBottomLeft = matrix[0][2] !== "" && matrix[0][2] === matrix[1][1] && matrix[1][1] === matrix[2][0];

  if (topLeftBottomRight) {
    return { won: true, index: 0 };
  }
  else if (topRightBottomLeft) {
    return { won: true, index: 2 };
  }
  else {
    return { won: false, index: -1 };
  }
}

const setBackground = (matrix: ThreeTimesThreeMatrix, colorMatrix: string[][], color: string) => {
  const [row, col, diag] = checkGameStatus(matrix);
  if (row.won) {
    colorMatrix[row.index] = Array(3).fill(color);
  } else if (col.won) {
    for (let i = 0; i < matrix.length; i++) {
      colorMatrix[i][col.index] = color;
    }
  } else if (diag.won) {
    if (diag.index === 0) {
      for (let i = 0; i < matrix.length; i++) {
        colorMatrix[i][i] = color;
      }
    } else {
      for (let i = 0; i < matrix.length; i++) {
        colorMatrix[i][matrix.length - 1 - i] = color;
      }
    }
  }
}

const checkWin = (matrix: ThreeTimesThreeMatrix, x: number, y: number): boolean => {
  const [row, col, diag] = checkGameStatus(matrix);
  config.value.ThreeTimesThree[x][y] = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : '';
  const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
  setBackground(config.value.BigThreeTimesThree[x][y], config.value.background[x][y], color)
  setBackground(config.value.ThreeTimesThree, config.value.winnerBackground, color)

  if (row.won || col.won || diag.won) {
    return true;
  } else {
    return false;
  }
}

const checkGameStatus = (matrix: ThreeTimesThreeMatrix): [WinData, WinData, WinData] => {
  const row = checkRows(matrix);
  const col = checkColumns(matrix);
  const diag = checkDiagonals(matrix);
  return [row, col, diag];
}

const evaluate = (board: ThreeTimesThreeMatrix, availableMoves: number[][], AIPLAYER: CellValue, HUMANPLAYER: CellValue, depth: number): number => {

  const [row, col, diag] = checkGameStatus(board);
  const winner = row.won ? board[row.index][0] : (col.won ? board[0][col.index] : (diag.won ? board[1][1] : (availableMoves.length === 0 ? "draw" : '')));
  if (winner == AIPLAYER) {
    return 10 + depth;
  } else if (winner == HUMANPLAYER) {
    return -10 - depth;
  } else {
    return 0;
  }
}

const getAvailableMoves = (board: ThreeTimesThreeMatrix) => {
  return board.flatMap((row, i) => row.map((cell, j) => ({ cell, indexes: [i, j] }))).filter(({ cell }) => cell === "").map(({ indexes }) => indexes);
}

const minimax = (board: ThreeTimesThreeMatrix, depth: number, maximizingPlayer: boolean, AIPLAYER: CellValue): number => {
  const HUMANPLAYER = AIPLAYER == "X" ? "O" : "X"
  const availableMoves = getAvailableMoves(board);
  const score = evaluate(board, availableMoves, AIPLAYER, HUMANPLAYER, depth);

  if (score === 10 || score === -10 || availableMoves.length == 0 || depth === 0) {
    return score;
  }

  if (maximizingPlayer) {
    let bestScore = -Infinity;
    for (const move of availableMoves) {
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[move[0]][move[1]] = AIPLAYER;
      const currentScore = minimax(newBoard, depth - 1, false, AIPLAYER);
      bestScore = Math.max(bestScore, currentScore);
    }

    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of availableMoves) {
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[move[0]][move[1]] = config.value.isXTurn ? "O" : "X"
      const currentScore = minimax(newBoard, depth - 1, true, HUMANPLAYER);
      bestScore = Math.min(bestScore, currentScore);
    }
    return bestScore;
  }
}


</script>

<template>
  <label for="is2player" class="ml-2"> 2 player mode </label>
  <Checkbox v-model="isTwoplayer" input-id="is2player" :binary="true" />
  <h2 v-if="config.hasWonAll == 'X' || config.hasWonAll == 'O'">"{{ config.hasWonAll }}" won the game
  </h2>
  <h2 v-else-if="config.hasWonAll == 'draw'">
    It's a draw
  </h2>
  <Button v-if="config.hasWonAll !== ''" @click="reset">Restart</Button>
  <div v-else>
    It's "{{ config.isXTurn ? "X" : "O" }}"'s turn
  </div>
  <table class="bigtable">
    <tr v-for="(bigrow, x) in config.BigThreeTimesThree" :key="x">
      <td v-for="(bigcell, y) in bigrow" :key="y" :class="config.winnerBackground[x][y]">
        <table :class="markValidArea(x, y)">
          <tr v-for="(row, i) in bigcell" :key="i">
            <td class="cell" v-for="(cell, j) in row" :key="j">
              <div :class="config.background[x][y][i][j] + ' mark'" @click="putASign(x, y, i, j)">{{ cell }}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<style scoped>
.bigtable {
  width: min(82vw, 82vh);
  height: min(82vw, 82vh);
  table-layout: fixed;
}

.cell {
  text-align: center;
  vertical-align: middle;
}

.available {
  width: min(24vw, 24vh);
  height: min(24vw, 24vh);
  border: solid;
  border-color: aquamarine;
}

.blocked {
  width: min(24vw, 24vh);
  height: min(24vw, 24vh);
  background-color: gray;
}

.mark {
  width: min(7vw, 7vh);
  height: min(7vw, 7vh);
  color: azure;
  align-content: center;
  vertical-align: middle;
  font-size: min(7vw, 7vh);
}

.black {
  background-color: black;
}

.grey {}

.green {
  background-color: green;
}

.red {
  background-color: red;
}
</style>
