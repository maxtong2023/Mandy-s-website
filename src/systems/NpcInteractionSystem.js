import { NPC_INTERACTION_DISTANCE } from "../constants";
import makeInteractionIndicator from "../components/InteractionIndicator";

export default function initNpcInteractionSystem(k, player) {
  // Track which NPCs currently have indicators showing
  const activeIndicators = new Map();

  // Update function that runs every frame
  k.onUpdate(() => {
    // Get all NPCs in the scene
    const npcs = k.get("npc");

    npcs.forEach((npc) => {
      // Calculate distance between player and NPC
      const distance = player.pos.dist(npc.pos);

      // Check if player is within interaction range
      if (distance <= NPC_INTERACTION_DISTANCE) {
        // Show indicator if not already showing
        if (!activeIndicators.has(npc)) {
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
      }
    });
  });

  // Cleanup function to destroy all indicators
  return {
    destroy: () => {
      activeIndicators.forEach((indicator) => indicator.destroy());
      activeIndicators.clear();
    },
  };
}

