// Connections - Group 16 words into 4 categories of 4
export default function makeConnectionsGame(k, onComplete) {
  const boxWidth = 650;
  const boxHeight = 650;
  
  const gameContainer = k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(100001),
    "connections-game",
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
    k.text("CONNECTIONS", {
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
  const instructionText = gameContainer.add([
    k.text("Find groups of 4 related words. Click to select, Submit to check!", {
      font: "determination",
      size: 14,
      width: boxWidth - 40,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, -270),
  ]);

  // Puzzle data - 4 categories
  const categories = [
    { name: "Birthday Treats", color: "#f9df6d", words: ["CAKE", "CANDY", "ICE", "CREAM"] },
    { name: "Party Decorations", color: "#a0c35a", words: ["BALLOON", "STREAMER", "BANNER", "CONFETTI"] },
    { name: "Stuff We Will Get for Our House", color: "#b0c4ef", words: ["CORGI", "HOME GYM", "HOT TUB", "CAT"] },
    { name: "Stuff You Can do At 21", color: "#ba81c5", words: ["CLUB", "DRINK", "RENT CAR", "HOTEL"] },
  ];

  // Shuffle all words
  let availableWords = [];
  categories.forEach(cat => {
    availableWords.push(...cat.words);
  });
  availableWords.sort(() => Math.random() - 0.5);

  // Game state
  let selected = new Set();
  let solvedCategories = [];
  let mistakes = 0;
  const maxMistakes = 4;

  // Mistakes display
  const mistakesText = gameContainer.add([
    k.text(`Mistakes remaining: ${maxMistakes - mistakes}`, {
      font: "determination",
      size: 16,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, -230),
  ]);

  // Word buttons
  const buttonWidth = 140;
  const buttonHeight = 50;
  const buttonGap = 10;
  const wordButtons = [];

  const updateButtonAppearance = (button, word) => {
    const isSelected = selected.has(word);
    button.color = isSelected ? k.Color.fromHex("#5a594e") : k.Color.fromHex("#333333");
  };

  const createGrid = () => {
    // Clear existing buttons
    wordButtons.forEach(btn => btn.destroy());
    wordButtons.length = 0;

    // Show solved categories at top
    let yOffset = -180;
    solvedCategories.forEach(cat => {
      const categoryBox = gameContainer.add([
        k.rect(buttonWidth * 4 + buttonGap * 3, buttonHeight),
        k.color(k.Color.fromHex(cat.color)),
        k.anchor("center"),
        k.pos(0, yOffset),
      ]);

      categoryBox.add([
        k.text(cat.name.toUpperCase(), {
          font: "determination",
          size: 14,
        }),
        k.color(k.Color.fromHex("#FFFFFF")),
        k.anchor("center"),
        k.pos(0, -10),
      ]);

      categoryBox.add([
        k.text(cat.words.join(", "), {
          font: "determination",
          size: 12,
        }),
        k.color(k.Color.fromHex("#FFFFFF")),
        k.anchor("center"),
        k.pos(0, 10),
      ]);

      yOffset += buttonHeight + buttonGap;
    });

    // Show remaining word buttons in 4x4 grid
    const startY = yOffset;
    availableWords.forEach((word, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const xPos = (col - 1.5) * (buttonWidth + buttonGap);
      const yPos = startY + row * (buttonHeight + buttonGap);

      const button = gameContainer.add([
        k.rect(buttonWidth, buttonHeight),
        k.color(k.Color.fromHex("#333333")),
        k.outline(2, k.Color.fromHex("#666666")),
        k.anchor("center"),
        k.pos(xPos, yPos),
        k.area(),
        "word-button",
        { word: word },
      ]);

      button.add([
        k.text(word, {
          font: "determination",
          size: 14,
        }),
        k.color(k.Color.fromHex("#FFFFFF")),
        k.anchor("center"),
        k.pos(0, 0),
      ]);

      // Add click handler
      button.onClick(() => {
        if (selected.has(word)) {
          selected.delete(word);
        } else if (selected.size < 4) {
          selected.add(word);
        }
        updateButtonAppearance(button, word);
      });

      // Set initial appearance
      updateButtonAppearance(button, word);
      
      wordButtons.push(button);
    });
  };

  // Submit button
  const submitButton = gameContainer.add([
    k.rect(200, 50),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, 260),
    k.area(),
    "submit-button",
  ]);

  submitButton.add([
    k.text("SUBMIT", {
      font: "determination",
      size: 20,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  submitButton.onClick(() => {
    if (selected.size !== 4) return;

    // Check if selection matches any category
    const selectedArray = Array.from(selected);
    let foundMatch = false;

    for (const category of categories) {
      if (selectedArray.every(word => category.words.includes(word))) {
        // Correct!
        foundMatch = true;
        solvedCategories.push(category);
        availableWords = availableWords.filter(w => !category.words.includes(w));
        selected.clear();
        
        if (solvedCategories.length === 4) {
          // Won!
          instructionText.text = "Perfect! All groups found! +1 Puzzle Piece";
          instructionText.color = k.Color.fromHex("#000000");
          k.wait(2, () => {
            gameContainer.destroy();
            onComplete(true);
          });
          return;
        }
        
        createGrid();
        break;
      }
    }

    if (!foundMatch) {
      mistakes++;
      mistakesText.text = `Mistakes remaining: ${maxMistakes - mistakes}`;
      selected.clear();
      
      if (mistakes >= maxMistakes) {
        instructionText.text = "Out of tries! Better luck next time!";
        instructionText.color = k.Color.fromHex("#000000");
        k.wait(2, () => {
          gameContainer.destroy();
          onComplete(false);
        });
        return;
      }
      
      createGrid();
    }
  });

  createGrid();

  return gameContainer;
}