import { inventoryAtom, store } from "../store";

export default function makeInventoryUI(k) {
  const uiContainer = k.add([
    k.pos(20, 100),
    k.fixed(),
    k.z(10000),
    "inventory-ui",
  ]);

  // Title
  uiContainer.add([
    k.text("INVENTORY:", {
      font: "determination",
      size: 16,
    }),
    k.color(k.Color.fromHex("#FFFFFF")),
    k.pos(0, 0),
  ]);

  // Items list
  const itemsList = uiContainer.add([
    k.text("", {
      font: "determination",
      size: 14,
    }),
    k.color(k.Color.fromHex("#aaea6c")),
    k.pos(0, 25),
  ]);

  // Update function
  const updateInventory = () => {
    const items = store.get(inventoryAtom);
    if (items.length === 0) {
      itemsList.text = "Empty";
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

