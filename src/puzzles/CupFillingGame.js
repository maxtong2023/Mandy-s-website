// Cup Filling Game - Press the correct arrow keys to fill cups!
export default function makeCupFillingGame(k, onComplete) {
  const boxWidth = 600;
  const boxHeight = 550;
  
  const gameContainer = k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(100001),
    "cup-game",
  ]);

  // Background
  gameContainer.add([
    k.rect(boxWidth, boxHeight),
    k.color(k.Color.fromHex("#2c3e50")),
    k.anchor("center"),
    k.pos(0, 0),
    k.opacity(0.95),
  ]);

  // Border
  gameContainer.add([
    k.rect(boxWidth, boxHeight),
    k.outline(4, k.Color.fromHex("#e74c3c")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Title
  gameContainer.add([
    k.text("MOLLY'S TEA SHOP", {
      font: "determination",
      size: 24,
    }),
    k.color(k.Color.fromHex("#e74c3c")),
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

  // Game state
  const gameDuration = 20; // 20 seconds
  const winThreshold = 10; // Need 10 cups
  const keysPerCup = 4; // 4 correct keys = 1 cup
  let timeLeft = gameDuration;
  let cupsCompleted = 0;
  let currentProgress = 0; // 0-3 for current cup
  let gameActive = true;

  // Arrow keys
  const arrowKeys = ["up", "down", "left", "right"];
  const arrowSymbols = {
    "up": "↑",
    "down": "↓",
    "left": "←",
    "right": "→"
  };
  let currentKey = arrowKeys[Math.floor(Math.random() * arrowKeys.length)];

  // UI
  const scoreText = gameContainer.add([
    k.text(`Cups: ${cupsCompleted}/${winThreshold}`, {
      font: "determination",
      size: 20,
    }),
    k.color(k.Color.fromHex("#000000")), // Black text
    k.anchor("center"),
    k.pos(-150, -200),
  ]);

  const timerText = gameContainer.add([
    k.text(`Time: ${Math.ceil(timeLeft)}s`, {
      font: "determination",
      size: 20,
    }),
    k.color(k.Color.fromHex("#000000")), // Black text
    k.anchor("center"),
    k.pos(150, -200),
  ]);

  const instructionText = gameContainer.add([
    k.text("Press the arrow key shown below!", {
      font: "determination",
      size: 14,
    }),
    k.color(k.Color.fromHex("#000000")), // Black text
    k.anchor("center"),
    k.pos(0, -160),
  ]);

  // Cup visual
  const cupWidth = 120;
  const cupHeight = 140;
  const cupY = 0;

  const cup = gameContainer.add([
    k.rect(cupWidth, cupHeight),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.outline(4, k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, cupY),
  ]);

  // Cup fill (tea liquid)
  const maxFillHeight = cupHeight - 10;
  const cupFill = cup.add([
    k.rect(cupWidth - 10, 0),
    k.color(k.Color.fromHex("#8B4513")),
    k.anchor("botleft"),
    k.pos(-cupWidth / 2 + 5, cupHeight / 2 - 5),
  ]);

  // Fill level markers (4 lines for 25%, 50%, 75%, 100%)
  for (let i = 1; i <= 4; i++) {
    const lineY = cupHeight / 2 - 5 - (maxFillHeight * i / 4);
    cup.add([
      k.rect(cupWidth - 10, 2),
      k.color(k.Color.fromHex("#00FF00")),
      k.anchor("botleft"),
      k.pos(-cupWidth / 2 + 5, lineY),
    ]);
  }

  // Progress text on cup
  const progressText = cup.add([
    k.text(`${currentProgress}/${keysPerCup}`, {
      font: "determination",
      size: 24,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Arrow key display
  const arrowDisplay = gameContainer.add([
    k.text(arrowSymbols[currentKey], {
      font: "determination",
      size: 80,
    }),
    k.color(k.Color.fromHex("#FFD700")),
    k.anchor("center"),
    k.pos(0, cupY + 140),
  ]);

  // Key name helper
  const keyNameText = gameContainer.add([
    k.text(currentKey.toUpperCase(), {
      font: "determination",
      size: 16,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, cupY + 190),
  ]);

  // Update fill level visual
  const updateFillLevel = () => {
    const fillPercentage = currentProgress / keysPerCup;
    cupFill.height = maxFillHeight * fillPercentage;
    progressText.text = `${currentProgress}/${keysPerCup}`;
  };

  // Pick new random key
  const pickNewKey = () => {
    currentKey = arrowKeys[Math.floor(Math.random() * arrowKeys.length)];
    arrowDisplay.text = arrowSymbols[currentKey];
    keyNameText.text = currentKey.toUpperCase();
  };

  // Complete a cup
  const completeCup = () => {
    cupsCompleted++;
    scoreText.text = `Cups: ${cupsCompleted}/${winThreshold}`;
    currentProgress = 0;
    updateFillLevel();

    if (cupsCompleted >= winThreshold) {
      // Won!
      instructionText.text = `${cupsCompleted} cups! You got Molly Tea!`;
      instructionText.color = k.Color.fromHex("#aaea6c");
      gameActive = false;
      k.wait(2, () => {
        gameContainer.destroy();
        onComplete(true, "Molly Tea");
      });
    } else {
      // Flash success
      arrowDisplay.color = k.Color.fromHex("#00FF00");
      k.wait(0.2, () => {
        if (gameActive) {
          arrowDisplay.color = k.Color.fromHex("#FFD700");
          pickNewKey();
        }
      });
    }
  };

  // Handle key press
  const handleKeyPress = (key) => {
    if (!gameActive) return;

    if (key === currentKey) {
      // Correct!
      currentProgress++;
      updateFillLevel();

      if (currentProgress >= keysPerCup) {
        // Cup complete!
        completeCup();
      } else {
        // Next key
        pickNewKey();
      }
    } else {
      // Wrong key! Game over
      instructionText.text = `Wrong key! You pressed ${key.toUpperCase()}!`;
      instructionText.color = k.Color.fromHex("#ff6b6b");
      arrowDisplay.color = k.Color.fromHex("#ff6b6b");
      gameActive = false;
      k.wait(2, () => {
        gameContainer.destroy();
        onComplete(false);
      });
    }
  };

  // Key handlers
  const upHandler = k.onKeyPress("up", () => handleKeyPress("up"));
  const downHandler = k.onKeyPress("down", () => handleKeyPress("down"));
  const leftHandler = k.onKeyPress("left", () => handleKeyPress("left"));
  const rightHandler = k.onKeyPress("right", () => handleKeyPress("right"));

  // Timer
  k.onUpdate(() => {
    if (!gameActive) return;

    timeLeft -= k.dt();
    timerText.text = `Time: ${Math.ceil(timeLeft)}s`;

    if (timeLeft <= 0) {
      // Time's up!
      gameActive = false;
      
      if (cupsCompleted >= winThreshold) {
        // Won!
        instructionText.text = `${cupsCompleted} cups! You got Molly Tea!`;
        instructionText.color = k.Color.fromHex("#aaea6c");
        k.wait(2, () => {
          gameContainer.destroy();
          onComplete(true, "Molly Tea");
        });
      } else {
        // Lost
        instructionText.text = `Only ${cupsCompleted} cups. Need ${winThreshold}!`;
        instructionText.color = k.Color.fromHex("#ff6b6b");
        k.wait(2, () => {
          gameContainer.destroy();
          onComplete(false);
        });
      }
    }
  });

  // Cleanup
  gameContainer.onDestroy(() => {
    upHandler.cancel();
    downHandler.cancel();
    leftHandler.cancel();
    rightHandler.cancel();
  });

  return gameContainer;
}
