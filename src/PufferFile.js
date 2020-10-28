/**
 * @typedef {Object} FileData
 * @property {string} name - The name of the file
 * @property {number} size - The size of the file, in bytes
 * @property {Date} modifyTime - The modification time of the file
 * @property {string} extension - The file extension
 */

import PufferFileManager from "./PufferFileManager";
import { simpleWsListener } from "../utils/protocol";

/**
 * File manager's file class
 * @property {FileData} info - The file info
 */
class PufferFile {
  /**
   * @param {PufferFileManager} manager - The file manager instance to use
   * @param {string} filepath - The path to the file
   * @param {FileData} data - The data
   */
  constructor(manager, filepath, data) {
    this.info = data;
    this._manager = manager;
    this._filepath = filepath;
  }

  /**
   * Gets the content of the file
   * @async
   * @returns {Promise<string>} - The content of the file
   */
  async getContent() {
    const res = await this._manager._server._axios.get(
      `/proxy/daemon/server/${this._manager._server.id}/file/${this._filepath}`
    );
    return res.data;
  }

  /**
   * Deletes the file
   * @async
   * @returns {Promise<undefined>}
   */
  async delete() {
    this._manager._server._ws.send(
      JSON.stringify({
        action: "delete",
        path: this._filepath,
        type: "file",
      })
    );
    await simpleWsListener(this._manager._server._ws, "file");
    return;
  }

  /**
   * Edits the file
   * @param {string} content - The new content of the file
   * @returns {Promies<undefined>}
   */
  async edit(content) {
    await this._manager._server._axios.put(
      `/proxy/daemon/server/${this._manager._server.id}/file/${this._filepath}`,
      content
    );
    return;
  }
}

export default PufferFile;
