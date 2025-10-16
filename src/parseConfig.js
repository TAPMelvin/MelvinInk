import Parse from 'parse';

// Parse configuration
const PARSE_APPLICATION_ID = 'your-app-id';
const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_KEY = 'your-javascript-key';

// Initialize Parse
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default Parse;
