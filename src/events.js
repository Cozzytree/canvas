import Rectangle from "./rect.js";
import { rectMap, circleMap, textMap, pencilMap, arrows } from "./main.js";
import { config, scrollBar } from "./config.js";
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
} from "./selectors";
import { Circle } from "./sphere.js";
import { Text } from "./text.js";
import { Arrows } from "./arrow.js";

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
         scrollBar.scrollPosition;
      if (config.mode === "rect") {
         const temp = new Rectangle(x, y);
         rectMap.set(Math.random() * 10, temp);
         temp.drawRect(temp); // Draw the new rectangle
         config.mode = "free";
         changeStyle();
         localStorage.setItem("rectMap", rectMap);
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
      const y =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPosition;
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
         scrollBar.scrollPosition;

      const newArr = new Arrows(mouseX, mouseY, mouseX + 100, mouseY);

      arrows.set(Math.random() * 10, newArr);
      config.mode = "free";
      changeStyle();
      newArr.isActive = true;
      newArr.drawArrow(newArr.x, newArr.y, newArr.tox, newArr.toy, 2, "white");
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
         scrollBar.scrollPosition;
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
   switch (config.mode) {
      case "pencil":
         pencil.style.background = "#8080806b";
         newRect.style.background = "transparent";
         newCircle.style.background = "transparent";
         freeMode.style.background = "transparent";
         lineArrow.style.background = "transparent";
         break;
      case "rect":
         newRect.style.background = "#8080806b";
         pencil.style.background = "transparent";
         newCircle.style.background = "transparent";
         freeMode.style.background = "transparent";
         lineArrow.style.background = "transparent";
         break;
      case "free":
         freeMode.style.background = "#8080806b";
         newRect.style.background = "transparent";
         pencil.style.background = "transparent";
         newCircle.style.background = "transparent";
         lineArrow.style.background = "transparent";
         break;
      case "circle":
         newCircle.style.background = "#8080806b";
         freeMode.style.background = "transparent";
         newRect.style.background = "transparent";
         pencil.style.background = "transparent";
         lineArrow.style.background = "transparent";
         break;
      case "arrowLine":
         lineArrow.style.background = "#8080806b";
         freeMode.style.background = "transparent";
         newRect.style.background = "transparent";
         pencil.style.background = "transparent";
         newCircle.style.background = "transparent";
         break;
      default:
         break;
   }
}

export function changeDoc() {
   switch (config.docMode) {
      case "both":
         scrollContainer.classList.add("grid");
         docuemntDiv.classList.remove("hidden");
         canvasDiv.classList.remove("hidden");
         switchBoth.classList.add("bg-zinc-400/30");
         switchCanvas.classList.remove("bg-zinc-400/30");
         switchDoc.classList.remove("bg-zinc-400/30");
         break;
      case "canvas":
         scrollContainer.classList.remove("grid");
         docuemntDiv.classList.add("hidden");
         canvasDiv.classList.remove("hidden");
         switchCanvas.classList.add("bg-zinc-400/30");
         switchBoth.classList.remove("bg-zinc-400/30");
         switchDoc.classList.remove("bg-zinc-400/30");
         break;
      case "doc":
         scrollContainer.classList.remove("grid");
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
