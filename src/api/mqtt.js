import { post } from '../utils/request'

export const LightOption = params => {
  return post('mqtt/lightOption', params, {stringify: true}).then(res => res.data)
}
