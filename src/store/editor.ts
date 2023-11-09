import {defineStore} from 'pinia'
import {MoveableManager} from "@/common/moveable/moveable";

type StateType = {
  moveableManager: MoveableManager,
  canvas: {
    scale: number,
    scaleWheelStep: number,
    width: number;
    height: number;
    bgColor: string;
  },
  currentProject: Record<any, any>
  activeItem: any,
  editorList: Array<any>
}

type ActionType = {
  setEditorProject: (projectInfo) => void
}

export const useEditorStore = defineStore<'editor', StateType, {}, ActionType>('editor', {
  state: () => ({
    moveableManager: void 0,
    canvas: {
      scale: -1,
      scaleWheelStep: 0.02,
      width: 1200,
      height: 2200,
      bgColor: '#FFF'
    },
    currentProject: void 0,
    activeItem: null,
    editorList: [],
  }),
  getters: () => {

  },
  actions: {
    setEditorProject(projectInfo) {
      this.currentProject = projectInfo
    },
  }
})
