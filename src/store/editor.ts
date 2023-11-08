import {defineStore} from 'pinia'
import {MoveableManager} from "@/common/moveable/moveable";

type StoreType = {
  moveableManager: MoveableManager,
  canvas: {
    scale: number,
    scaleWheelStep: number,
    width: number;
    height: number;
    bgColor: string;
  },
  editorList: Array<any>
}

export const useEditorStore = defineStore<'editor', StoreType>('editor', {
  state: () => ({
    moveableManager: void 0,
    canvas: {
      scale: -1,
      scaleWheelStep: 0.02,
      width: 1200,
      height: 2200,
      bgColor: '#FFF'
    },
    editorList: [],
  }),
  getters: () => {

  }
})
