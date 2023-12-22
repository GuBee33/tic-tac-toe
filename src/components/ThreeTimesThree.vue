<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';

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
}
const config: Ref<TheConfig> = ref({
  isXTurn: true,
  hasWon: [[false, false, false], [false, false, false], [false, false, false]],
  hasWonAll: '',
  lastClick: [-1, -1],
  ThreeTimesThree: [['', '', ''], ['', '', ''], ['', '', '']],
  BigThreeTimesThree: [
    [
      [['', '', ''], ['', '', ''], ['', '', '']],
      [['', '', ''], ['', '', ''], ['', '', '']],
      [['', '', ''], ['', '', ''], ['', '', '']]
    ],
    [
      [['', '', ''], ['', '', ''], ['', '', '']],
      [['', '', ''], ['', '', ''], ['', '', '']],
      [['', '', ''], ['', '', ''], ['', '', '']]
    ],
    [
      [['', '', ''], ['', '', ''], ['', '', '']],
      [['', '', ''], ['', '', ''], ['', '', '']],
      [['', '', ''], ['', '', ''], ['', '', '']]
    ]
  ],
  background: [
    [
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']],
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']],
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']]
    ],
    [
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']],
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']],
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']]
    ],
    [
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']],
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']],
      [['black', 'black', 'black'], ['black', 'black', 'black'], ['black', 'black', 'black']]
    ]
  ],
  winnerBackground: [["grey", "grey", "grey"], ["grey", "grey", "grey"], ["grey", "grey", "grey"]]
})

const reset = () => {
  config.value.isXTurn = true
  config.value.hasWon = [[false, false, false], [false, false, false], [false, false, false]]
  config.value.hasWonAll = ""
  config.value.lastClick = [-1, -1]
  config.value.ThreeTimesThree = [["", "", ""], ["", "", ""], ["", "", ""]]
  config.value.BigThreeTimesThree = [
    [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]],
    [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]],
    [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]]
  ]
  config.value.background = [
    [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]],
    [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]],
    [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]]
  ]
  config.value.winnerBackground = [["grey", "grey", "grey"], ["grey", "grey", "grey"], ["grey", "grey", "grey"]]

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
    const currentSign: CellValue = config.value.isXTurn ? 'X' : 'O';
    config.value.BigThreeTimesThree[x][y][i][j] = currentSign;
    config.value.isXTurn = !config.value.isXTurn;
    config.value.lastClick = [i, j];

    config.value.hasWon[x][y] = checkWin(config.value.BigThreeTimesThree[x][y], x, y);
    const [row, col, diag] = checkGameStatus(config.value.ThreeTimesThree);

    config.value.hasWonAll = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : (config.value.ThreeTimesThree.map((row, i) => row.some(c => c === "") ? row.map((c, j) => c === "" ? config.value.BigThreeTimesThree[i][j] : -1) : -1).flat().filter(x => x != -1).flat().flat().some(val => val === '') ? '' : 'draw');
    console.log(JSON.stringify(config.value))
  }
};

function markValidArea(x: number, y: number) {
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
function checkRows(matrix: ThreeTimesThreeMatrix): WinData {
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    if (row[0] !== '' && row.every(val => val === row[0])) {
      return { won: true, index: i };
    }
  }
  return { won: false, index: -1 };
}

function checkColumns(matrix: ThreeTimesThreeMatrix): WinData {
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

function checkDiagonals(matrix: ThreeTimesThreeMatrix): WinData {
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

function setBackground(matrix: ThreeTimesThreeMatrix, colorMatrix: string[][], color: string) {
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

function checkWin(matrix: ThreeTimesThreeMatrix, x: number, y: number): boolean {
  const [row, col, diag] = checkGameStatus(matrix);
  config.value.ThreeTimesThree[x][y] = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : '';
  const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
  setBackground(config.value.BigThreeTimesThree[x][y], config.value.background[x][y], color)
  setBackground(config.value.ThreeTimesThree, config.value.winnerBackground, color)

  if (row.won || col.won || diag.won) {
    // config.value.background[x][y][row.index] = Array(3).fill(color);
    return true;
    // } else if (col.won) {
    // for (let i = 0; i < matrix.length; i++) {
    //   config.value.background[x][y][i][col.index] = color;
    // }
    //   return true;
    // } else if (diag.won) {
    // if (diag.index === 0) {
    //   for (let i = 0; i < matrix.length; i++) {
    //     config.value.background[x][y][i][i] = color;
    //   }
    // } else {
    //   for (let i = 0; i < matrix.length; i++) {
    //     config.value.background[x][y][i][matrix.length - 1 - i] = color;
    //   }
    // }
    // return true;
  } else {
    return false;
  }
}

function checkGameStatus(matrix: ThreeTimesThreeMatrix): [WinData, WinData, WinData] {
  const row = checkRows(matrix);
  const col = checkColumns(matrix);
  const diag = checkDiagonals(matrix);
  return [row, col, diag];
}
</script>

<template>
  <h2 v-if="config.hasWonAll == 'X' || config.hasWonAll == 'O'">{{ config.hasWonAll }} won the game
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
  width: min(90vw, 90vh);
  height: min(90vw, 90vh);
  border-collapse: collapse;
  table-layout: fixed;
}

.cell {
  text-align: center;
  vertical-align: middle;
}

.available {
  width: calc(min(90vw, 90vh)/3);
  height: calc(min(90vw, 90vh)/3);
  border: solid;
  border-color: aquamarine;
}

.blocked {
  width: calc(min(90vw, 90vh)/3);
  height: calc(min(90vw, 90vh)/3);
  background-color: gray;
}

.mark {
  width: calc(min(90vw, 90vh)/11);
  height: calc(min(90vw, 90vh)/11);
  color: azure;
  align-content: center;
  vertical-align: middle;
  font-size: calc(min(90vw, 90vh)/15);
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
