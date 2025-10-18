import makeClawMachineGame from "../puzzles/ClawMachineGame";
import makeCupFillingGame from "../puzzles/CupFillingGame";
import { isPuzzleActiveAtom, inventoryAtom, completedMinigamesAtom, store } from "../store";

export default function initObjectInteractionSystem(k, player) {
  let currentObject = null;
  let activeMinigame = null;

  // Check for nearby interactive objects
  k.onUpdate(() => {
    if (store.get(isPuzzleActiveAtom)) return;

    const nearbyObjects = k.get("interactive-object").filter((obj) => {
      const distance = player.pos.dist(obj.pos);
      return distance < 100;
    });

    currentObject = nearbyObjects.length > 0 ? nearbyObjects[0] : null;
  });

  // Interact with object on Z key
  k.onKeyPress("z", () => {
    if (!currentObject || activeMinigame) return;
    if (store.get(isPuzzleActiveAtom)) return;

    const objectName = currentObject.objectName;
    const completedGames = store.get(completedMinigamesAtom);

    // Check if already completed
    if (completedGames.has(objectName)) {
      // Already completed this minigame
      return;
    }

    // Start the appropriate minigame
    store.set(isPuzzleActiveAtom, true);

    if (objectName === "Habibi") {
      activeMinigame = makeClawMachineGame(k, (won, itemName) => handleMinigameComplete(won, itemName, objectName));
    } else if (objectName === "Molly") {
      activeMinigame = makeCupFillingGame(k, (won, itemName) => handleMinigameComplete(won, itemName, objectName));
    }
  });

  const handleMinigameComplete = (won, itemName, objectName) => {
    if (won && itemName) {
      // Add item to inventory
      const currentInventory = store.get(inventoryAtom);
      store.set(inventoryAtom, [...currentInventory, itemName]);

      // Mark minigame as completed
      const completed = store.get(completedMinigamesAtom);
      const newCompleted = new Set(completed);
      newCompleted.add(objectName);
      store.set(completedMinigamesAtom, newCompleted);
    }

    // Clean up
    activeMinigame = null;
    store.set(isPuzzleActiveAtom, false);
  };

  return {
    getCurrentObject: () => currentObject,
  };
}

