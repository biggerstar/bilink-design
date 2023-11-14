import {MoveableOptions} from "moveable";

export default {
  'w-text': {
    // keepRatio: true,
    // keepRatioFinally: true,
    // clippable: true,
    // resizable: true,
    // scalable: true,
    draggable: true,
    rotatable: true,
    // renderDirections: ["nw", "ne", "s", "se", "sw", "e"],
    renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
  }
} as Record<any, MoveableOptions>
