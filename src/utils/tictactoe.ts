export type CellValue = "X" | "O" | "";
export type ThreeTimesThreeMatrix = CellValue[][];
export interface WinData {
  won: boolean;
  index: number;
  player: CellValue;
}

export class TicTacToe {
  checkRows = (matrix: ThreeTimesThreeMatrix): WinData => {
    for (let i = 0; i < matrix.length; i++) {
      const row = matrix[i];
      if (row[0] !== "" && row.every((val) => val === row[0])) {
        return { won: true, index: i, player: row[0] };
      }
    }
    return { won: false, index: -1, player: "" };
  };

  checkColumns = (matrix: ThreeTimesThreeMatrix): WinData => {
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
          return { won: true, index: i, player: matrix[0][i] };
        }
      }
    }
    return { won: false, index: -1, player: "" };
  };

  checkDiagonals = (matrix: ThreeTimesThreeMatrix): WinData => {
    const topLeftBottomRight =
      matrix[0][0] !== "" &&
      matrix[0][0] === matrix[1][1] &&
      matrix[1][1] === matrix[2][2];
    const topRightBottomLeft =
      matrix[0][2] !== "" &&
      matrix[0][2] === matrix[1][1] &&
      matrix[1][1] === matrix[2][0];

    if (topLeftBottomRight) {
      return { won: true, index: 0, player: matrix[0][0] };
    } else if (topRightBottomLeft) {
      return { won: true, index: 2, player: matrix[0][2] };
    } else {
      return { won: false, index: -1, player: "" };
    }
  };

  checkGameStatus = (
    matrix: ThreeTimesThreeMatrix
  ): [WinData, WinData, WinData] => {
    const row = this.checkRows(matrix);
    const col = this.checkColumns(matrix);
    const diag = this.checkDiagonals(matrix);
    return [row, col, diag];
  };

  evaluate = (
    board: ThreeTimesThreeMatrix,
    availableMoves: number[][],
    AIPLAYER: CellValue,
    HUMANPLAYER: CellValue
  ): number => {
    const [row, col, diag] = this.checkGameStatus(board);
    const winner = row.won
      ? board[row.index][0]
      : col.won
      ? board[0][col.index]
      : diag.won
      ? board[1][1]
      : availableMoves.length === 0
      ? "draw"
      : "";
    let score = 0;
    if (winner == AIPLAYER) {
      score = 10;
    } else if (winner == HUMANPLAYER) {
      score = -10;
    }
    return score;
  };

  getAvailableMoves = (board: ThreeTimesThreeMatrix): number[][] => {
    if (!this.checkGameStatus(board).some((data) => data.won)) {
      return board
        .flatMap((row, i) => row.map((cell, j) => ({ cell, indexes: [i, j] })))
        .filter(({ cell }) => cell === "")
        .map(({ indexes }) => indexes);
    } else return [];
  };

  minimax = (
    board: ThreeTimesThreeMatrix,
    depth: number,
    maximizingPlayer: boolean,
    AIPLAYER: CellValue
  ): number => {
    const HUMANPLAYER = AIPLAYER == "X" ? "O" : "X";
    const availableMoves = this.getAvailableMoves(board);
    const score = this.evaluate(board, availableMoves, AIPLAYER, HUMANPLAYER);

    if (
      score === 10 ||
      score === -10 ||
      availableMoves.length == 0 ||
      depth === 0
    ) {
      return score + (score < 0 ? -depth : depth);
    }

    if (maximizingPlayer) {
      let bestScore = -Infinity;
      for (const move of availableMoves) {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[move[0]][move[1]] = AIPLAYER;
        const currentScore =
          this.minimax(newBoard, depth - 1, false, AIPLAYER) + depth - 1;
        bestScore = Math.max(bestScore, currentScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of availableMoves) {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[move[0]][move[1]] = HUMANPLAYER;
        const currentScore =
          this.minimax(newBoard, depth - 1, true, AIPLAYER) - depth + 1;
        bestScore = Math.min(bestScore, currentScore);
      }
      return bestScore;
    }
  };
}
