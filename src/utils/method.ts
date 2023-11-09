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

export function getWidgetsName(el: HTMLElement) {
  if (el && isWidgets(el)) {
    return el.dataset['name']
  }
}

export function parseWidget4DomChain(el: HTMLElement): HTMLElement | void {
  if (!el) return
  let cont = 500
  let target = el
  while (cont--) {
    if (isWidgets(target)) {
      return target
    }
    target = <HTMLElement>(el.parentElement || el.parentElement)
    if (!target) break
  }
}

export function updateFont(fontInfo, toTarget?: HTMLElement) {
  if (!document.fonts) return console.error('抱歉，浏览器不支持 document.font 修改字体');
  const {content} = fontInfo
  const font = new FontFace(content.family, `url(${content.woff})`);
  if (document.fonts.has(font)) return
  if (!toTarget) toTarget = document.body
  document.fonts.add(font);
  font.load().then()
  font.loaded.then(() => {
    toTarget!.style.fontFamily = content.family;
  }).catch(err => {
    console.log(err);
  });
}
