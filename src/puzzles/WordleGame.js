// Wordle - Guess the 5-letter word in 6 tries
export default function makeWordleGame(k, onComplete) {
  const boxWidth = 500;
  const boxHeight = 600;
  
  const gameContainer = k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(100001),
    "wordle-game",
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
    k.text("WORDLE", {
      font: "determination",
      size: 32,
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
  const instructionText = gameContainer.add([
    k.text("Guess the 5-letter word! Type and press ENTER", {
      font: "determination",
      size: 16,
      width: boxWidth - 40,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, -240),
  ]);

  // Game state
  const targetWord = "LOVEU"; // The answer
  let currentGuess = "";
  let guesses = [];
  const maxGuesses = 6;
  const cellSize = 50;
  const cellGap = 5;

  // Create grid for guesses
  const gridStartY = -180;
  const guessRows = [];

  for (let row = 0; row < maxGuesses; row++) {
    const rowCells = [];
    for (let col = 0; col < 5; col++) {
      const xPos = (col - 2) * (cellSize + cellGap);
      const yPos = gridStartY + row * (cellSize + cellGap);

      const cell = gameContainer.add([
        k.rect(cellSize, cellSize),
        k.color(k.Color.fromHex("#333333")),
        k.outline(2, k.Color.fromHex("#666666")),
        k.anchor("center"),
        k.pos(xPos, yPos),
      ]);

      const letter = cell.add([
        k.text("", {
          font: "determination",
          size: 32,
        }),
        k.color(k.Color.fromHex("#FFFFFF")),
        k.anchor("center"),
        k.pos(0, 0),
      ]);

      rowCells.push({ cell, letter });
    }
    guessRows.push(rowCells);
  }

  // Current input display
  const updateCurrentRow = () => {
    const currentRow = guessRows[guesses.length];
    if (!currentRow) return;

    for (let i = 0; i < 5; i++) {
      currentRow[i].letter.text = currentGuess[i] || "";
    }
  };

  // Check guess and update colors
  const checkGuess = (guess) => {
    const currentRow = guessRows[guesses.length];
    const wordArray = targetWord.split("");
    const guessArray = guess.split("");
    const used = new Array(5).fill(false);

    // First pass: mark correct positions (green)
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === wordArray[i]) {
        currentRow[i].cell.color = k.Color.fromHex("#538d4e"); // Green
        used[i] = true;
      }
    }

    // Second pass: mark wrong positions (yellow) and wrong letters (gray)
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === wordArray[i]) continue; // Already green

      let foundInWord = false;
      for (let j = 0; j < 5; j++) {
        if (!used[j] && guessArray[i] === wordArray[j]) {
          currentRow[i].cell.color = k.Color.fromHex("#b59f3b"); // Yellow
          used[j] = true;
          foundInWord = true;
          break;
        }
      }

      if (!foundInWord) {
        currentRow[i].cell.color = k.Color.fromHex("#3a3a3c"); // Gray
      }
    }

    guesses.push(guess);

    // Check win/lose
    if (guess === targetWord) {
      instructionText.text = "Correct! +1 Puzzle Piece";
      instructionText.color = k.Color.fromHex("#000000");
      k.wait(2, () => {
        gameContainer.destroy();
        onComplete(true);
      });
    } else if (guesses.length >= maxGuesses) {
      instructionText.text = `Game Over! The word was ${targetWord}`;
      instructionText.color = k.Color.fromHex("#000000");
      k.wait(3, () => {
        gameContainer.destroy();
        onComplete(false);
      });
    } else {
      currentGuess = "";
      updateCurrentRow();
    }
  };

  // Keyboard input
  const keyHandler = k.onKeyPress((key) => {
    if (guesses.length >= maxGuesses) return;

    if (key === "enter" && currentGuess.length === 5) {
      checkGuess(currentGuess);
    } else if (key === "backspace") {
      currentGuess = currentGuess.slice(0, -1);
      updateCurrentRow();
    } else if (key.length === 1 && key >= 'a' && key <= 'z' && currentGuess.length < 5) {
      currentGuess += key.toUpperCase();
      updateCurrentRow();
    }
  });

  // Cleanup
  gameContainer.onDestroy(() => {
    keyHandler.cancel();
  });

  return gameContainer;
}

