import kaplay from "kaplay";

export default function makeKaplayCtx() {
  return kaplay({
    global: false,
    width: 1920,
    height: 1080,
    pixelDensity: 1,
    touchToMouse: true,
    debug: false,
    debugKey: "f1",
    canvas: document.getElementById("game"),
    letterbox: true, // Add black bars to maintain aspect ratio
    background: [0, 0, 0], // Black background
  });
}
