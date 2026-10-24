import { defineEnvVars } from "@sveltejs/kit/hooks";

export const variables = defineEnvVars({
  SCROBBLR_API_URL: {},
  SCROBBLR_APP_ID: {},
  SCROBBLR_APP_KEY: {}
});
