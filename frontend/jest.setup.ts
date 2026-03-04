import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// MSW 2.0+ requires these globals to be available in Node/JSDOM
Object.assign(global, { TextDecoder, TextEncoder });

// Polyfill fetch for node/jsdom
const { fetch, Request, Response, Headers, FormData, Blob } = require('undici');
Object.assign(global, { fetch, Request, Response, Headers, FormData, Blob });