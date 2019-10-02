(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":4}],3:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = require('./../helpers/cookies');

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"../core/createError":10,"./../core/settle":14,"./../helpers/buildURL":18,"./../helpers/cookies":20,"./../helpers/isURLSameOrigin":22,"./../helpers/parseHeaders":24,"./../utils":26}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":5,"./cancel/CancelToken":6,"./cancel/isCancel":7,"./core/Axios":8,"./core/mergeConfig":13,"./defaults":16,"./helpers/bind":17,"./helpers/spread":25,"./utils":26}],5:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],6:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":5}],7:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],8:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);
  config.method = config.method ? config.method.toLowerCase() : 'get';

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"../helpers/buildURL":18,"./../utils":26,"./InterceptorManager":9,"./dispatchRequest":11,"./mergeConfig":13}],9:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":26}],10:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":12}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var isAbsoluteURL = require('./../helpers/isAbsoluteURL');
var combineURLs = require('./../helpers/combineURLs');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/isCancel":7,"../defaults":16,"./../helpers/combineURLs":19,"./../helpers/isAbsoluteURL":21,"./../utils":26,"./transformData":15}],12:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

},{}],13:[function(require,module,exports){
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  utils.forEach(['url', 'method', 'params', 'data'], function valueFromConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    }
  });

  utils.forEach(['headers', 'auth', 'proxy'], function mergeDeepProperties(prop) {
    if (utils.isObject(config2[prop])) {
      config[prop] = utils.deepMerge(config1[prop], config2[prop]);
    } else if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (utils.isObject(config1[prop])) {
      config[prop] = utils.deepMerge(config1[prop]);
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  utils.forEach([
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
    'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
    'socketPath'
  ], function defaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  return config;
};

},{"../utils":26}],14:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":10}],15:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":26}],16:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  // Only Node.JS has a process variable that is of [[Class]] process
  if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  } else if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this,require('_process'))
},{"./adapters/http":3,"./adapters/xhr":3,"./helpers/normalizeHeaderName":23,"./utils":26,"_process":1}],17:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],18:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":26}],19:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

},{"./../utils":26}],21:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

},{"./../utils":26}],23:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":26}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":26}],25:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],26:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');
var isBuffer = require('is-buffer');

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Function equal to merge with the difference being that no reference
 * to original objects is kept.
 *
 * @see merge
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function deepMerge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = deepMerge(result[key], val);
    } else if (typeof val === 'object') {
      result[key] = deepMerge({}, val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  deepMerge: deepMerge,
  extend: extend,
  trim: trim
};

},{"./helpers/bind":17,"is-buffer":27}],27:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

},{}],28:[function(require,module,exports){
exports.Render = async () => {
	const today = new Date();
	const year = today.getFullYear();
	$("#timestamp").text(`© 2019 - ${year}`);
};
},{}],29:[function(require,module,exports){
exports.Render = async () => {
	$.getScript("https://buttons.github.io/buttons.js");
};
},{}],30:[function(require,module,exports){
const axios = require("axios");
const cache = require("./cached-repo.json");

exports.Render = async () => {

	let repos = cache;

	try {
		const response = await axios.get("https://api.github.com/users/BrunoS3D/repos");

		if (response && response.data) {
			repos = response.data;
		}
		else {
			console.warn("GITHUB NOT RESPONSE LOADING CACHED REPOSITORIES");
		}
	}
	catch {
		console.warn("GITHUB NOT RESPONSE LOADING CACHED REPOSITORIES");
	}

	if (repos) {
		repos = repos.filter((repo) => repo && !repo.fork);

		const list = $("#repo-list");

		repos.forEach((repo) => {
			const item = $("<li>", {
				"class": "repo-list-item fade-in-bottom",
				id: "repo-item"
			});

			const content = $("<div>", {
				"class": "repo-item-content",
			});

			const title = $("<a>", {
				"class": "repo-title-name",
				href: repo.html_url,
				text: repo.name
			});

			let desc = repo.description

			if (desc.length > 132) {
				desc = desc.substr(0, 132);
				desc = desc.substr(0, Math.min(desc.length, Math.max(desc.indexOf(" "), desc.indexOf(","), desc.indexOf("."))));
				if (desc.length <= 10) {
					desc = desc.substr(0, 132);
				}
				desc += "...";
			}

			const description = $("<p>", {
				"class": "repo-description",
				text: desc
			});

			const github_buttons = $("<div>", {
				"class": "github_buttons",
			});

			/*
			<!-- Place this tag where you want the button to render. -->
			<a class="github-button" href="https://github.com/BrunoS3D/Doom-Fire/subscription" data-icon="octicon-eye" aria-label="Watch BrunoS3D/Doom-Fire on GitHub">Watch</a>
			*/

			const watch_button = $("<a>", {
				"class": "github-button",
				href: `https://github.com/BrunoS3D/${repo.name}/subscription`,
				"data-icon": "octicon-eye",
				"data-size": "large",
				"aria-label": `Watch BrunoS3D/${repo.name} on GitHub`,
				text: "Watch"
			});

			/*
			<!-- Place this tag where you want the button to render. -->
			<a class="github-button" href="https://github.com/BrunoS3D/Bla-bla-bot" data-icon="octicon-star" data-size="large" aria-label="Star BrunoS3D/Bla-bla-bot on GitHub">Star</a>
			*/

			const star_button = $("<a>", {
				"class": "github-button",
				href: `https://github.com/BrunoS3D/${repo.name}`,
				"data-icon": "octicon-star",
				"data-size": "large",
				"aria-label": `Star BrunoS3D/${repo.name} on GitHub`,
				text: "Star"
			});

			/*
			<!-- Place this tag where you want the button to render. -->
			<a class="github-button" href="https://github.com/BrunoS3D/Doom-Fire/fork" data-icon="octicon-repo-forked" aria-label="Fork BrunoS3D/Doom-Fire on GitHub">Fork</a>
			*/

			const fork_button = $("<a>", {
				"class": "github-button",
				href: `https://github.com/BrunoS3D/${repo.name}/fork`,
				"data-icon": "octicon-repo-forked",
				"data-size": "large",
				"aria-label": `Fork BrunoS3D/${repo.name} on GitHub`,
				text: "Fork"
			});

			if (repo.description && repo.description.length != desc.length) {
				const readmore = $("<a>", {
					"class": "repo-description-readmore",
					href: repo.html_url,
					text: "(ver mais)"
				});

				description.append(readmore);
			}

			github_buttons.append(watch_button);
			github_buttons.append(fork_button);
			github_buttons.append(star_button);

			content.append(title);
			content.append(description);

			item.append(content);
			item.append(github_buttons);

			list.append(item);
		});
	}
};

},{"./cached-repo.json":32,"axios":2}],31:[function(require,module,exports){
exports.Render = async () => {
	$("#slideshow > .slideshow-item:gt(0)").hide();

	setInterval(function () {
		$("#slideshow > .slideshow-item:first")
			.fadeOut(1000)
			.next()
			.fadeIn(1000)
			.end()
			.appendTo("#slideshow");
	}, 3000);
};
},{}],32:[function(require,module,exports){
module.exports=[
	{
		"id": 197683302,
		"node_id": "MDEwOlJlcG9zaXRvcnkxOTc2ODMzMDI=",
		"name": "ARRE",
		"full_name": "BrunoS3D/ARRE",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/ARRE",
		"description": "Dissertation Project",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/ARRE",
		"forks_url": "https://api.github.com/repos/BrunoS3D/ARRE/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/ARRE/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/ARRE/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/ARRE/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/ARRE/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/ARRE/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/ARRE/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/ARRE/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/ARRE/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/ARRE/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/ARRE/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/ARRE/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/ARRE/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/ARRE/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/ARRE/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/ARRE/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/ARRE/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/ARRE/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/ARRE/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/ARRE/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/ARRE/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/ARRE/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/ARRE/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/ARRE/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/ARRE/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/ARRE/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/ARRE/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/ARRE/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/ARRE/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/ARRE/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/ARRE/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/ARRE/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/ARRE/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/ARRE/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/ARRE/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/ARRE/deployments",
		"created_at": "2019-07-19T01:53:30Z",
		"updated_at": "2019-07-19T01:53:37Z",
		"pushed_at": "2013-11-26T15:27:02Z",
		"git_url": "git://github.com/BrunoS3D/ARRE.git",
		"ssh_url": "git@github.com:BrunoS3D/ARRE.git",
		"clone_url": "https://github.com/BrunoS3D/ARRE.git",
		"svn_url": "https://github.com/BrunoS3D/ARRE",
		"homepage": null,
		"size": 78580,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "Assembly",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": null,
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 187110231,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODcxMTAyMzE=",
		"name": "Bla-bla-bot",
		"full_name": "BrunoS3D/Bla-bla-bot",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Bla-bla-bot",
		"description": "NODE.JS - 🤖 Apenas um BOT para Discord com player de música e Quiz de matemáticas.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot/deployments",
		"created_at": "2019-05-16T22:38:36Z",
		"updated_at": "2019-05-22T23:45:49Z",
		"pushed_at": "2019-05-17T13:30:46Z",
		"git_url": "git://github.com/BrunoS3D/Bla-bla-bot.git",
		"ssh_url": "git@github.com:BrunoS3D/Bla-bla-bot.git",
		"clone_url": "https://github.com/BrunoS3D/Bla-bla-bot.git",
		"svn_url": "https://github.com/BrunoS3D/Bla-bla-bot",
		"homepage": "",
		"size": 29326,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "gpl-2.0",
			"name": "GNU General Public License v2.0",
			"spdx_id": "GPL-2.0",
			"url": "https://api.github.com/licenses/gpl-2.0",
			"node_id": "MDc6TGljZW5zZTg="
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 191782753,
		"node_id": "MDEwOlJlcG9zaXRvcnkxOTE3ODI3NTM=",
		"name": "Bla-bla-bot-2",
		"full_name": "BrunoS3D/Bla-bla-bot-2",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Bla-bla-bot-2",
		"description": "NODE.JS - 🤖 (Tutorial) Create your first Discord Bot",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Bla-bla-bot-2/deployments",
		"created_at": "2019-06-13T14:52:32Z",
		"updated_at": "2019-08-23T14:19:07Z",
		"pushed_at": "2019-06-13T14:52:39Z",
		"git_url": "git://github.com/BrunoS3D/Bla-bla-bot-2.git",
		"ssh_url": "git@github.com:BrunoS3D/Bla-bla-bot-2.git",
		"clone_url": "https://github.com/BrunoS3D/Bla-bla-bot-2.git",
		"svn_url": "https://github.com/BrunoS3D/Bla-bla-bot-2",
		"homepage": "",
		"size": 22,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 206661603,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDY2NjE2MDM=",
		"name": "brunos3d.github.io",
		"full_name": "BrunoS3D/brunos3d.github.io",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/brunos3d.github.io",
		"description": "Meu incrível portfólio em construção.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io",
		"forks_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/brunos3d.github.io/deployments",
		"created_at": "2019-09-05T21:38:05Z",
		"updated_at": "2019-09-05T21:41:46Z",
		"pushed_at": "2019-09-05T21:41:44Z",
		"git_url": "git://github.com/BrunoS3D/brunos3d.github.io.git",
		"ssh_url": "git@github.com:BrunoS3D/brunos3d.github.io.git",
		"clone_url": "https://github.com/BrunoS3D/brunos3d.github.io.git",
		"svn_url": "https://github.com/BrunoS3D/brunos3d.github.io",
		"homepage": null,
		"size": 0,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "CSS",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": true,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 179903076,
		"node_id": "MDEwOlJlcG9zaXRvcnkxNzk5MDMwNzY=",
		"name": "Clipboard-To-Script",
		"full_name": "BrunoS3D/Clipboard-To-Script",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Clipboard-To-Script",
		"description": "UNITY - Designed for those who love testing internet ready codes and do not like waiting!",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Clipboard-To-Script/deployments",
		"created_at": "2019-04-07T00:57:04Z",
		"updated_at": "2019-05-22T14:16:41Z",
		"pushed_at": "2019-04-20T14:25:40Z",
		"git_url": "git://github.com/BrunoS3D/Clipboard-To-Script.git",
		"ssh_url": "git@github.com:BrunoS3D/Clipboard-To-Script.git",
		"clone_url": "https://github.com/BrunoS3D/Clipboard-To-Script.git",
		"svn_url": "https://github.com/BrunoS3D/Clipboard-To-Script",
		"homepage": "",
		"size": 17,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "C#",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 206642081,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDY2NDIwODE=",
		"name": "Comenty",
		"full_name": "BrunoS3D/Comenty",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Comenty",
		"description": "NEXT.JS - Estudo de algumas das mais atuais tecnologias para desenvolvimento de Backend e Frontend: React, Server-side Render, Express, Axios, MongoDB, Mongoose, bem como o uso de autenticação por GitHub OAuth.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Comenty",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Comenty/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Comenty/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Comenty/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Comenty/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Comenty/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Comenty/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Comenty/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Comenty/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Comenty/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Comenty/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Comenty/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Comenty/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Comenty/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Comenty/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Comenty/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Comenty/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Comenty/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Comenty/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Comenty/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Comenty/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Comenty/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Comenty/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Comenty/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Comenty/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Comenty/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Comenty/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Comenty/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Comenty/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Comenty/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Comenty/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Comenty/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Comenty/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Comenty/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Comenty/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Comenty/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Comenty/deployments",
		"created_at": "2019-09-05T19:30:43Z",
		"updated_at": "2019-09-05T21:21:13Z",
		"pushed_at": "2019-09-05T21:14:45Z",
		"git_url": "git://github.com/BrunoS3D/Comenty.git",
		"ssh_url": "git@github.com:BrunoS3D/Comenty.git",
		"clone_url": "https://github.com/BrunoS3D/Comenty.git",
		"svn_url": "https://github.com/BrunoS3D/Comenty",
		"homepage": "https://comenty.herokuapp.com/",
		"size": 113,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 188127900,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODgxMjc5MDA=",
		"name": "Discord-Assistant",
		"full_name": "BrunoS3D/Discord-Assistant",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Discord-Assistant",
		"description": "NODE.JS - 🤖 Another Discord BOT with some cool functions.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Discord-Assistant/deployments",
		"created_at": "2019-05-22T23:36:20Z",
		"updated_at": "2019-05-29T05:29:10Z",
		"pushed_at": "2019-05-29T05:29:09Z",
		"git_url": "git://github.com/BrunoS3D/Discord-Assistant.git",
		"ssh_url": "git@github.com:BrunoS3D/Discord-Assistant.git",
		"clone_url": "https://github.com/BrunoS3D/Discord-Assistant.git",
		"svn_url": "https://github.com/BrunoS3D/Discord-Assistant",
		"homepage": "",
		"size": 28,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 187777877,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODc3Nzc4Nzc=",
		"name": "discord-bot",
		"full_name": "BrunoS3D/discord-bot",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/discord-bot",
		"description": "discord bot created in Node.js called Geisha. Functionalities: play youtube videos as music in channels, or look up if Twitch users are online",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/discord-bot",
		"forks_url": "https://api.github.com/repos/BrunoS3D/discord-bot/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/discord-bot/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/discord-bot/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/discord-bot/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/discord-bot/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/discord-bot/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/discord-bot/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/discord-bot/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/discord-bot/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/discord-bot/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/discord-bot/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/discord-bot/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/discord-bot/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/discord-bot/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/discord-bot/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/discord-bot/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/discord-bot/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/discord-bot/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/discord-bot/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/discord-bot/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/discord-bot/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/discord-bot/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/discord-bot/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/discord-bot/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/discord-bot/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/discord-bot/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/discord-bot/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/discord-bot/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/discord-bot/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/discord-bot/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/discord-bot/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/discord-bot/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/discord-bot/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/discord-bot/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/discord-bot/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/discord-bot/deployments",
		"created_at": "2019-05-21T06:46:26Z",
		"updated_at": "2019-05-21T06:46:29Z",
		"pushed_at": "2018-09-07T13:03:45Z",
		"git_url": "git://github.com/BrunoS3D/discord-bot.git",
		"ssh_url": "git@github.com:BrunoS3D/discord-bot.git",
		"clone_url": "https://github.com/BrunoS3D/discord-bot.git",
		"svn_url": "https://github.com/BrunoS3D/discord-bot",
		"homepage": "",
		"size": 22,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "JavaScript",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": null,
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 186329328,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODYzMjkzMjg=",
		"name": "Doom-Fire",
		"full_name": "BrunoS3D/Doom-Fire",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Doom-Fire",
		"description": "UNITY - A small implementation of Doom's fire using Unity.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Doom-Fire",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Doom-Fire/deployments",
		"created_at": "2019-05-13T02:07:36Z",
		"updated_at": "2019-09-01T10:08:27Z",
		"pushed_at": "2019-05-22T14:18:06Z",
		"git_url": "git://github.com/BrunoS3D/Doom-Fire.git",
		"ssh_url": "git@github.com:BrunoS3D/Doom-Fire.git",
		"clone_url": "https://github.com/BrunoS3D/Doom-Fire.git",
		"svn_url": "https://github.com/BrunoS3D/Doom-Fire",
		"homepage": "",
		"size": 8384,
		"stargazers_count": 3,
		"watchers_count": 3,
		"language": "C#",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 3,
		"default_branch": "master"
	},
	{
		"id": 186169177,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODYxNjkxNzc=",
		"name": "Fade-Screen",
		"full_name": "BrunoS3D/Fade-Screen",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Fade-Screen",
		"description": "UNITY - A fast and simple system that adds screen transition to your game.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Fade-Screen",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Fade-Screen/deployments",
		"created_at": "2019-05-11T18:35:49Z",
		"updated_at": "2019-05-22T14:14:06Z",
		"pushed_at": "2019-05-11T19:51:17Z",
		"git_url": "git://github.com/BrunoS3D/Fade-Screen.git",
		"ssh_url": "git@github.com:BrunoS3D/Fade-Screen.git",
		"clone_url": "https://github.com/BrunoS3D/Fade-Screen.git",
		"svn_url": "https://github.com/BrunoS3D/Fade-Screen",
		"homepage": "",
		"size": 474,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "C#",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 69200296,
		"node_id": "MDEwOlJlcG9zaXRvcnk2OTIwMDI5Ng==",
		"name": "fullserializer",
		"full_name": "BrunoS3D/fullserializer",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/fullserializer",
		"description": "A robust JSON serialization framework that just works with support for all major Unity export platforms.",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/fullserializer",
		"forks_url": "https://api.github.com/repos/BrunoS3D/fullserializer/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/fullserializer/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/fullserializer/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/fullserializer/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/fullserializer/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/fullserializer/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/fullserializer/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/fullserializer/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/fullserializer/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/fullserializer/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/fullserializer/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/fullserializer/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/fullserializer/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/fullserializer/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/fullserializer/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/fullserializer/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/fullserializer/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/fullserializer/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/fullserializer/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/fullserializer/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/fullserializer/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/fullserializer/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/fullserializer/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/fullserializer/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/fullserializer/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/fullserializer/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/fullserializer/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/fullserializer/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/fullserializer/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/fullserializer/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/fullserializer/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/fullserializer/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/fullserializer/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/fullserializer/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/fullserializer/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/fullserializer/deployments",
		"created_at": "2016-09-26T00:57:11Z",
		"updated_at": "2019-04-10T19:49:58Z",
		"pushed_at": "2016-07-28T23:36:18Z",
		"git_url": "git://github.com/BrunoS3D/fullserializer.git",
		"ssh_url": "git@github.com:BrunoS3D/fullserializer.git",
		"clone_url": "https://github.com/BrunoS3D/fullserializer.git",
		"svn_url": "https://github.com/BrunoS3D/fullserializer",
		"homepage": "",
		"size": 1547,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "C#",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 180896831,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODA4OTY4MzE=",
		"name": "gpu-particles",
		"full_name": "BrunoS3D/gpu-particles",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/gpu-particles",
		"description": "A GPU Particle System for Unity",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/gpu-particles",
		"forks_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/gpu-particles/deployments",
		"created_at": "2019-04-12T00:04:28Z",
		"updated_at": "2019-04-12T00:04:32Z",
		"pushed_at": "2018-11-07T18:28:22Z",
		"git_url": "git://github.com/BrunoS3D/gpu-particles.git",
		"ssh_url": "git@github.com:BrunoS3D/gpu-particles.git",
		"clone_url": "https://github.com/BrunoS3D/gpu-particles.git",
		"svn_url": "https://github.com/BrunoS3D/gpu-particles",
		"homepage": null,
		"size": 77469,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "C#",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 200346390,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDAzNDYzOTA=",
		"name": "Hello-World-1",
		"full_name": "BrunoS3D/Hello-World-1",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Hello-World-1",
		"description": "Hello World in all possible programmnig languages",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/Hello-World-1",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Hello-World-1/deployments",
		"created_at": "2019-08-03T07:31:00Z",
		"updated_at": "2019-08-03T07:31:09Z",
		"pushed_at": "2018-10-26T19:53:00Z",
		"git_url": "git://github.com/BrunoS3D/Hello-World-1.git",
		"ssh_url": "git@github.com:BrunoS3D/Hello-World-1.git",
		"clone_url": "https://github.com/BrunoS3D/Hello-World-1.git",
		"svn_url": "https://github.com/BrunoS3D/Hello-World-1",
		"homepage": "https://omkar-ajnadkar.github.io/Hello-World/",
		"size": 186,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "Assembly",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 196654326,
		"node_id": "MDEwOlJlcG9zaXRvcnkxOTY2NTQzMjY=",
		"name": "Hydraulic-Erosion",
		"full_name": "BrunoS3D/Hydraulic-Erosion",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Hydraulic-Erosion",
		"description": null,
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Hydraulic-Erosion/deployments",
		"created_at": "2019-07-12T22:45:15Z",
		"updated_at": "2019-07-12T22:45:25Z",
		"pushed_at": "2019-03-14T16:55:21Z",
		"git_url": "git://github.com/BrunoS3D/Hydraulic-Erosion.git",
		"ssh_url": "git@github.com:BrunoS3D/Hydraulic-Erosion.git",
		"clone_url": "https://github.com/BrunoS3D/Hydraulic-Erosion.git",
		"svn_url": "https://github.com/BrunoS3D/Hydraulic-Erosion",
		"homepage": "https://www.youtube.com/watch?v=eaXk97ujbPQ",
		"size": 14807,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "C#",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 180088640,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODAwODg2NDA=",
		"name": "nativescript-windowed-modal",
		"full_name": "BrunoS3D/nativescript-windowed-modal",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/nativescript-windowed-modal",
		"description": "Consistent modals for Android and iOS",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal",
		"forks_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/nativescript-windowed-modal/deployments",
		"created_at": "2019-04-08T06:57:16Z",
		"updated_at": "2019-04-10T19:49:56Z",
		"pushed_at": "2019-02-14T13:25:24Z",
		"git_url": "git://github.com/BrunoS3D/nativescript-windowed-modal.git",
		"ssh_url": "git@github.com:BrunoS3D/nativescript-windowed-modal.git",
		"clone_url": "https://github.com/BrunoS3D/nativescript-windowed-modal.git",
		"svn_url": "https://github.com/BrunoS3D/nativescript-windowed-modal",
		"homepage": "https://market.nativescript.org/plugins/nativescript-windowed-modal",
		"size": 2523,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "TypeScript",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "apache-2.0",
			"name": "Apache License 2.0",
			"spdx_id": "Apache-2.0",
			"url": "https://api.github.com/licenses/apache-2.0",
			"node_id": "MDc6TGljZW5zZTI="
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 164871419,
		"node_id": "MDEwOlJlcG9zaXRvcnkxNjQ4NzE0MTk=",
		"name": "odin-serializer",
		"full_name": "BrunoS3D/odin-serializer",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/odin-serializer",
		"description": "Fast, robust, powerful and extendible .NET serializer built for Unity",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/odin-serializer",
		"forks_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/odin-serializer/deployments",
		"created_at": "2019-01-09T13:48:59Z",
		"updated_at": "2019-04-10T19:49:57Z",
		"pushed_at": "2018-11-23T14:59:22Z",
		"git_url": "git://github.com/BrunoS3D/odin-serializer.git",
		"ssh_url": "git@github.com:BrunoS3D/odin-serializer.git",
		"clone_url": "https://github.com/BrunoS3D/odin-serializer.git",
		"svn_url": "https://github.com/BrunoS3D/odin-serializer",
		"homepage": "http://www.sirenix.net",
		"size": 13962,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "C#",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "apache-2.0",
			"name": "Apache License 2.0",
			"spdx_id": "Apache-2.0",
			"url": "https://api.github.com/licenses/apache-2.0",
			"node_id": "MDc6TGljZW5zZTI="
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 195472001,
		"node_id": "MDEwOlJlcG9zaXRvcnkxOTU0NzIwMDE=",
		"name": "Pages-N-Bootstrap",
		"full_name": "BrunoS3D/Pages-N-Bootstrap",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Pages-N-Bootstrap",
		"description": "HTML - A simple study page designed to learn GitHub Pages and Bootstrap.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Pages-N-Bootstrap/deployments",
		"created_at": "2019-07-05T22:06:57Z",
		"updated_at": "2019-07-05T23:40:27Z",
		"pushed_at": "2019-07-05T23:40:26Z",
		"git_url": "git://github.com/BrunoS3D/Pages-N-Bootstrap.git",
		"ssh_url": "git@github.com:BrunoS3D/Pages-N-Bootstrap.git",
		"clone_url": "https://github.com/BrunoS3D/Pages-N-Bootstrap.git",
		"svn_url": "https://github.com/BrunoS3D/Pages-N-Bootstrap",
		"homepage": "https://brunos3d.github.io/Pages-N-Bootstrap/",
		"size": 10,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "HTML",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": true,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": null,
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 203453011,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDM0NTMwMTE=",
		"name": "Reply-Bot",
		"full_name": "BrunoS3D/Reply-Bot",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Reply-Bot",
		"description": "NODE.JS - 🤖 Bot para responder mensagens no discord.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Reply-Bot",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Reply-Bot/deployments",
		"created_at": "2019-08-20T20:54:19Z",
		"updated_at": "2019-08-27T20:24:59Z",
		"pushed_at": "2019-08-27T20:24:57Z",
		"git_url": "git://github.com/BrunoS3D/Reply-Bot.git",
		"ssh_url": "git@github.com:BrunoS3D/Reply-Bot.git",
		"clone_url": "https://github.com/BrunoS3D/Reply-Bot.git",
		"svn_url": "https://github.com/BrunoS3D/Reply-Bot",
		"homepage": "https://discord-reply-bot.herokuapp.com/",
		"size": 66,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 179905847,
		"node_id": "MDEwOlJlcG9zaXRvcnkxNzk5MDU4NDc=",
		"name": "SceneViewPlus",
		"full_name": "BrunoS3D/SceneViewPlus",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/SceneViewPlus",
		"description": "UNITY - SceneViewPlus for Unity is an editor extension that allows you to easily manipulate your game objects directly in SceneView.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus",
		"forks_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/SceneViewPlus/deployments",
		"created_at": "2019-04-07T01:40:30Z",
		"updated_at": "2019-08-09T12:53:32Z",
		"pushed_at": "2019-04-20T14:44:38Z",
		"git_url": "git://github.com/BrunoS3D/SceneViewPlus.git",
		"ssh_url": "git@github.com:BrunoS3D/SceneViewPlus.git",
		"clone_url": "https://github.com/BrunoS3D/SceneViewPlus.git",
		"svn_url": "https://github.com/BrunoS3D/SceneViewPlus",
		"homepage": "",
		"size": 32,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "C#",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 201483222,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDE0ODMyMjI=",
		"name": "Tindev-Backend",
		"full_name": "BrunoS3D/Tindev-Backend",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Tindev-Backend",
		"description": "Backend de estudo da Semana OmniStack 8.0 da Rockeseat",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Tindev-Backend/deployments",
		"created_at": "2019-08-09T14:29:34Z",
		"updated_at": "2019-08-10T00:13:53Z",
		"pushed_at": "2019-08-10T00:13:52Z",
		"git_url": "git://github.com/BrunoS3D/Tindev-Backend.git",
		"ssh_url": "git@github.com:BrunoS3D/Tindev-Backend.git",
		"clone_url": "https://github.com/BrunoS3D/Tindev-Backend.git",
		"svn_url": "https://github.com/BrunoS3D/Tindev-Backend",
		"homepage": null,
		"size": 293,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 1,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 1,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 201227062,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDEyMjcwNjI=",
		"name": "Tindev-Frontend",
		"full_name": "BrunoS3D/Tindev-Frontend",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Tindev-Frontend",
		"description": "Frontend Desktop de estudo da Semana OmniStack 8.0 da Rockeseat",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Tindev-Frontend/deployments",
		"created_at": "2019-08-08T09:38:30Z",
		"updated_at": "2019-08-10T00:12:52Z",
		"pushed_at": "2019-08-10T00:12:51Z",
		"git_url": "git://github.com/BrunoS3D/Tindev-Frontend.git",
		"ssh_url": "git@github.com:BrunoS3D/Tindev-Frontend.git",
		"clone_url": "https://github.com/BrunoS3D/Tindev-Frontend.git",
		"svn_url": "https://github.com/BrunoS3D/Tindev-Frontend",
		"homepage": "https://mib-tindev-frontend.herokuapp.com/",
		"size": 346,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": true,
		"forks_count": 2,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 2,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 198068750,
		"node_id": "MDEwOlJlcG9zaXRvcnkxOTgwNjg3NTA=",
		"name": "TokenMarcherAlgorithm",
		"full_name": "BrunoS3D/TokenMarcherAlgorithm",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/TokenMarcherAlgorithm",
		"description": " A basic, modifiable, and high performance text tokenizer algorithm small enough to fit on a business card without using regular expressions.",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm",
		"forks_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/TokenMarcherAlgorithm/deployments",
		"created_at": "2019-07-21T14:46:57Z",
		"updated_at": "2019-08-14T17:27:30Z",
		"pushed_at": "2019-07-21T11:54:52Z",
		"git_url": "git://github.com/BrunoS3D/TokenMarcherAlgorithm.git",
		"ssh_url": "git@github.com:BrunoS3D/TokenMarcherAlgorithm.git",
		"clone_url": "https://github.com/BrunoS3D/TokenMarcherAlgorithm.git",
		"svn_url": "https://github.com/BrunoS3D/TokenMarcherAlgorithm",
		"homepage": "",
		"size": 8,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "C#",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	},
	{
		"id": 187116938,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODcxMTY5Mzg=",
		"name": "True-RaycastAll",
		"full_name": "BrunoS3D/True-RaycastAll",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/True-RaycastAll",
		"description": "UNITY - A RaycastAll implementation for Unity to get hits on the same mesh, Point of Entry and Exit.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll",
		"forks_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/True-RaycastAll/deployments",
		"created_at": "2019-05-16T23:58:25Z",
		"updated_at": "2019-05-22T14:18:39Z",
		"pushed_at": "2019-05-22T14:18:37Z",
		"git_url": "git://github.com/BrunoS3D/True-RaycastAll.git",
		"ssh_url": "git@github.com:BrunoS3D/True-RaycastAll.git",
		"clone_url": "https://github.com/BrunoS3D/True-RaycastAll.git",
		"svn_url": "https://github.com/BrunoS3D/True-RaycastAll",
		"homepage": "",
		"size": 1056,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "C#",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 189153539,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODkxNTM1Mzk=",
		"name": "UnityCsReference",
		"full_name": "BrunoS3D/UnityCsReference",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/UnityCsReference",
		"description": "Unity C# reference source code",
		"fork": true,
		"url": "https://api.github.com/repos/BrunoS3D/UnityCsReference",
		"forks_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/UnityCsReference/deployments",
		"created_at": "2019-05-29T05:00:45Z",
		"updated_at": "2019-05-29T05:00:56Z",
		"pushed_at": "2019-05-29T01:47:46Z",
		"git_url": "git://github.com/BrunoS3D/UnityCsReference.git",
		"ssh_url": "git@github.com:BrunoS3D/UnityCsReference.git",
		"clone_url": "https://github.com/BrunoS3D/UnityCsReference.git",
		"svn_url": "https://github.com/BrunoS3D/UnityCsReference",
		"homepage": null,
		"size": 20807,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "C#",
		"has_issues": false,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": false,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": null,
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 187116565,
		"node_id": "MDEwOlJlcG9zaXRvcnkxODcxMTY1NjU=",
		"name": "VolumeBox",
		"full_name": "BrunoS3D/VolumeBox",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/VolumeBox",
		"description": "UNITY - An Interactive Trigger Box with custom events for Unity.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/VolumeBox",
		"forks_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/VolumeBox/deployments",
		"created_at": "2019-05-16T23:54:07Z",
		"updated_at": "2019-05-22T14:15:40Z",
		"pushed_at": "2019-05-17T00:31:20Z",
		"git_url": "git://github.com/BrunoS3D/VolumeBox.git",
		"ssh_url": "git@github.com:BrunoS3D/VolumeBox.git",
		"clone_url": "https://github.com/BrunoS3D/VolumeBox.git",
		"svn_url": "https://github.com/BrunoS3D/VolumeBox",
		"homepage": "",
		"size": 132,
		"stargazers_count": 0,
		"watchers_count": 0,
		"language": "C#",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 0,
		"default_branch": "master"
	},
	{
		"id": 201738072,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDE3MzgwNzI=",
		"name": "Xit-Xat",
		"full_name": "BrunoS3D/Xit-Xat",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Xit-Xat",
		"description": "NODE.JS - Back e Front de uma sala de Bate-Papo que segue o design do Discord utilizando WebSocket.",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Xit-Xat",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Xit-Xat/deployments",
		"created_at": "2019-08-11T08:26:44Z",
		"updated_at": "2019-08-24T17:15:57Z",
		"pushed_at": "2019-08-13T10:57:34Z",
		"git_url": "git://github.com/BrunoS3D/Xit-Xat.git",
		"ssh_url": "git@github.com:BrunoS3D/Xit-Xat.git",
		"clone_url": "https://github.com/BrunoS3D/Xit-Xat.git",
		"svn_url": "https://github.com/BrunoS3D/Xit-Xat",
		"homepage": "https://xit-xat.herokuapp.com/",
		"size": 936,
		"stargazers_count": 2,
		"watchers_count": 2,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 2,
		"default_branch": "master"
	},
	{
		"id": 201248528,
		"node_id": "MDEwOlJlcG9zaXRvcnkyMDEyNDg1Mjg=",
		"name": "Youtube-Downloader",
		"full_name": "BrunoS3D/Youtube-Downloader",
		"private": false,
		"owner": {
			"login": "BrunoS3D",
			"id": 21183964,
			"node_id": "MDQ6VXNlcjIxMTgzOTY0",
			"avatar_url": "https://avatars0.githubusercontent.com/u/21183964?v=4",
			"gravatar_id": "",
			"url": "https://api.github.com/users/BrunoS3D",
			"html_url": "https://github.com/BrunoS3D",
			"followers_url": "https://api.github.com/users/BrunoS3D/followers",
			"following_url": "https://api.github.com/users/BrunoS3D/following{/other_user}",
			"gists_url": "https://api.github.com/users/BrunoS3D/gists{/gist_id}",
			"starred_url": "https://api.github.com/users/BrunoS3D/starred{/owner}{/repo}",
			"subscriptions_url": "https://api.github.com/users/BrunoS3D/subscriptions",
			"organizations_url": "https://api.github.com/users/BrunoS3D/orgs",
			"repos_url": "https://api.github.com/users/BrunoS3D/repos",
			"events_url": "https://api.github.com/users/BrunoS3D/events{/privacy}",
			"received_events_url": "https://api.github.com/users/BrunoS3D/received_events",
			"type": "User",
			"site_admin": false
		},
		"html_url": "https://github.com/BrunoS3D/Youtube-Downloader",
		"description": "Node.JS - Um baixador de videos do Youtube a partir do CLI",
		"fork": false,
		"url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader",
		"forks_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/forks",
		"keys_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/keys{/key_id}",
		"collaborators_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/collaborators{/collaborator}",
		"teams_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/teams",
		"hooks_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/hooks",
		"issue_events_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/issues/events{/number}",
		"events_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/events",
		"assignees_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/assignees{/user}",
		"branches_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/branches{/branch}",
		"tags_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/tags",
		"blobs_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/git/blobs{/sha}",
		"git_tags_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/git/tags{/sha}",
		"git_refs_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/git/refs{/sha}",
		"trees_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/git/trees{/sha}",
		"statuses_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/statuses/{sha}",
		"languages_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/languages",
		"stargazers_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/stargazers",
		"contributors_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/contributors",
		"subscribers_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/subscribers",
		"subscription_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/subscription",
		"commits_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/commits{/sha}",
		"git_commits_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/git/commits{/sha}",
		"comments_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/comments{/number}",
		"issue_comment_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/issues/comments{/number}",
		"contents_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/contents/{+path}",
		"compare_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/compare/{base}...{head}",
		"merges_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/merges",
		"archive_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/{archive_format}{/ref}",
		"downloads_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/downloads",
		"issues_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/issues{/number}",
		"pulls_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/pulls{/number}",
		"milestones_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/milestones{/number}",
		"notifications_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/notifications{?since,all,participating}",
		"labels_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/labels{/name}",
		"releases_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/releases{/id}",
		"deployments_url": "https://api.github.com/repos/BrunoS3D/Youtube-Downloader/deployments",
		"created_at": "2019-08-08T11:56:42Z",
		"updated_at": "2019-08-13T08:38:51Z",
		"pushed_at": "2019-08-08T12:36:34Z",
		"git_url": "git://github.com/BrunoS3D/Youtube-Downloader.git",
		"ssh_url": "git@github.com:BrunoS3D/Youtube-Downloader.git",
		"clone_url": "https://github.com/BrunoS3D/Youtube-Downloader.git",
		"svn_url": "https://github.com/BrunoS3D/Youtube-Downloader",
		"homepage": "",
		"size": 66,
		"stargazers_count": 1,
		"watchers_count": 1,
		"language": "JavaScript",
		"has_issues": true,
		"has_projects": true,
		"has_downloads": true,
		"has_wiki": true,
		"has_pages": false,
		"forks_count": 0,
		"mirror_url": null,
		"archived": false,
		"disabled": false,
		"open_issues_count": 0,
		"license": {
			"key": "mit",
			"name": "MIT License",
			"spdx_id": "MIT",
			"url": "https://api.github.com/licenses/mit",
			"node_id": "MDc6TGljZW5zZTEz"
		},
		"forks": 0,
		"open_issues": 0,
		"watchers": 1,
		"default_branch": "master"
	}
]
},{}],33:[function(require,module,exports){
const RepoList = require("./components/RepoList");
const SlideShow = require("./components/SlideShow");
const GitHubButtons = require("./components/GitHubButtons");
const FooterTimestamp = require("./components/FooterTimestamp");

let lastSearch = "";
let searchNavCounter = 0;

// Olhe no fim deste script
async function renderComponents() {
	await RepoList.Render();
	await SlideShow.Render();
	await FooterTimestamp.Render();
	// Executar por ultimo =]
	await GitHubButtons.Render();
}

function navbarUpdate() {
	const navbar = $("#navbar");
	const scrollPos = $(document).scrollTop();

	const scrollDynamic = $(".scroll-dynamic");
	scrollDynamic.toggleClass("scrolled", scrollPos > navbar.height());
}

$(window).on("load", function () {
	// console.log("window loaded");
	$("#load-screen").fadeOut(500);
	$("#typewriter").addClass("typewriter-anim");
});

$(document).ready(function () {
	// console.log("document ready");
	navbarUpdate();
});

$(".nav-link").on("click", function () {
	$(".nav-link.active").removeClass("active");
	$(this).addClass("active");
});

$("#button-scroll-top").on("click", function () {
	window.location.href = "#";
	$(".nav-link.active").removeClass("active");
	$('a[href="#"]').addClass("active");
});

$("#search-form").submit(function (event) {
	event.preventDefault();
	const search = $("#search").val();

	if (!search) return;

	if (lastSearch == search) {
		searchNavCounter++;
	}
	else {
		lastSearch = search;
		searchNavCounter = 0;
	}

	const elements = $("h1, h2, p, a, label").filter(function () {
		return $(this).text().toLowerCase().indexOf(search.toLowerCase()) >= 0;
	});

	if (searchNavCounter >= elements.length) {
		searchNavCounter = 0;
	}

	const element = elements.eq(searchNavCounter);

	if (element && element.offset()) {
		$(document).scrollTop(element.offset().top - 200);
	}
});

$("#contact-form").submit(function (event) {
	event.preventDefault();

	const fname = $("#fname").val();
	const lname = $("#lname").val();
	const subject = $("#subject").val();

	const URI = `mailto:bruno3dcontato@gmail.com?subject=Portfolio%20Contato:%20${encodeURIComponent(fname)}%20${encodeURIComponent(lname)}&body=${encodeURIComponent(subject)}`;

	window.open(URI, "_blank");
});

$(document).scroll(function () {
	const scrollPos = $(document).scrollTop();
	navbarUpdate();

	if (scrollPos > 400) {
		$("#button-scroll-top").css("display", "block");
	}
	else {
		$("#button-scroll-top").css("display", "none");
	}
});

renderComponents();
},{"./components/FooterTimestamp":28,"./components/GitHubButtons":29,"./components/RepoList":30,"./components/SlideShow":31}]},{},[33]);
