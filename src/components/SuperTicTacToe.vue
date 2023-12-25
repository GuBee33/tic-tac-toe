<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
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
  // availableCells: number[][]
}
const isTwoplayer: Ref<boolean> = ref((false))
const config: Ref<TheConfig> = ref({
  isXTurn: true,
  hasWon: [],
  hasWonAll: '',
  lastClick: [-1, -1],
  ThreeTimesThree: [],
  BigThreeTimesThree: [],
  background: [],
  winnerBackground: [],
  // availableCells: [],
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
  // config.value.availableCells = []

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
          // config.value.availableCells.push([x, y, i, j])
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
  setWinner(config.value.BigThreeTimesThree[x][y], x, y);
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
    if (!isTwoplayer.value && config.value.hasWonAll === '') {
      const AIPLAYER = config.value.isXTurn ? 'X' : 'O'
      const [x2, y2, i2, j2] = getBestMove(i, j, AIPLAYER)
      updateConfig(x2, y2, i2, j2)
    }
  }
};

const getBestMove3x3 = (board: ThreeTimesThreeMatrix, AIPLAYER: CellValue): { bestMove: number[], bestScore: number } => {
  let bestMove = [-1, -1];
  let bestScore = -Infinity;
  const availableMoves = functions.getAvailableMoves(board)
  for (const move of availableMoves) {
    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[move[0]][move[1]] = AIPLAYER;
    const score = functions.minimax(newBoard, 8, false, AIPLAYER)
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return { bestMove, bestScore };
}



const getBestMove = (i: number, j: number, AIPLAYER: CellValue): number[] => {
  if (functions.getAvailableMoves(config.value.BigThreeTimesThree[i][j]).length > 0) {
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

    const resutl2 = functions.checkGameStatus(config.value.ThreeTimesThree)
    if (resutl2.some(x => x.won)) {
      setBackground(resutl2, config.value.winnerBackground, color)
      config.value.hasWonAll = result.filter(x => x.won)[0].player
    }
    else if (!config.value.BigThreeTimesThree.some(row => (row.some(col => functions.getAvailableMoves(col).length > 0)))) {
      config.value.hasWonAll = "draw"
    }
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

.grey {
  background-color: 2a323d;
}

.green {
  background-color: green;
}

.red {
  background-color: red;
}
</style>
