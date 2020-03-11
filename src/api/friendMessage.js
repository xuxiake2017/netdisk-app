import { post } from '../utils/request'

export const GetFriendMessages = params => {
  return post('friendMessage/getFriendMessages', params).then(res => res.data)
}

export const GetServer = params => {
  return post('friendMessage/getServer', params).then(res => res.data)
}
