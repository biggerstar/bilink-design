import ModelFonts from "../../common/db/model/Fonts.js";

const options = {
  method: 'GET',
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    Connection: 'keep-alive',
    Cookie: 'canary_uuid=e1f82f78a883bb6bc4a5220434eb4a0d; user_device_id=4a528c0e023c480c9363cf545ec26093; user_device_id_timestamp=1699982528279; x-product-type=INDIVIDUAL_FREE; _ga=GA1.1.503498900.1699982542; Hm_lvt_fdafb975c7b15a614fe2dd7716c44e87=1699982543,1700081130; gd.sid=fp9Wp6JRGgxlk3W1UF7N2xh3rvyDoWaX; gd.sid.sig=m7GswpFpwSnAFhttW9L3zLU4Wlc; token={"access_token":"eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjM4MDIwMDg5LCJhdWQiOiJnYW9kaW5neCIsImV4cCI6MTcwMDI0MDUwMywianRpIjoiZWUyNzBlNGY5MDYxOTA0NzY2MzgzMzA0ZGVkN2IyNGM0ODgzZWY3YyJ9.8nfoSJ-pYSQMH3YPctOow3pg6tosBV_iBpvl4gxis0E","access_token_life_time":43200,"refresh_token":"c2a9ca08e46b7fdb4258da88ed3968440108297d","refresh_token_life_time":1296000,"timestamp":1700197303786}; token.org_id.prod=8022919979521950817; has_org.prod=1; Hm_lpvt_fdafb975c7b15a614fe2dd7716c44e87=1700197318; gray-user.prod=1; _ga_GNS4BGH70N=GS1.1.1700197246.4.1.1700197328.0.0.0; token.prod=eyJhY2Nlc3NfdG9rZW4iOiJleUowZVhBaU9pSnFkM1FpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcGMzTWlPaUoxYlhNaUxDSnpkV0lpT2pNNE1ESXdNRGc1TENKaGRXUWlPaUpuWVc5a2FXNW5lQ0lzSW1WNGNDSTZNVGN3TURNek5qUXhPQ3dpYW5ScElqb2lPVEkwTkRZNE1UWTVOR0k0T0RBeE5tWmxOREk0WWpneFkyVTBObUZpTWpFd09EWmtaR0poT0NKOS5VSEJiNXZWSmVCOTFNM255ODZmOU5Gd0JjSzBmelUtckwzVElVRGl6MmdRIiwiYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTE4VDE5OjQwOjE4LjAwMFoiLCJhY2Nlc3NfdG9rZW5fbGlmZV90aW1lIjo0MzIwMCwicmVmcmVzaF90b2tlbiI6IjJhN2I0NmRkN2Q5OGE3MDhlNjIxYzJiZDQzZDkzNzJmYzkxMzA5NDMiLCJyZWZyZXNoX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTEyLTAzVDA3OjQwOjE4LjI5OVoiLCJyZWZyZXNoX3Rva2VuX2xpZmVfdGltZSI6MTI5NjAwMCwidGltZXN0YW1wIjoxNzAwMjkzMjE4MzI0fQ==; acw_tc=0b32823e17003328085978564e9d3d9295b45e830c9494bf478fdfe6084b0b',
    Host: 'www.gaoding.com',
    Referer: 'https://www.gaoding.com/editor/design?mode=user&id=26112933247478838',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    accept: 'application/json, text/plain, */*',
    authorization: 'Bearer eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjM4MDIwMDg5LCJhdWQiOiJnYW9kaW5neCIsImV4cCI6MTcwMDMzNjQxOCwianRpIjoiOTI0NDY4MTY5NGI4ODAxNmZlNDI4YjgxY2U0NmFiMjEwODZkZGJhOCJ9.UHBb5vVJeB91M3ny86f9NFwBcK0fzU-rL3TIUDiz2gQ',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'x-channel-id': '32',
    'x-product-type': 'INDIVIDUAL_FREE'
  },
};

const page_size = 100
let cont = 0

export async function crawl_all_fonts() {
  for (let i = 1; i < 200; i++) {
    const url = `https://www.gaoding.com/api/tb-dam/editors/fonts?page_size=${page_size}&page_num=${i}&source=GD&permission_code=USE`
    const res = await fetch(url, options)
      .then(response => response.json())
    if (!res || (Array.isArray(res) && !res.length)) {
      console.log('爬取完成，共', cont, '项字体.');
      break
    }
    if (Array.isArray(res)) {
      console.log('本次获取长度', res.length)
      cont += res.length
      res.forEach(item => {
        ModelFonts.findOrCreate({
          where: {
            id: item.id
          },
          defaults: {
            id: item.id.toString().trim(),
            name: item.name.trim(),
            data: item
          }
        }).then(() => {
          console.log('插入成功:', item.id, ' 字体名称:', item.name)
        })
      })
    }
  }
}
