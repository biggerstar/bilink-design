import tags from "@/api/mock/tags";
import widgetsDetail from "@/api/mock/widgetsDetail";

export async function apiGetPageConfig() {
  return {
    code: 200,
    data: {
      brand: 'BiLink设计',
      asideTag: tags,
      scaleSizeList: [2, 1, 0.75, 0.5],
      widgetsDetail: widgetsDetail,
      header: {
        moreOperation: [
          {
            text: '下载',
            icon: 'icon-xiazaidaoru',
            handler: 'download'
          },
          {
            text: '分享',
            icon: 'icon-fenxiang',
            handler: 'shared'
          },
          {
            text: '敬请期待',
            icon: 'icon-jingqingqidai',
          },
        ]
      },
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577',
      ]
    }
  }
}
