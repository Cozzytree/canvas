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
const lineBtn = document.getElementById("line");
const zoomText = document.getElementById("zoomText");
const shapeOptions = document.getElementById("shape-options");
const insertOptions = document.getElementById("insert-options");
const optionsContainer = document.getElementById("options-container");
const text = document.getElementById("Text");
const canvasBreakpoints = document.getElementById("render-breakpoints");
const breakPointsCtx = canvasBreakpoints.getContext("2d");

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
   lineBtn,
   zoomText,
   shapeOptions,
   insertOptions,
   optionsContainer,
   text,
   canvasBreakpoints,
   breakPointsCtx,
};
