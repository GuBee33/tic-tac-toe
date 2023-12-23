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


const evaluate = (board: ThreeTimesThreeMatrix, availableMoves: number[][], AIPLAYER: CellValue, HUMANPLAYER: CellValue): number => {

    const [row, col, diag] = checkGameStatus(board);
    const winner = row.won ? board[row.index][0] : (col.won ? board[0][col.index] : (diag.won ? board[1][1] : (availableMoves.length === 0 ? "draw" : '')));
    if (winner == AIPLAYER) {
        return 10;
    } else if (winner == HUMANPLAYER) {
        return -10;
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
    const score = evaluate(board, availableMoves, AIPLAYER, HUMANPLAYER);

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

const getBestMove = (board: ThreeTimesThreeMatrix, AIPLAYER: CellValue): number[] => {
    let bestMove = [-1, -1];
    let bestScore = -Infinity;

    const availableMoves = getAvailableMoves(board)
    if (availableMoves.some(x => x[0] == 1 && x[1] == 1)) {
        return [1, 1]
    }
    else {
        for (const move of availableMoves) {
            const newBoard = JSON.parse(JSON.stringify(board));
            newBoard[move[0]][move[1]] = AIPLAYER;
            const score = minimax(newBoard, 8, false, AIPLAYER); // Depth set to 8 for Tic-tac-toe
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }
}

const autoPlay = () => {
    const AIPLAYER = config.value.isXTurn ? 'O' : 'X'
    let [i, j] = getBestMove(config.value.ThreeTimesThree, AIPLAYER)
    updateConfig(i, j);
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

const checkWin = (matrix: ThreeTimesThreeMatrix, x: number, y: number) => {
    const [row, col, diag] = checkGameStatus(matrix);
    config.value.hasWonAll = row.won || col.won || diag.won ? (config.value.isXTurn ? 'O' : 'X') : (config.value.availableCells.length === 0 ? "draw" : '');
    const color = config.value.ThreeTimesThree[x][y] === 'O' ? 'green' : 'red';
    setBackground(config.value.ThreeTimesThree, config.value.background, color)
}

const checkGameStatus = (matrix: ThreeTimesThreeMatrix): [WinData, WinData, WinData] => {
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
