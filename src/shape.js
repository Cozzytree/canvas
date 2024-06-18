import {
   rectMap,
   circleMap,
   textMap,
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
      this.isActive = false;
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
            ...textMap.values(),
            ...lineMap.values(),
         ];
         allShapes.forEach((shape) => {
            shape.isActive = false;
         });

         let circle = null;
         let square = null;
         let text = null;
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

         lineMap.forEach((l) => {
            // const curvedPoints = l.curvePoints;
            // for (let i = 0; i < curvedPoints.length - 1; i++) {
            //    const x1 = curvedPoints[i].x;
            //    const y1 = curvedPoints[i].y;
            //    const x2 = curvedPoints[i + 1].x;
            //    const y2 = curvedPoints[i + 1].y;

            //    const distance = this.pointToSegmentDistance(
            //       clickX,
            //       clickY,
            //       x1,
            //       y1,
            //       x2,
            //       y2
            //    );

            //    if (distance <= this.tolerance) {
            //       minLine = l;
            //    }
            // }
            const width = l.maxX - l.minX;
            let horizontelParams =
               width < 5 ? -this.tolerance : +this.tolerance;
            let verticalParams =
               l.maxY - l.minY < 5 ? -this.tolerance : +this.tolerance;

            if (
               clickX >= l.minX + horizontelParams &&
               clickX <= l.maxX - horizontelParams &&
               clickY >= l.minY + verticalParams &&
               clickY <= l.maxY - verticalParams
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
            this.draw();
         }
      });

      document.addEventListener("keydown", (e) => {
         if (e.key === "Delete") {
            //remove selected square
            rectMap.forEach((rect, key) => {
               if (rect.isActive) {
                  rectMap.delete(key);
                  breakpoints.delete(key);
               }
            });

            lineMap.forEach((line, key) => {
               if (line.isActive) {
                  if (line.startTo) {
                     const { rect, text, sphere } = this.getShape(line.startTo);
                     if (rect) {
                        rect.pointTo.filter((r) => r !== key);
                     }
                     if (text) {
                        text.pointTo.filter((r) => r !== key);
                     }
                     if (sphere) {
                        sphere.pointTo.filter((r) => r !== key);
                     }
                  } else if (line.endTo) {
                     const { rect, text, sphere } = this.getShape(line.endTo);

                     if (rect) {
                        rect.pointTo.filter((r) => r !== key);
                     }
                     if (text) {
                        text.pointTo.filter((r) => r !== key);
                     }
                     if (sphere) {
                        sphere.pointTo.filter((r) => r !== key);
                     }
                  }
                  lineMap.delete(key);
               }
            });

            //remove selected arcs
            circleMap.forEach((arc, key) => {
               if (arc.isActive) {
                  circleMap.delete(key);
                  breakpoints.delete(key);
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
         context.font = `${t.size}px ${t.font || "Arial"}`;
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

      lineMap.forEach((line) => {
         if (line.isActive) {
            context.lineWidth = 3;
            context.fillStyle = "rgb(2, 211, 134)";
            context.strokeStyle = "rgb(2, 211, 134)";

            this.fourDots(...line.curvePoints);

            if (!line.lineType || line.lineType === "straight") {
               context.beginPath();
               context.lineWidth = 1;
               context.moveTo(line.curvePoints[0].x, line.curvePoints[0].y);
               for (let i = 1; i < line.curvePoints.length; i++) {
                  context.lineTo(line.curvePoints[i].x, line.curvePoints[i].y);
               }
               context.stroke();
               context.closePath();
            }
         } else {
            context.strokeStyle = line.borderColor;
         }

         context.beginPath();
         context.lineWidth = line.lineWidth;
         context.moveTo(line.curvePoints[0].x, line.curvePoints[0].y);

         if (line.lineType === "straight") {
            for (let i = 0; i < line.curvePoints.length; i++) {
               context.lineTo(line.curvePoints[i].x, line.curvePoints[i].y);
            }
         } else if (line.lineType === "elbow") {
            const headlen = 8;

            context.lineWidth = line.lineWidth;

            // if (
            //    Math.abs(line.curvePoints[0].x - line.curvePoints[1].x) >= 100
            // ) {
            //    // Calculate the perpendicular point
            //    let midpointX =
            //       (line.curvePoints[1].x - line.curvePoints[0].x) * 0.8;

            //    context.arcTo(
            //       line.curvePoints[0].x + midpointX,
            //       line.curvePoints[0].y,
            //       line.curvePoints[1].x,
            //       line.curvePoints[1].y,
            //       radius
            //    );
            //    // context.lineTo(arrow.x + midpointX, arrow.y);
            //    context.arcTo(
            //       line.curvePoints[0].x + midpointX,
            //       line.curvePoints[1].y,
            //       line.curvePoints[1].x,
            //       line.curvePoints[1].y,
            //       radius
            //    );

            //    // Draw line from the midpoint to the endpoint
            // } else {
            //    // If x is equal to tox, draw a straight line to the endpoint

            context.arcTo(
               line.curvePoints[1].x,
               line.curvePoints[0].y,
               line.curvePoints[1].x,
               line.curvePoints[1].y,
               5
            );
            // Draw a line from the end of the arc to (arrow.tox, arrow.toy)
            // }
            context.lineTo(line.curvePoints[1].x, line.curvePoints[1].y);
            context.stroke();

            // Draw the arrowhead
            const lastPoint = line.curvePoints[line.curvePoints.length - 1];
            const firstPoint = line.curvePoints[0];

            // arrow back side
            context.beginPath();
            if (firstPoint.y === lastPoint.y) {
               if (firstPoint.x < lastPoint.x) {
                  // Draw the first side of the arrowhead
                  context.moveTo(lastPoint.x, lastPoint.y);
                  context.lineTo(lastPoint.x - headlen, lastPoint.y - 5);
                  context.stroke();
                  context.closePath();

                  // Draw the second side of the arrowhead
                  context.beginPath();
                  context.moveTo(lastPoint.x, lastPoint.y);
                  context.lineTo(lastPoint.x - headlen, lastPoint.y + 5);
               } else {
                  // Draw the first side of the arrowhead
                  context.moveTo(lastPoint.x, lastPoint.y);
                  context.lineTo(lastPoint.x + headlen, lastPoint.y - 5);
                  context.stroke();
                  context.closePath();

                  // Draw the second side of the arrowhead
                  context.beginPath();
                  context.moveTo(lastPoint.x, lastPoint.y);
                  context.lineTo(lastPoint.x + headlen, lastPoint.y + 5);
               }
            } else if (firstPoint.y < lastPoint.y) {
               // Draw the first side of the arrowhead
               context.moveTo(lastPoint.x, lastPoint.y);
               context.lineTo(lastPoint.x + headlen, lastPoint.y - 5);
               context.stroke();
               context.closePath();

               // Draw the second side of the arrowhead
               context.beginPath();
               context.moveTo(lastPoint.x, lastPoint.y);
               context.lineTo(lastPoint.x - headlen, lastPoint.y - 5);
            } else if (firstPoint.y > lastPoint.y) {
               // Draw the first side of the arrowhead
               context.moveTo(lastPoint.x, lastPoint.y);
               context.lineTo(lastPoint.x + 5, lastPoint.y + 5);
               context.stroke();
               context.closePath();

               // Draw the second side of the arrowhead
               context.beginPath();
               context.moveTo(lastPoint.x, lastPoint.y);
               context.lineTo(lastPoint.x - headlen, lastPoint.y + 5);
            }

            // arrow front
            context.stroke();
            context.closePath();
         } else {
            // Start the path at the first point
            if (line.curvePoints.length <= 2) {
               context.lineTo(line.curvePoints[1].x, line.curvePoints[1].y);
            } else {
               for (let i = 1; i < line.curvePoints.length - 1; i++) {
                  const cp1 = line.curvePoints[i];
                  const cp2 = line.curvePoints[i + 1];

                  // Calculate the weighted midpoint (e.g., 80% closer to cp2)
                  const t = 0.8; // Weighting factor, 0.5 for halfway, closer to 1 for closer to cp2
                  const midPointX = (1 - t) * cp1.x + t * cp2.x;
                  const midPointY = (1 - t) * cp1.y + t * cp2.y;

                  // Use cp1 as the control point and the adjusted midpoint as the end point
                  context.quadraticCurveTo(cp1.x, cp1.y, midPointX, midPointY);
               }
               // Drawing the last segment to the last point
               let lastPoint = line.curvePoints[line.curvePoints.length - 1];
               context.lineTo(lastPoint.x, lastPoint.y);
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
         context.fillStyle = "green";
         context.arc(sides[i].x, sides[i].y, 6, 0, 2 * Math.PI, false);
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

               isResizing = true;
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

      const simpleLine = (l, key) => {
         const width = l.maxX - l.minX;
         let horizontelParams = width < 5 ? -this.tolerance : +this.tolerance;
         let verticalParams =
            l.maxY - l.minY < 5 ? -this.tolerance : +this.tolerance;

         if (
            mouseX >= l.minX + horizontelParams &&
            mouseX <= l.maxX - horizontelParams &&
            mouseY >= l.minY + verticalParams &&
            mouseY <= l.maxY - verticalParams
         ) {
            if (line === null || line.maxX - line.minX > width) {
               line = { l, key };
            }
         }
      };

      rectMap.forEach(checkRect);
      circleMap.forEach(checkCircle);
      textMap.forEach(checkText);
      lineMap.forEach(simpleLine);

      const setDragging = (obj) => {
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
         if (line.l.pointTo || line.l.endTo) return;
         line.l.curvePoints.forEach((e) => {
            e.offsetX = mouseX - e.x;
            e.offsetY = mouseY - e.y;
         });
         line.l.isActive = true;
         this.dragElement = line.key;
      } else if (smallestText) {
         setDragging(smallestText.text);
         this.dragElement = smallestText.key;
      }
   }

   mouseMove(e) {
      if (config.mode === "pencil") return;

      if (!this.resizeElement && !this.dragElement) return;
      const { x: mouseX, y: mouseY } = this.getTransformedMouseCoords(e);

      let rectResize = rectMap.get(this.resizeElement?.key);
      let circleResize = circleMap.get(this.resizeElement?.key);
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
      } else if (textResize) {
         textResize.size = Math.max(10, mouseY - textResize.y); // Ensure minimum size
         this.draw();
      } else if (lineResize) {
         if (this.resizeElement.direction === null) {
            lineResize.curvePoints[this.resizeElement.index].x = mouseX;
            lineResize.curvePoints[this.resizeElement.index].y = mouseY;
            this.updateLineMinMax(this.resizeElement?.key);

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
            this.lineConnectParams(mouseX, mouseY);
            this.draw();
         } else if (this.resizeElement.direction === "resizeEnd") {
            lineResize.curvePoints[lineResize.curvePoints.length - 1].x =
               mouseX;
            if (Math.abs(lineResize.curvePoints[0].y - mouseY) <= 10) {
               lineResize.curvePoints[lineResize.curvePoints.length - 1].y =
                  lineResize.curvePoints[0].y;
            } else
               lineResize.curvePoints[lineResize.curvePoints.length - 1].y =
                  mouseY;
            this.lineConnectParams(mouseX, mouseY);
            this.updateLineMinMax(this.resizeElement?.key);
            this.draw();
         }
      }

      if (rectResize || circleResize || textResize) return;

      let rect = rectMap.get(this.dragElement);
      let arc = circleMap.get(this.dragElement);
      let text = textMap.get(this.dragElement);
      let line = lineMap.get(this.dragElement);

      if (rect) {
         rect.isActive = true;
         rect.x = mouseX - rect.offsetX;
         rect.y = mouseY - rect.offsetY;

         this.showGuides(rect.x, rect.y, this.dragElement, rect);

         if (rect.pointTo.length > 0) {
            // let arc = [];
            let line = [];
            let arrowEndRect = [];
            let arrowStartRect = [];

            rect.pointTo.forEach((a) => {
               //    let arr = arrows.get(a);
               let l = lineMap.get(a);

               //    if (arr) arc.push(arr);

               if (l) line.push(l);
            });

            // get all the arrows connected to rect

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
                     line.forEach((l) => {
                        if (rectMap.get(l.startTo) === rect) {
                           const last = l.curvePoints.length - 1;

                           if (l.curvePoints[last].y < rect.y) {
                              l.curvePoints[0].x =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.curvePoints[0].y = rect.y;
                           } else if (
                              l.curvePoints[last].y >= rect.y &&
                              l.curvePoints[last].y <= rect.y + rect.height
                           ) {
                              if (l.curvePoints[last].x > rect.x) {
                                 l.curvePoints[0].x = rect.x + rect.width;
                              } else l.curvePoints[0].x = rect.x;

                              l.curvePoints[0].y =
                                 rect.y + (rect.y + rect.height - rect.y) * 0.5;
                           } else {
                              l.curvePoints[0].x =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.curvePoints[0].y = rect.y + rect.height;
                           }
                        }
                     });
                  }
               });
            }

            if (arrowEndRect.length > 0) {
               arrowEndRect.forEach((ar) => {
                  if (ar === rect) {
                     line.forEach((l) => {
                        if (rectMap.get(l.endTo) === rect) {
                           const last = l.curvePoints.length - 1;
                           if (
                              Math.abs(
                                 l.curvePoints[0].y - l.curvePoints[last].y
                              ) <= 5
                           ) {
                              l.curvePoints[last].y = l.curvePoints[0].y;
                           }
                           if (l.curvePoints[0].y < rect.y) {
                              l.curvePoints[last].x =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.curvePoints[last].y = rect.y;
                           } else if (
                              l.curvePoints[0].y >= rect.y &&
                              l.curvePoints[0].y <= rect.y + rect.height
                           ) {
                              if (
                                 l.curvePoints[0].x <
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5
                              ) {
                                 l.curvePoints[last].x = rect.x;
                              } else {
                                 l.curvePoints[last].x = rect.x + rect.width;
                              }
                              l.curvePoints[last].y =
                                 rect.y + (rect.y + rect.height - rect.y) * 0.5;
                           } else {
                              l.curvePoints[last].x =
                                 rect.x + (rect.x + rect.width - rect.x) * 0.5;
                              l.curvePoints[last].y = rect.y + rect.height;
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
            let line = [];
            let arrowStartSphere = [];
            let arrowEndSphere = [];
            arc.pointTo.forEach((a) => {
               let l = lineMap.get(a);

               if (l) line.push(l);
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
                     line.forEach((l) => {
                        if (circleMap.get(l.startTo) === arc) {
                           const last = l.curvePoints.length - 1;
                           if (l.curvePoints[last].y < arc.y - arc.yRadius) {
                              l.curvePoints[0].x = arc.x;
                              l.curvePoints[0].y = arc.y - arc.yRadius;
                           } else if (
                              l.curvePoints[last].y > arc.y - arc.yRadius &&
                              l.curvePoints[last].y < arc.y + arc.yRadius
                           ) {
                              if (l.curvePoints[last].x < arc.x - arc.xRadius) {
                                 l.curvePoints[0].x = arc.x - arc.xRadius;
                              } else {
                                 l.curvePoints[0].x = arc.x + arc.xRadius;
                              }
                              l.curvePoints[0].y = arc.y;
                           } else {
                              l.curvePoints[0].y = arc.y + arc.yRadius;
                              l.curvePoints[0].x = arc.x;
                           }
                        }
                     });
                  }
               });
            }
            if (arrowEndSphere.length > 0) {
               arrowEndSphere.forEach((ar) => {
                  if (ar == arc) {
                     line.forEach((l) => {
                        if (circleMap.get(l.endTo) === arc) {
                           const last = l.curvePoints.length - 1;
                           if (l.curvePoints[0].y < arc.y - arc.yRadius) {
                              l.curvePoints[last].x = arc.x;
                              l.curvePoints[last].y = arc.y - arc.yRadius;
                           } else if (
                              l.curvePoints[0].y > arc.y - arc.yRadius &&
                              l.curvePoints[0].y < arc.y + arc.yRadius
                           ) {
                              if (l.curvePoints[0].x < arc.x) {
                                 l.curvePoints[last].x = arc.x - arc.xRadius;
                              } else
                                 l.curvePoints[last].x = arc.x + arc.xRadius;
                              l.curvePoints[last].y = arc.y;
                           } else {
                              l.curvePoints[last].x = arc.x;
                              l.curvePoints[last].y = arc.y + arc.yRadius;
                           }
                        }
                     });
                  }
               });
            }
         }
         this.draw();
      } else if (text) {
         text.x = mouseX - text.offsetX;
         text.y = mouseY - text.offsetY;
         this.showGuides(text.x, text.y, this.dragElement, text);
         if (text.pointTo.length > 0) {
            let arcs = text.pointTo.map((t) => {
               return lineMap.get(t);
            });
            let lineStart = [];
            let lineEnd = [];

            arcs.forEach((a) => {
               let start = textMap.get(a.startTo);
               let end = textMap.get(a.endTo);
               if (start) {
                  lineStart.push(start);
               }
               if (end) {
                  lineEnd.push(end);
               }
            });

            if (lineStart.length > 0) {
               lineStart.forEach((ar) => {
                  if (ar === text) {
                     arcs.forEach((a) => {
                        const length = a.curvePoints.length - 1;
                        if (textMap.get(a.startTo) === text) {
                           if (a.curvePoints[length].y < a.curvePoints[0].y) {
                              a.curvePoints[0].y = text.y - this.tolerance;
                           } else
                              a.curvePoints[0].y =
                                 text.y + text.height + this.tolerance;

                           a.curvePoints[0].x =
                              text.x + (text.width + text.x - text.x) * 0.5;
                        }
                     });
                  }
               });
            }

            if (lineEnd.length > 0) {
               lineEnd.forEach((ar) => {
                  if (ar === text) {
                     arcs.forEach((a) => {
                        const length = a.curvePoints.length - 1;
                        if (textMap.get(a.endTo) === text) {
                           if (a.curvePoints[0].y < a.curvePoints[length].y) {
                              a.curvePoints[length].x =
                                 text.x + (text.width + text.x - text.x) * 0.5;
                              a.curvePoints[length].y = text.y - this.tolerance;
                           } else {
                              a.curvePoints[length].x =
                                 text.x + (text.width + text.x - text.x) * 0.5;
                              a.curvePoints[length].y =
                                 text.y + text.height + this.tolerance;
                           }
                        }
                     });
                  }
               });
            }
         }
         this.draw();
      } else if (line) {
         line.curvePoints.forEach((ele) => {
            const deltaX = mouseX - ele.offsetX;
            const deltaY = mouseY - ele.offsetY;
            this.showGuides(
               line.curvePoints[0].x,
               line.curvePoints[0].y,
               this.dragElement,
               line
            );
            ele.x = deltaX;
            ele.y = deltaY;
         });

         this.draw();
      }
   }

   mouseUp(e) {
      if (config.mode === "pencil") return;

      canvas.removeEventListener("mousemove", this.mouseMove.bind(this));
      const { x: mouseX, y: mouseY } = this.getTransformedMouseCoords(e);

      const rect = rectMap.get(this.resizeElement?.key);
      const line = lineMap.get(this.resizeElement?.key);

      if (rect) {
         rect.isActive = true;
         this.draw();
      } else if (line) {
         const key = this.resizeElement.key;
         if (this.resizeElement.direction === "resizeStart") {
            if (line.startTo) {
               const { rect, sphere, text } = this.getShape(line.startTo);

               if (rect && rect.pointTo.length > 0) {
                  if (
                     line.curvePoints[0].x < rect.x ||
                     line.curvePoints[0].x > rect.x + rect.width ||
                     line.curvePoints[0].y < rect.y ||
                     line.curvePoints[0].y > rect.y + rect.height
                  ) {
                     rect.pointTo.filter((r) => {
                        return r !== key;
                     });
                     line.startTo = null;
                  }
               }

               if (sphere && sphere.pointTo.length > 0) {
                  const distance = Math.sqrt(
                     (line.curvePoints[0].x - sphere.x) ** 2 -
                        (line.curvePoints[0].y - sphere.y) ** 2
                  );
                  if (distance > sphere.xRadius || distance > sphere.yRadius) {
                     sphere.pointTo.filter((s) => s !== key);
                     line.startTo = null;
                  }
               }

               if (text && text.pointTo.length > 0) {
                  if (
                     line.curvePoints[0].x < text.x ||
                     line.curvePoints[0].x > text.x + text.width ||
                     line.curvePoints[0].y < text.y ||
                     line.curvePoints[0].y > text.y + text.height
                  ) {
                     text.pointTo.filter((r) => {
                        return r !== key;
                     });
                     line.startTo = null;
                  }
               }
            }
            rectMap.forEach((rect, rectKey) => {
               const { x, y, width, height } = rect;
               if (
                  (mouseX >= x &&
                     mouseX <= x + width &&
                     mouseY >= y &&
                     mouseY <= y + this.tolerance) ||
                  (mouseX >= x &&
                     mouseX <= x + this.tolerance &&
                     mouseY >= y &&
                     mouseY <= y + height) ||
                  (mouseX >= x &&
                     mouseX <= x + width &&
                     mouseY >= y + height - this.tolerance &&
                     mouseY <= y + height) ||
                  (mouseX >= x + width - this.tolerance &&
                     mouseX <= x + width &&
                     mouseY >= y &&
                     mouseY <= y + height)
               ) {
                  let end = rectMap.get(line.endTo);
                  if (end && end === rect) return;
                  rect.pointTo.push(key);
                  line.startTo = rectKey;
               }
            });

            circleMap.forEach((circle, circleKey) => {
               const { xRadius, yRadius, x, y } = circle;
               const distance = Math.sqrt(
                  (mouseX - x) ** 2 + (mouseY - y) ** 2
               );

               if (
                  Math.abs(distance - xRadius) <= this.tolerance &&
                  Math.abs(distance - yRadius) <= this.tolerance
               ) {
                  if (circleKey === line.endTo) return;
                  circle.pointTo.push(key);
                  line.startTo = circleKey;
               }
            });

            textMap.forEach((text, textKey) => {
               if (
                  line.curvePoints[0].x >= text.x &&
                  line.curvePoints[0].x <= text.x + text.width &&
                  line.curvePoints[0].y >= text.y &&
                  line.curvePoints[0].y <= text.y + text.height
               ) {
                  if (textKey === line.endTo) return;
                  text.pointTo.push(key);
                  line.startTo = textKey;
               }
            });
         } else if (this.resizeElement.direction === "resizeEnd") {
            const length = line.curvePoints.length - 1;

            if (line.endTo) {
               const { rect, sphere, text } = this.getShape(line.startTo);
               if (rect && rect.pointTo.length > 0) {
                  if (
                     line.curvePoints[length].x < rect.x ||
                     line.curvePoints[length].x > rect.x + rect.width ||
                     line.curvePoints[length].y < rect.y ||
                     line.curvePoints[length].y > rect.y + rect.height
                  ) {
                     rect.pointTo.filter((r) => {
                        return r !== key;
                     });
                     line.endTo = null;
                  }
               }

               if (sphere && sphere.pointTo.length > 0) {
                  const distance = Math.sqrt(
                     (line.curvePoints[length].x - sphere.x) ** 2 -
                        (line.curvePoints[length].y - sphere.y) ** 2
                  );
                  if (distance > sphere.xRadius || distance > sphere.yRadius) {
                     sphere.pointTo.filter((s) => s !== key);
                     line.endTo = null;
                  }
               }

               if (text && text.pointTo.length > 0) {
                  if (
                     line.curvePoints[length].x < text.x ||
                     line.curvePoints[length].x > text.x + text.width ||
                     line.curvePoints[length].y < text.y ||
                     line.curvePoints[length].y > text.y + text.height
                  ) {
                     text.pointTo.filter((r) => {
                        return r !== key;
                     });
                     line.endTo = null;
                  }
               }
            }

            rectMap.forEach((rect, rectKey) => {
               const { x, y, width, height, pointTo } = rect;
               if (
                  (mouseX >= x &&
                     mouseX <= x + width &&
                     mouseY >= y &&
                     mouseY <= y + this.tolerance) ||
                  (mouseX >= x &&
                     mouseX <= x + this.tolerance &&
                     mouseY >= y &&
                     mouseY <= y + height) ||
                  (mouseX >= x &&
                     mouseX <= x + width &&
                     mouseY >= y + height - this.tolerance &&
                     mouseY <= y + height) ||
                  (mouseX >= x + width - this.tolerance &&
                     mouseX <= x + width &&
                     mouseY >= y &&
                     mouseY <= y + height)
               ) {
                  let start = rectMap.get(line.startTo);
                  if (start && start === rect) return;
                  pointTo.push(key);
                  line.endTo = rectKey;
               }
            });
            circleMap.forEach((circle, circleKey) => {
               const { xRadius, yRadius, x, y, pointTo } = circle;
               const distance = Math.sqrt(
                  (mouseX - x) ** 2 + (mouseY - y) ** 2
               );

               if (
                  Math.abs(distance - xRadius) <= this.tolerance &&
                  Math.abs(distance - yRadius) <= this.tolerance
               ) {
                  if (circleKey === line.startTo) return;
                  pointTo.push(key);
                  line.endTo = circleKey;
               }
            });
            textMap.forEach((text, textKey) => {
               if (
                  line.curvePoints[length].x >= text.x &&
                  line.curvePoints[length].x <= text.x + text.width &&
                  line.curvePoints[length].y >= text.y &&
                  line.curvePoints[length].y <= text.y + text.height
               ) {
                  if (textKey === line.startTo) return;
                  text.pointTo.push(key);
                  line.endTo = textKey;
               }
            });
         }
         this.updateLineMinMax(this.resizeElement.key);
      }

      const rectDrag = rectMap.get(this.dragElement);
      const arcDrag = circleMap.get(this.dragElement);
      const lineDrag = lineMap.get(this.dragElement);
      const textDrag = textMap.get(this.dragElement);

      if (rectDrag) {
         this.updateGuides(
            this.dragElement,
            rectDrag.x,
            rectDrag.y,
            rectDrag.x + rectDrag.width,
            rectDrag.y + rectDrag.height
         );
         if (rectDrag.pointTo.length > 0) {
            rectDrag.pointTo.forEach((l) => {
               this.updateLineMinMax(l);
            });
         }
      } else if (arcDrag) {
         this.updateGuides(
            this.dragElement,
            arcDrag.x - arcDrag.xRadius,
            arcDrag.y - arcDrag.yRadius,
            arcDrag.x + arcDrag.xRadius,
            arcDrag.y + arcDrag.yRadius
         );
         if (arcDrag.pointTo.length > 0) {
            arcDrag.pointTo.forEach((l) => {
               this.updateLineMinMax(l);
            });
         }
      } else if (lineDrag) {
         this.updateLineMinMax(this.dragElement);
      } else if (textDrag) {
         if (textDrag.pointTo.length > 0) {
            textDrag.pointTo.forEach((l) => {
               this.updateLineMinMax(l);
            });
         }
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

   updateLineMinMax(key) {
      let line = lineMap.get(key);
      if (!line) {
         return;
      }
      line.minX = Infinity;
      line.maxX = -Infinity;
      line.minY = Infinity;
      line.maxY = -Infinity;

      line.curvePoints.forEach((ele) => {
         if (ele.x < line.minX) {
            line.minX = ele.x;
         }
         if (ele.x > line.maxX) {
            line.maxX = ele.x;
         }
         if (ele.y < line.minY) {
            line.minY = ele.y;
         }
         if (ele.y > line.maxY) {
            line.maxY = ele.y;
         }
      });
   }

   lineConnectParams(mouseX, mouseY) {
      breakPointsCtx.beginPath();
      const padding = 3; // padding
      breakPointsCtx.lineWidth = padding;
      breakPointsCtx.strokeStyle = "rgb(2, 211, 134)";

      rectMap.forEach((rect) => {
         const { x, y, width, height } = rect;
         if (
            (mouseX >= x &&
               mouseX <= x + width &&
               mouseY >= y &&
               mouseY <= y + this.tolerance) ||
            (mouseX >= x &&
               mouseX <= x + this.tolerance &&
               mouseY >= y &&
               mouseY <= y + height) ||
            (mouseX >= x &&
               mouseX <= x + width &&
               mouseY >= y + height - this.tolerance &&
               mouseY <= y + height) ||
            (mouseX >= x + width - this.tolerance &&
               mouseX <= x + width &&
               mouseY >= y &&
               mouseY <= y + height)
         ) {
            // Start from the top-left corner, slightly offset by padding
            breakPointsCtx.moveTo(x - padding + 5, y - padding);

            // Top-right corner
            breakPointsCtx.arcTo(
               x + width + padding,
               y - padding,
               x + width + padding,
               y - padding + 5,
               5
            );

            // Bottom-right corner
            breakPointsCtx.arcTo(
               x + width + padding,
               y + height + padding,
               x + width + padding - 5,
               y + height + padding,
               5
            );

            // Bottom-left corner
            breakPointsCtx.arcTo(
               x - padding,
               y + height + padding,
               x - padding,
               y + height + padding - 5,
               5
            );

            // Top-left corner to close the path
            breakPointsCtx.arcTo(
               x - padding,
               y - padding,
               x - padding + 5,
               y - padding,
               5
            );

            breakPointsCtx.closePath();
         } else {
            breakPointsCtx.clearRect(
               0,
               0,
               canvasBreakpoints.width,
               canvasBreakpoints.height
            );
         }
      });

      circleMap.forEach((circle) => {
         const { x, y, xRadius, yRadius } = circle;
         const dx = mouseX - x;
         const dy = mouseY - y;
         const distance = Math.sqrt(dx * dx + dy * dy);

         if (
            Math.abs(distance - xRadius) <= this.tolerance &&
            Math.abs(distance - yRadius) <= this.tolerance
         ) {
            breakPointsCtx.beginPath();
            breakPointsCtx.ellipse(
               circle.x,
               circle.y,
               circle.xRadius + padding,
               circle.yRadius + padding,
               0,
               0,
               Math.PI * 2,
               false
            );
            breakPointsCtx.closePath();
         } else {
            breakPointsCtx.clearRect(
               0,
               0,
               canvasBreakpoints.width,
               canvasBreakpoints.height
            );
         }
      });

      textMap.forEach((text) => {
         const { x, y, width, height } = text;
         if (
            (mouseX >= x &&
               mouseX <= x + width &&
               mouseY >= y &&
               mouseY <= y + this.tolerance) ||
            (mouseX >= x + width - this.tolerance &&
               mouseX <= x + width &&
               mouseY >= y &&
               mouseY <= y + height) ||
            (mouseX >= x &&
               mouseX <= x + this.tolerance &&
               mouseY >= y &&
               mouseY <= y + height) ||
            (mouseX >= x &&
               mouseX <= x + width &&
               mouseY >= y + height - this.tolerance &&
               mouseY <= y + height)
         ) {
            // Start from the top-left corner, slightly offset by padding
            breakPointsCtx.moveTo(x - padding + 5, y - padding);

            // Top-right corner
            breakPointsCtx.arcTo(
               x + width + padding,
               y - padding,
               x + width + padding,
               y - padding + 5,
               5
            );

            // Bottom-right corner
            breakPointsCtx.arcTo(
               x + width + padding,
               y + height + padding,
               x + width + padding - 5,
               y + height + padding,
               5
            );

            // Bottom-left corner
            breakPointsCtx.arcTo(
               x - padding,
               y + height + padding,
               x - padding,
               y + height + padding - 5,
               5
            );

            // Top-left corner to close the path
            breakPointsCtx.arcTo(
               x - padding,
               y - padding,
               x - padding + 5,
               y - padding,
               5
            );

            breakPointsCtx.closePath();
         }
      });
      breakPointsCtx.stroke();
   }

   pointToSegmentDistance(px, py, x1, y1, x2, y2) {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const len_sq = C * C + D * D;
      const param = len_sq !== 0 ? dot / len_sq : -1;

      let xx, yy;

      if (param < 0) {
         xx = x1;
         yy = y1;
      } else if (param > 1) {
         xx = x2;
         yy = y2;
      } else {
         xx = x1 + param * C;
         yy = y1 + param * D;
      }

      const dx = px - xx;
      const dy = py - yy;
      return Math.sqrt(dx * dx + dy * dy);
   }
}

export const shape = new Shapes();
