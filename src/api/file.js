import { post } from '../utils/request'

export const GetFileList = params => {
  return post('file/listFile', params, {stringify: true}).then(res => res.data)
}

export const CheckMd5 = params => {
  return post('file/checkMd5', params, {stringify: true}).then(res => res.data)
}

export const UploadMD5 = params => {
  return post('file/uploadMD5', params, {stringify: true}).then(res => res.data)
}

export const ListAllDir = params => {
  return post('dir/listAllDir', params, {stringify: true}).then(res => res.data)
}

export const MkDir = params => {
  return post('dir/mkDir', params, {stringify: true}).then(res => res.data)
}

export const MoveFile = params => {
  return post('dir/moveFile', params, {stringify: true}).then(res => res.data)
}

export const ReName = params => {
  return post('file/reName', params, {stringify: true}).then(res => res.data)
}

export const GetDocumentList = params => {
  return post('file/getDocumentList', params, {stringify: true}).then(res => res.data)
}

export const GetVideoList = params => {
  return post('file/getVideoList', params, {stringify: true}).then(res => res.data)
}

export const GetAudioList = params => {
  return post('file/getAudioList', params, {stringify: true}).then(res => res.data)
}

export const GetPicList = params => {
  return post('file/getPicList', params, {stringify: true}).then(res => res.data)
}

export const DeleteFile = params => {
  return post('file/deleteFile', params).then(res => res.data)
}

export const GetPathStore = params => {
  return post('file/getPathStore', params).then(res => res.data)
}

export const FindById = params => {
  return post('file/findById', params).then(res => res.data)
}

export const GetFileMediaInfo = params => {
  return post('file/getFileMediaInfo', params).then(res => res.data)
}
