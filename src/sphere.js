import Shapes from "./shape";
import { arrows, circleMap } from "./main";
import { config, scrollBar } from "./config";
import { context } from "./selectors";

export class Circle extends Shapes {
  constructor(x, y, xRadius = 50, yRadius = 50) {
    super();
    this.x = x;
    this.y = y;
    this.xRadius = xRadius;
    this.yRadius = yRadius;
    this.type = "sphere";
    this.pointTo = [];

    //   canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    //   canvas.addEventListener("mouseup", this.mouseUp.bind(this));

    //   canvas.addEventListener("mousemove", this.mouseMoveResize.bind(this));
    //   canvas.addEventListener("mouseup", this.mouseUpResize.bind(this));
  }

  //    mouseMove(event) {
  //       if (config.mode === "pencil") return;
  //       circleMap.forEach((arc) => {
  //          if (arc.isDragging) {
  //             arc.isActive = true;
  //             arc.x =
  //                event.clientX -
  //                canvas.getBoundingClientRect().left -
  //                arc.offsetX;
  //             arc.y =
  //                event.clientY -
  //                canvas.getBoundingClientRect().top -
  //                arc.offsetY +
  //                scrollBar.scrollPositionY;
  //             if (arc.pointTo.length > 0) {
  //                let arrow = arc.pointTo.map((a) => {
  //                   return arrows.get(a);
  //                });

  //                let arrowStartSphere = [];
  //                let arrowEndSphere = [];
  //                arrow.forEach((a) => {
  //                   let start = circleMap.get(a.startTo);
  //                   let end = circleMap.get(a.endTo);
  //                   if (start) {
  //                      arrowStartSphere.push(start);
  //                   }
  //                   if (end) {
  //                      arrowEndSphere.push(end);
  //                   }
  //                });

  //                if (arrowStartSphere.length > 0) {
  //                   arrowStartSphere.forEach((ar) => {
  //                      if (ar == arc) {
  //                         arrow.forEach((a) => {
  //                            if (circleMap.get(a.startTo) === arc) {
  //                               if (
  //                                  a.tox >= arc.x - arc.xRadius &&
  //                                  a.tox <= arc.x + arc.xRadius
  //                               ) {
  //                                  a.x = arc.x;
  //                                  if (a.toy < a.y) {
  //                                     a.y = arc.y - arc.yRadius;
  //                                  } else {
  //                                     a.y = arc.y + arc.yRadius;
  //                                  }
  //                               } else if (a.x < a.tox) {
  //                                  a.x = arc.x + arc.xRadius;
  //                                  a.y = arc.y;
  //                               } else {
  //                                  a.x = arc.x - arc.xRadius;
  //                                  a.y = arc.y;
  //                               }
  //                            }
  //                         });
  //                      }
  //                   });
  //                }
  //                if (arrowEndSphere.length > 0) {
  //                   arrowEndSphere.forEach((ar) => {
  //                      if (ar == arc) {
  //                         arrow.forEach((a) => {
  //                            if (circleMap.get(a.endTo) === arc) {
  //                               if (
  //                                  a.x >= arc.x - arc.xRadius &&
  //                                  a.x <= arc.x + arc.xRadius
  //                               ) {
  //                                  // a.x is within the horizontal bounds of the circle
  //                                  if (a.y <= arc.y) {
  //                                     // a is above the circle
  //                                     a.tox = arc.x;
  //                                     a.toy = arc.y - arc.yRadius; // Top of the circle
  //                                  } else {
  //                                     // a is below the circle
  //                                     a.tox = arc.x;
  //                                     a.toy = arc.y + arc.yRadius; // Bottom of the circle
  //                                  }
  //                               } else if (a.x < arc.x - arc.xRadius) {
  //                                  // a.x is to the left of the circle
  //                                  a.tox = arc.x - arc.xRadius;
  //                                  a.toy = arc.y;
  //                               } else {
  //                                  // a.x is to the right of the circle
  //                                  a.tox = arc.x + arc.xRadius;
  //                                  a.toy = arc.y;
  //                               }
  //                            }
  //                         });
  //                      }
  //                   });
  //                }
  //             }
  //             this.draw();
  //          }
  //       });
  //    }

  //    mouseUp() {
  //       circleMap.forEach((arc) => {
  //          arc.isDragging = false;
  //       });
  //    }

  //    mouseMoveResize(e) {
  //       const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  //       const mouseY = e.clientY - canvas.getBoundingClientRect().top;
  //       circleMap.forEach((arc) => {
  //          if (arc.horizontelResizing) {
  //             arc.isActive = true;
  //             arc.xRadius = Math.abs(mouseX - arc.x);
  //             arc.draw();
  //          }
  //          if (arc.verticalResizing) {
  //             arc.isActive = true;
  //             arc.yRadius = Math.abs(mouseY - arc.y);
  //             arc.draw();
  //          }
  //          if (arc.isResizing) {
  //             arc.isActive = true;
  //             arc.xRadius = Math.abs(mouseX - arc.x);
  //             arc.yRadius = Math.abs(mouseY - arc.y);
  //             arc.draw();
  //          }
  //       });
  //    }

  //    mouseUpResize() {
  //       circleMap.forEach((arc) => {
  //          if (arc.horizontelResizing) {
  //             arc.horizontelResizing = false;
  //          }
  //          if (arc.verticalResizing) {
  //             arc.verticalResizing = false;
  //          }
  //          if (arc.isResizing) {
  //             arc.isResizing = false;
  //          }
  //       });
  //    }

  drawSphere(sphere) {
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
  }
}
