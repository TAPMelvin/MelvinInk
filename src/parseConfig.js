import Parse from 'parse';

// Parse configuration - Back4App credentials
// Match Back4App documentation format exactly
const PARSE_APPLICATION_ID = '1gmmKycnpK1J4rjYuanP0PZqmfd2VLknYJM8UOcR';
const PARSE_JAVASCRIPT_KEY = 'M0w0goPKgHs1gyxYTtUFuLrSRsA7ADVCi5wFuSCa';

// Initialize Parse (Back4App format)
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = 'https://parseapi.back4app.com';

export default Parse;
