import { post } from '../utils/request'

export const FriendApplyForOption = params => {
  return post('friendApplyFor/friendApplyForOption', params).then(res => res.data)
}
