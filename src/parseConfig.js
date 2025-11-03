import Parse from 'parse';

// Parse configuration
// You can set these via environment variables or replace with your actual credentials
const PARSE_APPLICATION_ID = process.env.PARSE_APP_ID || 'your-app-id';
const PARSE_HOST_URL = process.env.PARSE_HOST_URL || 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = process.env.PARSE_JS_KEY || 'your-javascript-key';

// Initialize Parse
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default Parse;
