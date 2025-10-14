import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeNpc from "./entities/Npc";
import { PALETTE } from "./constants";
import { cameraZoomValueAtom, store } from "./store";
import initNpcInteractionSystem from "./systems/NpcInteractionSystem";

export default async function initGame() {

  const k = makeKaplayCtx();
  k.loadSprite("player", "./sprites/player.png", {
    sliceX: 4,
    sliceY: 8,
    anims: {
      "walk-down-idle": 0,
      "walk-down": { from: 0, to: 3, loop: true },
      "walk-left-down": { from: 4, to: 7, loop: true },
      "walk-left-down-idle": 4,
      "walk-left": { from: 8, to: 11, loop: true },
      "walk-left-idle": 8,
      "walk-left-up": { from: 12, to: 15, loop: true },
      "walk-left-up-idle": 12,
      "walk-up": { from: 16, to: 19, loop: true },
      "walk-up-idle": 16,
      "walk-right-up": { from: 20, to: 23, loop: true },
      "walk-right-up-idle": 20,
      "walk-right": { from: 24, to: 27, loop: true },
      "walk-right-idle": 24,
      "walk-right-down": { from: 28, to: 31, loop: true },
      "walk-right-down-idle": 28,
    },
  });
  k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");
  k.loadShaderURL("tiledPattern", null, "./shaders/tiledPattern.frag");

  const setInitCamZoomValue = () => {
    if (k.width() < 1000) {
      k.camScale(k.vec2(0.5));
      store.set(cameraZoomValueAtom, 0.5);
      return;
    }
    k.camScale(k.vec2(0.8));
    store.set(cameraZoomValueAtom, 0.8);
  };
  setInitCamZoomValue();

  k.onUpdate(() => {
    const cameraZoomValue = store.get(cameraZoomValueAtom);
    if (cameraZoomValue !== k.camScale().x) k.camScale(k.vec2(cameraZoomValue));
  });

  const tiledBackground = k.add([
    k.uvquad(k.width(), k.height()),
    k.shader("tiledPattern", () => ({
      u_time: k.time() / 20,
      u_color1: k.Color.fromHex(PALETTE.color3),
      u_color2: k.Color.fromHex(PALETTE.color2),
      u_speed: k.vec2(1, -1),
      u_aspect: k.width() / k.height(),
      u_size: 5,
    })),
    k.pos(0, 0),
    k.fixed(),
  ]);

  tiledBackground.onUpdate(() => {
    tiledBackground.width = k.width();
    tiledBackground.height = k.height();
    tiledBackground.uniform.u_aspect = k.width() / k.height();
  });

  const player = makePlayer(k, k.vec2(k.center()), 700);

  // Create NPCs around the center with different idle directions
  makeNpc(k, k.vec2(k.center().x + 300, k.center().y), "NPC 1", "walk-left");
  makeNpc(k, k.vec2(k.center().x - 300, k.center().y), "NPC 2", "walk-right");
  makeNpc(k, k.vec2(k.center().x, k.center().y - 300), "NPC 3", "walk-down");
  makeNpc(k, k.vec2(k.center().x, k.center().y + 300), "NPC 4", "walk-up");
  makeNpc(k, k.vec2(k.center().x + 200, k.center().y - 200), "NPC 5", "walk-left-down");

  // Initialize the NPC interaction system
  initNpcInteractionSystem(k, player);
}
