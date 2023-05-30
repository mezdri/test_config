import { SnotifyToastConfig } from 'vue-snotify';
import { TranslateResult } from 'vue-i18n';

type SnotifyMethod = {
  (message: string | TranslateResult, options?: SnotifyToastConfig): void;
};

export type Snotify = {
  error: SnotifyMethod;
  success: SnotifyMethod;
  warning: SnotifyMethod;
};
