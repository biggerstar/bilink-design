import {WIDGETS_NAMES} from "@/constant";

export default {
  [WIDGETS_NAMES.W_TEXT]: {
    align: [
      {
        name: 'left',
        icon: 'icon-24gl-textAlignLeft',
        tip: '左对齐',
        status: true,
        style: {
          textAlign: 'left',
          textAlignLast: 'auto'
        }
      },
      {
        name: 'center',
        icon: 'icon-24gl-textAlignCenter',
        tip: '居中对齐',
        status: false,
        style: {
          textAlign: 'center',
          textAlignLast: 'auto'
        }
      },
      {
        name: 'right',
        icon: 'icon-24gl-textAlignRight',
        tip: '右对齐',
        status: false,
        style: {
          textAlign: 'right',
          textAlignLast: 'auto'
        }
      },
      {
        name: 'justify',
        icon: 'icon-24gl-textAlignJustifyLL',
        tip: '两端对齐',
        status: false,
        style: {
          textAlign: 'justify',
          textAlignLast: 'auto'
        }
      },
      {
        name: 'justify-last',
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
        name: 'bold',
        key: 'fontWeight',
        icon: 'icon-zitijiacu',
        tip: '字体加粗',
        status: false,
        style: {
          fontWeight: 'bold'
        }
      },
      {
        name: 'italic',
        key: 'fontStyle',
        icon: 'icon-xieti',
        tip: '斜体',
        status: false,
        style: {
          fontStyle: 'italic'
        }
      },
      {
        name: 'underline',
        key: 'textDecoration',
        icon: 'icon-zitixiahuaxian',
        tip: '下划线',
        status: false,
        style: {
          textDecoration: 'underline',
        }
      },
      {
        name: 'lineThrough',
        key: 'textDecoration',
        icon: 'icon-zitishanchuxian',
        tip: '删除线',
        status: false,
        style: {
          textDecoration: 'line-through'
        }
      },
      {
        name: 'verticalRl',
        key: 'writingMode',
        icon: 'icon-wenzigongju-shupai',
        tip: '文字竖排',
        status: false,
        style: {
          writingMode: 'vertical-rl'
        }
      },
    ]
  }
}
