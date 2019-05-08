import { post } from '../utils/request'

export const ParseToHtmlDecimal = params => {
  return post('emoji/parseToHtmlDecimal', params).then(res => res.data)
}
