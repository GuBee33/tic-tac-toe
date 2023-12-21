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

const isXTurn = ref(true);
const hasWon: Ref<boolean[][]> = ref([[false, false, false], [false, false, false], [false, false, false]]);
const hasWonAll = ref('');
const lastClick = ref([-1, -1]);
const ThreeTimesThree: Ref<ThreeTimesThreeMatrix> = ref([['', '', ''], ['', '', ''], ['', '', '']]);
const BigThreeTimesThree: Ref<BigThreeTimesThreeMatrix> = ref([
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
]);
const background: Ref<string[][][][]> = ref([
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
]);

const putASign = (x: number, y: number, i: number, j: number): void => {
  const canPlaceSign =
    !BigThreeTimesThree.value[x][y][i][j] &&
    !hasWon.value[x][y] &&
    !hasWonAll.value &&
    (
      lastClick.value[0] === x && lastClick.value[1] === y ||
      lastClick.value[0] === -1 && lastClick.value[1] === -1 ||
      hasWon.value[lastClick.value[0]][lastClick.value[1]] ||
      BigThreeTimesThree.value[x][y].flatMap(row => row.every(val => val !== ''))
    );

  if (canPlaceSign) {
    const currentSign: CellValue = isXTurn.value ? 'X' : 'O';
    BigThreeTimesThree.value[x][y][i][j] = currentSign;
    isXTurn.value = !isXTurn.value;
    lastClick.value = [i, j];

    hasWon.value[x][y] = checkWin(BigThreeTimesThree.value[x][y], x, y);
    const [row, col, diag] = checkGameStatus(ThreeTimesThree.value);
    hasWonAll.value = row.won || col.won || diag.won ? (isXTurn.value ? 'O' : 'X') : '';
  }
};

const reset = () => {
  BigThreeTimesThree.value = [
    [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]],
    [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]],
    [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]]
  ]
  ThreeTimesThree.value = [["", "", ""], ["", "", ""], ["", "", ""]]
  isXTurn.value = true
  hasWon.value = [[false, false, false], [false, false, false], [false, false, false]]
  hasWonAll.value = ""
  background.value = [
    [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]],
    [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]],
    [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]]
  ]
  lastClick.value = [-1, -1]
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

function checkWin(matrix: ThreeTimesThreeMatrix, x: number, y: number): boolean {
  const [row, col, diag] = checkGameStatus(matrix);
  ThreeTimesThree.value[x][y] = row.won || col.won || diag.won ? (isXTurn.value ? 'O' : 'X') : '';

  const color = ThreeTimesThree.value[x][y] === 'O' ? 'green' : 'red';

  if (row.won) {
    background.value[x][y][row.index] = Array(3).fill(color);
    return true;
  } else if (col.won) {
    for (let i = 0; i < matrix.length; i++) {
      background.value[x][y][i][col.index] = color;
    }
    return true;
  } else if (diag.won) {
    if (diag.index === 0) {
      for (let i = 0; i < matrix.length; i++) {
        background.value[x][y][i][i] = color;
      }
    } else {
      for (let i = 0; i < matrix.length; i++) {
        background.value[x][y][i][matrix.length - 1 - i] = color;
      }
    }
    return true;
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
  <div v-if="hasWonAll">{{ hasWonAll }} won the game
    <Button @click="reset">Restart</Button>
  </div>

  <table>
    <tr v-for="(bigrow, x) in BigThreeTimesThree" :key="x">
      <td v-for="(bigcell, y) in bigrow" :key="y">
        <table>
          <tr v-for="(row, i) in bigcell" :key="i">
            <td class="cell" v-for="(cell, j) in row" :key="j">
              <div :class="background[x][y][i][j] + ' mark'" @click="putASign(x, y, i, j)">{{ cell }}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<style scoped>
.cell {
  width: 40px;
  height: 40px;
}

.mark {
  width: 100%;
  height: 100%;
  color: azure;
  align-content: center;
  align-items: center;
  font-size: 20px;
}

.black {
  background-color: black;
}

.green {
  background-color: green;
}

.red {
  background-color: red;
}
</style>
