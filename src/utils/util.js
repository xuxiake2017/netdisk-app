import NetdiskConstant from './NetdiskConstant'

const SIGN_REGEXP = /([yMdhsm])(\1*)/g;
const DEFAULT_PATTERN = 'yyyy-MM-dd';
function padding (s, len) {
  len = len - (s + '').length;
  for (var i = 0; i < len; i++) { s = '0' + s; }
  return s;
}

export default {
  getQueryStringByName: function (name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let r = window.location.search.substr(1).match(reg);
    let context = '';
    if (r != null) { context = r[2]; }
    reg = null;
    r = null;
    return context == null || context === '' || context === 'undefined' ? '' : context;
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
  }
};
