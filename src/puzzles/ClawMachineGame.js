// Claw Machine - Time the moving claw to grab the prize! 5 levels with increasing speed
export default function makeClawMachineGame(k, onComplete) {
  const boxWidth = 600;
  const boxHeight = 500;
  
  const gameContainer = k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(100001),
    "claw-game",
  ]);

  // Background
  gameContainer.add([
    k.rect(boxWidth, boxHeight),
    k.color(k.Color.fromHex("#1a1a2e")),
    k.anchor("center"),
    k.pos(0, 0),
    k.opacity(0.95),
  ]);

  // Border
  gameContainer.add([
    k.rect(boxWidth, boxHeight),
    k.outline(4, k.Color.fromHex("#FFD700")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Title
  gameContainer.add([
    k.text("HABIBI'S CLAW MACHINE", {
      font: "determination",
      size: 24,
    }),
    k.color(k.Color.fromHex("#FFD700")),
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
  let currentLevel = 1;
  const maxLevel = 5;
  const levelSpeeds = [150, 250, 400, 600, 700]; // Level 5 is fast but not impossible
  let clawSpeed = levelSpeeds[0];

  // Level display
  const levelText = gameContainer.add([
    k.text(`Level ${currentLevel}/${maxLevel}`, {
      font: "determination",
      size: 18,
    }),
    k.color(k.Color.fromHex("#FFD700")),
    k.anchor("center"),
    k.pos(0, -220),
  ]);

  // Instructions
  const instructionText = gameContainer.add([
    k.text("Press SPACE to drop the claw!", {
      font: "determination",
      size: 16,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, -180),
  ]);

  // Game area
  const gameAreaWidth = 400;
  const gameAreaHeight = 250;
  const gameAreaY = 0;

  // Draw game box
  gameContainer.add([
    k.rect(gameAreaWidth, gameAreaHeight),
    k.color(k.Color.fromHex("#000000")),
    k.outline(3, k.Color.fromHex("#666666")),
    k.anchor("center"),
    k.pos(0, gameAreaY),
  ]);

  // Claw rail (top bar)
  gameContainer.add([
    k.rect(gameAreaWidth - 20, 5),
    k.color(k.Color.fromHex("#888888")),
    k.anchor("center"),
    k.pos(0, gameAreaY - gameAreaHeight / 2 + 10),
  ]);

  // Prize (plate emoji or box)
  const prizeStartY = gameAreaY + gameAreaHeight / 2 - 40;
  const prize = gameContainer.add([
    k.rect(40, 40),
    k.color(k.Color.fromHex("#FFD700")),
    k.outline(2, k.Color.fromHex("#FFA500")),
    k.anchor("center"),
    k.pos(0, prizeStartY),
  ]);

  prize.add([
    k.text("🍽️", {
      font: "determination",
      size: 24,
    }),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Claw position and movement
  let clawX = -gameAreaWidth / 2 + 30;
  let clawDirection = 1; // 1 = right, -1 = left
  let clawDropping = false;
  let clawRaising = false;
  let clawY = gameAreaY - gameAreaHeight / 2 + 30;
  const clawTopY = gameAreaY - gameAreaHeight / 2 + 30;
  const clawBottomY = gameAreaY + gameAreaHeight / 2 - 60;

  // Claw visual
  const claw = gameContainer.add([
    k.pos(clawX, clawY),
    k.anchor("center"),
    k.z(1000),
  ]);

  // Cable
  const cable = claw.add([
    k.rect(2, 40),
    k.color(k.Color.fromHex("#888888")),
    k.anchor("top"),
    k.pos(0, -40),
  ]);

  // Claw grabber
  const clawGrabber = claw.add([
    k.polygon([
      k.vec2(-15, 0),
      k.vec2(15, 0),
      k.vec2(10, 20),
      k.vec2(-10, 20),
    ]),
    k.color(k.Color.fromHex("#FF6B6B")),
    k.outline(2, k.Color.fromHex("#FFFFFF")),
    k.anchor("top"),
    k.pos(0, 0),
  ]);

  // Game state
  let gameActive = true;
  let hasWon = false;
  let waitingForNextLevel = false;

  const startNextLevel = () => {
    currentLevel++;
    if (currentLevel > maxLevel) {
      // Beat all levels!
      instructionText.text = `You beat all ${maxLevel} levels! Habibi Plate unlocked!`;
      instructionText.color = k.Color.fromHex("#aaea6c");
      gameActive = false;
      k.wait(2, () => {
        gameContainer.destroy();
        onComplete(true, "Habibi Plate");
      });
      return;
    }

    // Setup next level
    clawSpeed = levelSpeeds[currentLevel - 1];
    levelText.text = `Level ${currentLevel}/${maxLevel}`;
    clawX = -gameAreaWidth / 2 + 30;
    clawDirection = 1;
    clawY = clawTopY;
    claw.pos = k.vec2(clawX, clawY);
    clawDropping = false;
    clawRaising = false;
    hasWon = false;
    waitingForNextLevel = false;
    
    // IMPORTANT: Reset prize position!
    prize.pos.y = prizeStartY;
    
    let speedDescription = "faster";
    if (currentLevel === 4) speedDescription = "SUPER fast";
    if (currentLevel === 5) speedDescription = "ULTRA fast";
    
    instructionText.text = `Level ${currentLevel}! Claw is ${speedDescription} now!`;
    instructionText.color = k.Color.fromHex("#FFD700");
    k.wait(1.5, () => {
      if (gameActive) {
        instructionText.text = "Press SPACE to drop the claw!";
        instructionText.color = k.Color.fromHex("#FFFFFF");
      }
    });
  };

  // Update claw position
  k.onUpdate(() => {
    if (!gameActive || waitingForNextLevel) return;

    if (!clawDropping && !clawRaising) {
      // Move claw horizontally
      clawX += clawSpeed * clawDirection * k.dt();
      
      // Bounce at edges
      if (clawX > gameAreaWidth / 2 - 30) {
        clawX = gameAreaWidth / 2 - 30;
        clawDirection = -1;
      } else if (clawX < -gameAreaWidth / 2 + 30) {
        clawX = -gameAreaWidth / 2 + 30;
        clawDirection = 1;
      }
      
      claw.pos.x = clawX;
    } else if (clawDropping) {
      // Dropping phase
      clawY += 200 * k.dt();
      claw.pos.y = clawY;
      
      if (clawY >= clawBottomY) {
        // Reached bottom - check if we grabbed the prize
        const prizeLeft = prize.pos.x - 20;
        const prizeRight = prize.pos.x + 20;
        
        if (clawX >= prizeLeft && clawX <= prizeRight) {
          // Success! Grabbed the prize
          hasWon = true;
        } else {
          // Missed the prize
          hasWon = false;
        }
        
        // Stop dropping, start raising
        clawDropping = false;
        clawRaising = true;
      }
    } else if (clawRaising) {
      // Raising back up
      clawY -= 150 * k.dt();
      claw.pos.y = clawY;
      
      // If we grabbed the prize, move it with the claw
      if (hasWon) {
        prize.pos.y = claw.pos.y + 30;
      }
      
      if (clawY <= clawTopY) {
        // Back at top
        clawY = clawTopY;
        claw.pos.y = clawY;
        clawRaising = false;
        
        if (hasWon) {
          // Won this level!
          waitingForNextLevel = true;
          instructionText.text = `Level ${currentLevel} complete!`;
          instructionText.color = k.Color.fromHex("#aaea6c");
          k.wait(2, () => {
            if (gameActive) {
              startNextLevel();
            }
          });
        } else {
          // Missed! Game over
          instructionText.text = "You missed! Game Over!";
          instructionText.color = k.Color.fromHex("#ff6b6b");
          gameActive = false;
          k.wait(2, () => {
            gameContainer.destroy();
            onComplete(false);
          });
        }
      }
    }
  });

  // Drop claw on space
  const keyHandler = k.onKeyPress("space", () => {
    if (gameActive && !clawDropping && !clawRaising && !waitingForNextLevel) {
      clawDropping = true;
      instructionText.text = "Dropping...";
    }
  });

  // Cleanup
  gameContainer.onDestroy(() => {
    keyHandler.cancel();
  });

  return gameContainer;
}
