import { post } from '../utils/request'

export const FriendRequestOption = params => {
  return post('friendRequest/friendRequestOption', params).then(res => res.data)
}

export const SearchFriend = params => {
  return post('friendRequest/searchFriend', params).then(res => res.data)
}

export const AddFriendRequest = params => {
  return post('friendRequest/addFriendRequest', params).then(res => res.data)
}
