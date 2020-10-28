import http from 'axios'

/**
 * Type of a variable in a template
 * @typedef {("string"|"integer"|"boolean"|"options")} TemplateVariableType
 */

/**
 * A variable in a template
 * @typedef {Object} TemplateVariable
 * @property {string} desc - Description of the variable
 * @property {string} displayName - Display name of the variable
 * @property {boolean} required - Is the variable required?
 * @property {string} value - The default value of the variable
 * @property {TemplateVariableType} type - Type of the variable
 */

/**
 * Install step in a template
 * TODO: Accually document possible options for an install step
 * @typedef {Object} TemplateInstallStep
 * @property {string} type - Type of the step
 */

/**
 * @typedef {Object} TemplateData
 * @property {string} name - The name of the template
 * @property {string} displayName - The display name of the template
 */

/**
 * @typedef {Object} AdvancedTemplateData
 * @property {TemplateVariable[]} data - The variables used for server creation
 * @property {string} display - The display name of the template
 * @property {Object} install - Install steps for the template
 * @property {string} name - The name of the template
 * @property {Object} run - The run steps for the template
 * @property {Object[]} supportedEnviroments - The supported environments for the template
 */

/**
 * Server template
 */
class PufferTemplate {
  /**
   *
   * @param {TemplateData} data - The template data
   * @param {string} session - The session ID
   * @param {string} url - The panel URL
   * @property {string} name - The name of the template
   * @property {string} display - The display name of the template
   */
  constructor (data, session, url) {
    this.name = data.name
    this.display = data.display
    this._session = session
    this._url = url
    this._axios = http.create({
      baseURL: this._url,
      headers: {
        Authorization: `Bearer ${session}`
      }
    })
  }

  /**
   * Gets the full data of the template.
   * This includes all install steps, run command etc
   * @async
   * @returns {AdvancedTemplateData} - The full template data
   */
  async getDetails () {
    const res = await this._axios.get(`/api/templates/${this.name}`)
    return res.data
  }
}

export default PufferTemplate
