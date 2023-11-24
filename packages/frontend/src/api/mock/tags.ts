/* 暂时通过模拟获取，后面有使用管理系统能进行管理的话再移动到数据库中 */
export default [
  {
    name: '添加',
    icon: 'icon-tianjia',
    comp: 'add-panel',
    layoutInfo: [
      {
        name: '文字',
        items: [
          {
            text: '标题',
            icon: 'icon-dabiaoti',
            call: 'title'
          },
          {
            text: '副标题',
            icon: 'icon-xiaobiaoti',
            call: 'subtitle'

          },
          {
            text: '正文',
            icon: 'icon-bianjizhengwen',
            call: 'text'

          },
        ]
      },
      {
        name: '形状',
        items: [
          {
            tip: '正方形',
            icon: 'icon-checkbox',
            call: 'square',
            border: true,

          },
          {
            tip: '三角形',
            icon: 'icon-sanjiaoxing',
            call: 'triangle',
            border: true,

          },
          {
            tip: '圆形',
            icon: 'icon-yuanxing',
            call: 'rotundity',
            border: true,

          },
          {
            tip: '直线',
            icon: 'icon-line-fill',
            call: 'straightLine',
            border: true,
          },
        ]
      }
    ]
  },
  {
    name: '模板',
    icon: 'icon-moban',
    comp: 'template',
    type: 'template',
    typeId: '4971426',
  },
  {
    name: '素材',
    icon: 'icon-sucai',
    comp: 'material',
    type: 'icon',
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
    type: 'text',
  },
  {
    icon: 'icon-shangchuantupian',
    name: '图片',
    comp: 'images',
    type: 'images',
  },
  {
    name: '我的',
    icon: 'icon-wode',
    comp: 'my-design',
  },
]
