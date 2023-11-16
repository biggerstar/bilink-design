import {initMetaData} from "./main/init/init-meta.js";
import {MaterialIds} from "../common/MaterialIds.js";
import {crawlMaterialData} from "./main/crawl-material.js";
import {init_table} from "../common/db/init-table.js";
import {pref_table} from "./pref_table.js";

/*----------------------------初始化环境------------------------------------*/
await init_table()
await initMetaData()
/*------------------------------爬取---------------------------------------*/
// await crawlMaterialData(MaterialIds.iconRoot )  // 爬取svg图标素材数据
// await crawlMaterialData(MaterialIds.textRoot)  // 爬取文字素材数据
// await crawlMaterialData(MaterialIds.imagesRoot,29)  // 爬取图片素材数据
// await crawlMaterialData(MaterialIds.templateRoot,29)  // 爬取模板素材数据

/*-----------------------------数据清洗--------------------------------------*/

// await pref_table()
