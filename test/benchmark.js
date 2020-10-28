require('dotenv').config()
const { PufferClient } = require('../load')

const client = new PufferClient(
  {
    email: process.env.EMAIL,
    password: process.env.PASSWORD
  },
  process.env.INSTANCE
)

const fLog = console.log

// uncomment line below for benchmarks, with console.logging they are inaccurate
// console.log = () => {};

async function main () {
  const timeStart = Date.now()
  const promises = []
  const promises2 = []

  const session = await client.login()
  console.log('Session:', session)

  const serverLogger = async () => {
    const servers = await client.getServers()
    servers.forEach((server) => {
      const s = async () => {
        console.log('server ------------')
        console.log('Name:', server.name)
        console.log('ID:', server.id)
        console.log('Running:', await server.getStatus())
      }
      promises.push(s())
    })
    await Promise.all(promises)
  }

  const templateLogger = async () => {
    const templates = await client.getTemplates()
    templates.forEach((template) => {
      const s = async () => {
        console.log('template ------------')
        console.log('Name:', template.name)
        console.log('Display name:', template.display)
        console.log(await template.getDetails())
      }
      promises2.push(s())
    })
    await Promise.all(promises2)
  }

  const getMe = async () => {
    const me = await client.whoAmI()
    console.log(await me.getGlobalPerms())
  }

  await Promise.all([getMe(), serverLogger(), templateLogger()])
  const timeEnd = Date.now()
  fLog(`⏰ Elapsed: ${timeEnd - timeStart}ms`)
}

main()
