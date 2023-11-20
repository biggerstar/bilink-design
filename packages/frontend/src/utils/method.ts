// noinspection JSUnusedGlobalSymbols

import {isFunction, isObject} from "is-what";
import {WIDGET_DATASET_NAME, WIDGET_SELECTOR, WIDGETS_NAMES} from "@/constant";

/**
 * 某种鼠标响应事件时，计算鼠标指针在在目标元素内的百分比位置
 * */
export function getMouseInElementPercent(event: MouseEvent, fromElement: HTMLElement, toFixed = 0) {
  const elementWidth = fromElement.clientWidth;
  const elementHeight = fromElement.clientHeight;
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const percentX = Number(((mouseX / elementWidth) * 100).toFixed(toFixed));
  const percentY = Number(((mouseY / elementHeight) * 100).toFixed(toFixed))
  return {
    percentX,
    percentY
  }
}

export function isWidgets(el: HTMLElement) {
  return el.dataset['widgetType'] === 'widget'
}

/**
 * 获取组件名称
 * @param el
 * @param parseChain 是否往上解析链上距离最近的组件
 * */
export function getWidgetsName(el: HTMLElement, parseChain: boolean = false): string | void {
  if (!el) return
  if (parseChain) el = <any>parseWidget4DomChain(el)
  if (el && isWidgets(el)) return el.dataset['widgetName']
}

/**
 * 解析dom链上的组件
 * @param el 目标元素
 * @param handleValidate 手动验证是否找到
 * */
export function parseWidget4DomChain(el: HTMLElement, handleValidate?: (target: HTMLElement) => boolean): HTMLElement | void {
  if (!el) return
  let cont = 300
  let target = el
  while (cont-- && target) {
    if (isFunction(handleValidate)) {  // 如果手动解析，则进入，不能和 handleValidate(target) 同一行验证，否则可能会执行到else if
      if (handleValidate(target) === true) return target
    } else if (isWidgets(target)) return target
    target = <HTMLElement>(target?.parentElement)
    if (!target) break
  }
}

export function parseGroupWidget4DomChain(el: HTMLElement) {
  return parseWidget4DomChain(el, (target) => target.dataset[WIDGET_DATASET_NAME] === WIDGETS_NAMES.W_GROUP)
}

export function parseWidgetsInfo4DomChain(el: HTMLElement):
  {
    rootWidgetElement: HTMLElement | void;
    isGroup: boolean;
    child: HTMLElement[]
  } {
  if (!el) return
  const groupEl = parseWidget4DomChain(el, (target) => target.dataset[WIDGET_DATASET_NAME] === WIDGETS_NAMES.W_GROUP)
  const rootElement = groupEl ? groupEl : parseWidget4DomChain(el)
  const child: HTMLElement[] = rootElement ? Array.from(rootElement.querySelectorAll(WIDGET_SELECTOR)) : []
  return {
    child: child,
    rootWidgetElement: rootElement,
    isGroup: !!groupEl,
  }
}

/**
 * 尝试添加字体，已存在则忽略
 * @param fontInfo
 * */
export async function loadFont(fontInfo: { url: string, family: string, name?: string }) {
  if (!document.fonts) return console.error('抱歉，浏览器不支持 document.font 修改字体')
  const {family, url} = fontInfo
  if (!family || !url) return
  const font = new FontFace(family, `url(${url})`);
  if (document.fonts.has(font)) return
  return await font.load()
    .then(() => document.fonts.add(font))
    .catch(() => document.fonts.delete(font))
}

/**
 * 创建一个设置dom节点样式的接口
 * */
export function createSetWidgetsStyle(getElCb: () => HTMLElement | unknown): (name: keyof CSSStyleDeclaration, val: string) => void {
  if (!isFunction(getElCb)) console.error('getElCb 不是一个函数')
  return function (name, val) {
    const el = getElCb()
    if (el) el.style[name] = val
  }
}

export function selectAllText4Element(el: HTMLElement) {
  if (window.getSelection) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

/**
 * 后面可以单独拎出来当工具用
 * 操作 css transform 的 api，方便更新，删除 transform 的值
 * */
export class CssTransformApi {
  public transform = ''

  /** 载入 transform 字符串 */
  load(transform): this {
    this.transform = transform
    return this
  }

  /** 修改 transform 中的函数值 */
  change(name: string, val: string): this {
    this.remove(name)
    this.transform = `${this.transform} ${name}(${val})`
    return this
  }

  /** 获取所有的函数名和值对象 */
  getAll() {
    const regex = /(\w+)\(([^)]+)\)/ig;
    const result = {}
    const matches = this.transform.matchAll(regex)
    for (const match of matches) {
      const funcName = match[1];
      result[funcName] = match[2].split(',').map(param => parseFloat(param));
    }
    return result
  }

  /** 获取某个函数名的值 */
  get(name): Array<any> | void {
    const reg = new RegExp(`${name}\\(([^)]*)\\)`)
    const matchData = this.transform.match(reg)
    if (!matchData || !matchData[1]) return
    return matchData[1].split(',')
  }

  /** 移除某个函数 */
  remove(name): this {
    const reg = new RegExp(`${name}\\([^)]*\\)`, 'g')
    this.transform = this.transform.replace(reg, '');
    return this
  }
}

/** 将数字转指定保留小数位 */
export function toFixed(num: number | string, toFixed: number = 0): number {
  return Number(Number(num).toFixed(toFixed))
}

/** 获取 transform 字符串中的 translate 值 返回值样式为 x,y
 * toFixed 保留小数位
 * */
export function getTranslate4Transform(transform: string, toFixed = 2): string | '' {
  const cssTransformApi = new CssTransformApi()
  const translateInfo = cssTransformApi.load(transform).get('translate')
  if (!translateInfo) return
  if (!translateInfo.length) return ''
  return translateInfo.map(offset => parseInt(offset).toFixed(toFixed)).toString()
}

/**
 * 生成级联选择器数据树
 * */
export function genCascaderTree(sourceData: object[]) {
  return sourceData.map(item => {
    if (isObject(item) && Array.isArray(item.children)) {
      const res = genCascaderTree(item.children)
      return {
        value: item.id.toString(),
        label: item.name,
        children: res
      }
    }
  })
}
