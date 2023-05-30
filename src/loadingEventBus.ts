import Vue from 'vue';

const loadingEventBus = new Vue({
  methods: {
    loading(show: boolean = false) {
      this.$emit('loading', show);
    },
  },
});

export default loadingEventBus;
