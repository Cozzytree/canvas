const canvas = document.getElementById("canvas");
const lineArrow = document.getElementById("lineArrow");
const pencil = document.getElementById("pencil");
const context = canvas.getContext("2d");
const setText = document.getElementById("Text");
const scrollContainer = document.getElementById("canvas-container");
const scrollThumb = document.getElementById("scroll-thumb");
const scrollThumbX = document.getElementById("scroll-thumb-x");
const switchDoc = document.getElementById("switch-document");
const switchCanvas = document.getElementById("switch-canvas");
const switchBoth = document.getElementById("switch-both");
const docuemntDiv = document.getElementById("document");
const canvasDiv = document.getElementById("canvas-div");
const line = document.getElementById("line");
const zoomText = document.getElementById("zoomText");

let IS_PENCIL_DRAWING = false;
let LAST_X = 0;
let LAST_Y = 0;

export {
   canvas,
   pencil,
   context,
   lineArrow,
   setText,
   IS_PENCIL_DRAWING,
   LAST_X,
   LAST_Y,
   scrollContainer,
   scrollThumb,
   scrollThumbX,
   switchDoc,
   switchBoth,
   switchCanvas,
   docuemntDiv,
   canvasDiv,
   line,
   zoomText,
};
