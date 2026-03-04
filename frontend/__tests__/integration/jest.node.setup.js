// Polyfills required for MSW in Node environment
try {
  // Fetch/Response/Request polyfill
  require('undici/polyfill-fetch');
} catch (e) {
  // undici might be installed at runtime inside the container
}

// TextEncoder / TextDecoder
try {
  const { TextEncoder, TextDecoder } = require('util');
  if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
  if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;
} catch (e) {}

// ReadableStream ponyfill if missing
try {
  if (typeof global.ReadableStream === 'undefined') {
    const { ReadableStream } = require('web-streams-polyfill/ponyfill');
    global.ReadableStream = ReadableStream;
  }
} catch (e) {}

module.exports = {};
