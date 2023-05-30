<template>
  <v-container fluid grid-list-md>
    <v-layout row wrap>
      <h1>404 - Page Not Found</h1>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

@Component
export default class NotFound extends Vue {}
</script>
