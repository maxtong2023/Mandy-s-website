import { PALETTE } from "../constants";

export default function makeInteractionIndicator(k, parentNpc) {
  const indicator = parentNpc.add([
    k.circle(12),
    k.color(k.Color.fromHex(PALETTE.color2)),
    k.anchor("center"),
    k.pos(0, -50), // Position it directly above the NPC, much closer
    k.opacity(0.9),
    k.z(1000), // Ensure it renders on top
    "interaction-indicator",
  ]);

  // Add the "Z" text inside the circle
  indicator.add([
    k.text("Z", {
      font: "ibm-bold",
      size: 14,
    }),
    k.color(k.Color.fromHex(PALETTE.color1)),
    k.anchor("center"),
    k.pos(0, 0),
  ]);

  // Add a very subtle pulse animation
  let pulseDirection = 1;
  let pulseScale = 1;
  indicator.onUpdate(() => {
    pulseScale += pulseDirection * 0.15 * k.dt();
    
    if (pulseScale > 1.03) {
      pulseScale = 1.03;
      pulseDirection = -1;
    } else if (pulseScale < 0.97) {
      pulseScale = 0.97;
      pulseDirection = 1;
    }
    
    indicator.scale = k.vec2(pulseScale);
  });

  return indicator;
}

