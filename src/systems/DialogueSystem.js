import makeDialogueBox from "../components/DialogueBox";
import { isDialogueActiveAtom, store } from "../store";

export default function createDialogueSystem(k) {
  let dialogueBox = null;
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

    const text = currentNpc.dialogue[currentDialogueIndex];
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
        // End of dialogue
        endDialogue();
      }
    }
  };

  const endDialogue = () => {
    if (dialogueBox) {
      dialogueBox.destroy();
      dialogueBox = null;
    }
    currentNpc = null;
    currentDialogueIndex = 0;
    isDialogueActive = false;
    canAdvance = false;
    store.set(isDialogueActiveAtom, false);
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

