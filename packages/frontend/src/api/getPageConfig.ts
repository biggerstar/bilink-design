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
      header:{
        moreOperation:[
          {
            text: '下载',
            icon: 'icon-xiazaidaoru',
          },
          {
            text: '分享',
            icon: 'icon-fenxiang',
          },
          {
            text: '敬请期待',
            icon: 'icon-jingqingqidai',
          },
        ]
      }
    }
  }
}
