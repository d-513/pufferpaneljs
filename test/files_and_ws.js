require("dotenv").config();
const { PufferClient } = require("../load");

const client = new PufferClient(
  {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  },
  process.env.INSTANCE
);
const timeStart = Date.now();
async function main() {
  await client.login();
  const servers = await client.getServers();
  const server = servers.find((server) => server.id == process.env.SERVERID);
  await server.connect();
  await server.console.send("test");
  console.log(await server.replayLogs());
  await server.fileManager.getFiles("/");
  console.log("FILE: got file list");
  const file = await server.fileManager.createFile("/index.html");
  console.log("FILE: Created file", file);
  await file.edit("Hello, world!");
  console.log("FILE: edited");
  console.log(await file.getContent());
  console.log("FILE: got content ^^^");
  await file.delete();
  console.log("FILE: deleted");
  await server.disconnect();
  console.log("Disconnected");
  const timeEnd = Date.now();
  console.log(`⏰ Elapsed: ${timeEnd - timeStart}ms`);
}

main();
