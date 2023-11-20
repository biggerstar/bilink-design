import {WIDGETS_NAMES} from "@/constant";

export default {
  [WIDGETS_NAMES.W_TEXT]: {
    align: [
      {
        key: 'textAlign',
        value: 'left',
        icon: 'icon-24gl-textAlignLeft',
        tip: '左对齐',
        status: true,
        style: {
          textAlign: 'left',
          textAlignLast: 'auto'
        }
      },
      {
        key: 'textAlign',
        value: 'center',
        icon: 'icon-24gl-textAlignCenter',
        tip: '居中对齐',
        status: false,
        style: {
          textAlign: 'center',
          textAlignLast: 'auto'
        }
      },
      {
        key: 'textAlign',
        value: 'right',
        icon: 'icon-24gl-textAlignRight',
        tip: '右对齐',
        status: false,
        style: {
          textAlign: 'right',
          textAlignLast: 'auto'
        }
      },
      {
        key: 'textAlign',
        value: 'justify',
        icon: 'icon-24gl-textAlignJustifyLL',
        tip: '两端对齐',
        status: false,
        style: {
          textAlign: 'justify',
          textAlignLast: 'auto'
        }
      },
      {
        key: 'textAlign',
        value: 'justify-last',
        icon: 'icon-24gl-textAlignJustify',
        tip: '分散对齐',
        status: false,
        style: {
          textAlign: 'justify',
          textAlignLast: 'justify'
        }
      },
    ],
    textStyle: [
      {
        key: 'fontWeight',
        value: 'bold',
        icon: 'icon-zitijiacu',
        tip: '字体加粗',
        status: false,
        style: {
          fontWeight: 'bold'
        }
      },
      {
        key: 'fontStyle',
        value: 'italic',
        icon: 'icon-xieti',
        tip: '斜体',
        status: false,
        style: {
          fontStyle: 'italic'
        }
      },
      {
        key: 'textDecoration',
        value: 'underline',
        icon: 'icon-zitixiahuaxian',
        tip: '下划线',
        status: false,
        style: {
          textDecoration: 'underline',
        }
      },
      {
        key: 'textDecoration',
        value: 'line-through',
        icon: 'icon-zitishanchuxian',
        tip: '删除线',
        status: false,
        style: {
          textDecoration: 'line-through'
        }
      },
      {
        key: 'writingMode',
        value: 'vertical-rl',
        icon: 'icon-wenzigongju-shupai',
        tip: '文字竖排',
        status: false,
        style: {
          writingMode: 'vertical-rl'
        }
      },
    ],
    spaceInfo: [
      {
        name: 'lineHeight',
        key: 'lineHeight',
        icon: 'icon-chuizhijianju-',
        tip: '行间距',
        value: 1,
        step: 0.01,
        min: 0.01,
        max: 5,
      },
      {
        name: 'letterSpacing',
        key: 'letterSpacing',
        icon: 'icon-shuipingjianju-',
        tip: '字间距',
        value: 0,
        step: 0.5,
        min: -60,
        max: 200,
      },
    ],
    fontsSizeList: [
      "6",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "18",
      "24",
      "30",
      "36",
      "48",
      "60",
      "72",
      "84",
      "96",
      "108",
      "120",
      "140",
      "150",
      "160",
      "180",
      "200",
      "250",
      "300",
      "400",
      "500",
    ],
  },
  [WIDGETS_NAMES.W_GROUP]:{
    align: [
      {
        icon: 'icon-zuoduiqi-',
        tip: '左对齐',
        status: true,
        style: {
          textAlign: 'left',
          textAlignLast: 'auto'
        }
      },
      {
        icon: 'icon-juzhongduiqi-',
        tip: '水平居中对齐',
        status: false,
        style: {
          textAlign: 'center',
          textAlignLast: 'auto'
        }
      },
      {
        icon: 'icon-youduiqi-',
        tip: '右对齐',
        status: false,
        style: {
          textAlign: 'right',
          textAlignLast: 'auto'
        }
      },
      {
        icon: 'icon-dingduiqi-',
        tip: '上对齐',
        status: false,
        style: {
          textAlign: 'justify',
          textAlignLast: 'auto'
        }
      },
      {
        icon: 'icon-chuizhijuzhong-',
        tip: '垂直居中对齐',
        status: false,
        style: {
          textAlign: 'justify',
          textAlignLast: 'justify'
        }
      },
      {
        icon: 'icon-diduiqi-',
        tip: '下对齐',
        status: false,
        style: {
          textAlign: 'justify',
          textAlignLast: 'justify'
        }
      },
    ],
  }
}
