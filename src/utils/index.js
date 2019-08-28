export function browser (to) {
  const UA = navigator.userAgent;
  const ipad = !!(UA.match(/(iPad).*OS\s([\d_]+)/))
  const isIphone = !!(!ipad && UA.match(/(iPhone\sOS)\s([\d_]+)/))
  const isAndroid = !!(UA.match(/(Android)\s+([\d.]+)/))
  const isMobile = !!(isIphone || isAndroid)
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port
  const fullPath = to.fullPath
  const url = window.location.href
  if (isMobile) {
    if (url.indexOf('app') === -1) {
      if (fullPath.indexOf('/home/s') !== -1 || fullPath.indexOf('/home/verify') !== -1) {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/app/#${fullPath}`
        } else {
          location.href = `${protocol}//${hostname}/app/#${fullPath}`
        }
      } else {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/app`
        } else {
          location.href = `${protocol}//${hostname}/app`
        }
      }
      return false
    }
  } else {
    if (url.indexOf('app') !== -1) {
      if (fullPath.indexOf('/home/s') !== -1 || fullPath.indexOf('/home/verify') !== -1) {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}/#${fullPath}`
        } else {
          location.href = `${protocol}//${hostname}/#${fullPath}`
        }
      } else {
        if (port) {
          location.href = `${protocol}//${hostname}:${port}`
        } else {
          location.href = `${protocol}//${hostname}`
        }
      }
      return false
    }
  }
  return true
}
