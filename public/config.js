'use strict';

window.ORDERPILOT_CONFIG = {
  API_BASE_URL: "http://10.100.102.17:3000",
  APP_ENV: "desktop",
  APP_VERSION: "44.0.0",
  ENABLE_NATIVE_PUSH: true,
  ...(window.ORDERPILOT_CONFIG || {})
};
