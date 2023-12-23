<script setup lang="ts">
import { ref, Ref } from 'vue'
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';


type CellValue = 'X' | 'O' | '';
type ThreeTimesThreeMatrix = CellValue[][];
interface WinData {
    won: boolean;
    index: number;
}
interface TheConfig {
    isXTurn: boolean,
    hasWonAll: CellValue | "draw",
    ThreeTimesThree: ThreeTimesThreeMatrix,
    background: string[][],
    availableCells: number[][],
}
const isTwoplayer: Ref<boolean> = ref((true))
const config: Ref<TheConfig> = ref({
    isXTurn: true,
    hasWonAll: '',
    lastClick: [-1, -1],
    ThreeTimesThree: [['', '', ''], ['', '', ''], ['', '', '']],
    background: [
        ['black', 'black', 'black'],
        ['black', 'black', 'black'],
        ['black', 'black', 'black'],
    ],
    availableCells: [
        [0, 0], [0, 1], [0, 2],
        [1, 0], [1, 1], [1, 2],
        [2, 0], [2, 1], [2, 2]],
})

const reset = () => {
    config.value.isXTurn = true
    config.value.hasWonAll = ""
    config.value.ThreeTimesThree = [["", "", ""], ["", "", ""], ["", "", ""]]
    config.value.background = [
        ['black', 'black', 'black'],
        ['black', 'black', 'black'],
        ['black', 'black', 'black'],
    ]
    config.value.availableCells = [
        [0, 0], [0, 1], [0, 2],
        [1, 0], [1, 1], [1, 2],
        [2, 0], [2, 1], [2, 2]]
}
const putASign = (i: number, j: number): void => {
    const canPlaceSign =
        !config.value.ThreeTimesThree[i][j] &&
        !config.value.hasWonAll

    if (canPlaceSign) {
        const currentSign: CellValue = config.value.isXTurn ? 'X' : 'O';
        config.value.ThreeTimesThree[i][j] = currentSign;
        config.value.isXTurn = !config.value.isXTurn;
        config.value.availableCells = config.value.availableCells.filter(cell => !(cell[0] === i && cell[1] === j));
        checkWin(config.value.ThreeTimesThree, i, j);
        if (!isTwoplayer.value) {
            autoPlay()
        }
    }
};


function autoPlay() {
    let [i, j] = config.value.availableCells[Math.floor(Math.random() * config.value.availableCells.length)]
    const currentSign: CellValue = config.value.isXTurn ? 'X' : 'O';
    config.value.ThreeTimesThree[i][j] = currentSign;
    config.value.isXTurn = !config.value.isXTurn;
    config.value.availableCells = config.value.availableCells.filter(cell => !(cell[0] === i && cell[1] === j));
    checkWin(config.value.ThreeTimesThree, i, j);

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

function checkWin(matrix: ThreeTimesThreeMatrix, x: number, y: number) {
    const [row, col, diag] = checkGameStatus(matrix);
    config.value.hasWonAll = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : (config.value.availableCells.length === 0 ? "draw" : '');
    const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
    setBackground(config.value.ThreeTimesThree, config.value.background, color)
}

function checkGameStatus(matrix: ThreeTimesThreeMatrix): [WinData, WinData, WinData] {
    const row = checkRows(matrix);
    const col = checkColumns(matrix);
    const diag = checkDiagonals(matrix);
    return [row, col, diag];
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

.grey {}

.green {
    background-color: green;
}

.red {
    background-color: red;
}
</style>
