<template>
  <ul class="listarefs" v-if="this.params.data.referencias_link != '[]'">
    <li
      v-for="item in JSON.parse(this.params.data.referencias_link)"
      :key="item"
    >
      <a :href="item.split('__')[1]" target="_blank">{{
        item.split('__')[0]
      }}</a>
    </li>
  </ul>
  <p v-else>--</p>
</template>

<script>
import Vue from 'vue';
import config from '@/config/index';

export default Vue.extend({
  data: function() {
    return {
      cellValue: null,
    };
  },
  methods: {},
});
</script>
<style>
ul.listarefs {
  list-style: none;
  padding-left: 0px !important;
}
</style>
