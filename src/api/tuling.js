import { post } from '../utils/request'

export const Test = params => {
  return post('http://openapi.tuling123.com/openapi/api/v2', params, {stringify: false}).then(res => res.data)
}
