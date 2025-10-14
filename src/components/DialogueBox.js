export default function makeDialogueBox(k) {
  const boxWidth = 700;
  const boxHeight = 150;
  const padding = 20;

  // Create the dialogue box container (fixed to screen)
  const dialogueBox = k.add([
    k.pos(k.width() / 2, k.height() - boxHeight / 2 - 40),
    k.anchor("center"),
    k.fixed(),
    k.z(100000), // Always on top - very high z-index
    "dialogue-box",
    {
      currentText: "",
      fullText: "",
      currentIndex: 0,
      isTyping: false,
      typewriterSpeed: 0.03, // seconds per character
      typewriterTimer: 0,
      onComplete: null,
    },
  ]);

  // Background rectangle (black)
  dialogueBox.add([
    k.rect(boxWidth, boxHeight),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 0),
    k.opacity(1),
  ]);

  // Border (white)
  dialogueBox.add([
    k.rect(boxWidth, boxHeight),
    k.outline(4, k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Text display (white)
  const textDisplay = dialogueBox.add([
    k.text("", {
      font: "determination",
      size: 24,
      width: boxWidth - padding * 2,
      lineSpacing: 8,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("topleft"),
    k.pos(-boxWidth / 2 + padding, -boxHeight / 2 + padding),
  ]);

  // Function to start typing animation
  dialogueBox.setText = (text, onComplete = null) => {
    dialogueBox.fullText = text;
    dialogueBox.currentText = "";
    dialogueBox.currentIndex = 0;
    dialogueBox.isTyping = true;
    dialogueBox.typewriterTimer = 0;
    dialogueBox.onComplete = onComplete;
    textDisplay.text = "";
  };

  // Function to skip to end of current text
  dialogueBox.skipToEnd = () => {
    if (dialogueBox.isTyping) {
      dialogueBox.currentText = dialogueBox.fullText;
      dialogueBox.currentIndex = dialogueBox.fullText.length;
      dialogueBox.isTyping = false;
      textDisplay.text = dialogueBox.fullText;
      if (dialogueBox.onComplete) {
        dialogueBox.onComplete();
      }
    }
  };

  // Update function for typewriter effect
  dialogueBox.onUpdate(() => {
    // Update position if screen size changes
    dialogueBox.pos = k.vec2(k.width() / 2, k.height() - boxHeight / 2 - 40);

    if (dialogueBox.isTyping) {
      dialogueBox.typewriterTimer += k.dt();

      if (dialogueBox.typewriterTimer >= dialogueBox.typewriterSpeed) {
        dialogueBox.typewriterTimer = 0;

        if (dialogueBox.currentIndex < dialogueBox.fullText.length) {
          dialogueBox.currentIndex++;
          dialogueBox.currentText = dialogueBox.fullText.substring(
            0,
            dialogueBox.currentIndex
          );
          textDisplay.text = dialogueBox.currentText;
        } else {
          dialogueBox.isTyping = false;
          if (dialogueBox.onComplete) {
            dialogueBox.onComplete();
          }
        }
      }
    }
  });

  return dialogueBox;
}

