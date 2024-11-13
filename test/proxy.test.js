/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const queryString = require('query-string')
const { createHttpsProxy, createHttpProxy, generateCert } = require('../src/proxy')
const { createApiServer, HOSTNAME } = require('../src/api-server')
const fetch = require('node-fetch')
const { HttpsProxyAgent } = require('https-proxy-agent')
const { HttpProxyAgent } = require('http-proxy-agent')
const url = require('url')
const syswidecas = require('syswide-cas')

jest.mock('syswide-cas')

/**
 * HttpsProxyAgent needs a patch for TLS connections.
 * It doesn't pass in the original options during a SSL connect.
 *
 * See https://github.com/TooTallNate/proxy-agents/issues/89
 * An alternative is to use https://github.com/delvedor/hpagent
 */
class PatchedHttpsProxyAgent extends HttpsProxyAgent {
  constructor (proxyUrl, opts) {
    super(proxyUrl, opts)
    this.savedOpts = opts
  }

  async connect (req, opts) {
    return super.connect(req, { ...this.savedOpts, ...opts })
  }
}

/**
 * Converts a URL to a suitable object for http request options.
 *
 * @private
 * @param {string} aUrl the url to parse
 * @returns {object} an object to pass for http request options
 */
function urlToHttpOptions (aUrl) {
  // URL.urlToHttpOptions is only in node 15 or greater
  const { protocol, hostname, hash, search, pathname, path, href, username, password, port } = new url.URL(aUrl)
  const options = {
    protocol,
    hostname,
    hash,
    search,
    pathname,
    path,
    href,
    port
  }

  if (username && password) {
    options.auth = `${username}:${password}`
  }
  return options
}

describe('http proxy', () => {
  const protocol = 'http'
  let proxyServer, apiServer
  const portNotInUse = 3009

  describe('no auth', () => {
    beforeAll(async () => {
      proxyServer = await createHttpProxy()
      apiServer = await createApiServer({ port: 3000, useSsl: false })
    })

    afterAll(async () => {
      await proxyServer.stop()
      await apiServer.close()
    })

    test('success', async () => {
      const apiServerAddress = apiServer.address()
      const queryObject = { foo: 'bar' }

      const testUrl = `${protocol}://${HOSTNAME}:${apiServerAddress.port}/mirror?${queryString.stringify(queryObject)}`

      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      const response = await fetch(testUrl, {
        agent: new HttpProxyAgent(proxyOpts)
      })

      const json = await response.json()
      expect(json).toStrictEqual(queryObject)
    })

    test('failure', async () => {
      // connect to non-existent server port
      const testUrl = `${protocol}://${HOSTNAME}:${portNotInUse}/mirror/?foo=bar`

      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      const response = await fetch(testUrl, {
        agent: new HttpProxyAgent(proxyOpts)
      })
      expect(response.ok).toEqual(false)
      expect(response.status).toEqual(502)
    })
  })

  describe('basic auth', () => {
    beforeAll(async () => {
      proxyServer = await createHttpProxy({ useBasicAuth: true })
      apiServer = await createApiServer({ port: 3000, useSsl: false })
    })

    afterAll(async () => {
      await proxyServer.stop()
      await apiServer.close()
    })

    test('success', async () => {
      const queryObject = { foo: 'bar' }
      const apiServerPort = apiServer.address().port

      const username = 'admin'
      const password = 'secret'
      const headers = {
        'Proxy-Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      }
      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      proxyOpts.auth = `${username}:${password}`

      const testUrl = `${protocol}://${HOSTNAME}:${apiServerPort}/mirror?${queryString.stringify(queryObject)}`
      const response = await fetch(testUrl, {
        agent: new HttpProxyAgent(proxyOpts),
        headers
      })

      expect(response.ok).toEqual(true)
      const json = await response.json()
      expect(json).toStrictEqual(queryObject)
    })

    test('failure', async () => {
      const queryObject = { bar: 'foo' }
      const apiServerPort = apiServer.address().port

      const username = 'foo'
      const password = 'dont-know-the-password'
      const headers = {
        'Proxy-Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      }
      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      proxyOpts.auth = `${username}:${password}`

      const testUrl = `${protocol}://${HOSTNAME}:${apiServerPort}/mirror?${queryString.stringify(queryObject)}`
      const response = await fetch(testUrl, {
        agent: new HttpProxyAgent(proxyOpts),
        headers
      })

      expect(response.ok).toEqual(false)
      expect(response.status).toEqual(403)
    })
  })
})

describe('https proxy', () => {
  const protocol = 'https'
  let proxyServer, apiServer
  const portNotInUse = 3009
  const selfSigned = true

  describe('no auth (self-signed)', () => {
    beforeAll(async () => {
      proxyServer = await createHttpsProxy({ selfSigned })
      apiServer = await createApiServer({ port: 3001, useSsl: true })
    })

    afterAll(async () => {
      await proxyServer.stop()
      await apiServer.close()
    })

    test('success', async () => {
      const apiServerAddress = apiServer.address()
      const queryObject = { foo: 'bar' }

      const testUrl = `${protocol}://${HOSTNAME}:${apiServerAddress.port}/mirror?${queryString.stringify(queryObject)}`

      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)

      // IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = false
        const response = await fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts)
        })

        const json = await response.json()
        expect(json).toStrictEqual(queryObject)
      }
      // DO NOT IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = true
        const proxyFetch = fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts)
        })
        await expect(proxyFetch).rejects.toThrow('self-signed certificate in certificate chain')
      }
    })

    test('failure', async () => {
      // connect to non-existent server port
      const testUrl = `${protocol}://${HOSTNAME}:${portNotInUse}/mirror/?foo=bar`

      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      // the passing on of this property to the underlying implementation only works on https-proxy-agent@2.2.4
      // this is only used for unit-tests and passed in the constructor
      proxyOpts.ALPNProtocols = ['http/1.1']

      // IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = false
        const response = await fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts)
        })
        expect(response.ok).toEqual(false)
        expect(response.status).toEqual(502)
      }
      // DO NOT IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = true
        const proxyFetch = fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts)
        })
        await expect(proxyFetch).rejects.toThrow('self-signed certificate in certificate chain')
      }
    })
  })

  describe('basic auth', () => {
    beforeAll(async () => {
      proxyServer = await createHttpsProxy({ useBasicAuth: true, selfSigned })
      apiServer = await createApiServer({ port: 3001, useSsl: true })
    })

    afterAll(async () => {
      await proxyServer.stop()
      await apiServer.close()
    })

    test('success', async () => {
      const queryObject = { foo: 'bar' }
      const apiServerPort = apiServer.address().port

      const username = 'admin'
      const password = 'secret'
      const headers = {
        'Proxy-Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      }
      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      proxyOpts.auth = `${username}:${password}`
      const testUrl = `${protocol}://${HOSTNAME}:${apiServerPort}/mirror?${queryString.stringify(queryObject)}`

      // IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = false
        const response = await fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts),
          headers
        })
        expect(response.ok).toEqual(true)
        const json = await response.json()
        expect(json).toStrictEqual(queryObject)
      }
      // DO NOT IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = true
        const proxyFetch = fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts)
        })
        await expect(proxyFetch).rejects.toThrow('self-signed certificate in certificate chain')
      }
    })

    test('failure', async () => {
      const queryObject = { bar: 'foo' }
      const apiServerPort = apiServer.address().port

      const username = 'foo'
      const password = 'dont-know-the-password'
      const headers = {
        'Proxy-Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
      }
      const proxyUrl = proxyServer.url
      const proxyOpts = urlToHttpOptions(proxyUrl)
      proxyOpts.auth = `${username}:${password}`
      const testUrl = `${protocol}://${HOSTNAME}:${apiServerPort}/mirror?${queryString.stringify(queryObject)}`

      // IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = false
        const response = await fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts),
          headers
        })
        expect(response.ok).toEqual(false)
        expect(response.status).toEqual(403)
      }
      // DO NOT IGNORE self-signed certs
      {
        proxyOpts.rejectUnauthorized = true
        const proxyFetch = fetch(testUrl, {
          agent: new PatchedHttpsProxyAgent(proxyUrl, proxyOpts)
        })
        await expect(proxyFetch).rejects.toThrow('self-signed certificate in certificate chain')
      }
    })
  })

  test('createHttpsProxy (default options)', async () => {
    syswidecas.addCAs.mockRestore()

    proxyServer = await createHttpsProxy()
    await proxyServer.stop()

    expect(syswidecas.addCAs).toHaveBeenCalled()
  })
})

describe('generateCert', () => {
  beforeEach(() => {
    syswidecas.addCAs.mockRestore()
  })

  test('default (add root CAs)', async () => {
    await generateCert()
    expect(syswidecas.addCAs).toHaveBeenCalled()
  })

  test('do not add root CAs', async () => {
    await generateCert({ addToRootCAs: false })
    expect(syswidecas.addCAs).not.toHaveBeenCalled()
  })
})
