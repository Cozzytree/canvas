import { context } from "./selectors";
import Shapes from "./shape";

export default class Line extends Shapes {
   constructor(lineType) {
      super();
      this.startTo = null;
      this.endTo = null;
      this.curvePoints = [];
      this.type = "line";
      this.lineType = lineType;
      this.minX = null;
      this.maxX = null;
      this.minY = null;
      this.maxY = null;
   }

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
