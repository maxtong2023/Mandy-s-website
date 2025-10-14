import { NPC_INTERACTION_DISTANCE } from "../constants";
import makeInteractionIndicator from "../components/InteractionIndicator";
import createDialogueSystem from "./DialogueSystem";

export default function initNpcInteractionSystem(k, player) {
  // Track which NPCs currently have indicators showing
  const activeIndicators = new Map();
  
  // Create dialogue system
  const dialogueSystem = createDialogueSystem(k);

  // Track nearby NPCs for interaction
  let nearbyNpcs = [];

  // Handle Z key press
  k.onKeyPress("z", () => {
    // If dialogue is active, advance it
    if (dialogueSystem.isActive()) {
      dialogueSystem.advanceDialogue();
      return;
    }

    // Otherwise, try to start dialogue with closest NPC
    if (nearbyNpcs.length > 0) {
      // Find the closest NPC
      let closestNpc = nearbyNpcs[0];
      let closestDistance = player.pos.dist(closestNpc.pos);

      for (const npc of nearbyNpcs) {
        const distance = player.pos.dist(npc.pos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNpc = npc;
        }
      }

      dialogueSystem.startDialogue(closestNpc);
    }
  });

  // Update function that runs every frame
  k.onUpdate(() => {
    // Get all NPCs in the scene
    const npcs = k.get("npc");
    nearbyNpcs = [];

    npcs.forEach((npc) => {
      // Calculate distance between player and NPC
      const distance = player.pos.dist(npc.pos);

      // Check if player is within interaction range
      if (distance <= NPC_INTERACTION_DISTANCE) {
        nearbyNpcs.push(npc);

        // Show indicator if not already showing and no dialogue active
        if (!activeIndicators.has(npc) && !dialogueSystem.isActive()) {
          const indicator = makeInteractionIndicator(k, npc);
          activeIndicators.set(npc, indicator);
        }
      } else {
        // Hide indicator if player moved away
        if (activeIndicators.has(npc)) {
          const indicator = activeIndicators.get(npc);
          indicator.destroy();
          activeIndicators.delete(npc);
        }

        // End dialogue if player moved away from the NPC they're talking to
        if (dialogueSystem.isActive() && dialogueSystem.getCurrentNpc() === npc) {
          dialogueSystem.endDialogue();
        }
      }
    });

    // Hide all indicators when dialogue is active
    if (dialogueSystem.isActive()) {
      activeIndicators.forEach((indicator) => indicator.destroy());
      activeIndicators.clear();
    }
  });

  // Cleanup function to destroy all indicators
  return {
    destroy: () => {
      activeIndicators.forEach((indicator) => indicator.destroy());
      activeIndicators.clear();
      dialogueSystem.endDialogue();
    },
  };
}

