# Installation

Install as a regular npm package:

```bash
npm i @bechara/nestjs-core
```

Since it acts as a full platform wrapper, its common usage is when starting an application from scratch.

In this scenario, our recommended script to create and boot a boilerplate is (run in a new directory):

```bash
# First command is for PowerShell users
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

git init
npm init -y

npm i -g pnpm
pnpm i -DE typescript @types/node ts-node-dev
pnpm i -E @bechara/nestjs-core

echo "NODE_ENV=local" > .env

echo "node_modules" > .gitignore
echo ".env" >> .gitignore

echo "import { AppModule } from '@bechara/nestjs-core';" > main.ts
echo "AppModule.bootServer();" >> main.ts

pnpx -y tsc --init
pnpx -y tsnd main.ts
```

At this point you should have a full application running on port `8080`.


You may validate its functionality, by sending an HTTP request to `GET /util/status`.

The response shall be an object containing your machine information:

```json
{
  "system": {
    "version": "Windows 10 Pro",
    "type": "Windows_NT",
    "release": "10.0.19041",
    "architecture": "x64",
    "endianness": "LE",
    "uptime": 614041
  }
}
```

And your console should output:

```
2021-04-10 06:42:14  DBG  [LoggerService] Environment configured as local
2021-04-10 06:42:14  DBG  [HttpService] Creating instance for SlackModule...
2021-04-10 06:42:14  DBG  [AppService] Server timeout set to 90s
2021-04-10 06:42:14  NTC  [AppService] Server listening on port 8080        
2021-04-10 06:42:15  HTP  > GET    /util/status | ::1 | PostmanRuntime/7.26.10
2021-04-10 06:42:16  HTP  < GET    /util/status | 200 | 809 ms
```

---

[Next: Usage](usage.md)

[Back to title](../README.md)
