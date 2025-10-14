import {
  isEmailModalVisibleAtom,
  isProjectModalVisibleAtom,
  isSocialModalVisibleAtom,
  store,
} from "../store";

export default function makeNpc(k, posVec2, name, idleDirection = "walk-down") {
  const npc = k.add([
    k.sprite("player", { anim: `${idleDirection}-idle` }),
    k.scale(8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 5, 10) }),
    k.body({ isStatic: true }), // NPCs don't move
    k.pos(posVec2),
    "npc",
    {
      npcName: name,
      idleDirection: idleDirection,
      interactionIndicator: null,
    },
  ]);

  // Play the idle animation on loop
  npc.play(`${idleDirection}-idle`);

  return npc;
}

