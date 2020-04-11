import { post } from '../utils/request'

export const ShareFile = params => {
  return post('share/shareFile', params).then(res => res.data)
}

export const FindAll = params => {
  return post('share/findAll', params).then(res => res.data)
}

export const DeleteShare = params => {
  return post(`share/delete/${params}`).then(res => res.data)
}

export const GetShareFile = params => {
  return post('share/getShareFile', params).then(res => res.data)
}

export const CheckPwd = params => {
  return post('share/checkPwd', params).then(res => res.data)
}

export const GetSubList = params => {
  return post('share/getSubList', params).then(res => res.data)
}

export const SaveToCloud = params => {
  return post('share/saveToCloud', params).then(res => res.data)
}

export const GetShareFileMediaInfo = params => {
  return post('share/getFileMediaInfo', params).then(res => res.data)
}
