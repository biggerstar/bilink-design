import Template from "../db/model/Template.js";

import sleep from 'atomic-sleep'
import {crawlTemplateDetail} from "./crawl-template-detail.js";

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    authorization: 'Bearer eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjE2NDg2MzA2NzcsImF1ZCI6Imdhb2Rpbmd4IiwiZXhwIjoxNzAwMDI1OTA5LCJqdGkiOiJlOTAyYjJlNTE2YmQxZDFkNGRjNmZlOTZjMDBhNmQyYzNmMDI1YzY2In0.ZhT2fQKGI_hMOfxD4OJxhXxmw9IZt6FM9QBAjo-L730',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Cookie: 'acw_tc=0b32823e16999826556722762e9d57d71c14596db5042ee2dc4f4657eb100a; canary_uuid=c484c57b46a508a02aefb0de7b59b649; user_device_id=e063e39286b84619a0719071999b791b; user_device_id_timestamp=1699982656555; canary=gaoding.com/?; Hm_lvt_fdafb975c7b15a614fe2dd7716c44e87=1699982658; _ga=GA1.1.1071139361.1699982658; gd.sid=uJkS-dDPaSDkXDwjIn-blnGKJWRmUKK_; gd.sid.sig=4SZesIXibMvTy1eixfS4Jq4Kehk; token={"access_token":"eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjE2NDg2MzA2NzcsImF1ZCI6Imdhb2Rpbmd4IiwiZXhwIjoxNzAwMDI1OTA5LCJqdGkiOiJlOTAyYjJlNTE2YmQxZDFkNGRjNmZlOTZjMDBhNmQyYzNmMDI1YzY2In0.ZhT2fQKGI_hMOfxD4OJxhXxmw9IZt6FM9QBAjo-L730","access_token_life_time":43200,"refresh_token":"1c9890027288c2f4a273ffbfd5d99bdefce97698","refresh_token_life_time":1296000,"timestamp":1699982709315}; token.prod=eyJhY2Nlc3NfdG9rZW4iOiJleUowZVhBaU9pSnFkM1FpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcGMzTWlPaUoxYlhNaUxDSnpkV0lpT2pFMk5EZzJNekEyTnpjc0ltRjFaQ0k2SW1kaGIyUnBibWQ0SWl3aVpYaHdJam94TnpBd01ESTFPVEE1TENKcWRHa2lPaUpsT1RBeVlqSmxOVEUyWW1ReFpERmtOR1JqTm1abE9UWmpNREJoTm1ReVl6Tm1NREkxWXpZMkluMC5aaFQyZlFLR0lfaE1PZnhENE9KeGhYeG13OUladDZGTTlRQkFqby1MNzMwIiwiYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTE1VDA1OjI1OjA5LjAwMFoiLCJhY2Nlc3NfdG9rZW5fbGlmZV90aW1lIjo0MzIwMCwicmVmcmVzaF90b2tlbiI6IjFjOTg5MDAyNzI4OGMyZjRhMjczZmZiZmQ1ZDk5YmRlZmNlOTc2OTgiLCJyZWZyZXNoX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTI5VDE3OjI1OjA5LjMwMFoiLCJyZWZyZXNoX3Rva2VuX2xpZmVfdGltZSI6MTI5NjAwMCwidGltZXN0YW1wIjoxNjk5OTgyNzA5NDAzfQ==; gray-user.prod=1; token.org_id.prod=8026207550660305946; init_welcome_key=1; x-product-type=INDIVIDUAL_FREE; has_org.prod=1; Hm_lpvt_fdafb975c7b15a614fe2dd7716c44e87=1699982774; _ga_GNS4BGH70N=GS1.1.1699982657.1.1.1699982774.0.0.0',
    Host: 'www.gaoding.com',
    Pragma: 'no-cache',
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

/*
* 详情页 id: 4971536
* 海报   id: 4971426
* PPT   id: 4971545
* */

const maxPage = 7
const _maxPage = process.env.ENV === 'development' ? 1 : maxPage
const page_size = 80
let page_num = 1

export async function crawlTemplateData() {
  for (let i = 0; i < _maxPage; i++) { //  相似模板接口, 如果有大规模爬取可以通过种子拓开广度进行爬取,当前只爬取小部分
    const url = `https://www.gaoding.com/api/v3/cp/recommend-contents/templates/similar?page_size=${page_size}&biz_code=1&page_num=${page_num}`
    console.log('当前page_num:', page_num, 'page_size:', page_size)
    sleep(3000)
    page_num++
    await fetch(url, options)
      .then(res => res.json())
      .then(async (res) => {
        if (!Array.isArray(res)) return
        const allDetail = res.map(async (item) => {
          const hasItem = await Template.findByPk(item.id)
          if (!hasItem) return crawlTemplateDetail(item.id)  // 如果不在数据库中则发起请求
        })
        const allRes = await Promise.all(allDetail)
        return allRes.map((templateData, index) => {
          return {
            id: res[index].id,
            desc: res[index],
            detail: templateData,
          }
        })
      })
      .then(res => {
        res.forEach(async (item) => {
          if (!item) return
          await Template.create({
            id: item.id,
            desc: item.desc,
            detail: item.detail
          })
        })
      })
      .catch(err => console.error(err));
  }
}

