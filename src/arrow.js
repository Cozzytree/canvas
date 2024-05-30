import { Shapes, arrows, rectMap } from "./main";
import { canvas, context } from "./selectors";

export class Arrows extends Shapes {
   constructor(x, y, tox, toy) {
      super();
      this.x = x;
      this.y = y;
      this.tox = tox;
      this.toy = toy;
      this.isActive = false;
      this.type = "arrow";
      this.endTo = null;
      this.startTo = null;
      this.isResizingEnd = false;
      this.isResizingStart = false;

      this.mouseMoveListener = this.mouseMd.bind(this);
      this.mouseUpListener = this.mousep.bind(this);

      canvas.addEventListener("mousemove", this.mouseMoveListener);
      canvas.addEventListener("mouseup", this.mouseUpListener);
   }

   mouseD(e) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      const withinBounds = (x1, y1, x2, y2, tolerance = 0) => {
         return (
            mouseX >= x1 - tolerance &&
            mouseX <= x2 + tolerance &&
            mouseY >= y1 - tolerance &&
            mouseY <= y2 + tolerance
         );
      };

      arrows.forEach((arrow) => {
         if (
            withinBounds(
               arrow.tox,
               arrow.toy,
               arrow.tox,
               arrow.toy,
               this.tolerance
            )
         ) {
            arrow.isActive = true;
            arrow.isResizing = true;
            // return;
         }

         if (arrow.x < arrow.tox) {
            if (arrow.y > arrow.toy) {
               if (withinBounds(arrow.x, arrow.toy, arrow.tox, arrow.y)) {
                  arrow.isActive = true;
                  arrow.isDragging = true;
                  arrow.dragOffsetX = mouseX - arrow.x;
                  arrow.dragOffsetY = mouseY - arrow.y;
                  return;
               }
            } else if (arrow.y < arrow.toy) {
               if (
                  withinBounds(
                     arrow.x,
                     arrow.y,
                     arrow.tox,
                     arrow.toy,
                     this.tolerance
                  )
               ) {
                  arrow.isActive = true;
                  arrow.isDragging = true;
                  arrow.dragOffsetX = mouseX - arrow.x;
                  arrow.dragOffsetY = mouseY - arrow.y;
                  return;
               }
            } else {
               arrow.isActive = true;
               arrow.isDragging = true;
               arrow.dragOffsetX = mouseX - arrow.x;
               arrow.dragOffsetY = mouseY - arrow.y;
               return;
            }
         } else if (arrow.x > arrow.tox) {
            if (arrow.y > arrow.toy) {
               if (withinBounds(arrow.tox, arrow.toy, arrow.x, arrow.y)) {
                  arrow.isActive = true;
                  arrow.isDragging = true;
                  arrow.dragOffsetX = mouseX - arrow.x;
                  arrow.dragOffsetY = mouseY - arrow.y;
                  return;
               }
            } else if (arrow.y < arrow.toy) {
               if (
                  withinBounds(
                     arrow.tox,
                     arrow.y,
                     arrow.x,
                     arrow.toy,
                     this.tolerance
                  )
               ) {
                  arrow.isActive = true;
                  arrow.isDragging = true;
                  arrow.dragOffsetX = mouseX - arrow.x;
                  arrow.dragOffsetY = mouseY - arrow.y;
                  return;
               }
            } else {
               arrow.isActive = true;
               arrow.isDragging = true;
               arrow.dragOffsetX = mouseX - arrow.x;
               arrow.dragOffsetY = mouseY - arrow.y;
               return;
            }
         }
      });
   }

   mouseMd(e) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      arrows.forEach((arrow) => {
         if (arrow.isResizingEnd) {
            arrow.tox = mouseX;
            arrow.toy = mouseY;
         }
         if (arrow.isResizingStart) {
            arrow.x = mouseX;
            arrow.y = mouseY;
         }

         if (arrow.isDragging) {
            const deltaX = mouseX - arrow.dragOffsetX;
            const deltaY = mouseY - arrow.dragOffsetY;
            const diffX = arrow.tox - arrow.x;
            const diffY = arrow.toy - arrow.y;

            arrow.x = deltaX;
            arrow.y = deltaY;
            arrow.tox = deltaX + diffX;
            arrow.toy = deltaY + diffY;
         }
      });

      this.draw();
   }

   mousep(e) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      arrows.forEach((arrow, key) => {
         if (arrow.isDragging) {
            arrow.isDragging = false;
         }
         if (arrow.isResizingEnd) {
            arrow.isResizingEnd = false;
            if (arrow.endTo) {
               const theRect = rectMap.get(this.endTo);
               if (!theRect.pointTo) return;
               if (
                  arrow.tox < theRect.x ||
                  arrow.tox > theRect.x + theRect.width ||
                  arrow.toy < theRect.y ||
                  arrow.toy > theRect.y + theRect.width
               ) {
                  arrow.endTo = null;
                  theRect.pointTo = null;
               }
            }
            rectMap.forEach((rect, rectKey) => {
               if (
                  arrow.tox >= rect.x - this.tolerance &&
                  arrow.tox <= rect.x + rect.width + this.tolerance &&
                  arrow.toy >= rect.y - this.tolerance &&
                  arrow.toy <= rect.y + rect.height + this.tolerance
               ) {
                  rect.pointTo = key;
                  arrow.endTo = rectKey;
               }
            });
         }

         if (arrow.isResizingStart) {
            arrow.isResizingStart = false;
            if (arrow.startTo) {
               const theRect = rectMap.get(this.startTo);
               if (!theRect.startTo) return;
               if (
                  arrow.tox < theRect.x ||
                  arrow.tox > theRect.x + theRect.width ||
                  arrow.toy < theRect.y ||
                  arrow.toy > theRect.y + theRect.width
               ) {
                  arrow.startTo = null;
                  theRect.pointTo = null;
               }
            }
            rectMap.forEach((rect, rectKey) => {
               if (
                  arrow.x >= rect.x - this.tolerance &&
                  arrow.x <= rect.x + rect.width + this.tolerance &&
                  arrow.y >= rect.y - this.tolerance &&
                  arrow.y <= rect.y + rect.height + this.tolerance
               ) {
                  rect.pointTo = key;
                  arrow.startTo = rectKey;
               }
            });
         }
      });
   }

   drawArrow(fromx, fromy, tox, toy, arrowWidth = 2, color = "black") {
      let headlen = 10;
      let angle = Math.atan2(toy - fromy, tox - fromx);

      context.save();
      context.strokeStyle = color;
      context.lineWidth = arrowWidth;

      context.beginPath();
      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);
      context.stroke();

      context.beginPath();
      context.moveTo(tox, toy);
      context.lineTo(
         tox - headlen * Math.cos(angle - Math.PI / 7),
         toy - headlen * Math.sin(angle - Math.PI / 7)
      );
      context.lineTo(
         tox - headlen * Math.cos(angle + Math.PI / 7),
         toy - headlen * Math.sin(angle + Math.PI / 7)
      );
      context.lineTo(tox, toy);
      context.stroke();

      context.restore();
   }
}
