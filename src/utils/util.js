import NetdiskConstant from './NetdiskConstant'

const SIGN_REGEXP = /([yMdhsm])(\1*)/g;
const DEFAULT_PATTERN = 'yyyy-MM-dd';
function padding (s, len) {
  len = len - (s + '').length;
  for (var i = 0; i < len; i++) { s = '0' + s; }
  return s;
}

export default {
  formatDateHuman (time) {
    const d = time
    const now = new Date().getTime()

    const diff = (now - d) / 1000

    if (diff < 30) {
      return '刚刚'
    } else if (diff < 3600) { // less 1 hour
      return Math.ceil(diff / 60) + '分钟前'
    } else if (diff < 3600 * 24) {
      return Math.ceil(diff / 3600) + '小时前'
    } else if (diff < 3600 * 24) {
      return '1天前'
    } else {
      return Math.ceil(diff / (3600 * 24)) + '天前'
    }
  },
  formatDate: {

    format: function (date, pattern) {
      pattern = pattern || DEFAULT_PATTERN;
      return pattern.replace(SIGN_REGEXP, function ($0) {
        switch ($0.charAt(0)) {
          case 'y': return padding(date.getFullYear(), $0.length);
          case 'M': return padding(date.getMonth() + 1, $0.length);
          case 'd': return padding(date.getDate(), $0.length);
          case 'w': return date.getDay() + 1;
          case 'h': return padding(date.getHours(), $0.length);
          case 'm': return padding(date.getMinutes(), $0.length);
          case 's': return padding(date.getSeconds(), $0.length);
        }
      });
    },
    parse: function (dateString, pattern) {
      const matchs1 = pattern.match(SIGN_REGEXP);
      const matchs2 = dateString.match(/(\d)+/g);
      if (matchs1.length === matchs2.length) {
        const _date = new Date(1970, 0, 1);
        for (let i = 0; i < matchs1.length; i++) {
          const _int = parseInt(matchs2[i]);
          const sign = matchs1[i];
          switch (sign.charAt(0)) {
            case 'y': _date.setFullYear(_int); break;
            case 'M': _date.setMonth(_int - 1); break;
            case 'd': _date.setDate(_int); break;
            case 'h': _date.setHours(_int); break;
            case 'm': _date.setMinutes(_int); break;
            case 's': _date.setSeconds(_int); break;
          }
        }
        return _date;
      }
      return null;
    }
  },
  formatFileSize: function (fileSize) {
    if (fileSize) {
      if (fileSize > 1024 * 1024) {
        fileSize = fileSize / (1024 * 1024);
        return fileSize.toFixed(2) + 'M';
      } else {
        fileSize = fileSize / 1024;
        return fileSize.toFixed(2) + 'KB';
      }
    } else {
      return '--';
    }
  },
  fileIcoFilter (fileType) {
    switch (fileType) {
      case NetdiskConstant.FILE_TYPE_OF_DIR :
        return require('@/assets/file_ico/Folder_24_e0cacad.png')
      case NetdiskConstant.FILE_TYPE_OF_TXT :
        return require('@/assets/file_ico/Text_24_dd1b3d8.png')
      case NetdiskConstant.FILE_TYPE_OF_WORD :
        return require('@/assets/file_ico/Word_24_1e078ab.png')
      case NetdiskConstant.FILE_TYPE_OF_EXCEL :
        return require('@/assets/file_ico/Excel_24_614e53a.png')
      case NetdiskConstant.FILE_TYPE_OF_POWERPOINT :
        return require('@/assets/file_ico/PPT_24_0af6886.png')
      case NetdiskConstant.FILE_TYPE_OF_PDF :
        return require('@/assets/file_ico/PDF_24_5caf7bf.png')
      case NetdiskConstant.FILE_TYPE_OF_PIC :
        return require('@/assets/file_ico/Picture_24_dd06d30.png')
      case NetdiskConstant.FILE_TYPE_OF_MUSIC :
        return require('@/assets/file_ico/Music_24_04cf4b7.png')
      case NetdiskConstant.FILE_TYPE_OF_VIDEO :
        return require('@/assets/file_ico/Video_24_499ddeb.png')
      case NetdiskConstant.FILE_TYPE_OF_ZIP :
        return require('@/assets/file_ico/ZIP_24_3670294.png')
      case NetdiskConstant.FILE_TYPE_OF_APK :
        return require('@/assets/file_ico/Android_24_a529a3a.png')
      case NetdiskConstant.FILE_TYPE_OF_OTHER :
        return require('@/assets/file_ico/Misc_24_156416f.png')
    }
  },
  // 文件名过长截取
  formatFileName (fileRealName, isDir) {
    const fileNamelength = fileRealName.length
    const reg = /[\u3400-\u4DB5\u4E00-\u9FA5\u9FA6-\u9FBB\uF900-\uFA2D\uFA30-\uFA6A\uFA70-\uFAD9\uFF00-\uFFEF\u2E80-\u2EFF\u3000-\u303F\u31C0-\u31EF]/
    let flag = 0
    for (let i = 0; i < fileNamelength; i++) {
      let char = fileRealName.charAt(i)
      if (reg.test(char)) {
        flag++
      }
    }
    // 汉字占比
    const percent = flag / fileNamelength
    if (percent >= 0.35) {
      if (fileNamelength >= 20) {
        if (isDir) {
          fileRealName = `${fileRealName.substring(0, 10)}...${fileRealName.substring(fileNamelength - 10, fileNamelength)}`
        } else {
          fileRealName = `${fileRealName.substring(0, 15)}...${fileRealName.substring(fileNamelength - 5, fileNamelength)}`
        }
      }
    } else {
      if (fileNamelength >= 30) {
        if (isDir) {
          fileRealName = `${fileRealName.substring(0, 20)}...${fileRealName.substring(fileNamelength - 10, fileNamelength)}`
        } else {
          fileRealName = `${fileRealName.substring(0, 25)}...${fileRealName.substring(fileNamelength - 5, fileNamelength)}`
        }
      }
    }
    return fileRealName
  }
};
