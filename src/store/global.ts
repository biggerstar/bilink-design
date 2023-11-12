import {MoveableManager} from "@/common/moveable/moveable";

class GlobalStore {
  /** moveable 管理器 */
  moveableManager: MoveableManager
}

export const globalStore = new GlobalStore()
