// Birthday Letter - A special message that appears after collecting all puzzle pieces
export default function makeBirthdayLetter(k, onClose) {
  const boxWidth = 800;
  const boxHeight = 600;
  
  const letterContainer = k.add([
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor("center"),
    k.fixed(),
    k.z(300000), // Highest z-index - always on top
    "birthday-letter",
  ]);

  // Background
  letterContainer.add([
    k.rect(boxWidth, boxHeight),
    k.color(k.Color.fromHex("#FFF8DC")), // Cream/parchment color
    k.anchor("center"),
    k.pos(0, 0),
    k.opacity(0.98),
  ]);

  // Border
  letterContainer.add([
    k.rect(boxWidth, boxHeight),
    k.outline(6, k.Color.fromHex("#8B4513")), // Brown border
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Inner decorative border
  letterContainer.add([
    k.rect(boxWidth - 40, boxHeight - 40),
    k.outline(2, k.Color.fromHex("#DAA520")), // Gold inner border
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Title
  letterContainer.add([
    k.text("🎂 Happy 21st Birthday Mandy! 🎂", {
      font: "determination",
      size: 24,
    }),
    k.color(k.Color.fromHex("#8B0000")), // Dark red
    k.anchor("center"),
    k.pos(0, -boxHeight / 2 + 50),
  ]);

  // Letter content
  const letterText = `Dear Mandy,

Happy 21st Birthday! I love you so much and really hope that you enjoyed
the little game that I made for you. I appreciate you so much, and even though
I wasn't able to see you on Saturday, I hope that you enjoy your gifts and our time 
together on Sunday.

The past almost two years with you have been incredible and I can't wait 
to spend many more with you. You truly are a ball of sunshine and I look forward
to growing old with you and seeing how our lives change together.

I hope you enjoy your birthday, 21 is a big milestone. Know that I will always support
you, be proud of you, and be there for you.



I love you!

Happy Birthday, Mandy!

Max`;

  letterContainer.add([
    k.text(letterText, {
      font: "determination",
      size: 14,
      width: boxWidth - 120,
      lineSpacing: 6,
    }),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("center"),
    k.pos(0, 20),
  ]);

  // Close button
  const closeButton = letterContainer.add([
    k.rect(150, 40),
    k.color(k.Color.fromHex("#8B4513")),
    k.outline(2, k.Color.fromHex("#DAA520")),
    k.anchor("center"),
    k.pos(0, boxHeight / 2 - 50),
    k.area(),
    "close-button",
  ]);

  closeButton.add([
    k.text("Close (Z)", {
      font: "determination",
      size: 16,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  closeButton.onClick(() => {
    letterContainer.destroy();
    onClose();
  });

  // Also allow Z key to close
  const keyHandler = k.onKeyPress("z", () => {
    letterContainer.destroy();
    keyHandler.cancel();
    onClose();
  });

  return {
    destroy: () => {
      letterContainer.destroy();
      keyHandler.cancel();
    }
  };
}
