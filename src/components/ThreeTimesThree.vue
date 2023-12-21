<script setup lang="ts">
import { ref, Ref } from 'vue'

import Button from 'primevue/button';

type ThreeTimesThreeMatrix = string[][][][];

// Creating a variable of type ThreeTimesThreeMatrix
const BigThreeTimesThree: Ref<ThreeTimesThreeMatrix> = ref([
  [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]],
  [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]],
  [[["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]], [["", "", ""], ["", "", ""], ["", "", ""]]]
]);

const ThreeTimesThree = ref([["", "", ""], ["", "", ""], ["", "", ""]])
const background = ref([
  [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]],
  [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]],
  [[["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]], [["black", "black", "black"], ["black", "black", "black"], ["black", "black", "black"]]]
])
const isXTurn = ref(true)
const hasWon = ref([[false, false, false], [false, false, false], [false, false, false]])
const hasWonAll = ref()
// const winner = ref("")
const lastClick = ref([-1, -1])
const putASign = (x: number, y: number, i: number, j: number) => {
  if (!BigThreeTimesThree.value[x][y][i][j] &&
    !hasWon.value[x][y] &&
    !hasWonAll.value &&
    (
      (lastClick.value[0] == x &&
        lastClick.value[1] == y)
      ||
      (lastClick.value[0] == -1 &&
        lastClick.value[1] == -1)
      || hasWon.value[lastClick.value[0]][lastClick.value[1]]
    )
  ) {
    if (isXTurn.value) {
      BigThreeTimesThree.value[x][y][i][j] = "X"
      isXTurn.value = false
    }
    else {
      BigThreeTimesThree.value[x][y][i][j] = "O"
      isXTurn.value = true
    }
    lastClick.value = [i, j]
    hasWon.value[x][y] = checkWin(BigThreeTimesThree.value[x][y], x, y);
    const row = checkRows(ThreeTimesThree.value)
    const col = checkColumns(ThreeTimesThree.value)
    const diag = checkDiagonals(ThreeTimesThree.value)
    hasWonAll.value = (row[0] || col[0] || diag[0]) ? (isXTurn.value ? "O" : "X") : ""
  }
}

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

function checkRows(matrix: string[][]): [boolean, number] {
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    if (row[0] !== "" && row.every(val => val === row[0])) {
      return [true, i];
    }
  }
  return [false, -1];
}

function checkColumns(matrix: string[][]): [boolean, number] {
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
        return [true, i];
      }
    }
  }
  return [false, -1];
}

function checkDiagonals(matrix: string[][]): [boolean, number] {
  const topLeftBottomRight = matrix[0][0] !== "" && matrix[0][0] === matrix[1][1] && matrix[1][1] === matrix[2][2];
  const topRightBottomLeft = matrix[0][2] !== "" && matrix[0][2] === matrix[1][1] && matrix[1][1] === matrix[2][0];

  if (topLeftBottomRight) {
    return [true, 0]
  }
  else if (topRightBottomLeft) {
    return [true, 2]
  }
  else {
    return [false, -1]
  }
}
function checkWin(matrix: string[][], x: number, y: number): boolean {
  const row = checkRows(matrix)
  const col = checkColumns(matrix)
  const diag = checkDiagonals(matrix)
  ThreeTimesThree.value[x][y] = (row[0] || col[0] || diag[0]) ? (isXTurn.value ? "O" : "X") : ""
  const color = ThreeTimesThree.value[x][y] == "O" ? "green" : "red"
  if (row[0]) {
    background.value[x][y][row[1]][0] = color
    background.value[x][y][row[1]][1] = color
    background.value[x][y][row[1]][2] = color
    return true
  }
  else if (col[0]) {
    background.value[x][y][0][col[1]] = color
    background.value[x][y][1][col[1]] = color
    background.value[x][y][2][col[1]] = color
    return true
  }
  else if (diag[0]) {
    if (diag[1] == 0) {
      background.value[x][y][0][0] = color
      background.value[x][y][1][1] = color
      background.value[x][y][2][2] = color
      return true
    }
    else {
      background.value[x][y][0][2] = color
      background.value[x][y][1][1] = color
      background.value[x][y][2][0] = color
      return true
    }
  }
  else {
    return false
  }

}



</script>

<template>
  <div v-if="hasWonAll">"{{ hasWonAll }}" won the game
    <Button @click="reset">Restart</Button>
  </div>

  <table>

    <tr v-for="(bigrow, x) in BigThreeTimesThree">
      <td v-for="(bigcell, y) in bigrow">
        <table>
          <tr v-for="(row, i) in bigcell">
            <td class="cell" v-for="(cell, j) in row">
              <div :class="background[x][y][i][j]" @click="putASign(x, y, i, j)">{{ cell }}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<style scoped>
table,
tr,
td {
  border: solid black;
}

.cell {
  width: 50px;
  height: 50px;
}

.black {
  width: 100%;
  height: 100%;
  color: azure;
  background-color: black;
  align-content: center;
  align-items: center;
  font-size: 30px;
}

.green {
  width: 100%;
  height: 100%;
  color: azure;
  background-color: green;
  align-content: center;
  align-items: center;
  font-size: 30px;
}

.red {
  width: 100%;
  height: 100%;
  color: azure;
  background-color: red;
  align-content: center;
  align-items: center;
  font-size: 30px;
}
</style>
