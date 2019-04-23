import { post } from '../utils/request'

export const RequestLogin = params => {
  return post('user/login', params, {stringify: false}).then(res => res.data)
}

export const Logout = params => {
  return post('user/logout', params).then(res => res.data)
}

export const GetInfo = params => {
  return post('user/getInfo', params).then(res => res.data)
}

export const Detail = params => {
  return post('user/detail', params).then(res => res.data)
}

export const Update = params => {
  return post('user/update', params, {stringify: false}).then(res => res.data)
}

export const CheckUserName = params => {
  return post('user/checkUserName', params).then(res => res.data)
}

export const CheckPhone = params => {
  return post('user/checkPhone', params).then(res => res.data)
}

export const CheckEmail = params => {
  return post('user/checkEmail', params).then(res => res.data)
}

export const CheckImgCode = params => {
  return post('user/checkImgCode', params).then(res => res.data)
}

export const SendCodeToPhone = params => {
  return post('verify/sendCodeToPhone', params).then(res => res.data)
}

export const VerifyEmail = params => {
  return post('verify/verifyEmail', params).then(res => res.data)
}

export const Register = params => {
  return post('user/register', params).then(res => res.data)
}

export const RegisterApp = params => {
  return post('user/registerApp', params).then(res => res.data)
}
