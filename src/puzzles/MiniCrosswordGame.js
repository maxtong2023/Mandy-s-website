// Mini Crossword - A small 5x5 crossword puzzle
export default function makeMiniCrosswordGame(k, onComplete) {
  const boxWidth = 700;
  const boxHeight = 650;
  
  const gameContainer = k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(100001),
    "crossword-game",
  ]);

  // Background
  gameContainer.add([
    k.rect(boxWidth, boxHeight),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 0),
    k.opacity(0.95),
  ]);

  // Border
  gameContainer.add([
    k.rect(boxWidth, boxHeight),
    k.outline(4, k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Title
  gameContainer.add([
    k.text("MINI CROSSWORD", {
      font: "determination",
      size: 28,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, -boxHeight / 2 + 40),
  ]);

  // Exit button
  const exitButton = gameContainer.add([
    k.rect(30, 30),
    k.color(k.Color.fromHex("#ff6b6b")),
    k.outline(2, k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(boxWidth / 2 - 20, -boxHeight / 2 + 20),
    k.area(),
    "exit-button",
  ]);

  exitButton.add([
    k.text("×", {
      font: "determination",
      size: 20,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  exitButton.onClick(() => {
    gameContainer.destroy();
    onComplete(false);
  });

  // Instructions
  gameContainer.add([
    k.text("Click a cell, type letter. Use arrow keys to move.", {
      font: "determination",
      size: 14,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, -270),
  ]);

  // 5x5 crossword puzzle
  // 0 = black square, 1 = white square
  const grid = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ];

  // Answers
  const answers = [
    ["T", "O", "T", "E", "S"],
    ["U", "", "", "V", ""],
    ["L", "O", "V", "E", "R"],
    ["I", "", "", "", ""],
    ["P", "E", "I", "Q", "I"],
  ];

  // Clues
  const cluesText = gameContainer.add([
    k.text("ACROSS:\n1. Types of bags you wanted for your birthday(5)\n3. What I am to you (5)\n5. The first name of the person who loves you (5)\n\nDOWN:\n1. Your favorite flowers(6)\n 4. The day before a special day, like your birthday(3)", {
      font: "determination",
      size: 12,
      width: 280,
      lineSpacing: 4,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("topleft"),
    k.pos(-330, -230),
  ]);

  // Game state
  const cellSize = 45;
  const gridStartX = 30;
  const gridStartY = -200;
  let selectedCell = null;
  const cells = [];
  const playerAnswers = Array(5).fill(null).map(() => Array(5).fill(""));

  // Create grid
  for (let row = 0; row < 5; row++) {
    cells[row] = [];
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === 0) {
        // Black square
        const cell = gameContainer.add([
          k.rect(cellSize, cellSize),
          k.color(k.Color.fromHex("#000000")),
          k.outline(2, k.Color.fromHex("#666666")),
          k.anchor("center"),
          k.pos(gridStartX + col * cellSize, gridStartY + row * cellSize),
        ]);
        cells[row][col] = { cell, isBlack: true };
      } else {
        // White square
        const cell = gameContainer.add([
          k.rect(cellSize, cellSize),
          k.color(k.Color.fromHex("#FFFFFF")),
          k.outline(2, k.Color.fromHex("#000000")),
          k.anchor("center"),
          k.pos(gridStartX + col * cellSize, gridStartY + row * cellSize),
          k.area(),
          "crossword-cell",
          { row, col },
        ]);

        const letter = cell.add([
          k.text("", {
            font: "determination",
            size: 24,
          }),
          k.color(k.Color.fromHex("#000000")),
          k.anchor("center"),
          k.pos(0, 0),
        ]);

        cell.onClick(() => {
          selectCell(row, col);
        });

        cells[row][col] = { cell, letter, isBlack: false };
      }
    }
  }

  const selectCell = (row, col) => {
    // Deselect previous
    if (selectedCell) {
      const prev = cells[selectedCell.row][selectedCell.col];
      if (!prev.isBlack) {
        prev.cell.color = k.Color.fromHex("#FFFFFF");
      }
    }

    // Select new
    selectedCell = { row, col };
    cells[row][col].cell.color = k.Color.fromHex("#FFEB3B");
  };

  const updateCell = (row, col, letter) => {
    playerAnswers[row][col] = letter;
    if (!cells[row][col].isBlack) {
      cells[row][col].letter.text = letter;
    }
  };

  const checkSolution = () => {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (grid[row][col] === 1) {
          if (playerAnswers[row][col].toUpperCase() !== answers[row][col]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Keyboard input
  const keyHandler = k.onKeyPress((key) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    if (key === "backspace") {
      updateCell(row, col, "");
    } else if (key.length === 1 && key >= 'a' && key <= 'z') {
      updateCell(row, col, key.toUpperCase());
      
      // Auto-advance to next cell
      let nextCol = col + 1;
      let nextRow = row;
      while (nextCol < 5 && grid[nextRow][nextCol] === 0) {
        nextCol++;
      }
      if (nextCol < 5) {
        selectCell(nextRow, nextCol);
      }
    } else if (key === "enter") {
      if (checkSolution()) {
        cluesText.text = "Perfect! +1 Puzzle Piece";
        cluesText.color = k.Color.fromHex("#000000");
        k.wait(2, () => {
          gameContainer.destroy();
          onComplete(true);
        });
      } else {
        cluesText.text = "Not quite right! Keep trying...";
        cluesText.color = k.Color.fromHex("#000000");
        k.wait(1, () => {
          cluesText.text = "ACROSS:\n1. Activities for fun (5)\n3. Person who programs (5)\n5. Smallest image unit (5)\n\nDOWN:\n1. Search engine (6)\n2. Popular language (5)";
          cluesText.color = k.Color.fromHex("#000000");
        });
      }
    } else if (key === "right") {
      let nextCol = col + 1;
      while (nextCol < 5 && grid[row][nextCol] === 0) nextCol++;
      if (nextCol < 5) selectCell(row, nextCol);
    } else if (key === "left") {
      let nextCol = col - 1;
      while (nextCol >= 0 && grid[row][nextCol] === 0) nextCol--;
      if (nextCol >= 0) selectCell(row, nextCol);
    } else if (key === "down") {
      let nextRow = row + 1;
      while (nextRow < 5 && grid[nextRow][col] === 0) nextRow++;
      if (nextRow < 5) selectCell(nextRow, col);
    } else if (key === "up") {
      let nextRow = row - 1;
      while (nextRow >= 0 && grid[nextRow][col] === 0) nextRow--;
      if (nextRow >= 0) selectCell(nextRow, col);
    }
  });

  // Check button
  const checkButton = gameContainer.add([
    k.rect(200, 50),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, 260),
    k.area(),
    "check-button",
  ]);

  checkButton.add([
    k.text("CHECK", {
      font: "determination",
      size: 20,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  checkButton.onClick(() => {
    if (checkSolution()) {
      cluesText.text = "Perfect! +1 Puzzle Piece";
      cluesText.color = k.Color.fromHex("#000000");
      k.wait(2, () => {
        gameContainer.destroy();
        onComplete(true);
      });
    } else {
      cluesText.text = "Not quite right! Keep trying...";
      cluesText.color = k.Color.fromHex("#000000");
      k.wait(1, () => {
        cluesText.text = "ACROSS:\n1. Activities for fun (5)\n3. Person who programs (5)\n5. Smallest image unit (5)\n\nDOWN:\n1. Search engine (6)\n2. Popular language (5)";
        cluesText.color = k.Color.fromHex("#000000");
      });
    }
  });

  // Select first cell by default
  selectCell(0, 0);

  // Cleanup
  gameContainer.onDestroy(() => {
    keyHandler.cancel();
  });

  return gameContainer;
}

