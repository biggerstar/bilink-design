export async function apiGetCanvasDefaultConfig() {
  return {
    code: 200,
    data: {
      scale: -1,
      scaleWheelStep: 0.02,
      width: 1200,
      height: 2200,
      bgColor: '#FFF',
      font: {
        id: '100041903',
      }
    }
  }
}
