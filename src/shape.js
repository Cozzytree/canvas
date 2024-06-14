import {
   rectMap,
   circleMap,
   textMap,
   arrows,
   pencilMap,
   lineMap,
   breakpoints,
} from "./main";
import {
   breakPointsCtx,
   canvas,
   canvasBreakpoints,
   context,
   optionsContainer,
} from "./selectors";
import { Scale, config, scrollBar } from "./config";

export default class Shapes {
   constructor() {
      this.fillStyle = "rgba(0,0,0,0)";
      this.borderColor = "white";
      this.tolerance = 6;
      this.lineWidth = 1.7;
      // this.isDragging = false;
      this.isActive = false;
      // this.isResizing = false;
      // this.horizontelResizing = false;
      // this.verticalResizing = false;
      this.isDraggingOrResizing = false;
      this.resizeElement = null;
      this.dragElement = null;

      canvas.addEventListener("click", (e) => {
         if (
            config.mode === "pencil" ||
            config.mode === "line" ||
            config.mode === "arrowLine" ||
            config.mode === "text" ||
            config.mode === "circle" ||
            config.mode === "rect"
         )
            return;

         config.currentActive = null;

         const { x: clickX, y: clickY } = this.getTransformedMouseCoords(e);

         // Reset all shapes to inactive
         const allShapes = [
            ...rectMap.values(),
            ...circleMap.values(),
            ...arrows.values(),
            ...textMap.values(),
            ...lineMap.values(),
         ];
         allShapes.forEach((shape) => {
            shape.isActive = false;
         });

         let circle = null;
         let square = null;
         let text = null;
         let arrow = null;
         let minLine = null;

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
                  if (
                     arrow === null ||
                     Math.abs(arr.tox - arr.x) < Math.abs(arrow.tox - arrow.x)
                  ) {
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

         lineMap.forEach((l) => {
            const width = l.maxX - l.minX;

            if (
               clickX >= l.minX &&
               clickX <= l.maxX &&
               clickY >= l.minY &&
               clickY <= l.maxY
            ) {
               if (minLine === null || minLine.maxX - minLine.minX > width)
                  minLine = l;
            }
         });

         if (
            circle &&
            (!square || circle.xRadius * 2 < square.width) &&
            (!text || circle.xRadius * 2 < text.width)
         ) {
            config.currentActive = circle;
            circle.isActive = true;
         } else if (
            square &&
            (!circle || square.width < circle.xRadius * 2) &&
            (!text || square.width < text.width) &&
            (!minLine || square.width < minLine.maxX - minLine.minX)
         ) {
            config.currentActive = square;
            square.isActive = true;
         } else if (
            text &&
            (!circle || text.width < circle.xRadius * 2) &&
            (!square || text.width < square.width)
         ) {
            config.currentActive = text;
            text.isActive = true;
         } else if (
            arrow &&
            (!square || Math.abs(arrow.tox - arrow.x) < square.width)
         ) {
            config.currentActive = arrow;
            arrow.isActive = true;
         } else if (
            minLine &&
            (!square || minLine.maxX - minLine.minX < square.width)
         ) {
            config.currentActive = minLine;
            minLine.isActive = true;
         }
         if (config.currentActive) optionsContainer.classList.remove("hidden");
         else optionsContainer.classList.add("hidden");

         this.draw();
      });

      document.addEventListener("keydown", (e) => {
         if (e.ctrlKey && e.key === "a") {
            e.preventDefault();
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
                  if (arrow.endTo) {
                     const rect = rectMap.get(arrow.endTo);
                     const arc = circleMap.get(arrow.endTo);
                     const text = textMap.get(arrow.endTo);

                     if (arc) {
                        arc.pointTo = arc.pointTo.filter((a) => a !== key);
                     }
                     if (rect) {
                        rect.pointTo = rect.pointTo.filter((a) => a !== key);
                     }

                     if (text) {
                        text.pointTo = text.pointTo.filter((a) => a !== key);
                     }
                  }
                  if (arrow.startTo) {
                     const rect = rectMap.get(arrow.startTo);
                     const arc = circleMap.get(arrow.startTo);
                     const text = textMap.get(arrow.startTo);

                     if (arc) {
                        arc.pointTo = arc.pointTo.filter((a) => a !== key);
                     }
                     if (rect) {
                        rect.pointTo = rect.pointTo.filter((a) => a !== key);
                     }

                     if (text) {
                        text.pointTo = text.pointTo.filter((a) => a !== key);
                     }
                  }
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
      canvas.addEventListener("mousemove", this.mouseMove.bind(this));
      canvas.addEventListener("mouseup", this.mouseUp.bind(this));
   }

   draw() {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      const radius = 5; // Adjust the radius for the desired roundness

      context.save();
      context.translate(-scrollBar.scrollPositionX, -scrollBar.scrollPositionY);
      context.scale(Scale.scale, Scale.scale);
      context.lineWidth = this.lineWidth;
      context.fillStyle = "white";

      rectMap.forEach((rect) => {
         const x = rect.x;
         const y = rect.y;
         const width = rect.width;
         const height = rect.height;

         if (rect.isActive) {
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
         }
         context.beginPath();
         context.lineWidth = rect.lineWidth;
         context.strokeStyle = rect.borderColor;
         context.fillStyle = rect.fillStyle;
         context.moveTo(x + radius, y);
         context.arcTo(x + width, y, x + width, y + height, radius);
         context.arcTo(x + width, y + height, x, y + height, radius);
         context.arcTo(x, y + height, x, y, radius);
         context.arcTo(x, y, x + width, y, radius);
         context.closePath();
         context.fill();
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
         context.lineWidth = sphere.lineWidth;
         context.fillStyle = sphere.fillStyle;
         context.strokeStyle = sphere.borderColor;
         context.ellipse(
            sphere.x,
            sphere.y,
            sphere.xRadius,
            sphere.yRadius,
            0,
            0,
            2 * Math.PI
         );
         context.fill();
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
         context.fillStyle = t.fillStyle;
         context.font = `${t.size}px Arial`;
         let maxWidth = 0;
         let cumulativeHeight = 0;

         // Measure each string in the content array
         t.content.forEach((c) => {
            const textMetrics = context.measureText(c);
            maxWidth = Math.max(maxWidth, textMetrics.width);
            cumulativeHeight +=
               textMetrics.actualBoundingBoxAscent +
               textMetrics.actualBoundingBoxDescent;
         });

         // Store the measured dimensions
         t.width = maxWidth;
         t.height = cumulativeHeight + this.tolerance;

         let currentY = t.y;

         // Draw each string, adjusting the y coordinate

         t.content.forEach((c) => {
            const textMetrics = context.measureText(c);
            context.fillText(
               c,
               t.x,
               currentY + textMetrics.actualBoundingBoxAscent
            );
            currentY +=
               textMetrics.actualBoundingBoxAscent +
               textMetrics.actualBoundingBoxDescent +
               this.tolerance;
         });
      });

      //variables to be used when creating the arrow
      let headlen = 6;
      arrows.forEach((arrow) => {
         if (arrow.isActive) {
            context.strokeStyle = "rgb(2, 211, 134)";
            context.fillStyle = "rgb(2, 211, 134)"; // Color for active dots

            this.fourDots(
               { x: arrow.x, y: arrow.y },
               { x: arrow.tox, y: arrow.toy }
            );
         }

         context.beginPath();
         context.moveTo(arrow.x, arrow.y);
         context.strokeStyle = arrow.borderColor;
         context.lineWidth = arrow.lineWidth;

         if (Math.abs(arrow.x - arrow.tox) >= 100) {
            // Calculate the perpendicular point
            let midpointX = (arrow.tox - arrow.x) * 0.8;

            context.arcTo(
               arrow.x + midpointX,
               arrow.y,
               arrow.tox,
               arrow.toy,
               radius
            );
            // context.lineTo(arrow.x + midpointX, arrow.y);
            context.arcTo(
               arrow.x + midpointX,
               arrow.toy,
               arrow.tox,
               arrow.toy,
               radius
            );

            // Draw line from the midpoint to the endpoint
         } else {
            // If x is equal to tox, draw a straight line to the endpoint

            context.arcTo(arrow.x, arrow.toy, arrow.tox, arrow.toy, 10);
            // Draw a line from the end of the arc to (arrow.tox, arrow.toy)
         }
         // Draw the arrowhead
         context.lineTo(arrow.tox, arrow.toy);
         context.stroke();

         if (
            Math.max(arrow.x, arrow.tox) - Math.min(arrow.x, arrow.tox) <=
            20
         ) {
            context.beginPath();
            context.moveTo(arrow.tox, arrow.toy);
            if (arrow.toy < arrow.y) {
               //    context.arcTo();
               context.lineTo(arrow.tox - headlen, arrow.toy + headlen);
               context.lineTo(arrow.tox + headlen, arrow.toy + headlen);
            } else {
               context.lineTo(arrow.tox - headlen, arrow.toy - headlen);
               context.lineTo(arrow.tox + headlen, arrow.toy - headlen);
            }

            context.lineTo(arrow.tox, arrow.toy);
         } else if (arrow.x < arrow.tox) {
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

         context.stroke();
      });

      lineMap.forEach((line) => {
         if (line.isActive) {
            context.lineWidth = 3;
            context.fillStyle = "rgb(2, 211, 134)";
            context.strokeStyle = "rgb(2, 211, 134)";
            // this.fourDots(
            //    { x: line.x, y: line.y },
            //    { x: line.tox, y: line.toy }
            // );

            this.fourDots(...line.curvePoints);

            context.beginPath();
            context.strokeStyle = "blue";
            context.lineWidth = 1;
            context.moveTo(line.curvePoints[0].x, line.curvePoints[0].y);
            for (let i = 1; i < line.curvePoints.length; i++) {
               context.lineTo(line.curvePoints[i].x, line.curvePoints[i].y);
            }
            context.stroke();
            context.closePath();
         }

         context.beginPath();
         context.strokeStyle = line.borderColor;
         context.lineWidth = line.lineWidth;
         context.moveTo(line.curvePoints[0].x, line.curvePoints[0].y);

         if (line.isStraight) {
            context.lineTo(
               line.curvePoints[line.curvePoints.length - 1].x,
               line.curvePoints[line.curvePoints.length - 1].y
            );
         } else {
            // Start the path at the first point
            if (line.curvePoints.length <= 2) {
               context.lineTo(line.curvePoints[1].x, line.curvePoints[1].y);
            } else {
               for (let i = 1; i < line.curvePoints.length - 1; i++) {
                  const cp1 = line.curvePoints[i];
                  const cp2 = line.curvePoints[i + 1];

                  //   context.arcTo(cp1.x, cp1.y, cp2.x, cp2.y, 50);
                  // Calculate the weighted midpoint (e.g., 75% closer to cp2)
                  const t = 0.8; // Weighting factor, 0.5 for halfway, closer to 1 for closer to cp2
                  const midPointX = (1 - t) * cp1.x + t * cp2.x;
                  const midPointY = (1 - t) * cp1.y + t * cp2.y;

                  // Use cp1 as the control point and the adjusted midpoint as the end point
                  context.quadraticCurveTo(cp1.x, cp1.y, midPointX, midPointY);
               }
            }
         }
         context.stroke();
         context.closePath();
      });

      context.restore();
   }

   fourDots(...sides) {
      context.lineWidth = 1.7;
      for (let i = 0; i < sides.length; i++) {
         context.beginPath();
         context.fillStyle = "red";
         context.arc(sides[i].x, sides[i].y, 4, 0, 2 * Math.PI, false);
         context.fill();
         context.closePath();
      }
   }

   getTransformedMouseCoords(event) {
      const rect = canvas.getBoundingClientRect();
      const mouseX =
         (event.clientX - rect.left + scrollBar.scrollPositionX) / Scale.scale;
      const mouseY =
         (event.clientY - rect.top + scrollBar.scrollPositionY) / Scale.scale;
      return { x: mouseX, y: mouseY };
   }

   mouseDownDragAndResize(e) {
      if (config.mode === "pencil") return;
      let isResizing = false;

      const { x: mouseX, y: mouseY } = this.getTransformedMouseCoords(e);

      // rect resize
      rectMap.forEach((rect, key) => {
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
            this.isDraggingOrResizing = true;
            this.resizeElement = {
               direction: "horizontel",
               key,
            };
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
            this.resizeElement = {
               direction: "vertical",
               key,
            };
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
            this.resizeElement = {
               direction: "corners",
               key,
            };
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

      arrows.forEach((arrow, key) => {
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
            this.resizeElement = {
               direction: "resizeEnd",
               key,
            };
            isResizing = true;
         } else if (
            withinBounds(arrow.x, arrow.y, arrow.x, arrow.y, this.tolerance)
         ) {
            arrow.isActive = true;
            this.resizeElement = {
               direction: "resizeStart",
               key,
            };
            isResizing = true;
         }
      });

      if (isResizing) return;
      // sphere resize
      circleMap.forEach((arc, key) => {
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
            this.resizeElement = { direction: "horizontel", key };
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
            this.resizeElement = { direction: "vertical", key };
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
            this.resizeElement = { direction: "corners", key };
            isResizing = true;
         }
      });

      if (isResizing) return;

      lineMap.forEach((line, key) => {
         let points = line.curvePoints;
         for (let i = 0; i < points.length; i++) {
            if (
               mouseX >= points[i].x - 5 &&
               mouseX <= points[i].x + 5 &&
               mouseY >= points[i].y - 5 &&
               mouseY <= points[i].y + 5 &&
               line.isActive
            ) {
               line.isActive = true;
               if (i == 0) {
                  this.resizeElement = {
                     key,
                     direction: "resizeStart",
                  };
               } else if (i == points.length - 1) {
                  this.resizeElement = {
                     key,
                     direction: "resizeEnd",
                  };
               } else {
                  this.resizeElement = {
                     key,
                     direction: null,
                     index: i,
                  };
               }
            }
         }
      });
      if (isResizing) return;

      textMap.forEach((text, key) => {
         if (
            mouseX > text.x + text.width &&
            mouseX <= text.x + text.width + this.tolerance &&
            mouseY > text.y + text.height &&
            mouseY <= text.y + text.height + this.tolerance
         ) {
            isResizing = true;
            // text.isResizing = true;
            this.resizeElement = { key };
         }
      });

      if (isResizing) return;

      let smallestCircle = null;
      let smallestRect = null;
      let smallestText = null;
      let arr = null;
      let line = null;

      const checkRect = (rect, key) => {
         if (
            mouseX >= rect.x &&
            mouseX <= rect.x + rect.width &&
            mouseY >= rect.y &&
            mouseY <= rect.y + rect.height
         ) {
            if (smallestRect === null || rect.width < smallestRect.width) {
               smallestRect = { rect: rect, key };
            }
         }
      };

      const checkCircle = (sphere, key) => {
         const distance = Math.sqrt(
            (mouseX - sphere.x) ** 2 + (mouseY - sphere.y) ** 2
         );

         if (sphere.isActive) sphere.isActive = false;
         if (distance < sphere.xRadius && distance < sphere.yRadius) {
            if (
               smallestCircle === null ||
               sphere.xRadius < smallestCircle.xRadius
            ) {
               smallestCircle = { circle: sphere, key };
            }
         }
      };

      const checkText = (text, key) => {
         if (
            mouseX >= text.x &&
            mouseX <= text.x + text.width &&
            mouseY >= text.y &&
            mouseY <= text.y + text.height
         ) {
            if (smallestText === null || text.width < smallestText.width) {
               smallestText = { text, key };
            }
         }
      };

      const arrow = (arrow, key) => {
         if (arrow.endTo || arrow.startTo) {
            return (arr = null);
         }
         if (arrow.x < arrow.tox) {
            if (arrow.y > arrow.toy) {
               if (withinBounds(arrow.x, arrow.toy, arrow.tox, arrow.y)) {
                  if (
                     arr === null ||
                     Math.abs(arrow.tox - arrow.x) < Math.abs(arr.tox - arr.x)
                  ) {
                     arr = { arrow, key };
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
                     arr = { arrow, key };
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
                     arr = { arrow, key };
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
                     arr = { arrow, key };
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
                     arr = { arrow, key };
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
                     arr = { arrow, key };
                  }
               }
            }
         }
      };

      const simpleLine = (l, key) => {
         const width = l.maxX - l.minX;

         if (
            mouseX >= l.maxX &&
            mouseX <= l.maxX &&
            mouseY >= l.minY &&
            mouseY <= l.maxY
         ) {
            if (line === null || line.maxX - line.minX > width)
               line = { l, key };
         }
      };

      rectMap.forEach(checkRect);
      circleMap.forEach(checkCircle);
      textMap.forEach(checkText);
      arrows.forEach(arrow);
      lineMap.forEach(simpleLine);

      const setDragging = (obj) => {
         obj.isDragging = true;
         obj.isActive = true;
         obj.offsetX = mouseX - obj.x;
         obj.offsetY = mouseY - obj.y;
      };

      if (
         smallestCircle &&
         (!smallestRect ||
            smallestCircle?.circle.xRadius * 2 < smallestRect?.rect.width) &&
         (!smallestText ||
            smallestCircle?.circle.xRadius * 2 < smallestText?.text.width)
      ) {
         setDragging(smallestCircle.circle);
         this.dragElement = smallestCircle.key;
      } else if (
         smallestRect &&
         (!smallestCircle ||
            smallestRect?.rect.width < smallestCircle?.circle.xRadius * 2) &&
         (!smallestText ||
            smallestRect?.rect.width < smallestText?.text.width) &&
         (!line || smallestRect?.rect.width < line?.l.maxX - line?.l.minX)
      ) {
         setDragging(smallestRect.rect);
         this.dragElement = smallestRect.key;
      } else if (
         line &&
         (!smallestRect || line.l.maxX - line.l.minX < smallestRect?.rect.width)
      ) {
         setDragging(line.l);
         this.dragElement = line.key;
      } else if (smallestText) {
         setDragging(smallestText.text);
         this.dragElement = smallestText.key;
      } else if (arr) {
         setDragging(arr.arrow);
         this.dragElement = arr.key;
      } else if (line) {
         if (line.isActive) return;
         line.offsetX = mouseX - line.x;
         line.offsetY = mouseY - line.y;
         setDragging(line);
      }
   }

   mouseMove(e) {
      if (config.mode === "pencil") return;

      if (!this.resizeElement && !this.dragElement) return;
      const { x: mouseX, y: mouseY } = this.getTransformedMouseCoords(e);

      let rectResize = rectMap.get(this.resizeElement?.key);
      let circleResize = circleMap.get(this.resizeElement?.key);
      let arrowResize = arrows.get(this.resizeElement?.key);
      let textResize = textMap.get(this.resizeElement?.key);
      let lineResize = lineMap.get(this.resizeElement?.key);

      if (rectResize) {
         if (this.resizeElement.direction === "horizontel") {
            const oldPosition = rectResize.x + rectResize.width;
            const newX = mouseX > rectResize.x ? rectResize.x : mouseX;

            rectResize.x = newX;
            if (mouseX < oldPosition) {
               rectResize.width = Math.abs(oldPosition - mouseX);
            } else if (mouseX > oldPosition)
               rectResize.width = Math.abs(mouseX - rectResize.x); // Adjust width when mouseX is below rect.x

            // rect.width = Math.abs(mouseX - rect.x); // Adjust width normally when mouseX is to the right
         } else if (this.resizeElement.direction === "vertical") {
            const oldPosition = rectResize.y + rectResize.height;
            const newY = mouseY > rectResize.y ? rectResize.y : mouseY;

            rectResize.y = newY;
            if (mouseY < oldPosition) {
               {
                  rectResize.height = Math.abs(oldPosition - mouseY);
               }
            } else if (mouseY > oldPosition) {
               rectResize.height = Math.abs(mouseY - rectResize.y);
            }
         } else {
            rectResize.isActive = true;
            rectResize.width = Math.abs(mouseX - rectResize.x);
            rectResize.height = Math.abs(mouseY - rectResize.y);
         }
         this.draw();
      } else if (circleResize) {
         if (this.resizeElement.direction === "horizontel") {
            circleResize.isActive = true;
            circleResize.xRadius = Math.abs(mouseX - circleResize.x);
         } else if (this.resizeElement.direction === "vertical") {
            circleResize.isActive = true;
            circleResize.yRadius = Math.abs(mouseY - circleResize.y);
         } else {
            circleResize.isActive = true;
            circleResize.xRadius = Math.abs(mouseX - circleResize.x);
            circleResize.yRadius = Math.abs(mouseY - circleResize.y);
         }
         this.draw();
      } else if (arrowResize) {
         if (this.resizeElement.direction === "resizeStart") {
            arrowResize.x = mouseX;
            arrowResize.y = mouseY;
         } else {
            arrowResize.tox = mouseX;
            arrowResize.toy = mouseY;
         }
         this.draw();
      } else if (textResize) {
         textResize.size = Math.max(10, mouseY - textResize.y); // Ensure minimum size
         this.draw();
      } else if (lineResize) {
         if (this.resizeElement.direction === null) {
            lineResize.curvePoints[this.resizeElement.index].x = mouseX;
            lineResize.curvePoints[this.resizeElement.index].y = mouseY;
            if (mouseX > lineResize.maxX) {
               lineResize.maxX = mouseX;
            }
            if (mouseX < lineResize.minX) {
               lineResize.minX = mouseX;
            }
            if (mouseY > lineResize.maxY) {
               lineResize.maxY = mouseY;
            }
            if (mouseY < lineResize.minY) {
               lineResize.minY = mouseY;
            }

            this.draw();
         } else if (this.resizeElement.direction === "resizeStart") {
            lineResize.curvePoints[0].x = mouseX;
            lineResize.curvePoints[0].y = mouseY;
            if (mouseX > lineResize.maxX) {
               lineResize.maxX = mouseX;
            }
            if (mouseX < lineResize.minX) {
               lineResize.minX = mouseX;
            }
            if (mouseY > lineResize.maxY) {
               lineResize.maxY = mouseY;
            }
            if (mouseY < lineResize.minY) {
               lineResize.minY = mouseY;
            }

            this.draw();
         } else {
            lineResize.curvePoints[lineResize.curvePoints.length - 1].x =
               mouseX;
            lineResize.curvePoints[lineResize.curvePoints.length - 1].y =
               mouseY;
            if (mouseX > lineResize.maxX) {
               lineResize.maxX = mouseX;
            }
            if (mouseX < lineResize.minX) {
               lineResize.minX = mouseX;
            }
            if (mouseY > lineResize.maxY) {
               lineResize.maxY = mouseY;
            }
            if (mouseY < lineResize.minY) {
               lineResize.minY = mouseY;
            }

            this.draw();
         }
      }

      if (rectResize || circleResize || arrowResize || textResize) return;

      let rect = rectMap.get(this.dragElement);
      let arc = circleMap.get(this.dragElement);
      let arrow = arrows.get(this.dragElement);
      let text = textMap.get(this.dragElement);

      if (rect) {
         rect.isActive = true;
         rect.x = mouseX - rect.offsetX;
         rect.y = mouseY - rect.offsetY;

         this.showGuides(rect.x, rect.y, this.dragElement, rect);

         if (rect.pointTo.length > 0) {
            let arc = [];
            let line = [];
            let arrowEndRect = [];
            let arrowStartRect = [];

            rect.pointTo.forEach((a) => {
               let arr = arrows.get(a);
               let l = lineMap.get(a);

               if (arr) arc.push(arr);

               if (l) line.push(l);
            });

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

            if (line.length > 0) {
               line.forEach((l) => {
                  let start = rectMap.get(l.startTo);
                  let end = rectMap.get(l.endTo);
                  if (start) {
                     arrowStartRect.push(start);
                  }
                  if (end) {
                     arrowEndRect.push(end);
                  }
               });
            }

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

                     line.forEach((l) => {
                        if (rectMap.get(l.startTo) === rect) {
                           if (l.toy < rect.y) {
                              l.x =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.y = rect.y;
                           } else if (
                              l.toy >= rect.y &&
                              l.toy <= rect.y + rect.height
                           ) {
                              if (l.tox > rect.x) {
                                 l.x = rect.x + rect.width;
                              } else l.x = rect.x;

                              l.y =
                                 rect.y + (rect.y + rect.height - rect.y) * 0.5;
                           } else {
                              l.x =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.y = rect.y + rect.height;
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

                     line.forEach((l) => {
                        if (rectMap.get(l.endTo) === rect) {
                           if (l.y < rect.y) {
                              l.tox =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.toy = rect.y;
                           } else if (
                              l.y >= rect.y &&
                              l.y <= rect.y + rect.height
                           ) {
                              if (
                                 l.x <
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5
                              ) {
                                 l.tox = rect.x;
                              } else {
                                 l.tox = rect.x + rect.width;
                              }
                              l.toy =
                                 rect.y + (rect.y + rect.height - rect.y) * 0.5;
                           } else {
                              l.tox =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.toy = rect.y + rect.height;
                           }
                        }
                     });
                  }
               });
            }
         }
         this.draw();
      } else if (arc) {
         arc.isActive = true;
         arc.x = mouseX - arc.offsetX;
         arc.y = mouseY - arc.offsetY;
         this.showGuides(
            arc.x - arc.xRadius,
            arc.y - arc.yRadius,
            this.dragElement,
            arc
         );
         if (arc.pointTo.length > 0) {
            let arrow = [];
            let line = [];
            let arrowStartSphere = [];
            let arrowEndSphere = [];
            arc.pointTo.forEach((a) => {
               let arr = arrows.get(a);
               let l = lineMap.get(a);
               if (arr) arrow.push(arr);
               if (l) line.push(l);
            });
            arrow.forEach((a) => {
               let start = circleMap.get(a.startTo);
               let end = circleMap.get(a.endTo);
               if (start) {
                  arrowStartSphere.push(start);
               }
               if (end) {
                  arrowEndSphere.push(end);
               }
            });
            line.forEach((l) => {
               let start = circleMap.get(l.startTo);
               let end = circleMap.get(l.endTo);
               if (start) {
                  arrowStartSphere.push(start);
               }
               if (end) {
                  arrowEndSphere.push(end);
               }
            });
            if (arrowStartSphere.length > 0) {
               arrowStartSphere.forEach((ar) => {
                  if (ar == arc) {
                     arrow.forEach((a) => {
                        if (circleMap.get(a.startTo) === arc) {
                           if (
                              a.tox >= arc.x - arc.xRadius &&
                              a.tox <= arc.x + arc.xRadius
                           ) {
                              a.x = arc.x;
                              if (a.toy < a.y) {
                                 a.y = arc.y - arc.yRadius;
                              } else {
                                 a.y = arc.y + arc.yRadius;
                              }
                           } else if (a.x < a.tox) {
                              a.x = arc.x + arc.xRadius;
                              a.y = arc.y;
                           } else {
                              a.x = arc.x - arc.xRadius;
                              a.y = arc.y;
                           }
                        }
                     });
                     line.forEach((l) => {
                        if (circleMap.get(l.startTo) === arc) {
                           if (l.toy < arc.y - arc.yRadius) {
                              l.x = arc.x;
                              l.y = arc.y - arc.yRadius;
                           } else if (
                              l.toy > arc.y - arc.yRadius &&
                              l.toy < arc.y + arc.yRadius
                           ) {
                              if (l.tox < arc.x - arc.xRadius) {
                                 l.x = arc.x - arc.xRadius;
                              } else {
                                 l.x = arc.x + arc.xRadius;
                              }
                              l.y = arc.y;
                           } else {
                              l.y = arc.y + arc.yRadius;
                              l.x = arc.x;
                           }
                        }
                     });
                  }
               });
            }
            if (arrowEndSphere.length > 0) {
               arrowEndSphere.forEach((ar) => {
                  if (ar == arc) {
                     arrow.forEach((a) => {
                        if (circleMap.get(a.endTo) === arc) {
                           if (
                              a.x >= arc.x - arc.xRadius &&
                              a.x <= arc.x + arc.xRadius
                           ) {
                              // a.x is within the horizontal bounds of the circle
                              if (a.y <= arc.y) {
                                 // a is above the circle
                                 a.tox = arc.x;
                                 a.toy = arc.y - arc.yRadius; // Top of the circle
                              } else {
                                 // a is below the circle
                                 a.tox = arc.x;
                                 a.toy = arc.y + arc.yRadius; // Bottom of the circle
                              }
                           } else if (a.x < arc.x - arc.xRadius) {
                              // a.x is to the left of the circle
                              a.tox = arc.x - arc.xRadius;
                              a.toy = arc.y;
                           } else {
                              // a.x is to the right of the circle
                              a.tox = arc.x + arc.xRadius;
                              a.toy = arc.y;
                           }
                        }
                     });
                     line.forEach((l) => {
                        if (circleMap.get(l.endTo) === arc) {
                           if (l.y < arc.y - arc.yRadius) {
                              l.tox = arc.x;
                              l.toy = arc.y - arc.yRadius;
                           } else if (
                              l.y > arc.y - arc.yRadius &&
                              l.y < arc.y + arc.yRadius
                           ) {
                              if (l.x < arc.x) {
                                 l.tox = arc.x - arc.xRadius;
                              } else l.tox = arc.x + arc.xRadius;
                              l.toy = arc.y;
                           } else {
                              l.tox = arc.x;
                              l.toy = arc.y + arc.yRadius;
                           }
                        }
                     });
                  }
               });
            }
         }
         this.draw();
      }
      if (arrow) {
         const deltaX = mouseX - arrow.offsetX;
         const deltaY = mouseY - arrow.offsetY;
         const diffX = arrow.tox - arrow.x;
         const diffY = arrow.toy - arrow.y;

         arrow.x = deltaX;
         arrow.y = deltaY;
         arrow.tox = deltaX + diffX;
         arrow.toy = deltaY + diffY;
         this.draw();
      }
      if (text) {
         text.x = mouseX - text.offsetX;
         text.y = mouseY - text.offsetY;
         if (text.pointTo.length > 0) {
            let arcs = text.pointTo.map((t) => {
               return arrows.get(t);
            });
            let arrowStart = [];
            let arrowEnd = [];

            arcs.forEach((a) => {
               let start = textMap.get(a.startTo);
               let end = textMap.get(a.endTo);
               if (start) {
                  arrowStart.push(start);
               }
               if (end) {
                  arrowEnd.push(end);
               }
            });

            if (arrowStart.length > 0) {
               arrowStart.forEach((ar) => {
                  if (ar === text) {
                     arcs.forEach((a) => {
                        if (textMap.get(a.startTo) === text) {
                           if (a.toy < a.y) {
                              a.y = text.y - this.tolerance;
                           } else a.y = text.y + text.height + this.tolerance;

                           a.x = text.x + (text.width + text.x - text.x) * 0.5;
                        }
                     });
                  }
               });
            }

            if (arrowEnd.length > 0) {
               arrowEnd.forEach((ar) => {
                  if (ar === text) {
                     arcs.forEach((a) => {
                        if (textMap.get(a.endTo) === text) {
                           if (a.y < a.toy) {
                              a.tox =
                                 text.x + (text.width + text.x - text.x) * 0.5;
                              a.toy = text.y - this.tolerance;
                           } else {
                              a.tox =
                                 text.x + (text.width + text.x - text.x) * 0.5;
                              a.toy = text.y + text.height + this.tolerance;
                           }
                        }
                     });
                  }
               });
            }
         }
         this.draw();
      }

      // line resize
      lineMap.forEach((line) => {
         if (line.isDragging) {
            const deltaX = mouseX - line.offsetX;
            const deltaY = mouseY - line.offsetY;
            const diffX = line.tox - line.x;
            const diffY = line.toy - line.y;

            line.x = deltaX;
            line.y = deltaY;
            line.tox = deltaX + diffX;
            line.toy = deltaY + diffY;
         }
         if (line.isResizingStart) {
            line.isActive = true;
            line.x = mouseX;
            line.y = mouseY;
         } else if (line.isResizingEnd) {
            line.isActive = true;
            line.tox = mouseX;
            line.toy = mouseY;
         }
      });
   }

   mouseUp(e) {
      if (config.mode === "pencil") return;

      canvas.removeEventListener("mousemove", this.mouseMove.bind(this));
      // const { x: mouseX, y: mouseY } = this.getTransformedMouseCoords(e);

      const arrow = arrows.get(this.resizeElement?.key);
      const rect = rectMap.get(this.resizeElement?.key);

      if (arrow) {
         if (this.resizeElement?.direction === "resizeEnd") {
            if (arrow.endTo) {
               const {
                  rect: theRect,
                  sphere: theArc,
                  text,
               } = this.getShape(arrow.startTo);

               if (text && text.pointTo.length > 0) {
                  if (
                     arrow.tox < text.x ||
                     arrow.tox > text.x + text.width ||
                     arrow.toy < text.y ||
                     arrow.toy > text.y + text.height
                  ) {
                     arrow.endTo = null;
                     text.pointTo.filter((t) => t !== this.resizeElement?.key);
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
                     theRect.pointTo.filter(
                        (p) => p !== this.resizeElement?.key
                     );
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
                     theArc.pointTo.filter(
                        (p) => p !== this.resizeElement?.key
                     );
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
                        if (r === this.resizeElement?.key) return;
                        else {
                           rect.pointTo.push(this.resizeElement?.key);
                           arrow.endTo = rectKey;
                        }
                     });
                  } else {
                     rect.pointTo.push(this.resizeElement?.key);
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
                        if (a === this.resizeElement?.key) return;
                        else {
                           arc.pointTo.push(this.resizeElement?.key);
                           arrow.endTo = arckey;
                        }
                     });
                  } else {
                     arc.pointTo.push(this.resizeElement?.key);
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
                  t.pointTo.push(this.resizeElement?.key);
               }
            });
         } else if (this.resizeElement?.direction === "resizeStart") {
            if (arrow.startTo) {
               const {
                  rect: theRect,
                  sphere: theArc,
                  text: theText,
               } = this.getShape(arrow.startTo);

               if (theRect && theRect.pointTo.length > 0) {
                  if (
                     arrow.x < theRect.x ||
                     arrow.x > theRect.x + theRect.width ||
                     arrow.y < theRect.y ||
                     arrow.y > theRect.y + theRect.width
                  ) {
                     arrow.startTo = null;
                     // theRect.pointTo = null;
                     theRect.pointTo.filter(
                        (p) => p !== this.resizeElement?.key
                     );
                  }
               }

               if (theArc && theArc.pointTo.length > 0) {
                  const parameter = Math.sqrt(
                     (arrow.x - theArc.x) ** 2 + (arrow.toy - theArc.y) ** 2
                  );
                  if (
                     parameter > theArc.xRadius &&
                     parameter > theArc.yRadius
                  ) {
                     arrow.startTo = null;
                     theArc.pointTo.filter(
                        (p) => p !== this.resizeElement?.key
                     );
                  }
               }

               if (theText && theText.pointTo.length > 0) {
                  if (
                     arrow.tox < theText.x ||
                     arrow.tox > theText.x + theText.width ||
                     arrow.toy < theText.y ||
                     arrow.toy > theText.y + theText.height
                  ) {
                     arrow.startTo = null;
                     theText.pointTo.filter(
                        (t) => t !== this.resizeElement?.key
                     );
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
                  if (arrow.endTo === rectKey) return;
                  rect.pointTo.push(this.resizeElement?.key);
                  arrow.startTo = rectKey;
               }
            });
            circleMap.forEach((arc, arcKey) => {
               const parameter = Math.sqrt(
                  (arrow.x - arc.x) ** 2 + (arrow.y - arc.y) ** 2
               );
               if (parameter < arc.xRadius && parameter < arc.yRadius) {
                  if (arrow.endTo === arcKey) return;
                  arrow.startTo = arcKey;
                  arc.pointTo.push(this.resizeElement?.key);
               }
            });
            textMap.forEach((text, textKey) => {
               if (
                  arrow.x >= text.x - this.tolerance &&
                  arrow.x <= text.x + text.width + this.tolerance &&
                  arrow.y >= text.y - this.tolerance &&
                  arrow.y <= text.y + text.height + this.tolerance
               ) {
                  if (arrow.endTo === textKey) return;
                  text.pointTo.push(this.resizeElement?.key);
                  arrow.startTo = textKey;
               }
            });
         }
      }
      if (rect) {
         rect.isActive = true;
         this.draw();
      }

      lineMap.forEach((line, key) => {
         if (line.isDragging) {
            line.isDragging = false;
         }
         if (line.isResizingStart) {
            line.isResizingStart = false;

            if (line.startTo) {
               const { rect, sphere, text } = this.getShape(line.startTo);

               if (rect && rect.pointTo.length > 0) {
                  if (
                     line.x < rect.x ||
                     line.x > rect.x + rect.width ||
                     line.y < rect.y ||
                     line.y > rect.y + rect.height
                  ) {
                     rect.pointTo.filter((r) => {
                        return r !== key;
                     });
                     line.startTo = null;
                  }
               }

               if (sphere && sphere.pointTo.length > 0) {
                  const distance = Math.sqrt(
                     (line.x - sphere.x) ** 2 - (line.y - sphere.y) ** 2
                  );
                  if (distance > sphere.xRadius || distance > sphere.yRadius) {
                     sphere.pointTo.filter((s) => s !== key);
                     line.startTo = null;
                  }
               }
            }

            rectMap.forEach((rect, rectKey) => {
               if (
                  line.x >= rect.x - this.tolerance &&
                  line.x <= rect.x + rect.width + this.tolerance &&
                  line.y >= rect.y - this.tolerance &&
                  line.y <= rect.y + rect.height + this.tolerance
               ) {
                  let end = rectMap.get(line.endTo);
                  if (end === rect) return;

                  rect.pointTo.push(key);
                  line.startTo = rectKey;
               }
            });
            circleMap.forEach((circle, circleKey) => {
               const distance = Math.sqrt(
                  (line.x - circle.x) ** 2 - (line.y - circle.y) ** 2
               );
               if (distance < circle.xRadius && distance < circle.yRadius) {
                  if (circleKey === line.endTo) return;
                  circle.pointTo.push(key);
                  line.startTo = circleKey;
               }
            });
         } else if (line.isResizingEnd) {
            line.isResizingEnd = false;

            if (line.endTo) {
               const { rect, sphere, text } = this.getShape(line.startTo);
               if (rect && rect.pointTo.length > 0) {
                  if (
                     line.tox < rect.x ||
                     line.tox > rect.x + rect.width ||
                     line.toy < rect.y ||
                     line.toy > rect.y + rect.height
                  ) {
                     rect.pointTo.filter((r) => {
                        return r !== key;
                     });
                     line.endTo = null;
                  }
               }

               if (sphere && sphere.pointTo.length > 0) {
                  const distance = Math.sqrt(
                     (line.tox - circle.x) ** 2 - (line.toy - circle.y) ** 2
                  );
                  if (distance > sphere.xRadius || distance > sphere.yRadius) {
                     sphere.pointTo.filter((s) => s !== key);
                     line.endTo = null;
                  }
               }
            }

            rectMap.forEach((rect, rectKey) => {
               if (
                  line.tox >= rect.x - this.tolerance &&
                  line.toy <= rect.x + rect.width + this.tolerance &&
                  line.toy >= rect.y - this.tolerance
                  //   line.y <= rect.y + rect.headlen + this.tolerance
               ) {
                  let start = rectMap.get(line.startTo);
                  if (start === rect) return;
                  rect.pointTo.push(key);
                  line.endTo = rectKey;
               }
            });
            circleMap.forEach((circle, circleKey) => {
               const distance = Math.sqrt(
                  (line.tox - circle.x) ** 2 - (line.toy - circle.y) ** 2
               );

               if (distance < circle.xRadius && distance < circle.yRadius) {
                  if (circleKey === line.startTo) return;
                  circle.pointTo.push(key);
                  line.endTo = circleKey;
               }
            });
         }
      });

      const rectDrag = rectMap.get(this?.dragElement);
      const arcDrag = circleMap.get(this?.dragElement);

      if (rectDrag) {
         this.updateGuides(
            this.dragElement,
            rectDrag.x,
            rectDrag.y,
            rectDrag.x + rectDrag.width,
            rectDrag.y + rectDrag.height
         );
      } else if (arcDrag) {
         this.updateGuides(
            this.dragElement,
            arcDrag.x - arcDrag.xRadius,
            arcDrag.y - arcDrag.yRadius,
            arcDrag.x + arcDrag.xRadius,
            arcDrag.y + arcDrag.yRadius
         );
      }
      breakPointsCtx.clearRect(
         0,
         0,
         canvasBreakpoints.width,
         canvasBreakpoints.height
      );
      this.resizeElement = null;
      this.dragElement = null;
   }

   showGuides(x, y, key, object) {
      // Clear the entire canvas
      breakPointsCtx.clearRect(
         0,
         0,
         canvasBreakpoints.width,
         canvasBreakpoints.height
      );

      breakPointsCtx.save();
      breakPointsCtx.translate(
         -scrollBar.scrollPositionX,
         -scrollBar.scrollPositionY
      );
      breakPointsCtx.lineWidth = 1.2;
      breakPointsCtx.strokeStyle = "red";

      // Variable to track if a guide is drawn
      let guideDrawn = false;
      breakPointsCtx.beginPath();
      breakpoints.forEach((point, pointKey) => {
         if (key !== pointKey) {
            if (Math.abs(point.minX - x) <= this.tolerance) {
               object.x =
                  object.type === "sphere"
                     ? point.minX + object.xRadius
                     : point.minX;

               breakPointsCtx.moveTo(point.minX, y);
               breakPointsCtx.lineTo(point.minX, point.minY);
               guideDrawn = true;
            } else if (Math.abs(point.maxX - x) <= this.tolerance) {
               object.x =
                  object.type === "sphere"
                     ? point.maxX + object.xRadius
                     : point.maxX;

               breakPointsCtx.moveTo(point.maxX, y);
               breakPointsCtx.lineTo(point.maxX, point.minY);
               guideDrawn = true;
            } else if (Math.abs(point.minY - y) <= this.tolerance) {
               object.y =
                  object.type === "sphere"
                     ? point.minY + object.yRadius
                     : point.minY;

               breakPointsCtx.moveTo(point.minX, point.minY);
               breakPointsCtx.lineTo(x, point.minY);
               guideDrawn = true;
            } else if (Math.abs(point.maxY - y) <= this.tolerance) {
               object.y =
                  object.type === "sphere"
                     ? point.maxY + object.yRadius
                     : point.maxY;
               breakPointsCtx.moveTo(point.minX, point.maxY);
               breakPointsCtx.lineTo(x, point.maxY);
               guideDrawn = true;
            }
         }
      });

      // Only stroke if a guide was drawn
      if (guideDrawn) {
         breakPointsCtx.stroke();
      }

      breakPointsCtx.closePath();
      breakPointsCtx.restore();
   }

   updateGuides(key, x, y, width, height) {
      const adjust = breakpoints.get(key);
      adjust.minX = x;
      adjust.minY = y;
      adjust.maxX = width;
      adjust.maxY = height;
   }

   getShape(key) {
      const rect = rectMap.get(key);
      const sphere = circleMap.get(key);
      const text = textMap.get(key);
      return { rect, sphere, text };
   }
}

export const shape = new Shapes();
