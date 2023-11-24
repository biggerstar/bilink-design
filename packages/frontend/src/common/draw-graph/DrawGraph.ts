export class DrawGraph {
  public startX: number
  public startY: number
  public endX: number
  public endY: number
  public container: Element
  public target: HTMLElement
  public painting:boolean = false

  public startPoint(x: number, y: number) {
    this.startX = x
    this.startY = y
  }

  public endPoint(x: number, y: number) {
    this.endX = x
    this.endY = y
  }

  public observer(el: Element) {
    this.container = el
  }

  private _listen() {
    this.container.addEventListener('mousedown', (ev: MouseEvent) => {
      this.painting = true
      // const {left, top} = square.getBoundingClientRect()
      this.startX = ev.clientX
      this.startY = ev.clientY

      this.target = document.createElement('div')
      this.container.appendChild(this.target)

    })

    document.addEventListener('mousemove', (ev) => {
      const newX = ev.clientX - this.startX
      const newY = ev.clientY - this.startY

      this.target.style.left = `${newX}px`
      this.target.style.top = `${newY}px`
    });
  }

  public draw(callback: Function) {
    this._listen()
    console.log(111111111111111111)

    document.addEventListener('mouseup', () => {
      this.painting = false
      this.container.removeChild(this.target)
    });
  }
}
