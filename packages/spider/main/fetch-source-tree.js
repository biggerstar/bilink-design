/** 获取某个分类id下的树结构 */
export function fetchSourceTree(id) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      authorization: 'Bearer eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjE2NDg2MzA2NzcsImF1ZCI6Imdhb2Rpbmd4IiwiZXhwIjoxNzAwMDY5NzIyLCJqdGkiOiI2Mzk5NjIxYTE0MmVjMTBjYzJlNDYwYTQ5NjNjODk0YTMzYjg4NTk4In0.kH2DdDLOSizKM0ss0XiWSXMPzEFf6eMF-_BPBLpNzAA',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'content-type': 'application/json',
      Cookie: 'canary_uuid=c484c57b46a508a02aefb0de7b59b649; user_device_id=e063e39286b84619a0719071999b791b; user_device_id_timestamp=1699982656555; Hm_lvt_fdafb975c7b15a614fe2dd7716c44e87=1699982658; _ga=GA1.1.1071139361.1699982658; gd.sid=uJkS-dDPaSDkXDwjIn-blnGKJWRmUKK_; gd.sid.sig=4SZesIXibMvTy1eixfS4Jq4Kehk; token={"access_token":"eyJ0eXAiOiJqd3QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1bXMiLCJzdWIiOjE2NDg2MzA2NzcsImF1ZCI6Imdhb2Rpbmd4IiwiZXhwIjoxNzAwMDI1OTA5LCJqdGkiOiJlOTAyYjJlNTE2YmQxZDFkNGRjNmZlOTZjMDBhNmQyYzNmMDI1YzY2In0.ZhT2fQKGI_hMOfxD4OJxhXxmw9IZt6FM9QBAjo-L730","access_token_life_time":43200,"refresh_token":"1c9890027288c2f4a273ffbfd5d99bdefce97698","refresh_token_life_time":1296000,"timestamp":1699982709315}; gray-user.prod=1; token.org_id.prod=8026207550660305946; init_welcome_key=1; x-product-type=INDIVIDUAL_FREE; token.prod=eyJhY2Nlc3NfdG9rZW4iOiJleUowZVhBaU9pSnFkM1FpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcGMzTWlPaUoxYlhNaUxDSnpkV0lpT2pFMk5EZzJNekEyTnpjc0ltRjFaQ0k2SW1kaGIyUnBibWQ0SWl3aVpYaHdJam94TnpBd01EWTVOekl5TENKcWRHa2lPaUkyTXprNU5qSXhZVEUwTW1Wak1UQmpZekpsTkRZd1lUUTVOak5qT0RrMFlUTXpZamc0TlRrNEluMC5rSDJEZERMT1NpektNMHNzMFhpV1NYTVB6RUZmNmVNRi1fQlBCTHBOekFBIiwiYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTE1VDE3OjM1OjIyLjAwMFoiLCJhY2Nlc3NfdG9rZW5fbGlmZV90aW1lIjo0MzIwMCwicmVmcmVzaF90b2tlbiI6IjI5YmNlZTU5MjUwNzVmN2ExMzYzYzlhN2E2ZWQ3NTllMDRkMTI4NGQiLCJyZWZyZXNoX3Rva2VuX2V4cGlyZXNfYXQiOiIyMDIzLTExLTMwVDA1OjM1OjIyLjgzN1oiLCJyZWZyZXNoX3Rva2VuX2xpZmVfdGltZSI6MTI5NjAwMCwidGltZXN0YW1wIjoxNzAwMDI2NTIyODA0fQ==; acw_tc=0b32823e17000616489996406e9d3dddf56d1e5215b5b99dc6cf0ad80e0b41; has_org.prod=1; Hm_lpvt_fdafb975c7b15a614fe2dd7716c44e87=1700061672; _ga_GNS4BGH70N=GS1.1.1700061652.4.1.1700061682.0.0.0',
      Host: 'www.gaoding.com',
      Origin: 'https://www.gaoding.com',
      Pragma: 'no-cache',
      Referer: 'https://www.gaoding.com/editor/design?mode=user&',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      'x-channel-id': '32',
    },
    body: `{"id":${id}}`
  }

  return new Promise((resolve, reject) => {
    fetch('https://www.gaoding.com/api/v3/cp/v2/filters/single', options)
      .then(response => response.json())
      .then(response => resolve(response))
      .catch(err => reject(err));
  })
}
