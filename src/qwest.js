'use strict';

import {Utils} from './utils.js';

/**
 * qwest 2.0.0
 *
 * @description
 * @returns {object}
 * @author
 */

class qwest {

  constructor (options) {
    this.options = options;
    this._Utils = new Utils();
    this._reqLimit = 4;
    this._reqsInProgress = 0;
  }

  /**
   *
   * @param method
   * @param url
   * @param args
   * @returns {Promise}
   */

  createRequest (method, url, args, type) {
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      let client = that._Utils.getXHR();
      let uri = url;
      let isLimit = new Promise(function (resolved,rejected) {
        let check = function () {
          if(that._reqLimit <= that._reqsInProgress ) {
            resolved()
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });

      /**
       * increment requests counter
       */

      that._reqsInProgress += 1;

      isLimit.then(function () {
        if(that._Utils.isXHR2()) {
          console.warn('qwest dont have support for IE - yet');
          return false;
        }

        if (args && (method === 'POST') || method === 'PUT') {
          let argCount = 0;
          uri += '?';

          for(let key in args) {
            if(args.hasOwnProperty(key) && argCount++) {
              uri += '&';
            }

            /**
             * refactor to template string ?
             */
            uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
          }
        }

        client.onload = function () {
          if (this.status === 200 || this.status === 201 && this.readyState === 4) {
            resolve(that._Utils.preprocessResponse(this, type));
          } else {
            reject(this.statusText);
          }

          /**
           * decrement request counter
           */

          that._reqsInProgress -= 1;
        };

        client.onerror = function () {
          reject(this.statusText);

          /**
           * decrement request counter
           */

          that._reqsInProgress -= 1;
        };

        client.open(method,uri);
        client.send(null);
      });
    });

    return promise;
  }

  /**
   *
   * @param url
   * @param args
   * @returns {Promise}
   */

  get(url, args, type) {
    if (url) {
      return this.createRequest('GET', url, args, type);
    } else {
      throw new Error('qwest :: GET :: missing URL');
    }
  }

  /**
   *
   * @param url
   * @param args
   * @returns {Promise}
   */

  post (url, args) {
    if(url && args) {
      return this.createRequest('POST', url, args);
    } else {
      throw new Error('qwest :: POST :: missing URL or Arguments');
    }
  }

  /**
   *
   * @param url
   * @param args
   * @returns {Promise}
   */

  delete (url,args) {
    if(url && args) {
      return this.createRequest('DELETE', url, args);
    } else {
      throw new Error('qwest :: DELETE :: missing URL or Arguments');
    }
  }

  /**
   *
   * @param url
   * @param args
   * @returns {Promise}
   */

  put (url, args) {
    if(url && args) {
      return this.createRequest('PUT', url, args);
    } else {
      throw new Error('qwest :: PUT :: missing URL or Arguments');
    }
  }
}

export {qwest}
