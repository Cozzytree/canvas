import Rectangle from "./rect.js";
import {
   rectMap,
   circleMap,
   textMap,
   pencilMap,
   arrows,
   lineMap,
} from "./main.js";
import { Scale, config, scrollBar } from "./config.js";
import {
   canvas,
   pencil,
   context,
   lineArrow,
   switchBoth,
   switchDoc,
   switchCanvas,
   scrollContainer,
   docuemntDiv,
   canvasDiv,
   line,
   zoomText,
} from "./selectors";
import { Circle } from "./sphere.js";
import { Text } from "./text.js";
import { Arrows } from "./arrow.js";
import Line from "./line.js";
import { shape } from "./shape.js";

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
      const y =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPositionY;
      if (config.mode === "rect") {
         const temp = new Rectangle(x, y);
         rectMap.set(Math.random() * 10, temp);
         temp.draw();
         //  temp.drawRect(temp); // Draw the new rectangle
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
   const rectShape = document.createElement("div");
   rectShape.classList.add("rectShape");
   rectShape.style.width = "100px";
   rectShape.style.height = "100px";
   rectShape.style.position = "absolute";
   rectShape.style.borderRadius = "100%";

   document.addEventListener("mousemove", (e) => {
      if (config.mode !== "circle") return;
      rectShape.style.top = e.clientY + "px";
      rectShape.style.left = e.clientX + "px";
      document.body.append(rectShape);
   });

   canvas.addEventListener("click", (e) => {
      rectShape.remove();

      const { x, y } = shape.getTransformedMouseCoords(e);

      if (config.mode === "circle") {
         const temp = new Circle(x + 50, y + 50);
         circleMap.set(Math.random() * 10, temp);
         temp.drawSphere(temp); // Draw the new rectangle
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

lineArrow.addEventListener("click", () => {
   document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
   config.mode = "arrowLine";
   changeStyle();
   const line = document.createElement("div");
   line.classList.add("rectShape");
   line.style.width = "100px";
   line.style.height = "2px";
   line.style.position = "absolute";

   document.addEventListener("mousemove", (e) => {
      // console.log(config.mode);
      if (config.mode !== "arrowLine") return;
      line.style.top = e.clientY + "px";
      line.style.left = e.clientX + "px";
      document.body.append(line);
   });

   canvas.addEventListener("click", (e) => {
      line.remove();
      if (config.mode !== "arrowLine") return;
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPositionY;

      const newArr = new Arrows(mouseX, mouseY, mouseX + 100, mouseY);

      arrows.set(Math.random() * 10, newArr);
      config.mode = "free";
      changeStyle();
      newArr.isActive = true;
      newArr.drawArrow(newArr.x, newArr.y, newArr.tox, newArr.toy, 2, "white");
   });
});

// new line
line.addEventListener("click", () => {
   document.querySelectorAll(".rectShape").forEach((ele) => ele.remove());
   config.mode = "line";
   changeStyle();
   const line = document.createElement("div");
   line.classList.add("rectShape");
   line.style.width = "150px";
   line.style.height = "2px";
   line.style.position = "absolute";

   document.addEventListener("mousemove", (e) => {
      // console.log(config.mode);
      if (config.mode !== "line") return;
      line.style.top = e.clientY + "px";
      line.style.left = e.clientX + "px";
      document.body.append(line);
   });

   canvas.addEventListener("click", (e) => {
      if (config.mode !== "line") return;
      line.remove();
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPositionY;
      const newLine = new Line(mouseX, mouseY, mouseX + 140, mouseY);
      lineMap.set(Math.random() * 10, newLine);

      config.mode = "free";
      changeStyle();
      newLine.isActive = true;
      newLine.drawLine(newLine.x, newLine.y, newLine.tox, newLine.toy);
   });
});

canvas.addEventListener("dblclick", function (event) {
   // Handle double click event
   if (event.target.tagName === "TEXTAREA") return;

   const html = `<textarea class="w-[10ch] absolute px-[3px] text-[14px] outline-none bg-transparent focus:border-[1px] border-zinc-400/50 z-[999] h-fit shadow-sm" id="input"></textarea>`;
   document.body.insertAdjacentHTML("afterbegin", html);
   const input = document.getElementById("input");
   input.style.left = event.clientX + "px";
   input.style.top = event.clientY + "px";
   input.style.fontSize = "18px";
   input.focus();

   input.addEventListener("change", (e) => {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY =
         event.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPositionY;
      const content = e.target.value.split("\n");
      const newText = new Text(mouseX, mouseY, 15, content);
      textMap.set(Math.random() * 100, newText);
      console.log(newText);
      newText.draw();
      input.remove();
   });

   input.addEventListener("blur", (e) => {
      input.remove();
   });
});

window.addEventListener(
   "wheel",
   (e) => {
      // Get the bounding rectangle of the canvas
      const rect = canvas.getBoundingClientRect();

      // Calculate the mouse position relative to the canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (
         e.ctrlKey &&
         mouseX >= 0 &&
         mouseX <= canvas.width &&
         mouseY >= 0 &&
         mouseY <= canvas.height
      ) {
         e.preventDefault();
         if (e.deltaY > 0) {
            Scale.scale /= Scale.scalingFactor;
         } else {
            Scale.scale *= Scale.scalingFactor;
         }
         // Round the scale to one decimal place
         Scale.scale = Math.round(Scale.scale * 10) / 10;
         zoomText.textContent = `${parseInt(Scale.scale * 100)}%`;
         shape.draw();
      }
   },
   { passive: false }
);

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
   const elements = {
      pencil,
      rect: newRect,
      circle: newCircle,
      free: freeMode,
      arrowLine: lineArrow,
      line,
   };

   // Reset all backgrounds to transparent
   Object.values(elements).forEach(
      (el) => (el.style.background = "transparent")
   );

   // Set the selected mode's background

   if (config.mode in elements) {
      elements[config.mode].style.background = "#8080806b";
   }
}
export function changeDoc() {
   switch (config.docMode) {
      case "both":
         scrollContainer.classList.add("sm:grid");
         docuemntDiv.classList.remove("hidden");
         canvasDiv.classList.remove("hidden");
         switchBoth.classList.add("bg-zinc-400/30");
         switchCanvas.classList.remove("bg-zinc-400/30");
         switchDoc.classList.remove("bg-zinc-400/30");
         break;
      case "canvas":
         scrollContainer.classList.remove("sm:grid");
         docuemntDiv.classList.add("hidden");
         canvasDiv.classList.remove("hidden");
         switchCanvas.classList.add("bg-zinc-400/30");
         switchBoth.classList.remove("bg-zinc-400/30");
         switchDoc.classList.remove("bg-zinc-400/30");
         break;
      case "doc":
         scrollContainer.classList.remove("sm:grid");
         canvasDiv.classList.add("hidden");
         docuemntDiv.classList.remove("hidden");
         switchDoc.classList.add("bg-zinc-400/30");
         switchCanvas.classList.remove("bg-zinc-400/30");
         switchBoth.classList.remove("bg-zinc-400/30");
      default:
         break;
   }
}

switchBoth.addEventListener("click", () => {
   config.docMode = "both";
   changeDoc();
});

switchCanvas.addEventListener("click", () => {
   config.docMode = "canvas";
   changeDoc();
});

switchDoc.addEventListener("click", () => {
   config.docMode = "doc";
   console.log(config.docMode);
   changeDoc();
});

changeDoc();
changeStyle(config.mode);
