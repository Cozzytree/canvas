const newRect = document.getElementById("newRect");
const newCircle = document.getElementById("newCircle");
const pencil = document.getElementById("pencil");
const freeMode = document.getElementById("freeMode");
import { canvas, rectMap, Rectangle, Circle, circleMap, text } from "./main";
import { config } from "./config";

// draw new rect
newRect.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "rect";
  changeStyle(config.mode);
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
  changeStyle(config.mode);
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

// free mode
freeMode.addEventListener("click", (e) => {
  document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
  config.mode = "free";
  changeStyle(config.mode);
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
    const mouseY = event.clientY - canvas.getBoundingClientRect().top + 5;
    text.set(Math.random() * 100, {
      x: mouseX,
      y: mouseY,
      content: e.target.value,
    });
    input.remove();
  });
});

function changeStyle(mode) {
  if (mode === "pencil") {
    pencil.style.background = "#8080806b";
    newRect.style.background = "transparent";
    newCircle.style.background = "transparent";
    freeMode.style.background = "transparent";
  } else if (mode === "rect") {
    newRect.style.background = "#8080806b";
    pencil.style.background = "transparent";
    newCircle.style.background = "transparent";
    freeMode.style.background = "transparent";
  } else if (mode === "free") {
    freeMode.style.background = "#8080806b";
    newRect.style.background = "transparent";
    pencil.style.background = "transparent";
    newCircle.style.background = "transparent";
  } else if (mode === "circle") {
    freeMode.style.background = "transparent";
    newRect.style.background = "transparent";
    pencil.style.background = "transparent";
    newCircle.style.background = "#8080806b";
  }
}

changeStyle(config.mode);
