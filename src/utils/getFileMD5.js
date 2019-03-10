import SparkMD5 from 'spark-md5'
import ElementUI from 'element-ui'
import { CheckMd5 } from '@/api/file'
import store from '../store'

/**
 * 计算文件md5值
 * @param file
 * @param uid
 * @param parentId
 * @constructor
 */
export default function GetFileMD5 (file, uid, parentId) {
  let md5Hex = null;
  let isExist = true
  let fileReader = new FileReader()
  let blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;

  let fileSize = file.size;
  let fileRealName = file.name;
  let lastModifiedDate = file.lastModifiedDate.getTime();
  if (fileSize > 1024 * 1024 * 500) {
    ElementUI.Notification.error({
      title: 'error',
      message: '文件过大，请重新选择',
      duration: 2000
    });
    return;
  }
  let chunkSize = 2097152;
  // read in chunks of 2MB
  let chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  let spark = new SparkMD5();

  fileReader.onload = function (e) {
    // console.log("read chunk nr", currentChunk + 1, "of", chunks);
    spark.appendBinary(e.target.result); // append binary string
    currentChunk++;

    if (currentChunk < chunks) {
      loadNext();
    } else {
      // console.log("finished loading");
      md5Hex = spark.end();
      // console.info("computed hash", md5); // compute hash
      console.log(md5Hex)
      if (md5Hex) {
        CheckMd5({md5Hex}).then(res => {
          console.log(res)
          if (res.data === 20034) {
            // 服务器存在该MD5值
            isExist = true
          } else if (res.data === 20033) {
            // 服务器不存在该MD5值
            isExist = false
          }
          store.commit('storeFile', {uid, md5Hex, fileSize, fileRealName, lastModifiedDate, parentId, isExist})
        }).catch(res => {
        })
      }
    }
  };
  function loadNext () {
    let start = currentChunk * chunkSize
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsBinaryString(blobSlice.call(file, start, end));
  }
  loadNext();
}
