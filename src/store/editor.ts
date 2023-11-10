import {defineStore} from 'pinia'
import {MoveableManager} from "@/common/moveable/moveable";
import {DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";
import {merge, omit, pick} from "lodash-es";
import {loadFont} from "@/utils/method";
import {isNumber} from "is-what";
import {toRaw} from "vue";

type StateType = {
  /** moveable 管理器 */
  moveableManager: MoveableManager,
  /** 画布信息 */
  canvas: {
    scale: number,
    scaleWheelStep: number,
    width: number;
    height: number;
    bgColor: string;
    font: {  // canvas 内所有元素默认使用的字体
      id: string
    }
  },
  /** 所有字体 */
  allFont: object[],
  /** 当前正在编辑的工程文件 */
  currentProject: Record<any, any>
}

type GetterType = {
  /** 获取当前活跃小组件的配置信息 */
  activeOptions(): Record<any, any>
}

type ActionType = {
  /** 载入当前要编辑的工程配置信息 */
  loadEditorProject(projectInfo): void,
  /** 设置当前正在活跃的小组件配置,是否直接覆盖整个对象(值) */
  updateActiveWidgetsState<T extends Record<any, any>>(projectInfo: T, coverKeys?: (keyof T)[]): void,
  /** 通过 id 获取字体信息  */
  getFont4Id(id: string): any,
  /** 为指定元素设置字体  */
  setFontFamily(el: HTMLElement, id: string): any,
  /** 为指定元素设置大小  */
  setFontSize(el: HTMLElement, size: string | number): any,
  /** 为指定元素设置大小和字体  */
  setFont(el: HTMLElement, options: { id?: string, size?: string }): any,
}

export const useEditorStore = defineStore<'editor', StateType, GetterType, ActionType>('editor', {
  state: () => ({
    moveableManager: void 0,
    canvas: void 0,
    allFont: [],
    currentProject: void 0,
  }),
  getters: {
    activeOptions() {
      const activeElement = this.moveableManager.activeElement
      if (!activeElement) return
      return activeElement[DESIGN_OPTIONS]
    }
  },
  actions: {
    loadEditorProject(projectInfo) {
      this.currentProject = projectInfo
    },
    updateActiveWidgetsState(options, coverKeys = []) {
      options = toRaw(options)
      const activeElement = this.moveableManager.activeElement
      if (!activeElement) return
      const activeOptions = this.activeOptions
      const coverObj = pick(options, coverKeys)
      const deepMergeObj = omit(options, coverKeys)
      merge(activeOptions, deepMergeObj)
      Object.assign(activeOptions, coverObj)
      activeElement[DESIGN_SET_STATE](options)
    },
    getFont4Id(id) {
      if (!id) return
      return this.allFont.find(item => item.id === id)
    },
    setFontFamily(el, id): any {
      const fontData = this.getFont4Id(id)
      if (!fontData) return
      loadFont({
        url: fontData.content.woff,
        family: fontData.content.family,
      }).then(() => {
        el.style.fontFamily = fontData.content.family
      })
    },
    setFontSize(el, size) {
      el.style.fontSize = isNumber(size) ? `${size}px` : size
    },
    setFont(el, {id, size} = {}) {
      if (id) this.setFontFamily(el, id)
      if (size) this.setFontSize(el, size)
    }
  },
})
