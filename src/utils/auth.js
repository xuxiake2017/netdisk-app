import Cookies from 'js-cookie'

const TokenKey = 'X-Token'

export function getToken () {
  if (window.cordova) {
    return window.localStorage.getItem(TokenKey)
  } else {
    return Cookies.get(TokenKey)
  }
}

export function setToken (token) {
  if (window.cordova) {
    window.localStorage.setItem(TokenKey, token)
  } else {
    return Cookies.set(TokenKey, token)
  }
}

export function removeToken () {
  if (window.cordova) {
    return window.localStorage.removeItem(TokenKey)
  } else {
    return Cookies.remove(TokenKey)
  }
}
