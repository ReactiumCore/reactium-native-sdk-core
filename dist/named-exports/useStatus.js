"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStatus = void 0;

var _underscore = _interopRequireDefault(require("underscore"));

var _react = require("react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @api {ReactHook} useStatus(initialStatus) useStatus()
 * @apiGroup ReactHook
 * @apiName useStatus
 * @apiParam {String} [initialStatus='pending'] The initial status of the hook.
 * @apiDescription Synchronously set a status value that can be checked within a
 function scope without updating the state of the component. Useful when doing
 asynchronous activities and the next activity depends on a status of some sort
 from the previous activity.

 Returns [status:String, setStatus:Function, isStatus:Function, getStatus:Function]

 ### status
 The current asynchronous status value. (is accurate once per render)

 ### setStatus(status:String, forceRender:Boolean = false)
 Set the status value. If forceRender is true, a rerender will be triggered.
 _**Beware:**_ forceRender may have unintended consequence and should be used in last status before re-rendering situations only.

 ### isStatus(statuses:Array)
 Check if the current status matches the statuses passed.

 ### getStatus()
Get the synchrounous value of the status. This can matter if you need to set and check the value in the same render cycle.
 */
const useStatus = (initialStatus = 'pending') => {
  const statusRef = (0, _react.useRef)(initialStatus);
  const [, rerender] = (0, _react.useState)({});

  const setStatus = (newStatus, forceRender = false) => {
    if (statusRef.current === newStatus) return;
    statusRef.current = newStatus;
    if (forceRender) rerender({
      updated: Date.now()
    });
  };

  const isStatus = statuses => _underscore.default.flatten([statuses]).includes(statusRef.current);

  const getStatus = () => statusRef.current;

  return [statusRef.current, setStatus, isStatus, getStatus];
};

exports.useStatus = useStatus;