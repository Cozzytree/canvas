import { lineMap } from "./main";
import { canvas, context } from "./selectors";
import Shapes from "./shape";

export default class Line extends Shapes {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.isResizingStart = false;
    this.isResizingEnd = false;
    this.startTo = null;
    this.endTo = null;
    this.curvePoints = [];
    this.isDrawing = false;
    this.startPoint = null;
    this.currentPoint = null;
  }
  // this.tox = tox;
  // this.toy = toy;

  drawLine(x, y, tox, toy) {
    context.beginPath();
    context.lineWidth = 1.2;
    context.strokeStyle = "white";
    context.moveTo(x, y);
    context.lineTo(tox, toy);
    context.stroke();
    context.closePath();

    //   canvas.addEventListener("click", this.down.bind(this));
    //   canvas.addEventListener("mousemove", this.move.bind(this));
    //   canvas.addEventListener("mouseup", this.up.bind(this));
  }

  
}
