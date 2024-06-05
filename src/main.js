import { changeStyle } from "./events.js";
import { shape } from "./shape.js";
import { config, scrollBar } from "./config.js";
import { canvas, scrollContainer, scrollThumb } from "./selectors.js";

const circleMap = new Map();
const rectMap = new Map();
const pencilMap = new Map();
const textMap = new Map();
const arrows = new Map();
const lineMap = new Map();

canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

const visibleHeight = scrollContainer.clientHeight;
const contentHeight = 1800; // Simulate a taller content
canvas.height = contentHeight;

const scrollThumbHeight = Math.max(
   (visibleHeight / contentHeight) * visibleHeight,
   20
);
scrollThumb.style.height = `${scrollThumbHeight}px`;

function onScroll(y) {
   const maxScrollTop = visibleHeight - scrollThumbHeight;
   const thumbTop = Math.min(Math.max(y, 0), maxScrollTop);
   scrollThumb.style.top = `${thumbTop}px`;
   scrollBar.scrollPosition =
      (thumbTop / maxScrollTop) * (contentHeight - visibleHeight);
   //    shape.draw();
}

scrollThumb.addEventListener("mousedown", (e) => {
   scrollBar.isDragging = true;
   scrollBar.startY = e.clientY - scrollThumb.offsetTop;
   document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
   if (!scrollBar.isDragging) return;
   const y = e.clientY - scrollBar.startY;
   onScroll(y);
   shape.draw();
});

document.addEventListener("mouseup", () => {
   scrollBar.isDragging = false;
   document.body.style.userSelect = "auto";
});

export { circleMap, rectMap, pencilMap, textMap, arrows, lineMap };
