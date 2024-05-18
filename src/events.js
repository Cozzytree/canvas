const newRect = document.getElementById("newRect");
const newCircle = document.getElementById("newCircle");
import { canvas, rectMap, Rectangle, Circle , circleMap} from "./main";
import { config } from "./config";

// draw new rect
newRect.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "rect";
  const shape = document.createElement("div");
  shape.classList.add("rectShape");
  shape.style.width = "100px";
  shape.style.height = "100px";
  shape.style.position = "absolute";

  document.addEventListener("mousemove", (e) => {
    if (config.mode !== "rect") return;
    shape.style.top = e.clientY + "px";
    shape.style.left = e.clientX + "px";
    document.body.append(shape);
  });

  // Listen for click on the canvas to place the rectangle inside it
  canvas.addEventListener("click", (e) => {
    shape.remove();
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    if (config.mode === "rect") {
      const temp = new Rectangle(x, y);
      rectMap.set(Math.random() * 10, temp);
      temp.draw(); // Draw the new rectangle
      config.mode = "free";
    }
  });
});

// add new circle
newCircle.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "circle";
  const shape = document.createElement("div");
  shape.classList.add("rectShape");
  shape.style.width = "100px";
  shape.style.height = "100px";
  shape.style.position = "absolute";
  shape.style.borderRadius = "100%";

  document.addEventListener("mousemove", (e) => {
    if (config.mode !== "circle") return;
    shape.style.top = e.clientY + "px";
    shape.style.left = e.clientX + "px";
    document.body.append(shape);
  });

  canvas.addEventListener("click", (e) => {
    shape.remove();
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;
    if (config.mode === "circle") {
      const temp = new Circle(x + 50, y + 50);
      circleMap.set(Math.random() * 10, temp);
      temp.draw(); // Draw the new rectangle
      config.mode = "free";
    }
  });
});
