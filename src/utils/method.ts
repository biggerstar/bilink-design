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
