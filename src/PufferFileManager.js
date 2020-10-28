import PufferFile from "./PufferFile";
import PufferServer from "./PufferServer";
import { simpleWsListener } from "../utils/protocol";
import path from "path";
import slash from "slash";
/**
 * PufferServer File Manager
 */
class PufferFileManager {
  /**
   * @param {PufferServer} server - The server of the manager
   */
  constructor(server) {
    this._server = server;
  }

  /**
   * Gets the file list of the server
   * @param {string} path - The optional path to the directory
   * @returns {Promise<Array<PufferFile>>} - The list of files
   */
  async getFiles(path = "/") {
    await this._server._ws.send(
      JSON.stringify({ action: "get", type: "file", path, edit: false })
    );
    const res = await simpleWsListener(this._server._ws, "file");
    const files = [];
    if (!Array.isArray(res.data.files)) return [];
    res.data.files.forEach((file) => {
      if (!file.isFile) {
        return;
      }
      files.push(
        new PufferFile(this, `${path}${file.name}`, {
          name: file.name,
          modifyTime: new Date(file.modifyTime),
          size: file.size,
          extension: file.extension,
        })
      );
    });
    return files;
  }

  async createFile(filepath) {
    await this._server._axios.put(
      `/proxy/daemon/server/${this._server.id}/file/${filepath}`,
      ""
    );
    // The slash module is used as a workaround for Windows paths
    const files = await this.getFiles(slash(path.join(filepath, "..")));
    return files.find((file) => file._filepath === filepath);
  }
}

export default PufferFileManager;
