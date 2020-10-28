/**
 * Utility to convert http/s url to ws/s
 * @method
 * @param {string} url
 * @return {string}
 */
export function httpToWs (url) {
  return url.replace(/(http)(s)?\:\/\//, 'ws$2://')
}

/**
 * Simple ws listener for specific type field
 * Used internally
 * @param {WebSocket} socket
 * @param {string} type
 */
export function simpleWsListener (socket, type) {
  return new Promise((resolve) => {
    const listener = socket.on('message', (msg) => {
      const message = JSON.parse(msg)
      if (message.type === type) {
        socket.removeEventListener(listener)
        return resolve(message)
      }
    })
  })
}
