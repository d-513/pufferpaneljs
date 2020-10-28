import http from "axios";

/**
 * @typedef {Object} UserData
 * @property {number} id - The ID of the user
 * @property {string} username - The username of the user
 * @property {string} email - The email address of the user
 */
/**
 * PufferPanel User
 * @property {number} id - The user ID
 * @property {string} username - The username
 * @property {string} email - The email
 */
class PufferUser {
  /**
   * @param {object} data - data for the user in format { id, username, email }
   * @param {string} session - session id
   * @param {string} url - panel URL
   */
  constructor(data, session, url) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this._session = session;
    this._url = url;
    this._axios = http.create({
      baseURL: this._url,
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });
  }

  async getGlobalPerms() {
    const res = await this._axios.get(`/api/users/${this.id}/perms`);
    return res.data;
  }
}

export default PufferUser;
