import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeNpc from "./entities/Npc";
import makeInteractiveObject from "./entities/InteractiveObject";
import { PALETTE } from "./constants";
import { store } from "./store";
import initNpcInteractionSystem from "./systems/NpcInteractionSystem";
import initObjectInteractionSystem from "./systems/ObjectInteractionSystem";
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

  // Set fixed camera scale
  k.camScale(k.vec2(0.8));

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
    k.vec2(k.center().x + 600, k.center().y +450),
    "Andy",
    "walk-left",
    [
      "Man I sure do love freshmen!",
      "I enjoy blowing up the toilet, but I need Habibi In in order to do that.",
      "I'll give you a puzzle piece if you bring me a Habibi plate, extra shwarma and extra white sauce.",
    ],
    0, // Andy sprite
    null, // No puzzle
    true // Gives puzzle piece
  );

  makeNpc(
    k,
    k.vec2(k.center().x - 400, k.center().y - 500),
    "Max",
    "walk-right",
    [
      "Hi Mandy, Happy Birthday!",
      "Collect all the puzzle pieces and come back to me.",
      "I'll give you a reward when you're finished.",
    ],
    1, // Max sprite
    null, // No puzzle
    false // Does NOT give puzzle piece through normal flow - only through birthday letter
  );

  makeNpc(
    k,
    k.vec2(k.center().x + 600, k.center().y - 500),
    "Jiamin",
    "walk-down",
    [
      "Ugh.",
      "I need Molly Tea, I haven't had any in 15 seconds..",
      "I'm about to go into withdrawal. Bring me some Molly Tea and I'll give you a puzzle piece.",
    ],
    2, // Jiamin sprite
    null, // No puzzle
    true // Gives puzzle piece
  );

  // NPCs with NYTimes-style puzzle games (Lydia, Cindy, Bryan)
  makeNpc(
    k,
    k.vec2(k.center().x- 600, k.center().y + 500),
    "Lydia",
    "walk-up",
    [
      "Happy Bday Mandy.",
      "Max told me how much you like Wordle. Can you solve this one?",
      "I'll give you a puzzle piece if you solve it.",
    ],
    3, // Lydia sprite
    {
      type: "wordle",
    },
    false
  );

  makeNpc(
    k,
    k.vec2(k.center().x + -800, k.center().y +600),
    "Cindy",
    "walk-left-down",
    [
      "I could be playing Genshin Impact right now...",
      "Solve this Connections puzzle quickly and I'll give you a puzzle piece.",
      "Hurry...",
    ],
    4, // Cindy sprite
    {
      type: "connections",
    },
    false
  );

  makeNpc(
    k,
    k.vec2(k.center().x+ 800, k.center().y + 350),
    "Bryan",
    "walk-right-up",
    [
      "AHH AHHHH!",
      "I'M COOKED! I'M COOKED! I HAVE 10 LAB REPORTS DUE!!!",
      "HELP ME FINISH THIS CROSSWORD SO I CAN GO TO LAB, I'M SO COOKED!!!",
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
    k.vec2(k.center().x - halfSize + 250, k.center().y - halfSize + 250),
    "Habibi",
    "habibi",
    8 // Same scale as player
  );

  // Molly in bottom-right corner
  makeInteractiveObject(
    k,
    k.vec2(k.center().x + halfSize -250, k.center().y + halfSize- 250),
    "Molly",
    "molly",
    8 // Same scale as player
  );

  // Initialize interaction systems
  initNpcInteractionSystem(k, player);
  initObjectInteractionSystem(k, player);

  // Add UI
  makeInventoryUI(k);
}
