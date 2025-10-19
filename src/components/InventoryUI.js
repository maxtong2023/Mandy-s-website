import { inventoryAtom, puzzlePiecesAtom, store } from "../store";

export default function makeInventoryUI(k) {
  const uiContainer = k.add([
    k.pos(k.width() - 220, k.height() - 200), // Bottom right position
    k.fixed(),
    k.z(200000), // Highest z-index - always on top
    "inventory-ui",
  ]);

  // Background box
  uiContainer.add([
    k.rect(200, 180),
    k.color(k.Color.fromHex("#FFFFFF")), // White background
    k.outline(3, k.Color.fromHex("#000000")), // Black border
    k.pos(-10, -10),
  ]);

  // Title
  uiContainer.add([
    k.text("INVENTORY:", {
      font: "determination",
      size: 16,
    }),
    k.color(k.Color.fromHex("#000000")), // Black text
    k.pos(0, 0),
  ]);

  // Puzzle pieces display
  const puzzlePiecesDisplay = uiContainer.add([
    k.text("🧩 Puzzle Pieces: 0", {
      font: "determination",
      size: 14,
    }),
    k.color(k.Color.fromHex("#000000")), // Black text
    k.pos(0, 25),
  ]);

  // Items list
  const itemsList = uiContainer.add([
    k.text("", {
      font: "determination",
      size: 14,
    }),
    k.color(k.Color.fromHex("#000000")), // Black text
    k.pos(0, 50),
  ]);

  // Update function
  const updateInventory = () => {
    const items = store.get(inventoryAtom);
    const puzzlePieces = store.get(puzzlePiecesAtom);
    
    // Update puzzle pieces display
    puzzlePiecesDisplay.text = `🧩 Puzzle Pieces: ${puzzlePieces}`;
    
    // Update items list
    if (items.length === 0) {
      itemsList.text = "No items";
    } else {
      itemsList.text = items.join("\n");
    }
  };

  // Initial update
  updateInventory();

  // Listen for inventory changes
  k.onUpdate(() => {
    updateInventory();
  });

  return uiContainer;
}

