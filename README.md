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

## Functions

<dl>
<dt><a href="#createApiServer">createApiServer(options)</a> ⇒ <code>object</code></dt>
<dd><p>Create a simple API server.</p>
<p>For use in tests only.
Default port is 3000.</p>
<ol>
<li>GET <code>/mirror</code> will return any query variables as json.</li>
<li>POST <code>/post</code> will return the posted body as json.</li>
</ol>
</dd>
<dt><a href="#createHttpProxy">createHttpProxy(httpOptions)</a> ⇒ <code>Promise.&lt;mockttp.Mockttp&gt;</code></dt>
<dd><p>Create a HTTP forwarding proxy</p>
<p>For use in tests only.
Default port is 8080.</p>
</dd>
<dt><a href="#createHttpsProxy">createHttpsProxy(httpOptions)</a> ⇒ <code>Promise.&lt;mockttp.Mockttp&gt;</code></dt>
<dd><p>Create a HTTPS forwarding proxy</p>
<p>For use in tests only.
Default port is 8081.</p>
<p>This will generate certs for SSL, and add it to the root CAs temporarily.
This prevents any self-signed cert errors for tests when using the https proxy.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#HttpOptions">HttpOptions</a> : <code>object</code></dt>
<dd><p>HTTP Options</p>
</dd>
</dl>

<a name="createApiServer"></a>

## createApiServer(options) ⇒ <code>object</code>
Create a simple API server.

For use in tests only.
Default port is 3000.

1. GET `/mirror` will return any query variables as json.
2. POST `/post` will return the posted body as json.

**Kind**: global function  
**Returns**: <code>object</code> - the HTTP API server object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | the options object |
| [options.port] | <code>number</code> | <code>3000</code> | the port number to listen to |
| [options.useSsl] | <code>number</code> | <code>false</code> | use ssl (https) |

<a name="createHttpProxy"></a>

## createHttpProxy(httpOptions) ⇒ <code>Promise.&lt;mockttp.Mockttp&gt;</code>
Create a HTTP forwarding proxy

For use in tests only.
Default port is 8080.

**Kind**: global function  
**Returns**: <code>Promise.&lt;mockttp.Mockttp&gt;</code> - the proxy server instance  

| Param | Type | Description |
| --- | --- | --- |
| httpOptions | [<code>HttpOptions</code>](#HttpOptions) | the http proxy options |

<a name="createHttpsProxy"></a>

## createHttpsProxy(httpOptions) ⇒ <code>Promise.&lt;mockttp.Mockttp&gt;</code>
Create a HTTPS forwarding proxy

For use in tests only.
Default port is 8081.

This will generate certs for SSL, and add it to the root CAs temporarily.
This prevents any self-signed cert errors for tests when using the https proxy.

**Kind**: global function  
**Returns**: <code>Promise.&lt;mockttp.Mockttp&gt;</code> - the proxy server instance  

| Param | Type | Description |
| --- | --- | --- |
| httpOptions | [<code>HttpOptions</code>](#HttpOptions) | the http proxy options |

<a name="HttpOptions"></a>

## HttpOptions : <code>object</code>
HTTP Options

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| port | <code>number</code> |  | the port to use |
| useBasicAuth | <code>boolean</code> |  | use basic authorization |
| [username] | <code>boolean</code> | <code>admin</code> | the username for basic authorization |
| [password] | <code>boolean</code> | <code>secret</code> | the password for basic authorization |

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
