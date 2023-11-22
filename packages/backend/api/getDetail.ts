import express from "express";
import {isString} from "is-what";
import {crawlTemplateDetail} from "../../spider/main/crawl-template-detail.js";

/**
 * 获取资源具体信息
 * */
export const router = express.Router();
router.get('/detail', async (req, res) => {
  let {id} = req.query
  if (isString(id)) {
    const detail = await crawlTemplateDetail(id)
    if (detail) {
      return res.status(200).send({
        code: 200,
        message: '成功',
        data: detail
      })
    }
  }
  res.send({
    code: 404,
    message: '资源不存在'
  })
})


