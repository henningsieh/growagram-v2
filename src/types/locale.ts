import { APP_SETTINGS } from "~/assets/constants";

export type Locale = (typeof APP_SETTINGS.LANGUAGES)[number]["code"];
