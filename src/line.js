import { lineMap } from "./main";
import { canvas, context } from "./selectors";
import Shapes from "./shape";

export default class Line extends Shapes {
   constructor(x, y, tox, toy) {
      super();
      this.x = x;
      this.y = y;
      this.tox = tox;
      this.toy = toy;
      this.isResizingStart = false;
      this.isResizingEnd = false;
      this.startTo = null;
      this.endTo = null;
   }

   drawLine(x, y, tox, toy) {
      context.beginPath();
      context.lineWidth = 1.2;
      context.strokeStyle = "white";
      context.moveTo(x, y);
      context.lineTo(tox, toy);
      context.stroke();
      context.closePath();

      canvas.addEventListener("click", this.down.bind(this));
      //   canvas.addEventListener("mousemove", this.move.bind(this));
      canvas.addEventListener("mouseup", this.up.bind(this));
   }

   down(e) {
      const tolerance = 5;
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      lineMap.forEach((line) => {
         const isNearStart =
            mouseX >= line.x - tolerance &&
            mouseX <= line.x + tolerance &&
            mouseY >= line.y - tolerance &&
            mouseY <= line.y + tolerance;

         const isNearEnd =
            mouseX >= line.tox - tolerance &&
            mouseX <= line.tox + tolerance &&
            mouseY >= line.toy - tolerance &&
            mouseY <= line.toy + tolerance;

         if (isNearStart || isNearEnd) {
            line.isActive = true;
         }
      });
   }

   move(e) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      lineMap.forEach((line) => {
         if (line.isResizingStart) {
            line.isActive = true;
            line.x = mouseX;
            line.y = mouseY;
            this.draw();
         } else if (line.isResizingEnd) {
            line.isActive = true;
            line.tox = mouseX;
            line.toy = mouseY;
            this.draw();
         }
      });
   }

   up() {
      lineMap.forEach((line) => {
         if (line.isResizingEnd || line.isResizingStart) {
            line.isResizingEnd = false;
            line.isResizingStart = false;
         }
      });
   }
}
