import { DIAGONAL_FACTOR } from "../constants";
import {
  isEmailModalVisibleAtom,
  isProjectModalVisibleAtom,
  isSocialModalVisibleAtom,
  isDialogueActiveAtom,
  store,
} from "../store";

export default function makePlayer(k, posVec2, speed) {
  const player = k.add([
    k.sprite("player", { anim: "walk-down" }),
    k.scale(8),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 5, 10) }),
    k.body(),
    k.pos(posVec2),
    "player",
    {
      direction: k.vec2(0, 0),
      directionName: "walk-down",
    },
  ]);

  let isMouseDown = false;
  const game = document.getElementById("game");
  game.addEventListener("focusout", () => {
    isMouseDown = false;
  });
  game.addEventListener("mousedown", () => {
    isMouseDown = true;
  });

  game.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  game.addEventListener("touchstart", () => {
    isMouseDown = true;
  });

  game.addEventListener("touchend", () => {
    isMouseDown = false;
  });

  player.onUpdate(() => {
    // Update z-index based on Y position for proper layering
    // Add offset to keep z-index positive
    player.z = player.pos.y + 10000;

    // Clamp camera to stay within background bounds (256x256 pixels scaled by 8 = 2048 in game world)
    const backgroundScale = 8;
    const backgroundSize = 256 * backgroundScale; // 2048
    const halfSize = backgroundSize / 2;
    const center = k.center();
    
    // Calculate camera viewport size based on zoom
    const camScale = k.camScale().x;
    const viewportWidth = k.width() / camScale;
    const viewportHeight = k.height() / camScale;
    const halfViewportWidth = viewportWidth / 2;
    const halfViewportHeight = viewportHeight / 2;
    
    // Calculate camera bounds
    const minX = center.x - halfSize + halfViewportWidth;
    const maxX = center.x + halfSize - halfViewportWidth;
    const minY = center.y - halfSize + halfViewportHeight;
    const maxY = center.y + halfSize - halfViewportHeight;
    
    // Clamp camera position to player position within bounds
    const targetCamX = Math.max(minX, Math.min(maxX, player.pos.x));
    const targetCamY = Math.max(minY, Math.min(maxY, player.pos.y));
    const targetCamPos = k.vec2(targetCamX, targetCamY);

    if (!k.camPos().eq(targetCamPos)) {
      k.tween(
        k.camPos(),
        targetCamPos,
        0.2,
        (newPos) => k.camPos(newPos),
        k.easings.linear
      );
    }

    if (
      store.get(isSocialModalVisibleAtom) ||
      store.get(isEmailModalVisibleAtom) ||
      store.get(isProjectModalVisibleAtom) ||
      store.get(isDialogueActiveAtom)
    ) {
      // Force player to idle state when dialogue or modals are active
      if (!player.getCurAnim().name.includes("idle")) {
        player.play(`${player.directionName}-idle`);
      }
      return;
    }

    player.direction = k.vec2(0, 0);
    const worldMousePos = k.toWorld(k.mousePos());

    if (isMouseDown) {
      player.direction = worldMousePos.sub(player.pos).unit();
    }

    if (
      player.direction.eq(k.vec2(0, 0)) &&
      !player.getCurAnim().name.includes("idle")
    ) {
      player.play(`${player.directionName}-idle`);
      return;
    }

    if (
      player.direction.x > 0 &&
      player.direction.y > -0.5 &&
      player.direction.y < 0.5
    ) {
      player.directionName = "walk-right";
    }

    if (
      player.direction.x < 0 &&
      player.direction.y > -0.5 &&
      player.direction.y < 0.5
    )
      player.directionName = "walk-left";

    if (player.direction.x < 0 && player.direction.y < -0.8)
      player.directionName = "walk-up";

    if (player.direction.x < 0 && player.direction.y > 0.8)
      player.directionName = "walk-down";

    if (
      player.direction.x < 0 &&
      player.direction.y > -0.8 &&
      player.direction.y < -0.5
    )
      player.directionName = "walk-left-up";

    if (
      player.direction.x < 0 &&
      player.direction.y > 0.5 &&
      player.direction.y < 0.8
    )
      player.directionName = "walk-left-down";

    if (
      player.direction.x > 0 &&
      player.direction.y < -0.5 &&
      player.direction.y > -0.8
    )
      player.directionName = "walk-right-up";

    if (
      player.direction.x > 0 &&
      player.direction.y > 0.5 &&
      player.direction.y < 0.8
    )
      player.directionName = "walk-right-down";

    if (player.getCurAnim().name !== player.directionName) {
      player.play(player.directionName);
    }

    if (player.direction.x && player.direction.y) {
      player.move(player.direction.scale(DIAGONAL_FACTOR * speed));
      return;
    }

    player.move(player.direction.scale(speed));
  });

  return player;
}
