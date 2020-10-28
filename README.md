# pufferpaneljs

A JavaScript library for interacting with [PufferPanel](https://pufferpanel.com) programatically.

### Installation

| NPM                         | YARN                     |
| --------------------------- | ------------------------ |
| `npm install pufferpaneljs` | `yarn add pufferpaneljs` |

### Usage

Basic client:

```js
const { PufferClient } = require("pufferpaneljs");

const client = new PufferClient(
  {
    email: "someone@example.com",
    password: "password",
  },
  "https://your-pufferpanel-instance.example.com"
);
async function main() {
  await client.login();
  const servers = await client.getServers();
  const server = servers.find((server) => server.id == "some-server-id");
  await server.connect();
  await server.console.send("test");
  console.log(await server.replayLogs());
  await server.fileManager.getFiles("/");
  const file = await server.fileManager.createFile("/index.html");
  await file.edit("Hello, world!");
  await file.delete();
  await server.disconnect();
}

main();
```

### JSDoc

PufferPanelJS has much more classes and functions than shown in the example.  
See the documentation [here](https://dada513.github.io/pufferpaneljs/)
