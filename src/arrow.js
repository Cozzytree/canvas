import Shapes from "./shape";
import { scrollBar } from "./config";
import { arrows, circleMap, rectMap, textMap } from "./main";
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
      const mouseY =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPosition;

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
      const mouseY =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPosition;

      arrows.forEach((arrow) => {
         if (arrow.isResizingEnd) {
            arrow.tox = mouseX;
            arrow.toy = mouseY;
            this.draw();
         }
         if (arrow.isResizingStart) {
            arrow.x = mouseX;
            arrow.y = mouseY;
            this.draw();
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
            this.draw();
         }
      });
   }

   mousep() {
      //   const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      //   const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      arrows.forEach((arrow, key) => {
         if (arrow.isDragging) {
            arrow.isDragging = false;
         }

         // arrow end
         if (arrow.isResizingEnd) {
            arrow.isResizingEnd = false;

            if (arrow.endTo) {
               const theArc = circleMap.get(arrow.endTo);
               const theRect = rectMap.get(arrow.endTo);
               const text = textMap.get(arrow.endTo);

               if (text && text.pointTo.length > 0) {
                  if (
                     arrow.tox < text.x ||
                     arrow.tox > text.x + text.width ||
                     arrow.toy < text.y ||
                     arrow.toy > text.y + text.height
                  ) {
                     arrow.endTo = null;
                     text.pointTo.filter((t) => t !== key);
                  }
               }

               // end to rect
               if (theRect && theRect.pointTo.length > 0) {
                  if (
                     arrow.tox < theRect.x ||
                     arrow.tox > theRect.x + theRect.width ||
                     arrow.toy < theRect.y ||
                     arrow.toy > theRect.y + theRect.width ||
                     arrow.startTo === arrow.endTo
                  ) {
                     arrow.endTo = null;
                     // theRect.pointTo = null;
                     theRect.pointTo.filter((p) => p !== key);
                  }
               }

               // end to arc

               if (theArc && theArc.pointTo.length > 0) {
                  const parameter = Math.sqrt(
                     (arrow.tox - theArc.x) ** 2 + (arrow.toy - theArc.y) ** 2
                  );
                  if (
                     parameter > theArc.xRadius &&
                     parameter > theArc.yRadius
                  ) {
                     arrow.endTo = null;
                     // theRect.pointTo = null;
                     theArc.pointTo.filter((p) => p !== key);
                  }
               }
            }

            // arrow end point to rect
            rectMap.forEach((rect, rectKey) => {
               if (
                  arrow.tox >= rect.x - this.tolerance &&
                  arrow.tox <= rect.x + rect.width + this.tolerance &&
                  arrow.toy >= rect.y - this.tolerance &&
                  arrow.toy <= rect.y + rect.height + this.tolerance
               ) {
                  if (rect.pointTo.length > 0) {
                     rect.pointTo.forEach((r) => {
                        if (r === key) return;
                        else {
                           rect.pointTo.push(key);
                           arrow.endTo = rectKey;
                        }
                     });
                  } else {
                     rect.pointTo.push(key);
                     arrow.endTo = rectKey;
                  }
               }
            });

            // arrow end point to sphere
            circleMap.forEach((arc, arckey) => {
               const parameter = Math.sqrt(
                  (arrow.tox - arc.x) ** 2 + (arrow.toy - arc.y) ** 2
               );
               if (parameter < arc.xRadius && parameter < arc.yRadius) {
                  if (arc.pointTo.length > 0) {
                     arc.pointTo.forEach((a) => {
                        if (a === key) return;
                        else {
                           arc.pointTo.push(key);
                           arrow.endTo = arckey;
                        }
                     });
                  } else {
                     arc.pointTo.push(key);
                     arrow.endTo = arckey;
                  }
               }
            });

            //point to text
            textMap.forEach((t, textKey) => {
               if (
                  arrow.tox >= t.x &&
                  arrow.tox <= t.x + t.width &&
                  arrow.toy >= t.y &&
                  arrow.toy <= t.y + t.height
               ) {
                  arrow.endTo = textKey;
                  t.pointTo.push(key);
               }
            });
         }

         if (arrow.isResizingStart) {
            arrow.isResizingStart = false;

            if (arrow.startTo) {
               const theArc = circleMap.get(arrow.startTo);
               const theRect = rectMap.get(arrow.startTo);

               if (theRect && theRect.pointTo.length > 0) {
                  if (
                     arrow.tox < theRect.x ||
                     arrow.tox > theRect.x + theRect.width ||
                     arrow.toy < theRect.y ||
                     arrow.toy > theRect.y + theRect.width
                  ) {
                     arrow.startTo = null;
                     // theRect.pointTo = null;
                     theRect.pointTo.filter((p) => p !== key);
                  }
               }

               if (theArc && theArc.pointTo.length > 0) {
                  const parameter = Math.sqrt(
                     (arrow.tox - theArc.x) ** 2 + (arrow.toy - theArc.y) ** 2
                  );
                  if (
                     parameter > theArc.xRadius &&
                     parameter > theArc.yRadius
                  ) {
                     arrow.endTo = null;
                     // theRect.pointTo = null;
                     theArc.pointTo.filter((p) => p !== key);
                  }
               }
            }

            rectMap.forEach((rect, rectKey) => {
               if (
                  arrow.x >= rect.x - this.tolerance &&
                  arrow.x <= rect.x + rect.width + this.tolerance &&
                  arrow.y >= rect.y - this.tolerance &&
                  arrow.y <= rect.y + rect.height + this.tolerance
               ) {
                  rect.pointTo.push(key);
                  arrow.startTo = rectKey;
               }
            });
            circleMap.forEach((arc, arcKey) => {
               const parameter = Math.sqrt(
                  (arrow.x - arc.x) ** 2 + (arrow.y - arc.y) ** 2
               );
               if (parameter < arc.xRadius && parameter < arc.yRadius) {
                  arrow.startTo = arcKey;
                  arc.pointTo.push(key);
               }
            });
         }
      });
   }

   drawArrow(fromx, fromy, tox, toy, arrowWidth = 1.2, color = "black") {
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
