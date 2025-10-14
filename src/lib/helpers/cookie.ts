import jwt from 'jsonwebtoken'
export function Cookies(): Record<string, any> {
  return document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=')
    if (!key.startsWith('__next'))
      acc = {
        ...acc,
        [key]: value,
      }

    if (key.toLowerCase() === 'token') {
      const { iat, exp, ...decoded } = jwt.decode(value) as Record<string, any>

      acc = {
        ...acc,
        ...decoded,
      }
      if (exp) {
        acc = {
          ...acc,
          expires: new Date(exp * 1000),
        }
      }
      if (iat) {
        acc = {
          ...acc,
          issued: new Date(iat * 1000),
        }
      }
    }
    return acc
  }, {})
}
