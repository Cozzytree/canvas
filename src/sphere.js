import { Shapes, circleMap } from "./main";
import { config } from "./config";
import { context } from "./selectors";

export class Circle extends Shapes {
    constructor(x, y, xRadius = 50, yRadius = 50) {
        super();
        this.x = x;
        this.y = y;
        this.xRadius = xRadius;
        this.yRadius = yRadius;
        this.type = "sphere";

        canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        canvas.addEventListener("mouseup", this.mouseUp.bind(this));

        canvas.addEventListener("mousemove", this.mouseMoveResize.bind(this));
        canvas.addEventListener("mouseup", this.mouseUpResize.bind(this));
    }

    mouseMove(event) {
        if (config.mode === "pencil") return;
        circleMap.forEach((arc) => {
            if (arc.isDragging) {
                arc.isActive = true;
                arc.x =
                    event.clientX -
                    canvas.getBoundingClientRect().left -
                    arc.offsetX;
                arc.y =
                    event.clientY -
                    canvas.getBoundingClientRect().top -
                    arc.offsetY;
                this.draw();
            }
        });
    }

    mouseUp() {
        circleMap.forEach((arc) => {
            arc.isDragging = false;
        });
    }

    mouseMoveResize(e) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;
        circleMap.forEach((arc) => {
            if (arc.horizontelResizing) {
                arc.isActive = true;
                arc.xRadius = Math.abs(mouseX - arc.x);
                arc.draw();
            }
            if (arc.verticalResizing) {
                arc.isActive = true;
                arc.yRadius = Math.abs(mouseY - arc.y);
                arc.draw();
            }
            if (arc.isResizing) {
                arc.isActive = true;
                arc.xRadius = Math.abs(mouseX - arc.x);
                arc.yRadius = Math.abs(mouseY - arc.y);
                arc.draw();
            }
        });
    }

    mouseUpResize() {
        circleMap.forEach((arc) => {
            if (arc.horizontelResizing) {
                arc.horizontelResizing = false;
            }
            if (arc.verticalResizing) {
                arc.verticalResizing = false;
            }
            if (arc.isResizing) {
                arc.isResizing = false;
            }
        });
    }

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
