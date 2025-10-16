export async function getRequest(path: string, options?: { [k: string]: any }) {
  const { signal, ...headers } = (options || {}) as { [k: string]: any }

  if (typeof localStorage !== 'undefined') {
    headers.authorization = `Bearer ${localStorage.getItem('token')}`
  }

  return await fetch(path, {
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
      ...headers,
    },
    signal,
  }).then((xhr) => {
    if (xhr.headers.get('x-token')) {
      const token = xhr.headers.get('x-token')!
      localStorage.setItem('token', token)
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 14};`
    }
    return xhr.ok
      ? xhr.json()
      : Promise.resolve({
          status: xhr.statusText,
          code: xhr.status,
          error: xhr.text(),
        })
  })
}

export async function postRequest(path: string, body: any, options?: { [k: string]: string }) {
  const headers: Record<string, string> = {
    ...options,
  }
  if (typeof localStorage !== 'undefined') {
    headers.authorization = `Bearer ${localStorage.getItem('token')}`
  }
  if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'

  return await fetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  }).then((xhr) => {
    if (xhr.headers.get('x-token')) {
      const token = xhr.headers.get('x-token')!
      localStorage.setItem('token', token)
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 14};`
    }
    return xhr.ok
      ? xhr.json()
      : Promise.resolve({
          status: xhr.statusText,
          code: xhr.status,
          error: xhr.text(),
        })
  })
}

export async function uploadRequest(path: string, file: any, options?: { [k: string]: string }) {
  const headers: Record<string, string> = {
    ...options,
  }
  if (typeof localStorage !== 'undefined') {
    headers.authorization = `Bearer ${localStorage.getItem('token')}`
  }

  return await fetch(path, {
    method: 'POST',
    body: file,
    headers,
  }).then((xhr) => {
    if (xhr.headers.get('x-token')) {
      const token = xhr.headers.get('x-token')!
      localStorage.setItem('token', token)
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 14};`
    }
    return xhr.ok
      ? xhr.json()
      : Promise.resolve({
          status: xhr.statusText,
          code: xhr.status,
          error: xhr.text(),
        })
  })
}

export async function putRequest(path: string, body: any, options?: { [k: string]: string }) {
  const headers: Record<string, string> = {
    ...options,
  }
  if (typeof localStorage !== 'undefined') {
    headers.authorization = `Bearer ${localStorage.getItem('token')}`
  }
  return await fetch(path, {
    method: 'PUT',
    body,
    headers,
  }).then((xhr) => {
    if (xhr.headers.get('x-token')) {
      const token = xhr.headers.get('x-token')!
      localStorage.setItem('token', token)
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 14};`
    }
    return xhr.ok
      ? xhr.json()
      : Promise.resolve({
          status: xhr.statusText,
          code: xhr.status,
          error: xhr.text(),
        })
  })
}
