import { post } from '@/utils/request'

export const HaveRead = params => {
  return post('message/haveRead', params).then(res => res.data)
}
