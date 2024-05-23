import { Shapes, pencilMap } from "./main";
import { config } from "./config";

export class Pencil extends Shapes {
  constructor(start, end) {
    super();
    this.start = start;
    this.end = end;
  }
}
