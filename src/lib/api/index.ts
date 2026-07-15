import { authApi } from "./auth";
import { profileApi } from "./profile";
import { searchApi } from "./search";
import { tokensApi } from "./tokens";
import { catalogApi } from "./catalog";
import { commentsApi } from "./comments";
import { imagesApi } from "./images";

export const api = {
  auth: authApi,
  profile: profileApi,
  search: searchApi,
  tokens: tokensApi,
  catalog: catalogApi,
  comments: commentsApi,
  images: imagesApi,
};

export { ApiError } from "./request";
