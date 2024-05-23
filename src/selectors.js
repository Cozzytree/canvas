const canvas = document.getElementById("canvas");
const lineArrow = document.getElementById("lineArrow");
const pencil = document.getElementById("pencil");
const context = canvas.getContext("2d");
const setText = document.getElementById("Text");

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
};
