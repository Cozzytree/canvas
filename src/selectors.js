const canvas = document.getElementById("canvas");
const pencil = document.getElementById("pencil");
const context = canvas.getContext("2d");

let IS_PENCIL_DRAWING = false;
let LAST_X = 0;
let LAST_Y = 0;

export {
  canvas,
  pencil,
  context,
  IS_PENCIL_DRAWING,
  LAST_X,
  LAST_Y,
};
