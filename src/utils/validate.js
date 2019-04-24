// 大小写字母数字
export function validateAlphaNum (value) {
  const res = /^[A-Za-z\d]+$/.test(value)
  if (!res) {
    return new Error('请仅输入大小写字母以及数字')
  }
  return new Error()
}

// 密码
export function validatePassword (value) {
  if (value.length < 6) {
    return new Error('密码长度不应小于6位')
  }
  return validateAlphaNum(value)
}

// 验证码
export function validateCaptcha (value) {
  if (value.length !== 4) {
    return new Error('验证码长度应为4位')
  } else if (!/^[A-Za-z\d]+$/.test(value)) {
    return new Error('验证码应只包含数字、字母')
  }
  return new Error()
}

// 手机
export function checkPhone (value) {
  value = value && value.toString().trim()
  const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(value)
  if (!isPhone) {
    return new Error('请输入正确的手机号')
  }
  return new Error()
}

export function checkEmail (value) {
  const val = value && value.toString().trim()
  if (!/^[A-Za-z0-9._%-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,4}$/.test(val)) {
    return new Error('请输入正确的邮箱地址')
  }
  return new Error()
}
