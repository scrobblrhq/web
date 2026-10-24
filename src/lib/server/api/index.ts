import type { ApiEvent } from "./request";
import { authApi } from "./auth";
import { profileApi } from "./profile";
import { searchApi } from "./search";
import { tokensApi } from "./tokens";
import { catalogApi } from "./catalog";
import { commentsApi } from "./comments";
import { imagesApi } from "./images";
import { scrobblerApi } from "./scrobbler";
import { importsApi } from "./imports";
import { rankingsApi } from "./rankings";
import { accountApi } from "./account";

export { run } from "./run";

export const createApi = (event: ApiEvent) => ({
  auth: authApi(event),
  profile: profileApi(event),
  search: searchApi(event),
  scrobbler: scrobblerApi(event),
  tokens: tokensApi(event),
  catalog: catalogApi(event),
  comments: commentsApi(event),
  images: imagesApi(event),
  imports: importsApi(event),
  rankings: rankingsApi(event),
  account: accountApi(event),
});

export { ApiError } from "./request";
