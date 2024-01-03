<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';

import { TicTacToe, CellValue, ThreeTimesThreeMatrix, WinData } from '../utils/tictactoe';

const functions = new TicTacToe();

type BigThreeTimesThreeMatrix = ThreeTimesThreeMatrix[][];

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
const isTwoplayer: Ref<boolean> = ref((false))
const players = [
  { title: "Human vs Computer", value: false },
  { title: "Human vs Human", value: true },
]
const level: Ref<"easy" | "medium" | "hard"> = ref(("hard"))
const levels = [{ name: "easy", disabled: false, label: "Easy" }, { name: "medium", disabled: false, label: "Medium" }, { name: "hard", disabled: false, label: "Hard" }]
const config: Ref<TheConfig> = ref({
  isXTurn: true,
  hasWon: [],
  hasWonAll: '',
  lastClick: [-1, -1],
  ThreeTimesThree: [],
  BigThreeTimesThree: [],
  background: [],
  winnerBackground: [],
  availableCells: [],
})
const bigtableClass = ref({ "bigtable": true, "cursor-wait": false })
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
          row.push("")
          rowbg.push("black")
          config.value.availableCells.push([x, y, i, j])
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

const filterAvailable = (x: number, y: number, i = -1, j = -1, boards = false) => {
  if (i !== -1 && j !== -1) {
    return config.value.availableCells.filter((arr) => !(arr[0] === x && arr[1] === y && arr[2] === i && arr[3] === j));
  }
  else {
    const filteredBoardCells = config.value.availableCells.filter((arr) => !(arr[0] === x && arr[1] === y))
    if (boards) {
      return filteredBoardCells.map((arr) => arr.slice(0, 2)).reduce((result: number[][], current: number[]) => {
        if (!result.some((item) => item[0] === current[0] && item[1] === current[1])) {
          result.push(current);
        }
        return result;
      }, []);
    }
    else {
      return filteredBoardCells
    }
  }
}

const updateConfig = (x: number, y: number, i: number, j: number): void => {
  const currentSign: CellValue = config.value.isXTurn ? 'X' : 'O';
  config.value.BigThreeTimesThree[x][y][i][j] = currentSign;
  config.value.availableCells = filterAvailable(x, y, i, j)
  config.value.isXTurn = !config.value.isXTurn;
  config.value.lastClick = [i, j];
  setWinner(config.value.BigThreeTimesThree[x][y], x, y);
}

const putASign = async (x: number, y: number, i: number, j: number) => {
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
    if (!isTwoplayer.value && config.value.hasWonAll === '') {
      bigtableClass.value = { "bigtable": true, "cursor-wait": true }
      await botMove(i, j)
      bigtableClass.value = { "bigtable": true, "cursor-wait": false }
    }
  }
};

const botMove = async (i: number, j: number) => {
  const AIPLAYER = config.value.isXTurn ? 'X' : 'O'
  let [x2, y2, i2, j2] = [-1, -1, -1, -1]
  if (level.value === "easy") {
    const [newX2, newY2, newI2, newJ2] = getRandomMove(i, j);
    x2 = newX2;
    y2 = newY2;
    i2 = newI2;
    j2 = newJ2;
  }
  else if (level.value === "medium") {
    const [newX2, newY2, newI2, newJ2] = getAGoodtMove(i, j, AIPLAYER)
    x2 = newX2;
    y2 = newY2;
    i2 = newI2;
    j2 = newJ2;
  }
  else if (level.value === "hard") {
    const [newX2, newY2, newI2, newJ2] = getBestMove(i, j, AIPLAYER)
    x2 = newX2;
    y2 = newY2;
    i2 = newI2;
    j2 = newJ2;
  }
  updateConfig(x2, y2, i2, j2)
}

const getBestMove3x3 = (board: ThreeTimesThreeMatrix, AIPLAYER: CellValue, depth = 8): { bestMove: number[], bestScore: number } => {
  let bestMove = [-1, -1];
  let bestScore = -Infinity;
  const availableMoves = functions.getAvailableMoves(board)
  for (const move of availableMoves) {
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[move[0]][move[1]] = AIPLAYER;
    const score = functions.minimax(newBoard, depth, false, AIPLAYER)
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return { bestMove, bestScore };
}


const getBestMove3x3Plus = (board: ThreeTimesThreeMatrix, AIPLAYER: CellValue, depth = 8): { bestMove: number[], bestScore: number } => {
  let bestMove = [-1, -1];
  let bestScore = -Infinity;
  const availableMoves = functions.getAvailableMoves(board)
  const availableBoards = functions.getAvailableMoves(config.value.ThreeTimesThree)
  for (const move of availableMoves) {
    const newBoard = JSON.parse(JSON.stringify(board));
    let nextOppenentMoveScore = 9
    if (availableBoards.some(availableMove => availableMove[0] === move[0] && availableMove[1] === move[1])) {

      const newNextMoveBoard = JSON.parse(JSON.stringify(config.value.BigThreeTimesThree[move[0]][move[1]]));
      if (newBoard.every((value: CellValue, index: number) => value === newNextMoveBoard[index])) {
        newNextMoveBoard[move[0]][move[1]] = AIPLAYER;
      }
      newBoard[move[0]][move[1]] = AIPLAYER;
      nextOppenentMoveScore = getBestMove3x3(newNextMoveBoard, AIPLAYER === 'X' ? 'O' : 'X', 1).bestScore
    }
    const score = functions.minimax(newBoard, depth, false, AIPLAYER) - nextOppenentMoveScore
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return { bestMove, bestScore };
}

const getAvailableBoard = (i: number, j: number): [number, number, ThreeTimesThreeMatrix] => {
  if (config.value.ThreeTimesThree[i][j] === '') {
    return [i, j, config.value.BigThreeTimesThree[i][j]]
  }
  else {
    const availableBoards = functions.getAvailableMoves(config.value.ThreeTimesThree)
    const randomIndex = Math.floor(Math.random() * availableBoards.length);
    const [x, y] = availableBoards[randomIndex];
    return [x, y, config.value.BigThreeTimesThree[x][y]]
  }
}

// const allAvailableMoves = (i: number, j: number): number[][] => {
//   const boardCoords = config.value.ThreeTimesThree[i][j] === '' ? [[i, j]] : functions.getAvailableMoves(config.value.ThreeTimesThree)
//   let allAvailableMoves: number[][] = []
//   boardCoords.forEach(([x, y]) => {
//     const availableMoves = functions.getAvailableMoves(config.value.BigThreeTimesThree[x][y])
//     allAvailableMoves.push(...availableMoves.map(move => [x, y, ...move]))
//   })
//   return allAvailableMoves
// }

const getRandomMove = (i: number, j: number): number[] => {
  const [x, y, board] = getAvailableBoard(i, j)
  const availableMoves = functions.getAvailableMoves(board)
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return [x, y, ...availableMoves[randomIndex]];
}

const getBestMove = (i: number, j: number, AIPLAYER: CellValue): number[] => {
  if (config.value.ThreeTimesThree[i][j] === '') {
    return [i, j, ...getBestMove3x3Plus(config.value.BigThreeTimesThree[i][j], AIPLAYER).bestMove]
  }
  else {
    let verybestMove: number[] = []
    let verybestScore = -Infinity
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (config.value.ThreeTimesThree[x][y] === '') {
          const { bestMove, bestScore } = getBestMove3x3Plus(config.value.BigThreeTimesThree[x][y], AIPLAYER)
          if (bestScore > verybestScore) {
            verybestScore = bestScore
            verybestMove = [x, y, ...bestMove]
          }
        }
      }
    }
    return verybestMove
  }
}

const getAGoodtMove = (i: number, j: number, AIPLAYER: CellValue): number[] => {
  if (config.value.ThreeTimesThree[i][j] === '') {
    return [i, j, ...getBestMove3x3(config.value.BigThreeTimesThree[i][j], AIPLAYER).bestMove]
  }
  else {
    let verybestMove: number[] = []
    let verybestScore = -Infinity
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (config.value.ThreeTimesThree[x][y] === '') {
          const { bestMove, bestScore } = getBestMove3x3(config.value.BigThreeTimesThree[x][y], AIPLAYER)
          if (bestScore > verybestScore) {
            verybestScore = bestScore
            verybestMove = [x, y, ...bestMove]
          }
        }
      }
    }
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
const setBackground = (result: [WinData, WinData, WinData], colorMatrix: string[][], color: string) => {
  for (let i = 0; i < 3; i++) {
    if (result[0].won) {
      colorMatrix[result[0].index][i] = color;
    } else if (result[1].won) {
      colorMatrix[i][result[1].index] = color;
    } else if (result[2].won) {
      if (result[2].index === 0) {
        colorMatrix[i][i] = color;
      } else {
        colorMatrix[i][2 - i] = color;
      }
    }
  }
}

const setWinner = (matrix: ThreeTimesThreeMatrix, x: number, y: number) => {
  const result = functions.checkGameStatus(matrix);
  if (result.some(x => x.won)) {
    config.value.ThreeTimesThree[x][y] = result.filter(x => x.won)[0].player;
    const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
    setBackground(result, config.value.background[x][y], color)
    config.value.hasWon[x][y] = true;
    config.value.availableCells = filterAvailable(x, y, -1, -1)
    const resutl2 = functions.checkGameStatus(config.value.ThreeTimesThree)
    if (resutl2.some(x => x.won)) {
      setBackground(resutl2, config.value.winnerBackground, color)
      config.value.hasWonAll = result.filter(x => x.won)[0].player
    }
    else if (config.value.availableCells.length == 0) {
      config.value.hasWonAll = "draw"
    }
  }
}


</script>

<template>
  <SelectButton v-model="isTwoplayer" :options="players" optionLabel="title" optionValue="value" aria-labelledby="basic"
    :allowEmpty="false" />
  <SelectButton v-if="!isTwoplayer" v-model="level" :options="levels" aria-labelledby="basic" optionLabel="label"
    optionValue="name" optionDisabled="disabled" :allowEmpty="false" />

  <h2 v-if="config.hasWonAll == 'X' || config.hasWonAll == 'O'">"{{ config.hasWonAll }}" won the game
  </h2>
  <h2 v-else-if="config.hasWonAll == 'draw'">
    It's a draw
  </h2>
  <Button v-if="config.hasWonAll !== ''" @click="reset">Restart</Button>
  <div v-else>
    It's "{{ config.isXTurn ? "X" : "O" }}"'s turn
  </div>
  <table :class="bigtableClass">
    <tr v-for="(bigrow, x) in config.BigThreeTimesThree" :key="x">
      <td v-for="(bigcell, y) in bigrow" :key="y" :class="config.winnerBackground[x][y]">
        <table :class="markValidArea(x, y)">
          <tr v-for="(row, i) in bigcell" :key="i">
            <td class="cell" v-for="(cell, j) in row" :key="j">
              <Button v-if="cell == 'X'" :class="config.background[x][y][i][j] + ' signbutton'"
                @click="putASign(x, y, i, j)" icon="pi pi-times">
              </Button><Button v-else-if="cell == 'O'" :class="config.background[x][y][i][j] + ' signbutton'"
                @click="putASign(x, y, i, j)" icon="pi pi-circle">
              </Button>
              <Button v-else :class="config.background[x][y][i][j] + ' signbutton'" @click="putASign(x, y, i, j)">
              </Button>
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
  
  align-content: center;
  vertical-align: middle;
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
  /* width: min(7vw, 7vh);
  height: min(7vw, 7vh); */
  /* color: azure;
  align-content: center;
  vertical-align: middle; */
}

.black {
  background-color: black;
}

.grey {
  background-color: #2a323d;
}

.green {
  background-color: green;
}

.red {
  background-color: red;
}

.signbutton {
  color:azure;
  width: min(7vw, 7vh);
  height: min(7vw, 7vh);
  font-weight: bold !important;
  font-size: x-large !important;
}

</style>
