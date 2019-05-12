import { post } from '../utils/request'

export const FriendApplyForOption = params => {
  return post('friendApplyFor/friendApplyForOption', params).then(res => res.data)
}

export const SearchFriend = params => {
  return post('friendApplyFor/searchFriend', params).then(res => res.data)
}

export const AddFriendRequest = params => {
  return post('friendApplyFor/addFriendRequest', params).then(res => res.data)
}
