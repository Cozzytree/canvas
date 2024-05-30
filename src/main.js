"use strict";

import { changeStyle } from "./events.js";
import { config } from "./config.js";
import { canvas, pencil, context } from "./selectors.js";

const circleMap = new Map();
const rectMap = new Map();
const pencilMap = new Map();
const textMap = new Map();
const arrows = new Map();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Shapes {
   constructor() {
      this.tolerance = 6.5;
      this.lineWidth = 2;
      this.isDragging = false;
      this.isActive = false;
      this.isResizing = false;
      this.horizontelResizing = false;
      this.verticalResizing = false;

      // document.addEventListener("click", function (event) {
      //   // Check if the Ctrl key is pressed
      //   if (event.ctrlKey) {
      //     // Handle Ctrl+click event
      //     console.log("Ctrl key was pressed while clicking");
      //     // Place your custom logic here
      //   }
      // });

      canvas.addEventListener("click", (e) => {
         const clickX = e.clientX - canvas.getBoundingClientRect().left;
         const clickY = e.clientY - canvas.getBoundingClientRect().top;
         if (config.mode === "pencil") return;

         // Reset all shapes to inactive
         const allShapes = [
            ...rectMap.values(),
            ...circleMap.values(),
            ...arrows.values(),
            ...textMap.values(),
         ];
         allShapes.forEach((shape) => {
            shape.isActive = false;
         });
         // rectMap.forEach((rect) => (rect.isActive = false));
         // circleMap.forEach((circle) => (circle.isActive = false));
         // textMap.forEach((text) => (text.isActive = false));
         // arrows.forEach((arrow) => (arrow.isActive = false));

         let circle = null;
         let square = null;
         let text = null;
         let arrow = null;

         // Check if the click is within any rectangle
         for (const [_, rect] of rectMap) {
            if (
               clickX >= rect.x &&
               clickX <= rect.x + rect.width &&
               clickY >= rect.y &&
               clickY <= rect.y + rect.height
            ) {
               if (square === null || square.width > rect.width) {
                  square = rect;
               }
            }
         }

         // click withinh circle
         for (const [_, arc] of circleMap) {
            if (
               clickX > arc.x - arc.xRadius &&
               clickX <= arc.x + arc.xRadius &&
               clickY >= arc.y - arc.yRadius &&
               clickY <= arc.y + arc.yRadius
            ) {
               if (circle === null || arc.xRadius < circle.xRadius) {
                  circle = arc;
               }
            }
         }

         //click withinh text
         for (const [_, t] of textMap) {
            if (
               clickX >= t.x &&
               clickX <= t.x + t.width &&
               clickY >= t.y &&
               clickY <= t.y + t.height
            ) {
               if (text === null || t.width < text.width) {
                  text = t;
               }
            }
         }

         arrows.forEach((arr) => {
            if (arr.x < arr.tox) {
               if (
                  clickX >= arr.x - this.tolerance &&
                  clickX <= arr.tox + this.tolerance &&
                  clickY >= arr.y - this.tolerance &&
                  clickY <= arr.toy + this.tolerance
               ) {
                  if (arrow === null || arr.tox - arr.x < arrow.tox - arrow.x) {
                     arrow = arr;
                  }
               }
            } else if (arr.x > arr.tox) {
               if (
                  clickX <= arr.x - this.tolerance &&
                  clickX >= arr.tox + this.tolerance &&
                  clickY >= arr.y - this.tolerance &&
                  clickY <= arr.toy + this.tolerance
               ) {
                  if (arrow === null || arr.tox - arr.x < arrow.tox - arrow.x) {
                     arrow = arr;
                  }
               }
            }
         });

         if (circle && !square && !text && !arrow) {
            circle.isActive = true;
         } else if (!circle && square && !text && !arrow) {
            square.isActive = true;
         } else if (!circle && !square && text && !arrow) {
            text.isActive = true;
         } else if (!circle && !square && !text && arrow) {
            arrow.isActive = true;
         } else if (circle && square && !text) {
            if (square.width > 2 * circle.xRadius) {
               circle.isActive = true;
            } else {
               square.isActive = true;
            }
         } else if (circle && !square && text) {
            if (circle.xRadius * 2 < text.width) {
               circle.isActive = true;
            } else {
               text.isActive = true;
            }
         } else if (!circle && square && text) {
            if (square.width < text.width) {
               square.isActive = true;
            } else {
               text.isActive = true;
            }
         } else if (circle && square && text) {
            if (
               circle.xRadius * 2 < text.width &&
               circle.xRadius * 2 < square.width
            ) {
               circle.isActive = true;
            } else if (
               square.width < text.width &&
               square.width < 2 * circle.xRadius
            ) {
               square.isActive = true;
            } else {
               text.isActive = true;
            }
         }

         this.draw();
      });

      document.addEventListener("keydown", (e) => {
         if (e.ctrlKey && e.key === "a") {
            rectMap.forEach((rect) => {
               rect.isActive = true;
            });
            circleMap.forEach((arc) => {
               arc.isActive = true;
            });
            textMap.forEach((text) => {
               text.isActive = true;
            });
            arrows.forEach((arrow) => {
               arrow.isActive = true;
            });
            this.draw();
         }
      });

      document.addEventListener("keydown", (e) => {
         if (e.key === "Delete") {
            //remove selected square
            rectMap.forEach((rect, key) => {
               if (rect.isActive) {
                  rectMap.delete(key);
               }
            });

            arrows.forEach((arrow, key) => {
               if (arrow.isActive) {
                  arrows.delete(key);
               }
            });
            //remove selected arcs
            circleMap.forEach((arc, key) => {
               if (arc.isActive) {
                  circleMap.delete(key);
               }
            });

            textMap.forEach((text, key) => {
               if (text.isActive) {
                  textMap.delete(key);
               }
            });
            this.draw();
         }
      });

      canvas.addEventListener(
         "mousedown",
         this.mouseDownDragAndResize.bind(this)
      );

      // canvas.addEventListener("mousedown", this.mouseDownforResizing.bind(this));
   }

   draw() {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      const radius = 10; // Adjust the radius for the desired roundness

      rectMap.forEach((rect) => {
         const x = rect.x;
         const y = rect.y;
         const width = rect.width;
         const height = rect.height;

         if (rect.isActive) {
            context.save();
            const dotRadius = 5;
            context.lineWidth = 1;
            context.strokeStyle = "rgb(2, 211, 134)";
            context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

            //dots
            this.fourDots(
               { x: rect.x - this.tolerance, y: rect.y - this.tolerance },
               {
                  x: rect.x + rect.width + this.tolerance,
                  y: rect.y - this.tolerance,
               },
               {
                  x: rect.x + rect.width + this.tolerance,
                  y: rect.y + rect.height + this.tolerance,
               },
               {
                  x: rect.x - this.tolerance,
                  y: rect.y + rect.height + this.tolerance,
               }
            );

            // Draw the rectangle using canvas rect method
            context.beginPath();
            context.rect(
               x - this.tolerance,
               y - this.tolerance,
               width + 2 * this.tolerance,
               height + 2 * this.tolerance
            );
            context.stroke();

            context.restore();
         } else {
            context.strokeStyle = "white";
         }

         context.beginPath();
         context.moveTo(x + radius, y);
         context.arcTo(x + width, y, x + width, y + height, radius);
         context.arcTo(x + width, y + height, x, y + height, radius);
         context.arcTo(x, y + height, x, y, radius);
         context.arcTo(x, y, x + width, y, radius);
         context.closePath();
         context.stroke();
      });

      circleMap.forEach((sphere) => {
         const x = sphere.x - sphere.xRadius;
         const y = sphere.y - sphere.yRadius;
         const width = sphere.x + sphere.xRadius;
         const height = sphere.y + sphere.yRadius;
         if (sphere.isActive) {
            context.save(); // Save the current drawing state

            context.strokeStyle = "rgb(2, 211, 134)";
            context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

            //dots
            this.fourDots(
               { x: x - this.tolerance, y: y - this.tolerance },
               { x: width + this.tolerance, y: y - this.tolerance },
               { x: width + this.tolerance, y: height + this.tolerance },
               { x: x - this.tolerance, y: height + this.tolerance }
            );

            // Draw the rectangle using canvas rect method
            context.beginPath();
            context.rect(
               x - this.tolerance,
               y - this.tolerance,
               2 * sphere.xRadius + 2 * this.tolerance,
               2 * sphere.yRadius + 2 * this.tolerance
            );
            context.stroke();

            context.restore(); // Restore the previous drawing state
         }
         context.beginPath();
         context.strokeStyle = "white";
         context.ellipse(
            sphere.x,
            sphere.y,
            sphere.xRadius,
            sphere.yRadius,
            0,
            0,
            2 * Math.PI
         );
         context.closePath();
         context.stroke();
      });

      // context.save();
      // pencilMap.forEach((pencil) => {
      //   context.beginPath();
      //   pencil.forEach((coor, index) => {
      //     if (index === 0) {
      //       context.moveTo(coor.x, coor.y); // Move to the first point
      //     } else {
      //       // Use quadraticCurveTo for drawing curved lines
      //       const prevCoor = pencil[index - 1];
      //       const cx = (coor.x + prevCoor.x) / 2; // Control point x-coordinate
      //       const cy = (coor.y + prevCoor.y) / 2; // Control point y-coordinate
      //       context.quadraticCurveTo(prevCoor.x, prevCoor.y, cx, cy); // Draw a quadratic curve
      //     }
      //   });

      //   // Set line properties
      //   context.lineCap = "round";
      //   context.lineJoin = "round";
      //   context.lineWidth = 1.6;
      //   context.strokeStyle = "#dcdcdc";
      //   context.stroke();
      //   context.closePath();
      // });
      // context.restore();
      // context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      context.save();
      context.fillStyle = "white";
      context.lineWidth = 1;
      textMap.forEach((t) => {
         if (t.isActive) {
            context.save();
            context.strokeStyle = "rgb(2, 211, 134)";
            context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

            //dots
            this.fourDots(
               { x: t.x - this.tolerance, y: t.y - this.tolerance },
               {
                  x: t.x + t.width + this.tolerance,
                  y: t.y - this.tolerance,
               },
               {
                  x: t.x + t.width + this.tolerance,
                  y: t.y + t.height + this.tolerance,
               },
               {
                  x: t.x - this.tolerance,
                  y: t.y + t.height + this.tolerance,
               }
            );

            context.beginPath();
            context.rect(
               t.x - t.tolerance,
               t.y - t.tolerance,
               2 * this.tolerance + t.width,
               2 * this.tolerance + t.height
            );
            context.stroke();

            context.restore();
         }
         // Set the font size before measuring the text
         context.font = `${t.size}px Arial`;

         // Measure the text
         const textMetrics = context.measureText(t.content);
         t.width = textMetrics.width;
         t.height =
            textMetrics.actualBoundingBoxAscent +
            textMetrics.actualBoundingBoxDescent;

         // Draw the text, adjusting the y coordinate
         context.fillText(
            t.content,
            t.x,
            t.y + textMetrics.actualBoundingBoxAscent
         );
      });
      context.restore();

      //variables to be used when creating the arrow
      let headlen = 10;
      arrows.forEach((arrow) => {
         context.save();
         if (arrow.isActive) {
            context.beginPath();
            context.strokeStyle = "rgb(2, 211, 134)";
            context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

            context.beginPath();
            context.arc(
               arrow.x - this.tolerance,
               arrow.y,
               4,
               0,
               2 * Math.PI,
               false
            );
            context.fill();

            context.beginPath();
            if (arrow.x < arrow.tox) {
               context.arc(
                  arrow.tox + this.tolerance,
                  arrow.toy,
                  3,
                  0,
                  2 * Math.PI,
                  false
               );
            } else {
               context.arc(
                  arrow.tox - this.tolerance,
                  arrow.toy,
                  3,
                  0,
                  2 * Math.PI,
                  false
               );
            }

            // if (Math.abs(arrow.y - arrow.toy) <= 10) {
            //    context.arc(
            //       arrow.tox + this.tolerance,
            //       arrow.toy,
            //       3,
            //       0,
            //       2 * Math.PI,
            //       false
            //    );
            // } else if (arrow.y > arrow.toy) {
            //    context.arc(
            //       arrow.tox,
            //       arrow.toy - this.tolerance,
            //       3,
            //       0,
            //       2 * Math.PI,
            //       false
            //    );
            // } else {
            //    context.arc(
            //       arrow.tox,
            //       arrow.toy + this.tolerance,
            //       3,
            //       0,
            //       2 * Math.PI,
            //       false
            //    );
            // }
            context.fill();
         } else {
            context.strokeStyle = "white";
         }
         let headlen = 7; // Length of the arrowhead

         // Calculate the angle for the arrowhead
         let angle = Math.atan2(arrow.toy - arrow.y, arrow.tox - arrow.x);

         // Begin drawing the main line
         context.beginPath();
         context.moveTo(arrow.x, arrow.y);

         if (Math.abs(arrow.x - arrow.tox) >= 100) {
            // Calculate the perpendicular point
            let midpointX = (arrow.tox - arrow.x) * 0.8;
            let midpointY = (arrow.toy - arrow.y) * 0.7;

            // Draw line to the midpoint
            context.lineTo(arrow.x + midpointX, arrow.y);

            context.lineTo(arrow.x + midpointX, arrow.toy);

            // context.lineTo(arrow.tox, arrow.y + midpointY);

            // Draw line from the midpoint to the endpoint
            context.lineTo(arrow.tox, arrow.toy);

            context.lineWidth = 2;
            context.stroke();
         } else {
            // If x is equal to tox, draw a straight line to the endpoint
            context.lineTo(arrow.x, arrow.toy);
            context.lineTo(arrow.tox, arrow.toy);
         }
         // Draw the arrowhead

         context.moveTo(arrow.tox, arrow.toy);

         context.lineWidth = 2;
         context.stroke();

         if (arrow.x < arrow.tox) {
            context.beginPath();
            context.moveTo(arrow.tox, arrow.toy);
            context.lineTo(arrow.tox - headlen, arrow.toy - headlen);
            context.lineTo(arrow.tox - headlen, arrow.toy + headlen);
            context.lineTo(arrow.tox, arrow.toy);
         } else {
            context.beginPath();
            context.moveTo(arrow.tox, arrow.toy);
            context.lineTo(arrow.tox + headlen, arrow.toy - headlen);
            context.lineTo(arrow.tox + headlen, arrow.toy + headlen);
            context.lineTo(arrow.tox, arrow.toy);
         }
         // if (Math.abs(arrow.y - arrow.toy) <= 10) {
         // // Draw the arrowhead
         //    context.beginPath();
         //    context.moveTo(arrow.tox, arrow.toy);
         //    context.lineTo(arrow.tox - headlen, arrow.toy - headlen);
         //    context.lineTo(arrow.tox - headlen, arrow.toy + headlen);
         //    context.lineTo(arrow.tox, arrow.toy);
         // }
         // else if (arrow.y > arrow.toy) {
         //    context.lineTo(arrow.tox + headlen, arrow.toy + headlen);
         //    context.lineTo(arrow.tox - headlen, arrow.toy + headlen);
         //    context.lineTo(arrow.tox, arrow.toy);
         // }
         //   else if (arrow.y < arrow.toy) {
         //    context.lineTo(arrow.tox - headlen, arrow.toy - headlen);
         //    context.lineTo(arrow.tox + headlen, arrow.toy - headlen);
         //    context.lineTo(arrow.tox, arrow.toy);
         // }

         // Draw the arrowhead outline
         context.stroke();
         context.restore();
      });
   }

   fourDots(tL, tR, bR, bL) {
      const sides = [tL, tR, bR, bL];
      for (let i = 0; i < sides.length; i++) {
         context.beginPath();
         context.arc(sides[i].x, sides[i].y, 4, 0, 2 * Math.PI, false);
         context.fill();
      }
   }

   mouseDownDragAndResize(e) {
      // if (this.isResizing) return;
      if (config.mode === "pencil") return;
      let isResizing = false;
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      // rect resize
      rectMap.forEach((rect) => {
         // Check for horizontal resizing
         const leftEdge = mouseX >= rect.x - this.tolerance && mouseX <= rect.x;
         const rightEdge =
            mouseX >= rect.x + rect.width &&
            mouseX <= rect.x + rect.width + this.tolerance;
         const verticalBounds =
            mouseY >= rect.y + this.tolerance &&
            mouseY <= rect.y + rect.height - this.tolerance;

         if ((leftEdge || rightEdge) && verticalBounds) {
            rect.isActive = true;
            rect.horizontalResizing = true;
            isResizing = true;
            return;
         }

         // vertical resizing //
         const withinTopEdge =
            mouseY >= rect.y - this.tolerance &&
            mouseY <= rect.y + this.tolerance;
         const withinBottomEdge =
            mouseY >= rect.y + rect.height - this.tolerance &&
            mouseY <= rect.y + rect.height + this.tolerance;
         const withinHorizontalBounds =
            mouseX > rect.x + this.tolerance &&
            mouseX < rect.x + rect.width - this.tolerance;

         if ((withinTopEdge || withinBottomEdge) && withinHorizontalBounds) {
            rect.isActive = true;
            rect.verticalResizing = true;
            isResizing = true;
            return;
         }

         // Check for corners resize
         const withinTopLeftCorner =
            mouseX >= rect.x - this.tolerance &&
            mouseX <= rect.x + this.tolerance &&
            mouseY >= rect.y - this.tolerance &&
            mouseY <= rect.y + this.tolerance;

         const withinTopRightCorner =
            mouseX >= rect.x + rect.width - this.tolerance &&
            mouseX <= rect.x + rect.width + this.tolerance &&
            mouseY >= rect.y - this.tolerance &&
            mouseY <= rect.y + this.tolerance;

         const withinBottomLeftCorner =
            mouseX >= rect.x - this.tolerance &&
            mouseX <= rect.x + this.tolerance &&
            mouseY >= rect.y + rect.height - this.tolerance &&
            mouseY <= rect.y + rect.height + this.tolerance;

         const withinBottomRightCorner =
            mouseX >= rect.x + rect.width - this.tolerance &&
            mouseX <= rect.x + rect.width + this.tolerance &&
            mouseY >= rect.y + rect.height - this.tolerance &&
            mouseY <= rect.y + rect.height + this.tolerance;

         if (
            withinTopLeftCorner ||
            withinTopRightCorner ||
            withinBottomLeftCorner ||
            withinBottomRightCorner
         ) {
            rect.isActive = true;
            rect.isResizing = true;
            isResizing = true;
         }
      });

      if (isResizing) return;
      // arrow resize
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
            arrow.isResizingEnd = true;
            isResizing = true;
            return;
         } else if (
            withinBounds(arrow.x, arrow.y, arrow.x, arrow.toy, this.tolerance)
         ) {
            arrow.isActive = true;
            arrow.isResizingStart = true;
            isResizing = true;
         }
      });

      if (isResizing) return;
      // sphere resize
      circleMap.forEach((arc) => {
         const forXless = arc.x - arc.xRadius;
         const forXmore = arc.x + arc.xRadius;
         const forYless = arc.y - arc.yRadius;
         const forYmore = arc.y + arc.yRadius;

         //horizontel resizing
         const leftEdge =
            mouseX >= forXless - this.tolerance && mouseX <= forXless;
         const rightEdge =
            mouseX >= forXmore && mouseX <= forXmore + this.tolerance;
         const verticalBounds =
            mouseY >= forYless + this.tolerance &&
            mouseY <= forYmore - this.tolerance;

         if ((leftEdge || rightEdge) && verticalBounds) {
            arc.isActive = true; // Set the circle as active
            arc.horizontelResizing = true; // Set the horizontal resizing flag
            isResizing = true;
         }

         //vertical resizing
         const topEdge =
            mouseY >= forYless - this.tolerance && mouseY <= forYless;
         const bottomEdge =
            mouseY >= forYmore && mouseY <= forYmore + this.tolerance;
         const horizontalBounds =
            mouseX >= forXless + this.tolerance &&
            mouseX <= forXmore - this.tolerance;

         if ((topEdge || bottomEdge) && horizontalBounds) {
            arc.isActive = true;
            arc.verticalResizing = true; // set vertical resizing to true
            isResizing = true;
         }

         //full resize
         if (
            // Top-left corner
            (mouseX >= forXless &&
               mouseX < forXless + this.tolerance &&
               mouseY > forYless - this.tolerance &&
               mouseY <= forYless) ||
            // Top-right corner
            (mouseX >= forXmore &&
               mouseX < forXmore + this.tolerance &&
               mouseY > forYless - this.tolerance &&
               mouseY <= forYless) ||
            // Bottom-left corner
            (mouseX >= forXless - this.tolerance &&
               mouseX <= forXless &&
               mouseY >= forYmore &&
               mouseY <= forYmore + this.tolerance) ||
            // Bottom-right corner
            (mouseX >= forXmore &&
               mouseX <= forXmore + this.tolerance &&
               mouseY >= forYmore &&
               mouseY <= forYmore + this.tolerance)
         ) {
            arc.isActive = true;
            arc.isResizing = true;
            isResizing = true;
         }
      });

      if (isResizing) return;

      let smallestCircle = null;
      let smallestRect = null;
      let smallestText = null;
      let arr = null;

      const checkRect = (rect) => {
         if (
            mouseX >= rect.x &&
            mouseX <= rect.x + rect.width &&
            mouseY >= rect.y &&
            mouseY <= rect.y + rect.height
         ) {
            if (smallestRect === null || rect.width < smallestRect.width) {
               smallestRect = rect;
            }
         }
      };

      const checkCircle = (sphere) => {
         const distance = Math.sqrt(
            (mouseX - sphere.x) ** 2 + (mouseY - sphere.y) ** 2
         );

         if (sphere.isActive) sphere.isActive = false;
         if (distance < sphere.xRadius && distance < sphere.yRadius) {
            if (
               smallestCircle === null ||
               sphere.xRadius < smallestCircle.xRadius
            ) {
               smallestCircle = sphere;
            }
         }
      };

      const checkText = (text) => {
         if (
            mouseX >= text.x &&
            mouseX <= text.x + text.width &&
            mouseY >= text.y &&
            mouseY <= text.y + text.height
         ) {
            if (smallestText === null || text.width < smallestText.width) {
               smallestText = text;
            }
         }
      };

      const arrow = (arrow) => {
         if (arrow.x < arrow.tox) {
            if (arrow.y > arrow.toy) {
               if (withinBounds(arrow.x, arrow.toy, arrow.tox, arrow.y)) {
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = arrow;
                  }
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
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = arrow;
                  }
               }
            } else if (arrow.y === arrow.toy) {
               if (
                  mouseX >= arrow.x &&
                  mouseX <= arrow.tox &&
                  mouseY >= arrow.y - this.tolerance &&
                  mouseY <= arrow.y + this.tolerance
               ) {
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = arrow;
                  }
               }
            }
         } else if (arrow.x > arrow.tox) {
            if (arrow.y > arrow.toy) {
               if (withinBounds(arrow.tox, arrow.toy, arrow.x, arrow.y)) {
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = arrow;
                  }
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
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = arrow;
                  }
               }
            } else if (arrow.y === arrow.toy) {
               if (
                  mouseX >= arrow.x &&
                  mouseX <= arrow.tox &&
                  mouseY >= arrow.y - this.tolerance &&
                  mouseY <= arrow.y + this.tolerance
               ) {
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = arrow;
                  }
               }
            }
         }
      };

      rectMap.forEach(checkRect);
      circleMap.forEach(checkCircle);
      textMap.forEach(checkText);
      arrows.forEach(arrow);

      const setDragging = (obj) => {
         obj.isDragging = true;
         obj.isActive = true;
         obj.offsetX = mouseX - obj.x;
         obj.offsetY = mouseY - obj.y;
      };

      if (!smallestRect && !smallestText && smallestCircle) {
         setDragging(smallestCircle);
         return;
      } else if (smallestRect && !smallestCircle && !smallestText) {
         setDragging(smallestRect);
      } else if (smallestText && !smallestCircle && !smallestRect) {
         setDragging(smallestText);
      } else if (arr && !smallestCircle && !smallestRect && !smallestText) {
         arr.isActive = true;
         arr.isDragging = true;
         arr.dragOffsetX = mouseX - arr.x;
         arr.dragOffsetY = mouseY - arr.y;
      } else if (arr && smallestRect && !smallestCircle && !smallestText) {
         if (smallestRect.x + smallestRect.width < Math.max(arr.x, arr.tox)) {
            setDragging(smallestRect);
         } else {
            arr.isActive = true;
            arr.isDragging = true;
            arr.dragOffsetX = mouseX - arr.x;
            arr.dragOffsetY = mouseY - arr.y;
         }
      } else if (smallestCircle && smallestRect && !smallestText) {
         if (
            2 * smallestCircle.xRadius * 2 * smallestCircle.yRadius <
            smallestRect.width * smallestRect.height
         ) {
            setDragging(smallestCircle);
            return;
         } else {
            setDragging(smallestRect);
            return;
         }
      } else if (!smallestCircle && smallestRect && smallestText) {
         if (
            smallestRect.width * smallestRect.height <
            smallestText.width * smallestText.height
         ) {
            setDragging(smallestRect);
            return;
         } else {
            setDragging(smallestText);
            return;
         }
      } else if (smallestCircle && !smallestRect && smallestText) {
         if (
            2 * smallestCircle.xRadius * 2 * smallestCircle.yRadius <
            smallestText.width * smallestText.height
         ) {
            setDragging(smallestCircle);
            return;
         } else {
            setDragging(smallestText);
            return;
         }
      }
   }
}

new Shapes();
export { Shapes, circleMap, rectMap, pencilMap, textMap, arrows };
