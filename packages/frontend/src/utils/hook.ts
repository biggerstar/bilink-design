export function hook_console_warn() {
  const rowConsoleWarn = console.warn
  console.warn = function (log, ...args) {   // vue3-infinitegrid 的bug，这里进行拦截警告
    if (log.includes('Component emitted event')) return
    if (log.includes('non-passive event')) return
    rowConsoleWarn.call(console, log, ...args)
  }
}
