/**
 * Status of a server
 * @typedef {Object} ServerStatus
 * @property {boolean} running
 */

/**
 * RAM and CPU usage of a server
 * @typedef {Object} ServerUsageStatus
 * @property {number} memory - The RAM used, in bytes
 * @property {number} cpu - The CPU usage, in percent 100 represents one core
 */

import { httpToWs, simpleWsListener } from "../utils/protocol";
import PufferFileManager from "./PufferFileManager";
import PufferConsole from "./PufferConsole";
import http from "axios";
import WebSocket from "isomorphic-ws";
import combineURLs from "axios/lib/helpers/combineURLs";
import events from "events";

/**
 * PufferPanel Server
 * @property {string} id - The ID of the server
 * @property {string} name - The name of the server
 * @property {Object} node - The node the server is hosted on
 * @property {Array} log - The console logs of the server
 * @property {FileManager} fileManager - The file manager
 * @property {Console} console - The console
 */
class PufferServer extends events.EventEmitter {
  /**
   *
   * @param {object} data - Server data from PufferClient#getServers
   * @param {string} session - The session ID to use
   * @param {string} url - The panel URL to use
   */
  constructor(data, session, url) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.node = data.node;
    this.log = [];
    this._url = url;
    this._session = session;
    this._ws = null;
    this._axios = http.create({
      baseURL: this._url,
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });
    this.fileManager = new PufferFileManager(this);
    this.console = new PufferConsole(this);
  }

  /**
   * Gets the status of the server.
   * @async
   * @returns {Promise<ServerStatus>}
   */
  async getStatus() {
    const res = await this._axios.get(`/proxy/daemon/server/${this.id}/status`);
    return res.data;
  }

  /**
   * Connects to the server's websocket
   * Most functions will not be available without calling this first.
   * @returns {Promise<WebSocket>} The WebSocket
   */
  connect() {
    this._ws = new WebSocket(
      httpToWs(combineURLs(this._url, `/proxy/daemon/socket/${this.id}`)),
      {
        headers: {
          Cookie: `puffer_auth=${this._session}`,
        },
      }
    );
    return new Promise((resolve, reject) => {
      this._ws.on("open", () => {
        this._registerWsEvents();
        resolve(this._ws);
      });
      this._ws.on("error", (err) => reject(err));
    });
  }

  /**
   * Disconnects the websocket connection
   * @return {Promise<undefined>}
   */
  disconnect() {
    return new Promise((resolve) => {
      this._ws.close();
      this._ws.on("close", () => resolve());
    });
  }

  /**
   * Gets the CPU and RAM usage stats of the server
   * @async
   * @returns {Promise<ServerUsageStatus>}
   */
  async getStats() {
    this._ws.send(JSON.stringify({ type: "stat" }));
    const res = await simpleWsListener(this._ws, "stat");
    return res.data;
  }

  /**
   * Replays logs from before the websocket connection was established
   * @async
   * @returns {Promise<Array>} - The array of log messages
   */
  async replayLogs() {
    this._ws.send(JSON.stringify({ type: "replay" }));
    const logs = await simpleWsListener(this._ws, "console");
    return logs.data.logs;
  }

  /**
   * Starts the server. Resolves after the daemon has received the message.
   * @async
   * @returns {Promise<null>}
   */
  async start() {
    this._ws.send(JSON.stringify({ type: "start" }));
    await simpleWsListener(this._ws, "status");
    return null;
  }

  /**
   * Stops the server. Resolves after the server is stopped. You may not want to await this call.
   * @async
   * @returns {Promise<string[]>} - The shutdown logs
   */
  async stop() {
    const log = [];
    this.on("log", (msg) => log.push(msg));
    this._ws.send(JSON.stringify({ type: "stop" }));
    await simpleWsListener(this._ws, "status");
    return log;
  }

  /**
   * Kills the server. Resolves after the process exits.
   * @async
   * @returns {Promise<null>}
   */
  async kill() {
    this._ws.send(JSON.stringify({ type: "kill" }));
    await simpleWsListener(this._ws, "status");
    return;
  }

  _registerWsEvents() {
    this._ws.on("message", (msg) => {
      const message = JSON.parse(msg);
      if (message.type === "console") {
        /**
         * Emmitted when a log message is received from the daemon
         * @event PufferServer#log
         * @type {string}
         */
        this.emit("log", message.data.logs.join("").trim());
        this.log.concat(message.data.logs);
      } else if (message.type === "stat") {
        /**
         * Emmitted when the server receives the cpu and ram usage status.
         * Won't be emmitted unless PufferServer#getStats is called
         * @event PufferServer#stat
         * @type {ServerUsageStatus}
         */
        this.emit("stat", message.data);
      }
    });
  }
}

export default PufferServer;
