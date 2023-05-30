import { Vue } from 'vue/types/vue';

export const makeTestId = (componentInstance: Vue) => (identifier: string) =>
  `${componentInstance.$options.name}--${identifier}`;
