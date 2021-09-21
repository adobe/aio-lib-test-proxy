/**
 * Create a simple API server.
 *
 * For use in tests only.
 * Default port is 3000.
 *
 * 1. GET `/mirror` will return any query variables as json.
 * 2. POST `/post` will return the posted body as json.
 * @param options - the options object
 * @param [options.port = 3000] - the port number to listen to
 * @param [options.useSsl = false] - use ssl (https)
 * @returns the HTTP API server object
 */
declare function createApiServer(options: {
    port?: number;
    useSsl?: number;
}): any;

/**
 * HTTP Options
 * @property port - the port to use
 * @property useBasicAuth - use basic authorization
 * @property [username = admin] - the username for basic authorization
 * @property [password = secret] - the password for basic authorization
 */
declare type HttpOptions = {
    port: number;
    useBasicAuth: boolean;
    username?: boolean;
    password?: boolean;
};

/**
 * Create a HTTP forwarding proxy
 *
 * For use in tests only.
 * Default port is 8080.
 * @param httpOptions - the http proxy options
 * @returns the proxy server instance
 */
declare function createHttpProxy(httpOptions: HttpOptions): Promise<mockttp.Mockttp>;

/**
 * Create a HTTPS forwarding proxy
 *
 * For use in tests only.
 * Default port is 8081.
 *
 * This will generate certs for SSL, and add it to the root CAs temporarily.
 * This prevents any self-signed cert errors for tests when using the https proxy.
 * @param httpOptions - the http proxy options
 * @returns the proxy server instance
 */
declare function createHttpsProxy(httpOptions: HttpOptions): Promise<mockttp.Mockttp>;

