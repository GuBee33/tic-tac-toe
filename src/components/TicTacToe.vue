<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { TicTacToe, CellValue, ThreeTimesThreeMatrix } from '../utils/tictactoe';

const functions = new TicTacToe();

interface TheConfig {
    isXTurn: boolean,
    hasWonAll: CellValue | "draw",
    ThreeTimesThree: ThreeTimesThreeMatrix,
    background: string[][],
    availableCells: number[][],
}
const isTwoplayer: Ref<boolean> = ref((false))
const config: Ref<TheConfig> = ref({
    isXTurn: true,
    hasWonAll: '',
    lastClick: [-1, -1],
    ThreeTimesThree: [],
    background: [],
    availableCells: [],
})

const reset = () => {
    config.value.isXTurn = true
    config.value.hasWonAll = ""
    config.value.availableCells = []
    config.value.ThreeTimesThree = []
    config.value.background = []
    for (let i = 0; i < 3; i++) {
        let empty: CellValue[] = []
        let bg = []
        for (let j = 0; j < 3; j++) {
            empty.push("")
            bg.push("black")
            config.value.availableCells.push([i, j])
        }
        config.value.ThreeTimesThree.push(empty)
        config.value.background.push(bg)
    }
}
reset()

const updateConfig = (i: number, j: number): void => {
    const currentSign: CellValue = config.value.isXTurn ? 'X' : 'O';
    config.value.ThreeTimesThree[i][j] = currentSign;
    config.value.isXTurn = !config.value.isXTurn;
    config.value.availableCells = config.value.availableCells.filter(cell => !(cell[0] === i && cell[1] === j));
    checkWin(config.value.ThreeTimesThree, i, j);
}

const putASign = (i: number, j: number): void => {
    const canPlaceSign =
        !config.value.ThreeTimesThree[i][j] &&
        !config.value.hasWonAll
    if (canPlaceSign) {
        updateConfig(i, j)
        if (!isTwoplayer.value && !config.value.hasWonAll) {
            autoPlay()
        }
    }
};

const getBestMove = (board: ThreeTimesThreeMatrix, AIPLAYER: CellValue): number[] => {
    let bestMove = [-1, -1];
    let bestScore = -Infinity;

    const availableMoves = functions.getAvailableMoves(board)
    for (const move of availableMoves) {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[move[0]][move[1]] = AIPLAYER;

        const score = functions.minimax(newBoard, 8, false, AIPLAYER) + (move[0] + move[1] === 2 ? (move[0] == 1 ? 3 : 2) : 0);
        console.log(score, move)
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

const autoPlay = () => {
    const AIPLAYER = config.value.isXTurn ? 'X' : 'O'
    let [i, j] = getBestMove(config.value.ThreeTimesThree, AIPLAYER)
    updateConfig(i, j);
}

const checkWin = (matrix: ThreeTimesThreeMatrix, x: number, y: number) => {
    const [row, col, diag] = functions.checkGameStatus(matrix);
    config.value.hasWonAll = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : (config.value.availableCells.length === 0 ? "draw" : '');
    const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
    setBackground(config.value.ThreeTimesThree, config.value.background, color)
}

const setBackground = (matrix: ThreeTimesThreeMatrix, colorMatrix: string[][], color: string) => {
    const [row, col, diag] = functions.checkGameStatus(matrix);
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
        <tr v-for="(row, i) in config.ThreeTimesThree" :key="i">
            <td class="cell" v-for="(cell, j) in row" :key="j">
                <div :class="config.background[i][j] + ' mark'" @click="putASign(i, j)">{{ cell }}
                </div>
            </td>
        </tr>
    </table>
</template>

<style scoped>
.bigtable {
    width: min(82vw, 82vh);
    height: min(81vw, 81vh);
    border-collapse: collapse;
    table-layout: fixed;
}

.cell {
    text-align: center;
    vertical-align: middle;
}

.mark {
    width: min(27vw, 27vh);
    height: min(27vw, 27vh);
    color: azure;
    align-content: center;
    vertical-align: middle;
    font-size: min(27vw, 27vh);
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
