// Interactive objects like Habibi and Molly that trigger minigames
export default function makeInteractiveObject(k, posVec2, name, spriteName, scale = 8) {
  const obj = k.add([
    k.sprite(spriteName),
    k.scale(scale),
    k.anchor("center"),
    k.area({ shape: new k.Rect(k.vec2(0), 8, 8) }),
    k.body({ isStatic: true }),
    k.pos(posVec2),
    "interactive-object",
    {
      objectName: name,
      spriteName: spriteName,
    },
  ]);

  // Update z-index based on Y position for proper layering
  obj.onUpdate(() => {
    obj.z = obj.pos.y + 10000;
  });

  return obj;
}

