<!--
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

<!--
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
DO NOT update README.md, it is generated.
Modify 'docs/readme_template.md', then run `npm run generate-docs`.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-->

[![Version](https://img.shields.io/npm/v/@adobe/aio-lib-test-proxy.svg)](https://npmjs.org/package/@adobe/aio-lib-test-proxy)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-lib-test-proxy.svg)](https://npmjs.org/package/@adobe/aio-lib-test-proxy)
[![Node.js CI](https://github.com/adobe/aio-lib-test-proxy/actions/workflows/node.js.yml/badge.svg)](https://github.com/adobe/aio-lib-test-proxy/actions/workflows/node.js.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-test-proxy/main.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-test-proxy/)


# Adobe I/O Lib for Test Proxies and Api Servers

### Installing

```bash
$ npm install --save-dev @adobe/aio-lib-test-proxy
```

### Usage
1) Initialize the SDK

```javascript
const { createApiServer, createHttpProxy, createHttpsProxy } = require('@adobe/aio-lib-test-proxy')

const httpsProxy = createHttpsProxy()
const response = await fetch('https://adobe.com', {
  agent: new HttpsProxyAgent('https://my-proxy.local:8080')
})
httpsProxy.stop()

const apiServer = createApiServer()
const response2 = await fetch('http://localhost:3000/mirror?foo=bar')
const response = await fetch('http://localhost:3000/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ foo: 'bar' })
})
apiServer.close()
```

{{>main-index~}}
{{>all-docs~}}

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
