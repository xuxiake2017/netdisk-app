import { post } from '../utils/request'

export const GetFriendMessages = params => {
  return post('friendMessage/getFriendMessages', params).then(res => res.data)
}
