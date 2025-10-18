import makeDialogueBox from "../components/DialogueBox";
import makeWordleGame from "../puzzles/WordleGame";
import makeConnectionsGame from "../puzzles/ConnectionsGame";
import makeMiniCrosswordGame from "../puzzles/MiniCrosswordGame";
import { isDialogueActiveAtom, puzzlePiecesAtom, completedPuzzlesAtom, isPuzzleActiveAtom, inventoryAtom, store } from "../store";

export default function createDialogueSystem(k) {
  let dialogueBox = null;
  let puzzleBox = null;
  let currentNpc = null;
  let currentDialogueIndex = 0;
  let isDialogueActive = false;
  let canAdvance = false;

  const startDialogue = (npc) => {
    if (isDialogueActive || !npc.dialogue || npc.dialogue.length === 0) return;

    currentNpc = npc;
    currentDialogueIndex = 0;
    isDialogueActive = true;
    canAdvance = false;
    store.set(isDialogueActiveAtom, true);

    // Create dialogue box if it doesn't exist
    if (!dialogueBox) {
      dialogueBox = makeDialogueBox(k, npc.npcName);
    }

    // Show first dialogue
    showCurrentDialogue();
  };

  const showCurrentDialogue = () => {
    if (!currentNpc || !dialogueBox) return;

    // Check if NPC has dynamic dialogue based on inventory
    let dialogueToUse = currentNpc.dialogue;
    if (currentNpc.npcName === "Andy") {
      const inventory = store.get(inventoryAtom);
      if (inventory.includes("Habibi Plate")) {
        dialogueToUse = [
          "Hello there, traveler!",
          "Welcome to this strange world.",
          "Oh! You have Habibi's plate! She must really trust you.",
          "Here, take this puzzle piece!"
        ];
      }
    } else if (currentNpc.npcName === "Jiamin") {
      const inventory = store.get(inventoryAtom);
      if (inventory.includes("Molly Tea")) {
        dialogueToUse = [
          "Hey! You look familiar.",
          "I've been waiting for someone like you.",
          "Molly's tea! You must have impressed her.",
          "Here's a puzzle piece for your journey!"
        ];
      }
    }

    const text = dialogueToUse[currentDialogueIndex];
    canAdvance = false;

    dialogueBox.setText(text, () => {
      // Called when typewriter animation finishes
      canAdvance = true;
    });
  };

  const advanceDialogue = () => {
    if (!isDialogueActive || !dialogueBox) return;

    // If still typing, skip to end
    if (dialogueBox.isTyping) {
      dialogueBox.skipToEnd();
      return;
    }

    // If can advance and not typing, go to next dialogue
    if (canAdvance) {
      currentDialogueIndex++;

      // Check if there's more dialogue
      if (currentDialogueIndex < currentNpc.dialogue.length) {
        showCurrentDialogue();
      } else {
        // End of dialogue - check if NPC has puzzle or gives puzzle piece
        const completedPuzzles = store.get(completedPuzzlesAtom);
        const npcId = currentNpc.npcName;
        
        if (currentNpc.puzzleData && !completedPuzzles.has(npcId)) {
          // Show puzzle - save NPC reference before ending dialogue
          const npcForPuzzle = currentNpc;
          endDialogue();
          showPuzzle(npcForPuzzle);
        } else if (currentNpc.givesPuzzlePiece && !completedPuzzles.has(npcId)) {
          // Check item requirements for specific NPCs
          const inventory = store.get(inventoryAtom);
          let canGivePiece = false;
          let itemToConsume = null;

          if (npcId === "Andy") {
            canGivePiece = inventory.includes("Habibi Plate");
            itemToConsume = "Habibi Plate";
          } else if (npcId === "Jiamin") {
            canGivePiece = inventory.includes("Molly Tea");
            itemToConsume = "Molly Tea";
          } else {
            // Other NPCs (Max) give pieces normally
            canGivePiece = true;
          }

          if (canGivePiece) {
            // Give puzzle piece
            const currentPieces = store.get(puzzlePiecesAtom);
            store.set(puzzlePiecesAtom, currentPieces + 1);
            
            // Mark as completed
            const newCompleted = new Set(completedPuzzles);
            newCompleted.add(npcId);
            store.set(completedPuzzlesAtom, newCompleted);

            // Consume the item if it's Andy or Jiamin
            if (itemToConsume) {
              const newInventory = inventory.filter(item => item !== itemToConsume);
              store.set(inventoryAtom, newInventory);
            }
          }
          
          endDialogue();
        } else {
          // Already completed or no reward
          endDialogue();
        }
      }
    }
  };

  const showPuzzle = (npc) => {
    if (puzzleBox) return;

    // Make sure dialogue state is cleared and puzzle state is set
    store.set(isDialogueActiveAtom, false);
    store.set(isPuzzleActiveAtom, true);

    // Create the appropriate puzzle game based on puzzle type
    const puzzleType = npc.puzzleData.type;
    
    if (puzzleType === "wordle") {
      puzzleBox = makeWordleGame(k, (won) => handlePuzzleComplete(won, npc));
    } else if (puzzleType === "connections") {
      puzzleBox = makeConnectionsGame(k, (won) => handlePuzzleComplete(won, npc));
    } else if (puzzleType === "crossword") {
      puzzleBox = makeMiniCrosswordGame(k, (won) => handlePuzzleComplete(won, npc));
    }
  };

  const handlePuzzleComplete = (isCorrect, npc) => {
    if (isCorrect && npc) {
      // Give puzzle piece
      const currentPieces = store.get(puzzlePiecesAtom);
      store.set(puzzlePiecesAtom, currentPieces + 1);
      
      // Mark puzzle as completed
      const completedPuzzles = store.get(completedPuzzlesAtom);
      const newCompleted = new Set(completedPuzzles);
      newCompleted.add(npc.npcName);
      store.set(completedPuzzlesAtom, newCompleted);
    }
    puzzleBox = null;
    store.set(isDialogueActiveAtom, false);
    store.set(isPuzzleActiveAtom, false);
  };

  const endDialogue = () => {
    if (dialogueBox) {
      dialogueBox.destroy();
      dialogueBox = null;
    }
    if (puzzleBox) {
      puzzleBox.destroy();
      puzzleBox = null;
    }
    currentNpc = null;
    currentDialogueIndex = 0;
    isDialogueActive = false;
    canAdvance = false;
    store.set(isDialogueActiveAtom, false);
    store.set(isPuzzleActiveAtom, false);
  };

  const isActive = () => isDialogueActive;

  const getCurrentNpc = () => currentNpc;

  return {
    startDialogue,
    advanceDialogue,
    endDialogue,
    isActive,
    getCurrentNpc,
  };
}

