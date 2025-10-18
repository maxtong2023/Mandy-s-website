import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeNpc from "./entities/Npc";
import makeInteractiveObject from "./entities/InteractiveObject";
import { PALETTE } from "./constants";
import { cameraZoomValueAtom, store } from "./store";
import initNpcInteractionSystem from "./systems/NpcInteractionSystem";
import initObjectInteractionSystem from "./systems/ObjectInteractionSystem";
import makePuzzlePieceUI from "./components/PuzzlePieceUI";
import makeInventoryUI from "./components/InventoryUI";

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
  k.loadFont("determination", "./fonts/Determination.ttf");
  k.loadSprite("background", "./backgrounds/background.png");
  
  // Load character sprites (6 characters from 4x8 grid, first 6 sprites)
  k.loadSprite("sprites", "./sprites/sprites.png", {
    sliceX: 4,
    sliceY: 8,
  });

  // Load interactive object sprites
  k.loadSprite("habibi", "./sprites/habibi.png");
  k.loadSprite("molly", "./sprites/molly.png");

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

  // Add the background image (256x256 pixels, scaled up by 8 like player sprites)
  const backgroundScale = 8;
  const backgroundSize = 256 * backgroundScale; // 2048 in game world
  const background = k.add([
    k.sprite("background"),
    k.scale(backgroundScale),
    k.pos(k.center()),
    k.anchor("center"),
    k.z(-1000), // Behind everything
    "background",
  ]);

  // Add invisible walls around the background to contain player
  const wallThickness = 10;
  const halfSize = backgroundSize / 2;

  // Top wall
  k.add([
    k.rect(backgroundSize, wallThickness),
    k.pos(k.center().x, k.center().y - halfSize),
    k.anchor("center"),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    "wall",
  ]);

  // Bottom wall
  k.add([
    k.rect(backgroundSize, wallThickness),
    k.pos(k.center().x, k.center().y + halfSize),
    k.anchor("center"),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    "wall",
  ]);

  // Left wall
  k.add([
    k.rect(wallThickness, backgroundSize),
    k.pos(k.center().x - halfSize, k.center().y),
    k.anchor("center"),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    "wall",
  ]);

  // Right wall
  k.add([
    k.rect(wallThickness, backgroundSize),
    k.pos(k.center().x + halfSize, k.center().y),
    k.anchor("center"),
    k.area(),
    k.body({ isStatic: true }),
    k.opacity(0),
    "wall",
  ]);

  const player = makePlayer(k, k.vec2(k.center()), 700);

  // Create NPCs around the center with different idle directions and dialogues
  // Sprite indices: 0=Andy, 1=Max, 2=Jiamin, 3=Lydia, 4=Cindy, 5=Bryan
  
  // NPCs that give puzzle pieces directly (Andy, Max, Jiamin)
  makeNpc(
    k,
    k.vec2(k.center().x + 300, k.center().y),
    "Andy",
    "walk-left",
    [
      "Hello there, traveler!",
      "Welcome to this strange world.",
      "I'd love to help, but I need proof you've met Habibi first.",
    ],
    0, // Andy sprite
    null, // No puzzle
    true // Gives puzzle piece
  );

  makeNpc(
    k,
    k.vec2(k.center().x - 300, k.center().y),
    "Max",
    "walk-right",
    [
      "Greetings!",
      "I found this puzzle piece earlier.",
      "You can have it!",
    ],
    1, // Max sprite
    null, // No puzzle
    true // Gives puzzle piece
  );

  makeNpc(
    k,
    k.vec2(k.center().x, k.center().y - 300),
    "Jiamin",
    "walk-down",
    [
      "Hey! You look familiar.",
      "I've been waiting for someone like you.",
      "I can't give you anything until you've proven yourself to Molly.",
    ],
    2, // Jiamin sprite
    null, // No puzzle
    true // Gives puzzle piece
  );

  // NPCs with NYTimes-style puzzle games (Lydia, Cindy, Bryan)
  makeNpc(
    k,
    k.vec2(k.center().x, k.center().y + 300),
    "Lydia",
    "walk-up",
    [
      "I love word games!",
      "Want to play Wordle?",
      "Guess the 5-letter word to earn a puzzle piece!",
    ],
    3, // Lydia sprite
    {
      type: "wordle",
    },
    false
  );

  makeNpc(
    k,
    k.vec2(k.center().x + 200, k.center().y - 200),
    "Cindy",
    "walk-left-down",
    [
      "I'm obsessed with Connections!",
      "Can you group these 16 words into 4 categories?",
      "Each category has 4 words. Good luck!",
    ],
    4, // Cindy sprite
    {
      type: "connections",
    },
    false
  );

  makeNpc(
    k,
    k.vec2(k.center().x - 200, k.center().y + 200),
    "Bryan",
    "walk-right-up",
    [
      "Hey there!",
      "I do the Mini Crossword every morning!",
      "Think you can solve mine?",
    ],
    5, // Bryan sprite
    {
      type: "crossword",
    },
    false
  );

  // Interactive objects (Habibi and Molly)
  // Use existing backgroundSize and halfSize from walls section above
  // Habibi in top-left corner
  makeInteractiveObject(
    k,
    k.vec2(k.center().x - halfSize + 100, k.center().y - halfSize + 100),
    "Habibi",
    "habibi",
    8 // Same scale as player
  );

  // Molly in bottom-right corner
  makeInteractiveObject(
    k,
    k.vec2(k.center().x + halfSize - 100, k.center().y + halfSize - 100),
    "Molly",
    "molly",
    8 // Same scale as player
  );

  // Initialize interaction systems
  initNpcInteractionSystem(k, player);
  initObjectInteractionSystem(k, player);

  // Add UI
  makePuzzlePieceUI(k);
  makeInventoryUI(k);
}
