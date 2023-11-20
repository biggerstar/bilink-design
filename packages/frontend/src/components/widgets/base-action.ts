import {createSetWidgetsStyle, CssTransformApi} from "@/utils/method";
import {isFunction} from "is-what";
import {editorStore} from "@/store/editor";
import {DESIGN_OPTIONS, DESIGN_SET_STATE} from "@/constant";

/**
 * 用于处理不同组件传入不同了配置键值对并指定对应的不同处理方式
 *  */
export function createBaseCssAction() {
  let element
  const setWidgetsStyle: (name: keyof CSSStyleDeclaration, val: string) => void = createSetWidgetsStyle(() => element)

  function updateTransform(name, value) {
    const cssTransformApi = new CssTransformApi()
    cssTransformApi.load(element!.style.transform).change(name, value)
    setWidgetsStyle("transform", cssTransformApi.transform)
  }

  function updateStyle(name: keyof CSSStyleDeclaration, value: string) {
    setWidgetsStyle(name, value)
  }

  function updateBoxSize() {
    if (!editorStore.moveableManager) return
    const transformOrigin = element.style.transformOrigin
    element.style.transformOrigin = 'center center'
    editorStore.updateActiveWidgetsState({
      width: element.scrollWidth,
      height: element.scrollHeight,
    })
    element.style.transformOrigin = transformOrigin
  }

  function setState(options: Record<any, any>) {
    for (const name in options) {
      const func = shareAction[name]
      if (isFunction(func)) func.call(null, options[name])
    }
  }

  const shareAction = {   // 所有组件通用的函数
    style: (styleObj: Partial<CSSStyleDeclaration>) => Object.keys(styleObj).forEach(name => element && (element.style[name] = styleObj[name])),
    width: (val) => setWidgetsStyle("width", val ? `${val}px` : 'auto'),
    height: (val) => setWidgetsStyle("height", val ? `${val}px` : 'auto'),
    backgroundColor: (val) => setWidgetsStyle('backgroundColor', val || 'transparent'),
    transform: (transform) => {
      // console.log(Object.values(transform).join(','))
      updateTransform('matrix', Object.values(transform).join(','))
    },
    opacity: (val) => setWidgetsStyle("opacity", `${val}`),
    left: (val) => updateTransform('translateX', `${val}px`),
    top: (val) => updateTransform('translateY', `${val}px`),
  }

  return {
    /** 获取当前操作的元素对象 */
    getElement(): HTMLElement {
      return element
    },
    /** 链接到dom节点 */
    connect: (el: HTMLElement) => element = el,
    /**
     * 创建小组件配置映射处理函数
     * 返回一个函数为setState用于触发 actionMap 传入的处理函数
     * */
    setState,
    /** 更新css style的值，键名为 CSSStyleDeclaration类型 */
    updateStyle,
    /** 更新当前盒子的宽高，能解决溢出时movable不能自动框选的问题 */
    updateBoxSize,
    /** 更新css transform字段中的功能函数值，比如scale translate rotate等 */
    updateTransform,
    /** 拓展处理功能字段 */
    expand: (obj: Record<any, any>) => Object.assign(shareAction, obj),
    /** 所有的处理字段及其函数 */
    share: shareAction,
    /** 将该组件的配置和设置状态的函数挂载到element节点上 */
    patchConfigToElement(config) {
      element[DESIGN_OPTIONS] = config
      element[DESIGN_SET_STATE] = setState
    }
  }
}
