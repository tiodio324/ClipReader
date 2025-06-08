/**
 * Polyfill for Node.js 'os' module used by viva-parser-fb2
 * This provides minimal implementation of the os module functions that might be used by the parser
 */

const os = {
  EOL: '\n',
  platform: () => 'android', // or 'ios' depending on platform
  tmpdir: () => '',
  hostname: () => 'localhost',
  type: () => 'React Native',
  release: () => '',
  homedir: () => '',
  userInfo: () => ({}),
  cpus: () => [],
  freemem: () => 0,
  totalmem: () => 0,
  uptime: () => 0,
  loadavg: () => [0, 0, 0],
  networkInterfaces: () => ({}),
};

export default os;