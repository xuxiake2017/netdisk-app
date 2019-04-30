import { post } from '../utils/request'

export const SendMessage = params => {
  return post('tuling/sendMessage', params, {stringify: true}).then(res => res.data)
}
