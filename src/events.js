import {
  rectMap,
  Rectangle,
  Circle,
  circleMap,
  textMap,
  pencilMap,
  Text,
} from "./main";
import { config } from "./config";
import { canvas, pencil, context } from "./selectors";
const newRect = document.getElementById("newRect");
const newCircle = document.getElementById("newCircle");
const freeMode = document.getElementById("freeMode");

// draw new rect
newRect.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "rect";
  changeStyle();
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
      changeStyle();
    }
  });
});

// add new circle
newCircle.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "circle";
  changeStyle();
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
      changeStyle();
    }
  });
});

// free mode
freeMode.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "free";
  changeStyle();
});

canvas.addEventListener("dblclick", function (event) {
  // Handle double click event
  if (event.target.tagName === "INPUT") return;

  const html = `<input type="text" class="w-[10ch] absolute px-[3px] text-[14px] outline-none bg-transparent focus:border-[1px] border-zinc-400/50 z-[999] shadow-sm" id="input"/>
  `;
  document.body.insertAdjacentHTML("afterbegin", html);
  const input = document.getElementById("input");
  input.style.left = event.clientX + "px";
  input.style.top = event.clientY + "px";
  input.focus();

  input.addEventListener("change", (e) => {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    const newText = new Text(mouseX, mouseY, 15, e.target.value);
    textMap.set(Math.random() * 100, newText);
    newText.draw();
    input.remove();
  });

  input.addEventListener("blur", (e) => {
    input.remove();
  });
});

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentDrawingId = 0; // ID for the current drawing

pencil.addEventListener("click", () => {
  config.mode = "pencil";
  changeStyle();
  rectMap.forEach((rect) => {
    rect.isActive = false;
    rect.draw();
  });
  circleMap.forEach((arc) => {
    arc.isActive = false;
    arc.draw();
  });
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
});

function startDrawing(e) {
  if (config.mode !== "pencil") return;
  currentDrawingId++;
  isDrawing = true;
  [lastX, lastY] = [
    e.clientX - canvas.getBoundingClientRect().left,
    e.clientY - canvas.getBoundingClientRect().top,
  ];
}

function draw(e) {
  if (!isDrawing || config.mode !== "pencil") return;
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  context.beginPath();
  context.moveTo(lastX, lastY);
  context.lineTo(x, y);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 1.6;
  context.strokeStyle = "#dcdcdc";
  context.stroke();

  [lastX, lastY] = [x, y];

  // Store drawing data in the map
  if (!pencilMap.has(currentDrawingId)) {
    pencilMap.set(currentDrawingId, []);
  }
  pencilMap.get(currentDrawingId).push({ x, y });
}

function stopDrawing() {
  isDrawing = false;
}

export function changeStyle() {
  if (config.mode === "pencil") {
    pencil.style.background = "#8080806b";
    newRect.style.background = "transparent";
    newCircle.style.background = "transparent";
    freeMode.style.background = "transparent";
  } else if (config.mode === "rect") {
    newRect.style.background = "#8080806b";
    pencil.style.background = "transparent";
    newCircle.style.background = "transparent";
    freeMode.style.background = "transparent";
  } else if (config.mode === "free") {
    freeMode.style.background = "#8080806b";
    newRect.style.background = "transparent";
    pencil.style.background = "transparent";
    newCircle.style.background = "transparent";
  } else if (config.mode === "circle") {
    freeMode.style.background = "transparent";
    newRect.style.background = "transparent";
    pencil.style.background = "transparent";
    newCircle.style.background = "#8080806b";
  }
}

changeStyle(config.mode);
