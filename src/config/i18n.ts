import Vue from 'vue';
import VueI18n from 'vue-i18n';
import msg from '@/translations/index';

Vue.use(VueI18n);

export default new VueI18n({
  locale: 'es',
  messages: msg,
});
