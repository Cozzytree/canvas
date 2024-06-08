import { changeStyle } from "./events.js";
import { shape } from "./shape.js";
import { config, scrollBar } from "./config.js";
import {
  canvas,
  scrollContainer,
  scrollThumb,
  scrollThumbX,
} from "./selectors.js";

const circleMap = new Map();
const rectMap = new Map();
const pencilMap = new Map();
const textMap = new Map();
const arrows = new Map();
const lineMap = new Map();

const visibleHeight = scrollContainer.clientHeight;
const visibleWidth = scrollContainer.clientWidth;
const contentHeight = 1800; // Simulate a taller content
const contentWidth = 2800;
canvas.width = contentWidth;
canvas.height = contentHeight;

const scrollThumbHeight = Math.max(
  (visibleHeight / contentHeight) * visibleHeight,
  20
);
const scrollThumbWidth = Math.max(
  (visibleWidth / contentWidth) * visibleWidth,
  20
);
scrollThumb.style.height = `${scrollThumbHeight}px`;
scrollThumbX.style.width = `${scrollThumbWidth}px`;
console.log(scrollThumbWidth);

function onScroll(y) {
  const maxScrollTop = visibleHeight - scrollThumbHeight;
  const thumbTop = Math.min(Math.max(y, 0), maxScrollTop);
  scrollThumb.style.top = `${thumbTop}px`;
  scrollBar.scrollPositionY =
    (thumbTop / maxScrollTop) * (contentHeight - visibleHeight);
  //    shape.draw();
}

function onScrollX(x) {
  const maxScrollLeft = visibleWidth - scrollThumbWidth;
  const thumbLeft = Math.min(Math.max(x, 0), maxScrollLeft);
  scrollThumbX.style.left = `${thumbLeft}px`;
  scrollBar.scrollPositionX =
    (thumbLeft / maxScrollLeft) * (contentWidth - visibleWidth);
}

scrollThumb.addEventListener("mousedown", (e) => {
  scrollBar.isDraggingY = true;
  scrollBar.startY = e.clientY - scrollThumb.offsetTop;
  document.body.style.userSelect = "none";
});

scrollThumbX.addEventListener("mousedown", (e) => {
  scrollBar.isDraggingX = true;
  scrollBar.startX = e.clientX - scrollThumbX.offsetLeft;
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (scrollBar.isDraggingY) {
    const y = e.clientY - scrollBar.startY;
    onScroll(y);
  }
  if (scrollBar.isDraggingX) {
    const x = e.clientX - scrollBar.startX;
    onScrollX(x);
  }
  shape.draw();
});

document.addEventListener("mouseup", () => {
  scrollBar.isDraggingY = false;
  scrollBar.isDraggingX = false;
  document.body.style.userSelect = "auto";
});

export { circleMap, rectMap, pencilMap, textMap, arrows, lineMap };
