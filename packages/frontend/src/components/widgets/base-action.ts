import {createSetWidgetsStyle, CssTransformApi} from "@/utils/method";
import {isFunction} from "is-what";

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

  const shareAction = {   // 所有组件通用的函数
    width: (val) =>{
      console.log('width',val);
      setWidgetsStyle("width", val ? `${val}px` : 'auto')
    },
    height: (val) => {
      console.log('height',val);
      setWidgetsStyle("height", val ? `${val}px` : 'auto')
    },
    backgroundColor: (val) => setWidgetsStyle('backgroundColor', val || 'transparent'),
    transform: (transform) => {
      // console.log(Object.values(transform).join(','))
      updateTransform('matrix', Object.values(transform).join(','))
    },
    opacity: (val) => setWidgetsStyle("opacity", `${val}`),
    style: (styleObj: Partial<CSSStyleDeclaration>) => Object.keys(styleObj).forEach(name => element && (element.style[name] = styleObj[name]))
  }

  return {
    /** 链接到dom节点 */
    connect: (el: HTMLElement) => element = el,
    /**
     * 创建小组件配置映射处理函数
     * 返回一个函数为setState用于触发 actionMap 传入的处理函数
     * */
    setState(options: Record<any, any>) {
      for (const name in options) {
        const func = shareAction[name]
        if (isFunction(func)) func.call(null, options[name])
      }
    },
    /** 更新css style的值，键名为 CSSStyleDeclaration类型 */
    updateStyle,
    /** 更新css transform字段中的功能函数值，比如scale translate rotate等 */
    updateTransform,
    /** 拓展处理功能字段 */
    expand: (obj: Record<any, any>) => Object.assign(shareAction, obj),
    /** 所有的处理字段及其函数 */
    share: shareAction
  }
}
