import {defineStore} from 'pinia'
import {DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";
import {loadFont} from "@/utils/method";
import {isNumber} from "is-what";
import {deepmerge} from "@biggerstar/deepmerge";
import {toRaw} from "vue";
import {globalStore} from "@/store/global";

type StateType = {
  widgetsDetailConfig: Record<any, any>
  /** 所有字体 */
  allFont: object[],
  /** 当前正在编辑的工程文件 */
  currentProject: {
    /** 画布信息 */
    canvas: {
      scale: number,
      scaleWheelStep: number,
      width: number;
      height: number;
      bgColor: string;
      fontId: string   // canvas 内所有元素默认使用的字体
      watermark?: string;
    },
    /** 小组件信息集合 */
    items: []
  }
}

type GetterType = {}

type ActionType = {
  /** 获取当前活跃小组件的配置信息 */
  getCurrentOptions(): Record<any, any>

  /** 载入当前要编辑的工程配置信息 */
  loadEditorProject(projectInfo): void,
  /** 设置当前正在活跃的小组件配置,会自动更新源currentProject.items中的配置,是否直接覆盖整个对象(值)
   * safe 安全合并，在源对象上若没有的不会被合并, 默认 false
   * effectDom 本次设置的值是否对应到dom并影响dom效果 ， 默认 true
   * */
  updateActiveWidgetsState<T extends Record<any, any>>(projectInfo: T, options?: { safe?: boolean, effectDom?: boolean }): void,
  /** 通过 id 获取字体信息  */
  getFont4Id(id: string): any,
  /** 为指定元素设置字体  */
  setFontFamily(el: HTMLElement, id: string): any,
  /** 为指定元素设置大小  */
  setFontSize(el: HTMLElement, size: string | number): any,
  /** 为指定元素设置大小和字体  */
  setFont(el: HTMLElement, options: { id?: string, size?: string }): any,
  /** 获取某个组件详情页的配置信息  */
  getWidgetsDetailConfig(name: string): any,
}

export const useEditorStore = defineStore<'editor', StateType, GetterType, ActionType>('editor', {
  state: () => ({
    allFont: [],
    currentProject: {
      canvas: void 0,
      items: [],
    },
    widgetsDetailConfig: {}
  }),
  actions: {
    getCurrentOptions() {
      const currentWidget = globalStore.moveableManager.currentWidget
      if (!currentWidget) return
      return currentWidget[DESIGN_OPTIONS]
    },
    loadEditorProject(projectInfo) {
      this.currentProject = projectInfo
    },
    updateActiveWidgetsState(projectInfo, options = {}) {
      const {effectDom = true} = options
      projectInfo = toRaw(projectInfo)
      const currentWidget = globalStore.moveableManager.currentWidget
      if (!currentWidget) return
      /* 通过activeOptions引用更新在 currentProject.items 中的配置  */
      deepmerge(this.getCurrentOptions(), projectInfo, options)
      if (effectDom) currentWidget[DESIGN_SET_STATE](projectInfo)
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
    },
    getWidgetsDetailConfig(w_name) {
      return this.widgetsDetailConfig?.[w_name]
    }
  },
})

// const editorStore = useEditorStore()
// editorStore.$subscribe(()=>{})
