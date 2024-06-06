import Shapes from "./shape.js";
import { arrows, rectMap } from "./main";
import { config, scrollBar } from "./config";
import { canvas, context } from "./selectors";

export default class Rectangle extends Shapes {
   constructor(
      x,
      y,
      width = 100,
      height = 100,
      tolerance,
      lineWidth,
      isDragging,
      isActive,
      isResizing,
      horizontelResizing,
      verticalResizing
   ) {
      super(
         tolerance,
         lineWidth,
         isDragging,
         isActive,
         isResizing,
         horizontelResizing,
         verticalResizing
      );
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.type = "rect";
      this.pointTo = [];

      // canvas.addEventListener("mousedown", this.mouseDownforResizing.bind(this));

      //   canvas.addEventListener("mousemove", this.mouseMove.bind(this));
      //   canvas.addEventListener(
      //      "mousemove",
      //      this.mouseMoveforResizing.bind(this)
      //   );

      //   canvas.addEventListener("mouseup", this.mouseUp.bind(this));
      //   canvas.addEventListener("mouseup", this.mouseUpforResizing.bind(this));
   }

   mouseMove(e) {
      if (config.mode === "pencil") return;
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      rectMap.forEach((rect) => {
         if (rect.isDragging) {
            rect.isActive = true;
            rect.x = mouseX - rect.offsetX;
            rect.y = mouseY - rect.offsetY + scrollBar.scrollPosition;
            if (rect.pointTo.length > 0) {
               // let arc = arrows.get(rect.pointTo);
               let arc = rect.pointTo.map((a) => {
                  return arrows.get(a);
               });
               let arrowStartRect = [];
               let arrowEndRect = [];

               // get all the arrows connected to rect
               arc.forEach((a) => {
                  let start = rectMap.get(a.startTo);
                  let end = rectMap.get(a.endTo);
                  if (start) {
                     arrowStartRect.push(start);
                  }
                  if (end) {
                     arrowEndRect.push(end);
                  }
               });

               if (arrowStartRect.length > 0) {
                  arrowStartRect.forEach((ar) => {
                     if (ar === rect) {
                        arc.forEach((a) => {
                           if (rectMap.get(a.startTo) === rect) {
                              if (a.tox < rect.x) {
                                 // a.tox is to the left of the rectangle
                                 a.x = rect.x;
                                 a.y = rect.y + rect.height * 0.5; // Middle of the left edge
                              } else if (a.tox > rect.x + rect.width) {
                                 // a.tox is to the right of the rectangle
                                 a.x = rect.x + rect.width;
                                 a.y = rect.y + rect.height * 0.5; // Middle of the right edge
                              } else {
                                 // a.tox is within the horizontal bounds of the rectangle
                                 a.x = a.tox;
                                 if (a.y < rect.y) {
                                    // a.y is above the rectangle
                                    a.y = rect.y;
                                 } else if (a.tox > rect.y + rect.height) {
                                    // a.y is below the rectangle
                                    a.y = rect.y + rect.height;
                                 } else {
                                    // a.y is within the vertical bounds of the rectangle
                                    a.y = rect.y; // Vertical center of the rectangle
                                 }
                              }
                           }
                        });
                     }
                  });
               }

               if (arrowEndRect.length > 0) {
                  arrowEndRect.forEach((ar) => {
                     if (ar === rect) {
                        arc.forEach((a) => {
                           if (rectMap.get(a.endTo) === rect) {
                              if (a.x > rect.x + rect.width) {
                                 // a.x is to the right of the rectangle
                                 a.tox = rect.x + rect.width;
                                 a.toy = rect.y + rect.height * 0.5; // Middle of the right edge
                              } else if (a.x < rect.x) {
                                 // a.x is to the left of the rectangle
                                 a.tox = rect.x;
                                 a.toy = rect.y + rect.height * 0.5; // Middle of the left edge
                              } else {
                                 // a.x is within the horizontal bounds of the rectangle
                                 if (a.y < rect.y) {
                                    // a.y is above the rectangle
                                    a.tox = a.x;
                                    a.toy = rect.y; // Top edge
                                 } else if (a.y > rect.y + rect.height) {
                                    // a.y is below the rectangle
                                    a.tox = a.x;
                                    a.toy = rect.y + rect.height; // Bottom edge
                                 } else {
                                    // a.x and a.y are inside the rectangle bounds
                                    // Define some default behavior if needed
                                    a.tox = rect.x + rect.width * 0.5; // Center of the rectangle
                                    a.toy = rect.y + rect.height * 0.5; // Center of the rectangle
                                 }
                              }
                           }
                        });
                     }
                  });
               }
            }
            // rect.draw();
         }
      });
   }

   mouseUp(e) {
      if (config.mode === "pencil") return;
      rectMap.forEach((rect) => {
         if (rect.isDragging) {
            rect.x =
               e.clientX - canvas.getBoundingClientRect().left - rect.offsetX;
            rect.y =
               e.clientY -
               canvas.getBoundingClientRect().top -
               rect.offsetY +
               scrollBar.scrollPosition;
            rect.draw();
            rect.isDragging = false;
         }
      });
 
   }

   drawRect(rect) {
      const radius = 10;
      context.beginPath();
      context.moveTo(rect.x + radius, rect.y);
      context.arcTo(
         rect.x + rect.width,
         rect.y,
         rect.x + rect.width,
         rect.y + rect.height,
         radius
      );
      context.arcTo(
         rect.x + rect.width,
         rect.y + rect.height,
         rect.x,
         rect.y + rect.height,
         radius
      );
      context.arcTo(rect.x, rect.y + rect.height, rect.x, rect.y, radius);
      context.arcTo(rect.x, rect.y, rect.x + rect.width, rect.y, radius);
      context.closePath();
      context.stroke();
   }

   mouseMoveforResizing(e) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY =
         e.clientY -
         canvas.getBoundingClientRect().top +
         scrollBar.scrollPosition;

      rectMap.forEach((rect) => {
         if (rect.horizontalResizing) {
            const oldPosition = rect.x + rect.width;
            const newX = mouseX > rect.x ? rect.x : mouseX;

            rect.x = newX;
            if (mouseX < oldPosition) {
               rect.width = Math.abs(oldPosition - mouseX);
            } else if (mouseX > oldPosition)
               rect.width = Math.abs(mouseX - rect.x); // Adjust width when mouseX is below rect.x

            // rect.width = Math.abs(mouseX - rect.x); // Adjust width normally when mouseX is to the right
            rect.draw();
         } else if (rect.verticalResizing) {
            const oldPosition = rect.y + rect.height;
            const newY = mouseY > rect.y ? rect.y : mouseY;

            rect.y = newY;
            if (mouseY < oldPosition) {
               {
                  rect.height = Math.abs(oldPosition - mouseY);
               }
            } else if (mouseY > oldPosition) {
               rect.height = Math.abs(mouseY - rect.y);
            }
            rect.draw();
         } else if (rect.isResizing) {
            rect.isActive = true;
            rect.width = Math.abs(mouseX - rect.x);
            rect.height = Math.abs(mouseY - rect.y);
            rect.draw();
         }
      });
   }

   mouseUpforResizing() {
      rectMap.forEach((rect) => {
         rect.isActive = true;
         rect.isResizing = false;
         rect.verticalResizing = false;
         rect.horizontalResizing = false;
      });
   }
}
