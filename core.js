// Generated by CoffeeScript 1.10.0
(function() {
  var hasProp = {}.hasOwnProperty;

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(function() {
        return (root.PinejsClientCore = factory());
      });
    } else if (typeof exports === 'object') {
      return module.exports = factory();
    } else {
      return root.PinejsClientCore = factory();
    }
  })(this, function() {
    return function(utils, Promise) {
      var PinejsClientCore, bracketJoin, buildExpand, buildFilter, escapeResource, escapeValue, isPrimitive, join, validParams;
      (function() {
        var i, len, method, requiredMethods;
        requiredMethods = ['isString', 'isNumber', 'isBoolean', 'isObject', 'isArray'];
        for (i = 0, len = requiredMethods.length; i < len; i++) {
          method = requiredMethods[i];
          if (utils[method] == null) {
            throw new Error('The utils implementation must support ' + requiredMethods.join(', '));
          }
        }
        if (Promise.reject == null) {
          throw new Error('The Promise implementation must support .reject');
        }
      })();
      isPrimitive = function(value) {
        return utils.isString(value) || utils.isNumber(value) || utils.isBoolean(value) || value === null;
      };
      escapeResource = function(resource) {
        var component;
        if (utils.isString(resource)) {
          return encodeURIComponent(resource);
        } else if (utils.isArray(resource)) {
          resource = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = resource.length; i < len; i++) {
              component = resource[i];
              results.push(encodeURIComponent(component));
            }
            return results;
          })();
          return resource.join('/');
        } else {
          throw new Error('Not a valid resource: ' + typeof value);
        }
      };
      escapeValue = function(value) {
        if (utils.isString(value)) {
          return "'" + encodeURIComponent(value) + "'";
        } else if (utils.isNumber(value) || utils.isBoolean(value) || value === null) {
          return value;
        } else {
          throw new Error('Not a valid value: ' + typeof value);
        }
      };
      join = function(strOrArray, separator) {
        if (separator == null) {
          separator = ',';
        }
        if (utils.isString(strOrArray)) {
          return strOrArray;
        } else if (utils.isArray(strOrArray)) {
          return strOrArray.join(separator);
        } else {
          throw new Error('Expected a string or array, got: ' + typeof strOrArray);
        }
      };
      bracketJoin = function(arr, separator, forceOuterBrackets) {
        var str;
        if (forceOuterBrackets == null) {
          forceOuterBrackets = false;
        }
        str = arr.join(')' + separator + '(');
        if (arr.length > 1) {
          return '((' + str + '))';
        }
        if (forceOuterBrackets) {
          return '(' + str + ')';
        }
        return str;
      };
      buildFilter = (function() {
        var addParentKey, handleArray, handleObject, handleOperator;
        addParentKey = function(filter, parentKey, operator) {
          if (operator == null) {
            operator = ' eq ';
          }
          if (parentKey != null) {
            return escapeResource(parentKey) + operator + filter;
          }
          return filter;
        };
        handleOperator = function(filter, parentKey, operator) {
          var operands, result;
          operator = operator.slice(1);
          switch (operator) {
            case 'ne':
            case 'eq':
            case 'gt':
            case 'ge':
            case 'lt':
            case 'le':
            case 'add':
            case 'sub':
            case 'mul':
            case 'div':
            case 'mod':
              operator = ' ' + operator + ' ';
              if (isPrimitive(filter)) {
                filter = escapeValue(filter);
                return addParentKey(filter, parentKey, operator);
              } else if (utils.isArray(filter)) {
                filter = handleArray(filter);
                filter = bracketJoin(filter, operator);
                return addParentKey(filter, parentKey);
              } else if (utils.isObject(filter)) {
                result = handleObject(filter);
                if (result.length < 1) {
                  throw new Error(operator + " objects must have at least 1 property as an object, got: " + (JSON.stringify(filter)));
                }
                if (result.length === 1) {
                  return addParentKey(result[0], parentKey, operator);
                } else {
                  filter = bracketJoin(result, operator);
                  return addParentKey(filter, parentKey);
                }
              } else {
                throw new Error('Expected null/string/number/bool/obj/array, got: ' + typeof filter);
              }
              break;
            case 'contains':
            case 'endswith':
            case 'startswith':
            case 'endswith':
            case 'endswith':
            case 'length':
            case 'indexof':
            case 'substring':
            case 'tolower':
            case 'toupper':
            case 'trim':
            case 'concat':
            case 'year':
            case 'month':
            case 'day':
            case 'hour':
            case 'minute':
            case 'second':
            case 'fractionalseconds':
            case 'date':
            case 'time':
            case 'totaloffsetminutes':
            case 'now':
            case 'maxdatetime':
            case 'mindatetime':
            case 'totalseconds':
            case 'round':
            case 'floor':
            case 'ceiling':
            case 'isof':
            case 'cast':
              if (isPrimitive(filter)) {
                operands = [];
                if (parentKey != null) {
                  operands.push(escapeResource(parentKey));
                }
                operands.push(escapeValue(filter));
                return operator + '(' + operands.join() + ')';
              } else if (utils.isArray(filter)) {
                filter = handleArray(filter);
                filter = bracketJoin(filter, ',', true);
                filter = operator + filter;
                return addParentKey(filter, parentKey);
              } else if (utils.isObject(filter)) {
                result = handleObject(filter);
                filter = bracketJoin(result, ',', true);
                filter = operator + filter;
                return addParentKey(filter, parentKey);
              } else {
                throw new Error('Expected null/string/number/obj/array, got: ' + typeof filter);
              }
              break;
            case 'raw':
              return addParentKey(filter, parentKey);
            case '':
              filter = escapeResource(filter);
              return addParentKey(filter, parentKey);
            case 'and':
            case 'or':
              filter = buildFilter(filter, null, " " + operator + " ");
              return addParentKey(filter, parentKey);
            case 'in':
              operator = " " + operator + " ";
              if (isPrimitive(filter)) {
                filter = escapeValue(filter);
                return addParentKey(filter, parentKey, ' eq ');
              } else if (utils.isArray(filter)) {
                filter = handleArray(filter, parentKey, 1);
                return filter = bracketJoin(filter, ' or ');
              } else if (utils.isObject(filter)) {
                result = handleObject(filter, parentKey);
                if (result.length < 1) {
                  throw new Error(operator + " objects must have at least 1 property as an object, got: " + (JSON.stringify(filter)));
                }
                return filter = bracketJoin(result, ' or ');
              } else {
                throw new Error('Expected null/string/number/bool/obj/array, got: ' + typeof filter);
              }
              break;
            case 'not':
              filter = 'not(' + buildFilter(filter) + ')';
              return addParentKey(filter, parentKey);
            default:
              throw new Error('Unrecognised operator: ' + operator);
          }
        };
        handleObject = function(filter, parentKey) {
          var key, results, value;
          results = [];
          for (key in filter) {
            if (!hasProp.call(filter, key)) continue;
            value = filter[key];
            if (key[0] === '$') {
              results.push(handleOperator(value, parentKey, key));
            } else {
              key = [key];
              if (parentKey != null) {
                key = parentKey.concat(key);
              }
              results.push(buildFilter(value, key));
            }
          }
          return results;
        };
        handleArray = function(filter, parentKey, minElements) {
          var i, len, results, value;
          if (minElements == null) {
            minElements = 2;
          }
          if (filter.length < minElements) {
            throw new Error("Filter arrays must have at least " + minElements + " elements, got: " + (JSON.stringify(filter)));
          }
          results = [];
          for (i = 0, len = filter.length; i < len; i++) {
            value = filter[i];
            results.push(buildFilter(value, parentKey));
          }
          return results;
        };
        return function(filter, parentKey, joinStr) {
          if (isPrimitive(filter)) {
            filter = escapeValue(filter);
            return addParentKey(filter, parentKey);
          } else if (utils.isArray(filter)) {
            filter = handleArray(filter);
            filter = bracketJoin(filter, joinStr != null ? joinStr : ' or ');
            return addParentKey(filter, parentKey);
          } else if (utils.isObject(filter)) {
            filter = handleObject(filter, parentKey);
            return bracketJoin(filter, joinStr != null ? joinStr : ' and ');
          } else {
            throw new Error('Expected null/string/number/obj/array, got: ' + typeof filter);
          }
        };
      })();
      buildExpand = (function() {
        var handleArray, handleObject;
        handleObject = function(expand, parentKey) {
          var expandOptions, expands, key, value;
          expandOptions = [];
          expands = [];
          for (key in expand) {
            if (!hasProp.call(expand, key)) continue;
            value = expand[key];
            if (key[0] === '$') {
              if (parentKey.length === 0) {
                throw new Error('Cannot have expand options without first expanding something!');
              }
              value = (function() {
                switch (key) {
                  case '$filter':
                    return buildFilter(value);
                  case '$expand':
                    return buildExpand(value);
                  default:
                    return join(value);
                }
              })();
              expandOptions.push(key + "=" + value);
            } else {
              key = parentKey.concat(key);
              expands.push(buildExpand(value, key));
            }
          }
          if (expandOptions.length > 0) {
            expandOptions = expandOptions.join('&');
            expandOptions = escapeResource(parentKey) + ("(" + expandOptions + ")");
            expands.push(expandOptions);
          }
          return expands;
        };
        handleArray = function(expand, parentKey) {
          var i, len, results, value;
          if (expand.length < 1) {
            throw new Error("Expand arrays must have at least 1 elements, got: " + (JSON.stringify(expand)));
          }
          results = [];
          for (i = 0, len = expand.length; i < len; i++) {
            value = expand[i];
            results.push(buildExpand(value, parentKey));
          }
          return results;
        };
        return function(expand, parentKey) {
          if (parentKey == null) {
            parentKey = [];
          }
          if (isPrimitive(expand)) {
            return escapeResource(parentKey.concat(expand));
          } else if (utils.isArray(expand)) {
            expand = handleArray(expand, parentKey);
            return expand = join(expand);
          } else if (utils.isObject(expand)) {
            expand = handleObject(expand, parentKey);
            return join(expand);
          }
        };
      })();
      validParams = ['apiPrefix', 'passthrough', 'passthroughByMethod'];
      return PinejsClientCore = (function() {
        PinejsClientCore.prototype.apiPrefix = '/';

        PinejsClientCore.prototype.passthrough = {};

        PinejsClientCore.prototype.passthroughByMethod = {};

        function PinejsClientCore(params, backendParams) {
          var i, len, validParam;
          if (utils.isString(params)) {
            params = {
              apiPrefix: params
            };
          }
          if (utils.isObject(params)) {
            for (i = 0, len = validParams.length; i < len; i++) {
              validParam = validParams[i];
              if (params[validParam] != null) {
                this[validParam] = params[validParam];
              }
            }
          }
        }

        PinejsClientCore.prototype.clone = function(params, backendParams) {
          var cloneBackendParams, cloneParams, i, key, len, ref, validParam, value;
          if (utils.isString(params)) {
            params = {
              apiPrefix: params
            };
          }
          cloneParams = {};
          for (i = 0, len = validParams.length; i < len; i++) {
            validParam = validParams[i];
            if (this[validParam] != null) {
              cloneParams[validParam] = this[validParam];
            }
            if ((params != null ? params[validParam] : void 0) != null) {
              cloneParams[validParam] = params[validParam];
            }
          }
          cloneBackendParams = {};
          if (utils.isObject(this.backendParams)) {
            ref = this.backendParams;
            for (key in ref) {
              value = ref[key];
              cloneBackendParams[key] = value;
            }
          }
          if (utils.isObject(backendParams)) {
            for (key in backendParams) {
              value = backendParams[key];
              cloneBackendParams[key] = value;
            }
          }
          return new this.constructor(cloneParams, cloneBackendParams);
        };

        PinejsClientCore.prototype.query = function(params) {
          return this.get(params);
        };

        PinejsClientCore.prototype.get = function(params) {
          var singular;
          singular = utils.isObject(params) && (params.id != null);
          return this.request(params, {
            method: 'GET'
          }).then(function(data) {
            if ((data != null ? data.d : void 0) == null) {
              throw new Error('Invalid response received.');
            }
            if (singular) {
              if (data.d.length > 1) {
                throw new Error('Returned multiple results when only one was expected.');
              }
              return data.d[0];
            }
            return data.d;
          });
        };

        PinejsClientCore.prototype.put = function(params) {
          return this.request(params, {
            method: 'PUT'
          });
        };

        PinejsClientCore.prototype.patch = function(params) {
          return this.request(params, {
            method: 'PATCH'
          });
        };

        PinejsClientCore.prototype.post = function(params) {
          return this.request(params, {
            method: 'POST'
          });
        };

        PinejsClientCore.prototype["delete"] = function(params) {
          return this.request(params, {
            method: 'DELETE'
          });
        };

        PinejsClientCore.prototype.compile = function(params) {
          var option, queryOptions, ref, ref1, url, value;
          if (utils.isString(params)) {
            return params;
          } else if (params.url != null) {
            return params.url;
          } else {
            if (params.resource == null) {
              throw new Error('Either the url or resource must be specified.');
            }
            url = params.resource;
            if (params.id != null) {
              url += '(' + escapeValue(params.id) + ')';
            }
            queryOptions = [];
            if (params.options != null) {
              ref = params.options;
              for (option in ref) {
                if (!hasProp.call(ref, option)) continue;
                value = ref[option];
                value = (function() {
                  switch (option) {
                    case 'filter':
                      return buildFilter(value);
                    case 'expand':
                      return buildExpand(value);
                    default:
                      return join(value);
                  }
                })();
                queryOptions.push(("$" + option + "=") + value);
              }
            }
            if (params.customOptions != null) {
              ref1 = params.customOptions;
              for (option in ref1) {
                if (!hasProp.call(ref1, option)) continue;
                value = ref1[option];
                queryOptions.push(option + '=' + value);
              }
            }
            if (queryOptions.length > 0) {
              url += '?' + queryOptions.join('&');
            }
            return url;
          }
        };

        PinejsClientCore.prototype.request = function(params, overrides) {
          var apiPrefix, body, e, error, i, len, mergeObjs, method, obj, option, opts, passthrough, ref, ref1, ref2, url, value;
          if (overrides == null) {
            overrides = {};
          }
          try {
            method = params.method, body = params.body, passthrough = params.passthrough;
            if (passthrough == null) {
              passthrough = {};
            }
            if (utils.isString(params)) {
              method = 'GET';
            }
            apiPrefix = (ref = params.apiPrefix) != null ? ref : this.apiPrefix;
            url = apiPrefix + this.compile(params);
            method = (ref1 = method != null ? method : overrides.method) != null ? ref1 : 'GET';
            method = method.toUpperCase();
            mergeObjs = [
              this.passthrough, (ref2 = this.passthroughByMethod[method]) != null ? ref2 : {}, passthrough != null ? passthrough : {}, {
                method: method,
                url: url,
                body: body
              }, overrides
            ];
            opts = {};
            for (i = 0, len = mergeObjs.length; i < len; i++) {
              obj = mergeObjs[i];
              for (option in obj) {
                if (!hasProp.call(obj, option)) continue;
                value = obj[option];
                opts[option] = value;
              }
            }
            opts.method = method;
            return this._request(opts);
          } catch (error) {
            e = error;
            return Promise.reject(e);
          }
        };

        return PinejsClientCore;

      })();
    };
  });

}).call(this);
