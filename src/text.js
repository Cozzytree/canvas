import Shapes from "./shape";
import { arrows, textMap } from "./main";
import { config, scrollBar } from "./config";

export class Text extends Shapes {
  constructor(x, y, size = 20, content) {
    super();
    this.x = x;
    this.y = y;
    this.size = size;
    //   this.content = content;
    this.content = content;
    this.pointTo = [];

    //   canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    //   canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    //   canvas.addEventListener("mouseup", this.mouseUp.bind(this));
  }

  mouseDown(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY =
      e.clientY -
      canvas.getBoundingClientRect().top +
      scrollBar.scrollPositionY;

    textMap.forEach((text) => {
      if (this.isWithinBounds(mouseX, mouseY, text)) {
        text.isDragging = true;
        text.offsetX = mouseX - text.x;
        text.offsetY = mouseY - text.y;
        text.isActive = true;
      }
      if (this.isWithinResizeHandle(mouseX, mouseY, text)) {
        text.isResizing = true;
      }
    });
  }

  mouseMove(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY =
      e.clientY -
      canvas.getBoundingClientRect().top +
      scrollBar.scrollPositionY;

    textMap.forEach((text) => {
      if (text.isDragging) {
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
                    a.x = text.x + text.width;
                    a.y = text.y + text.height;
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
                        text.x +
                        (text.width + text.x - text.x) * 0.5 -
                        this.tolerance;
                      a.toy = text.y;
                    } else {
                      a.tox =
                        text.x +
                        (text.width + text.x - text.x) * 0.5 +
                        this.tolerance;
                      a.toy = text.y + text.height;
                    }
                  }
                });
              }
            });
          }
        }
      } else if (text.isResizing) {
        text.size = Math.max(10, mouseY - text.y); // Ensure minimum size
      }
    });
  }

  mouseUp(e) {
    textMap.forEach((text) => {
      if (text.isDragging || text.isResizing) {
        text.isDragging = false;
        text.isResizing = false;
      }
    });
  }

  isWithinBounds(mouseX, mouseY, text) {
    return (
      mouseX >= text.x &&
      mouseX <= text.x + text.width &&
      mouseY >= text.y &&
      mouseY <= text.x + text.height
    );
  }

  isWithinResizeHandle(mouseX, mouseY, text) {
    return (
      mouseX > text.x + text.width &&
      mouseX <= text.x + text.width + this.tolerance &&
      mouseY > text.y + text.height &&
      mouseY <= text.y + text.height + this.tolerance
    );
  }
}
