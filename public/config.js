'use strict';

window.ORDERPILOT_CONFIG = {
  API_BASE_URL: "http://10.100.102.18:3000",
  APP_ENV: "desktop-remote",
  APP_VERSION: "43.0.0",
  ENABLE_NATIVE_PUSH: true,
  ...(window.ORDERPILOT_CONFIG || {})
};
