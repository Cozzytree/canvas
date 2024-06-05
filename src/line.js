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
}
