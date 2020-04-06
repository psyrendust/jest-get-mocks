/**
 * A performance.now wrapper for node and browser.
 *
 * ```js
 * import { now } from '@frontend/api-services-js/core/utils';
 * const start = now();
 * setTimeout(() => {
 *   console.log('This operation took ' + (now() - start) + 'ms');
 * }, 1000);
 * ```
 */
exports.now = ((win, pr) => {
  if (win !== undefined && win.performance && win.performance.now) {
    // In the browser with support
    return () => Math.round(win.performance.now() * 1000) / 1000;
  }
  if (pr !== undefined && pr.hrtime) {
    // In node use hrtime
    const nano = () => {
      const hr = pr.hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    const start = nano();
    return () => Math.round(((nano() - start) / 1e6) * 1000) / 1000;
  }
  const start = Date.now();
  return () => Date.now() - start;
})(window, process);
