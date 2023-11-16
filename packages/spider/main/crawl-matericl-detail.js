import {sleep} from '../../common/tool/tool.js'
import {isFunction} from "is-what";

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    authorization: 'Bearer eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjE2NDg2MzA2NzcsImF1ZCI6Imdhb2Rpbmd4IiwiZXhwIjoxNzAwMDI1OTA5LCJqdGkiOiJlOTAyYjJlNTE2YmQxZDFkNGRjNmZlOTZjMDBhNmQyYzNmMDI1YzY2In0.ZhT2fQKGI_hMOfxD4OJxhXxmw9IZt6FM9QBAjo-L730',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Cookie: 'canary_uuid=c484c57b46a508a02aefb0de7b59b649; user_device_id=e063e39286b84619a0719071999b791b; user_device_id_timestamp=1699982656555; Hm_lvt_fdafb975c7b15a614fe2dd7716c44e87=1699982658; _ga=GA1.1.1071139361.1699982658; gd.sid=uJkS-dDPaSDkXDwjIn-blnGKJWRmUKK_; gd.sid.sig=4SZesIXibMvTy1eixfS4Jq4Kehk; token={"access_token":"eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjE2NDg2MzA2NzcsImF1ZCI6Imdhb2Rpbmd4IiwiZXhwIjoxNzAwMDI1OTA5LCJqdGkiOiJlOTAyYjJlNTE2YmQxZDFkNGRjNmZlOTZjMDBhNmQyYzNmMDI1YzY2In0.ZhT2fQKGI_hMOfxD4OJxhXxmw9IZt6FM9QBAjo-L730","access_token_life_time":43200,"refresh_token":"1c9890027288c2f4a273ffbfd5d99bdefce97698","refresh_token_life_time":1296000,"timestamp":1699982709315}; token.prod=eyJhY2Nlc3NfdG9rZW4iOiJleUowZVhBaU9pSnFkM1FpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcGMzTWlPaUoxYlhNaUxDSnpkV0lpT2pFMk5EZzJNekEyTnpjc0ltRjFaQ0k2SW1kaGIyUnBibWQ0SWl3aVpYaHdJam94TnpBd01ESTFPVEE1TENKcWRHa2lPaUpsT1RBeVlqSmxOVEUyWW1ReFpERmtOR1JqTm1abE9UWmpNREJoTm1ReVl6Tm1NREkxWXpZMkluMC5aaFQyZlFLR0lfaE1PZnhENE9KeGhYeG13OUladDZGTTlRQkFqby1MNzMwIiwiYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTE1VDA1OjI1OjA5LjAwMFoiLCJhY2Nlc3NfdG9rZW5fbGlmZV90aW1lIjo0MzIwMCwicmVmcmVzaF90b2tlbiI6IjFjOTg5MDAyNzI4OGMyZjRhMjczZmZiZmQ1ZDk5YmRlZmNlOTc2OTgiLCJyZWZyZXNoX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTI5VDE3OjI1OjA5LjMwMFoiLCJyZWZyZXNoX3Rva2VuX2xpZmVfdGltZSI6MTI5NjAwMCwidGltZXN0YW1wIjoxNjk5OTgyNzA5NDAzfQ==; gray-user.prod=1; token.org_id.prod=8026207550660305946; init_welcome_key=1; x-product-type=INDIVIDUAL_FREE; has_org.prod=1; Hm_lpvt_fdafb975c7b15a614fe2dd7716c44e87=1699982774; _ga_GNS4BGH70N=GS1.1.1699982657.1.1.1699983435.0.0.0; acw_tc=0bde432216999929641611376ea6c35196f0c00e923fd7c2c5edb3647b2246',
    Host: 'www.gaoding.com',
    Pragma: 'no-cache',
    Referer: 'https://www.gaoding.com/editor/design?id=193298900',
    'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'x-channel-id': '32',
    'x-gd-traffic-tags': 'base',
    'x-product-type': 'INDIVIDUAL_FREE'
  },
};


const page_size = 300
let page_num = 1

/**
 * 传入一个id, 获取该id的对应类型的组件数据列表
 * */
async function _crawlMaterialDataDetail(id, page_size, page_num) {
  if (!id || !page_size || !page_num) return
  return new Promise((resolve, reject) => {
    fetch(`https://www.gaoding.com/api/v3/cp/search-contents/simple?page_size=${page_size}&filter_id=${id}&is_group=true&page_num=${page_num}`, options)
      .then(response => response.json())
      .then(response => resolve(response))
      .catch(err => reject(err));
  })
}

let resultCont = 0

/** 递归调用获取该 素材类型下的所有小组件 */
export async function crawlMaterialDataDetail(id, callback) {
  let cont = 500
  while (cont--) {
    const res = await _crawlMaterialDataDetail(id, page_size, page_num++)
    if (!Array.isArray(res) || res.length === 0) {   // 递归时如果下个页面已经没有数据了则回归
      page_num = 1
      resultCont = 0
      return
    }
    resultCont += res.length
    if (isFunction(callback)) callback(res)
    console.log('当前素材类型id', id, '已获取小组件个数', resultCont)
    await sleep(1000)  // 每个请求间隔2秒，关爱稿定，不能太快太离谱
  }
}


