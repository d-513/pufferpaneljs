import { EventEmitter } from "events";
import PufferServer from "./PufferServer";
import PufferUser from "./PufferUser";
import PufferTemplate from "./PufferTemplate";
import http from "axios";

/**
 * @typedef {Object} UserCredentials
 * @property {string} email - The email address of the user
 * @property {string} password - The password of the user
 */
/**
 * PufferPanel Client.
 * Main class for interacting with the panel
 * @property {UserCredentials} credentials - The login credentials
 */
class PufferClient extends EventEmitter {
  /**
   * @param {UserCredentials} credentials - The login credentials
   * @param {string} url - The panel's url
   */
  constructor(credentials, url) {
    super();
    this.credentials = credentials;
    this._url = url;
    this._axios = http.create({
      baseURL: this._url,
    });
  }

  /**
   * Logs the client into panel.
   * @async
   * @returns {Promise<string>} The session ID
   */
  async login() {
    const res = await this._axios.post("/auth/login", {
      email: this.credentials.email,
      password: this.credentials.password,
    });

    this._session = res.data.session;
    this._scopes = res.data.scopes;

    // auto-add header for auth
    this._axios = http.create({
      baseURL: this._url,
      headers: { Authorization: `Bearer ${this._session}` },
    });

    // emit login event
    this.emit("login", this.credentials, this._session);
    return this._session;
  }

  /**
   * Gets the server list.
   * @async
   * @returns {Promise<PufferServer[]>} The server list.
   */
  async getServers() {
    const res = await this._axios.get("/api/servers");
    const servers = [];
    res.data.servers.forEach((server) =>
      servers.push(new PufferServer(server, this._session, this._url))
    );
    return servers;
  }

  /**
   * Gets the template list of the server
   * @async
   * @returns {Promise<PufferTemplate[]>}
   */
  async getTemplates() {
    const res = await this._axios.get("/api/templates");
    const templates = [];
    res.data.forEach((template) => {
      templates.push(
        new PufferTemplate(
          { name: template.name, display: template.display },
          this._session,
          this._url
        )
      );
    });
    return templates;
  }

  /**
   * Gives information about the current session.
   * @async
   * @returns {Promise<PufferUser>} The current user
   */
  async whoAmI() {
    const res = await this._axios.get("/api/self");
    return new PufferUser(res.data, this._session, this._url);
  }
}

export default PufferClient;
