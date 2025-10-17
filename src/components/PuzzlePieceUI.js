import { puzzlePiecesAtom, store } from "../store";

export default function makePuzzlePieceUI(k) {
  // Create container for puzzle piece display
  const uiContainer = k.add([
    k.pos(40, 40),
    k.fixed(),
    k.z(50000), // Above most things but below modals
    "puzzle-ui",
  ]);

  // Background box
  uiContainer.add([
    k.rect(180, 60),
    k.color(k.Color.fromHex("#000000")),
    k.anchor("topleft"),
    k.pos(0, 0),
    k.opacity(0.8),
  ]);

  // Border
  uiContainer.add([
    k.rect(180, 60),
    k.outline(3, k.Color.fromHex("#aaea6c")),
    k.anchor("topleft"),
    k.pos(0, 0),
  ]);

  // Puzzle piece icon (just text for now)
  uiContainer.add([
    k.text("🧩", {
      size: 32,
    }),
    k.anchor("left"),
    k.pos(15, 30),
  ]);

  // Puzzle piece counter text
  const counterText = uiContainer.add([
    k.text("0/6", {
      font: "determination",
      size: 24,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.anchor("left"),
    k.pos(60, 30),
  ]);

  // Update counter when puzzle pieces change
  uiContainer.onUpdate(() => {
    const pieces = store.get(puzzlePiecesAtom);
    counterText.text = `${pieces}/6`;
    
    // Change color when all pieces collected
    if (pieces >= 6) {
      counterText.color = k.Color.fromHex("#aaea6c");
    }
  });

  return uiContainer;
}

