import { Shapes, arrows, rectMap } from "./main";
import { config } from "./config";
import { canvas, context } from "./selectors";

export class Rectangle extends Shapes {
   constructor(x, y, width = 100, height = 100) {
      super();
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.type = "rect";
      this.pointTo = [];

      // canvas.addEventListener("mousedown", this.mouseDownforResizing.bind(this));

      canvas.addEventListener("mousemove", this.mouseMove.bind(this));
      canvas.addEventListener(
         "mousemove",
         this.mouseMoveforResizing.bind(this)
      );

      canvas.addEventListener("mouseup", this.mouseUp.bind(this));
      canvas.addEventListener("mouseup", this.mouseUpforResizing.bind(this));
   }

   mouseMove(e) {
      if (config.mode === "pencil") return;
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      rectMap.forEach((rect) => {
         if (rect.isDragging) {
            rect.isActive = true;
            rect.x = mouseX - rect.offsetX;
            rect.y = mouseY - rect.offsetY;
            if (rect.pointTo.length > 0) {
               // let arc = arrows.get(rect.pointTo);
               let arc = rect.pointTo.map((a) => {
                  return arrows.get(a);
               });

               // let arrowStartRect = rectMap.get(arc.startTo);
               // let arrowEndReet = rectMap.get(arc.endTo);
               let arrowStartRect = arc.map((a) => {
                  return rectMap.get(a.startTo);
               });
               let arrowEndRect = arc.map((a) => {
                  return rectMap.get(a.endTo);
               });

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

               arrowEndRect.forEach((ar) => {
                  if (ar == rect) {
                     arc.forEach((a) => {
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
                     });
                  }
               });
            }
            rect.draw();
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
               e.clientY - canvas.getBoundingClientRect().top - rect.offsetY;
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

   // mouseDownforResizing(e) {
   //   const mouseX = e.clientX - canvas.getBoundingClientRect().left;
   //   const mouseY = e.clientY - canvas.getBoundingClientRect().top;

   //   rectMap.forEach((rect) => {
   //     // Check for horizontal resizing
   //     const leftEdge =
   //       mouseX >= rect.x - this.tolerance && mouseX <= rect.x + this.tolerance;
   //     const rightEdge =
   //       mouseX >= rect.x + rect.width - this.tolerance &&
   //       mouseX <= rect.x + rect.width + this.tolerance;
   //     const verticalBounds =
   //       mouseY > rect.y + this.tolerance &&
   //       mouseY < rect.y + rect.height - this.tolerance;

   //     if ((leftEdge || rightEdge) && verticalBounds) {
   //       console.log("true");
   //       rect.isActive = true;
   //       rect.horizontalResizing = true;
   //     }

   //     // vertical resizing //
   //     const withinTopEdge =
   //       mouseY >= rect.y - this.tolerance && mouseY <= rect.y + this.tolerance;
   //     const withinBottomEdge =
   //       mouseY >= rect.y + rect.height - this.tolerance &&
   //       mouseY <= rect.y + rect.height + this.tolerance;
   //     const withinHorizontalBounds =
   //       mouseX > rect.x + this.tolerance &&
   //       mouseX < rect.x + rect.width - this.tolerance;

   //     if ((withinTopEdge || withinBottomEdge) && withinHorizontalBounds) {
   //       rect.isActive = true;
   //       rect.verticalResizing = true;
   //     }

   //     // Check for corners resize
   //     const withinTopLeftCorner =
   //       mouseX >= rect.x - this.tolerance &&
   //       mouseX <= rect.x + this.tolerance &&
   //       mouseY >= rect.y - this.tolerance &&
   //       mouseY <= rect.y + this.tolerance;

   //     const withinTopRightCorner =
   //       mouseX >= rect.x + rect.width - this.tolerance &&
   //       mouseX <= rect.x + rect.width + this.tolerance &&
   //       mouseY >= rect.y - this.tolerance &&
   //       mouseY <= rect.y + this.tolerance;

   //     const withinBottomLeftCorner =
   //       mouseX >= rect.x - this.tolerance &&
   //       mouseX <= rect.x + this.tolerance &&
   //       mouseY >= rect.y + rect.height - this.tolerance &&
   //       mouseY <= rect.y + rect.height + this.tolerance;

   //     const withinBottomRightCorner =
   //       mouseX >= rect.x + rect.width - this.tolerance &&
   //       mouseX <= rect.x + rect.width + this.tolerance &&
   //       mouseY >= rect.y + rect.height - this.tolerance &&
   //       mouseY <= rect.y + rect.height + this.tolerance;

   //     if (
   //       withinTopLeftCorner ||
   //       withinTopRightCorner ||
   //       withinBottomLeftCorner ||
   //       withinBottomRightCorner
   //     ) {
   //       rect.isActive = true;
   //       rect.isResizing = true;
   //     }
   //   });
   // }

   mouseMoveforResizing(e) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

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
         } else if (rect.verticalResizing) {
            const oldPosition = rect.y + rect.height;
            const newY = mouseY > rect.y ? rect.y : mouseY;

            rect.y = newY;
            if (mouseY < oldPosition) {
               rect.height = Math.abs(oldPosition - mouseY);
            } else if (mouseY > oldPosition)
               rect.height = Math.abs(mouseY - rect.y);
         } else if (rect.isResizing) {
            rect.isActive = true;
            rect.width = Math.abs(
               e.clientX - canvas.getBoundingClientRect().left - rect.x
            );
            rect.height = Math.abs(
               e.clientY - canvas.getBoundingClientRect().top - rect.y
            );
         }
         rect.draw();
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
