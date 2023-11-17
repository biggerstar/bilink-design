export default [
  {
    name: '添加',
    icon: 'icon-tianjia',
    comp: 'add-page',
  },
  {
    name: '模板',
    icon: 'icon-moban',
    comp: 'template',
  },
  {
    name: '素材',
    icon: 'icon-sucai',
    comp: 'material',
    materialId: "4828240",
    materialType: 'icon',
    navigationInfo: [
      {
        text: '全部',
        id: '',
        type: 'button',
      },
      {
        text: '容器',
        id: '4828669',
        type: 'button',
      },
      {
        text: '形状',
        id: '4828675',
        type: 'button',
      },
      {
        text: '图标',
        id: '4828629',
        type: 'button',
      },
      {
        text: '便签',
        id: '4828626',
        type: 'button',
      },
      {
        text: '更多',
        id: '-1',
        type: 'cascader',
      },
    ]
  },
  {
    name: '文字',
    icon: 'icon-wenzi',
    comp: 'text',
    materialId: "4828240",
    materialType: 'text',
  },
  {
    icon: 'icon-shangchuantupian',
    name: '图片',
    comp: 'images',
  },
  {
    name: '我的',
    icon: 'icon-wode',
    comp: 'my-page',
  },
]
