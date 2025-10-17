import {
  isEmailModalVisibleAtom,
  isProjectModalVisibleAtom,
  isSocialModalVisibleAtom,
  store,
} from "../store";

export default function makeNpc(k, posVec2, name, idleDirection = "walk-down", dialogue = [], spriteIndex = 0) {
  const npc = k.add([
    k.sprite("sprites", { frame: spriteIndex }),
    k.scale(8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 5, 10) }),
    k.body({ isStatic: true }), // NPCs don't move
    k.pos(posVec2),
    k.z(posVec2.y + 10000), // Set initial z-index based on Y position with offset
    "npc",
    {
      npcName: name,
      idleDirection: idleDirection,
      interactionIndicator: null,
      dialogue: dialogue, // Array of dialogue sentences
    },
  ]);

  // Update z-index based on Y position for proper layering
  // Add offset to keep z-index positive
  npc.onUpdate(() => {
    npc.z = npc.pos.y + 10000;
  });

  return npc;
}

