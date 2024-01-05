<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';
import { TicTacToe, CellValue, ThreeTimesThreeMatrix } from '../utils/tictactoe';

const functions = new TicTacToe();

interface TheConfig {
    isXTurn: boolean,
    hasWonAll: CellValue | "draw",
    ThreeTimesThree: ThreeTimesThreeMatrix,
    background: backgroundClasses[][],
    availableCells: number[][],
}
type backgroundClasses = { "shadow-6": boolean, "spot": boolean, "black": boolean, "gray": boolean, "green": boolean, "red": boolean, "flip-x": boolean }
type BackgroundKeys = keyof backgroundClasses;

const isTwoplayer: Ref<boolean> = ref((false))
const players = [
    { title: "Human vs Computer", value: false },
    { title: "Human vs Human", value: true },
]
const level: Ref<"easy" | "hard"> = ref(("hard"))
const levels = [{ name: "easy", disabled: false, label: "Easy" }, { name: "hard", disabled: false, label: "Unbeatable" }]

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
        let bg: backgroundClasses[] = []
        for (let j = 0; j < 3; j++) {
            empty.push("")
            bg.push({ "shadow-6": true, "spot": true, "black": true, "gray": false, "green": false, "red": false, "flip-x": false })
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
    config.value.background[i][j]['flip-x'] = true
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

const getRandomMove = (board: ThreeTimesThreeMatrix): number[] => {
    const availableMoves = functions.getAvailableMoves(board)
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

const getBestMove = (board: ThreeTimesThreeMatrix, AIPLAYER: CellValue): number[] => {
    let bestMove = [-1, -1];
    let bestScore = -Infinity;

    const availableMoves = functions.getAvailableMoves(board)
    for (const move of availableMoves) {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[move[0]][move[1]] = AIPLAYER;
        const score = functions.minimax(newBoard, 8, false, AIPLAYER) + (move[0] + move[1] === 2 ? (move[0] == 1 ? 3 : 2) : 0);
        if (score > bestScore) {
            bestScore = score; bestMove = move;
        }
    }
    return bestMove;
}

const autoPlay = () => {
    const AIPLAYER = config.value.isXTurn ? 'X' : 'O'
    let [i, j] = [-1, -1]
    if (level.value === "easy") {
        [i, j] = getRandomMove(config.value.ThreeTimesThree)
    } else {
        [i, j] = getBestMove(config.value.ThreeTimesThree, AIPLAYER)
    }
    if (i !== -1 && j !== -1) {
        updateConfig(i, j);
    }
}

const checkWin = (matrix: ThreeTimesThreeMatrix, x: number, y: number) => {
    const [row, col, diag] = functions.checkGameStatus(matrix);
    config.value.hasWonAll = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : (config.value.availableCells.length === 0 ? "draw" : '');
    const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
    setBackground(config.value.ThreeTimesThree, config.value.background, color)
}

const setBackground = (matrix: ThreeTimesThreeMatrix, colorMatrix: backgroundClasses[][], color: BackgroundKeys) => {
    const [row, col, diag] = functions.checkGameStatus(matrix);
    for (let i = 0; i < matrix.length; i++) {
        if (row.won) {
            colorMatrix[row.index][i][color] = true
        } else if (col.won) {
            colorMatrix[i][col.index][color] = true;
        } else if (diag.won) {
            if (diag.index === 0) {
                colorMatrix[i][i][color] = true;
            }
            else {
                colorMatrix[i][matrix.length - 1 - i][color] = true;
            }
        }
    }
}


</script>

<template>
    <SelectButton v-model="isTwoplayer" :options="players" optionLabel="title" optionValue="value" aria-labelledby="basic"
        :allowEmpty="false" />
    <SelectButton v-if="!isTwoplayer" v-model="level" :options="levels" aria-labelledby="basic" :allowEmpty="false"
        optionLabel="label" optionValue="name" />

    <h2 v-if="config.hasWonAll == 'X' || config.hasWonAll == 'O'">"{{ config.hasWonAll }}" won the game
    </h2>
    <h2 v-else-if="config.hasWonAll == 'draw'">
        It's a draw
    </h2>
    <Button v-if="config.hasWonAll !== ''" @click="reset">Restart</Button>
    <div v-else>
        It's "{{ config.isXTurn ? "X" : "O" }}"'s turn
    </div>
    <div class="container">
        <ul class="flex spot-row" v-for="(row, i) in config.ThreeTimesThree" :key="i">
            <li :class="config.background[i][j]" v-for="(cell, j) in row" :key="j" @click="putASign(i, j)">
                {{ cell }}
            </li>
        </ul>
    </div>
</template>

<style >

.container {
    width: min(82vw, 82vh);
    height: min(81vw, 81vh);
    margin: 0 auto;
}

.spot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(27vw, 27vh);
    height: min(27vw, 27vh);
    margin: 5px;
    font-size: min(20vw, 20vh);
}


</style>
