import { post } from '../utils/request'

export const GetAllFriendNotify = params => {
  return post('friendNotify/getAll', params).then(res => res.data)
}
