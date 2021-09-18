"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Hook = void 0;

var _v = _interopRequireDefault(require("uuid/v4"));

var _underscore = _interopRequireDefault(require("underscore"));

var _objectPath = _interopRequireDefault(require("object-path"));

var _enums = _interopRequireDefault(require("../enums"));

var _actionSequence = _interopRequireDefault(require("action-sequence"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const noop = {
  sync: () => {},
  async: () => Promise.resolve()
};
const Hook = {
  action: {},
  actionIds: {}
};
/**
 * @api {Function} Hook.flush(name) Hook.flush()
 * @apiName Hook.flush
 * @apiDescription Clear all registered callbacks for a hook.
 * @apiParam {String} name the hook name
 * @apiParam {String} [type='async'] 'async' or 'sync' hooks
 * @apiGroup Reactium.Hook
 */

exports.default = exports.Hook = Hook;

Hook.flush = (name, type = 'async') => _objectPath.default.set(Hook.action, `${type}.${name}`, {});
/**
 * @api {Function} Hook.unregister(id) Hook.unregister()
 * @apiName Hook.unregister
 * @apiDescription Unregister a registered hook callback by id.
 * @apiParam {String} id the unique id provided by Hook.register() or Hook.list()
 * @apiGroup Reactium.Hook
 */


Hook.unregister = id => {
  const path = _objectPath.default.get(Hook.actionIds, [id]);

  if (path) {
    _objectPath.default.del(Hook.action, path);

    _objectPath.default.del(Hook.actionIds, [id]);
  }
};

Hook._register = (type = 'async') => (name, callback, order = _enums.default.priority.neutral, id) => {
  id = id || (0, _v.default)();
  const path = `${type}.${name}.${id}`;

  _objectPath.default.set(Hook.actionIds, [id], path);

  _objectPath.default.set(Hook.action, `${type}.${name}.${id}`, {
    id,
    order,
    callback
  });

  return id;
};
/**
 * @api {Function} Hook.register(name,callback,order,id) Hook.register()
 * @apiName Hook.register
 * @apiDescription Register a hook callback.
 * @apiParam {String} name the hook name
 * @apiParam {Function} callback async function (or returning promise) that will be called when the hook is run.
 The hook callback will receive any parameters provided to Hook.run, followed by a context object (passed by reference to each callback).
 * @apiParam {Integer} [order=Enums.priority.neutral] order of which the callback will be called when this hook is run.
 * @apiParam {String} [id] the unique id. If not provided, a uuid will be generated
 * @apiGroup Reactium.Hook
 * @apiExample Example Usage
import Reactium from 'reactium-core/sdk';
Reactium.Hook.register('plugin-init', async context => {
// mutate context object asynchrounously here
    console.log('Plugins initialized!');
}, Enums.priority.highest);
*/


Hook.register = Hook._register('async');
/**
 * @api {Function} Hook.registerSync(name,callback,order,id) Hook.registerSync()
 * @apiName Hook.registerSync
 * @apiDescription Register a sync hook callback.
 * @apiParam {String} name the hook name
 * @apiParam {Function} callback function returning promise that will be called when the hook is run.
 The hook callback will receive any parameters provided to Hook.run, followed by a context object (passed by reference to each callback).
 * @apiParam {Integer} [order=Enums.priority.neutral] order of which the callback will be called when this hook is run.
 * @apiParam {String} [id] the unique id. If not provided, a uuid will be generated
 * @apiGroup Reactium.Hook
 * @apiExample Example Usage
import Reactium from 'reactium-core/sdk';
Reactium.Hook.registerSync('my-sync-hook', context => {
    // mutate context object synchrounously here
    console.log('my-sync-hook run!');
}, Enums.priority.highest);
*/

Hook.registerSync = Hook._register('sync');
/**
 * @api {Function} Hook.list() Hook.list()
 * @apiName Hook.list
 * @apiDescription Register a hook callback.
 * @apiGroup Reactium.Hook
 */

Hook.list = (type = 'async') => Object.keys(_objectPath.default.get(Hook.action, type, {})).sort();

Hook._actions = (name, type = 'async', params) => _underscore.default.sortBy(Object.values(_objectPath.default.get(Hook.action, `${type}.${name}`, {})), 'order').reduce((acts, action) => {
  const {
    callback = noop[type],
    id
  } = action;

  acts[id] = ({
    context
  }) => callback(...params, context);

  return acts;
}, {});
/**
 * @api {Function} Hook.run(name,...params) Hook.run()
 * @apiName Hook.run
 * @apiDescription Run hook callbacks.
 * @apiParam {String} name the hook name
 * @apiParam {Mixed} ...params any number of arbitrary parameters (variadic)
 * @apiSuccess {Object} context context object passed to each callback (after other variadic parameters)
 * @apiGroup Reactium.Hook
 */


Hook.run = (name, ...params) => {
  return (0, _actionSequence.default)({
    actions: Hook._actions(name, 'async', params),
    context: {
      hook: name,
      params
    }
  });
};
/**
 * @api {Function} Hook.runSync(name,...params) Hook.runSync()
 * @apiName Hook.runSync
 * @apiDescription Run hook callbacks sychronously.
 * @apiParam {String} name the hook name
 * @apiParam {Mixed} ...params any number of arbitrary parameters (variadic)
 * @apiSuccess {Object} context context object passed to each callback (after other variadic parameters)
 * @apiGroup Reactium.Hook
 */


Hook.runSync = (name, ...params) => {
  const context = {
    hook: name,
    params
  };
  Object.values(Hook._actions(name, 'sync', params)).forEach(callback => callback({
    context
  }));
  return context;
};