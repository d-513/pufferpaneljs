import { PufferServer } from ".";
/**
 * Class for sending commands to a server
 */
class PufferConsole {
  /**
   * @param {PufferServer} server - The server of console
   */
  constructor(server) {
    this._server = server;
  }

  /**
   * @async
   * @param {string} command - The command to send
   * @returns {Promise<null>}
   */
  async send(command) {
    this._server._ws.send(JSON.stringify({ type: "console", command }));
    return null;
  }
}

export default PufferConsole;
