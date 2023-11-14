import {isFunction} from "is-what";

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
  return el.dataset['type'] === 'widgets'
}

/**
 * 获取组件名称
 * @param el
 * @param parseChain 是否往上解析链上距离最近的组件
 * */
export function getWidgetsName(el: HTMLElement, parseChain: boolean = false): string | void {
  if (!el) return
  if (parseChain) el = <any>parseWidget4DomChain(el)
  if (el && isWidgets(el)) return el.dataset['name']
}

export function parseWidget4DomChain(el: HTMLElement): HTMLElement | void {
  if (!el) return
  let cont = 500
  let target = el
  while (cont--) {
    if (isWidgets(target)) return target
    target = <HTMLElement>(el.parentNode || el.parentElement)
    if (!target) break
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
 * 创建小组件配置映射处理函数
 * 返回一个函数为setState用于触发 actionMap 传入的处理函数
 * cb 回调函数
 * */
export function createHandlerAction<T>(actionMap: Record<any, any>, cb?: Function): (options: Record<any, any> & T) => void {
  return /* setState */ function (options: Record<any, any>) {
    for (const name in options) {
      const func = actionMap[name]
      if (isFunction(func)) func.call(null, options[name])
      if (isFunction(cb)) cb.call(null, name, options)
    }
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
