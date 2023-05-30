<template>
  <v-app>
    <app-loading></app-loading>
    <router-view></router-view>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import Loading from './components/Loading.vue';
import { datadogRum } from '@datadog/browser-rum';

if (process.env.NODE_ENV == 'QA') {
  if (location.host.split('.')[0] == 'qagpstrack') {
    import(`../src/css/${'track3'}_style.css`);
  } else {
    import(
      `../src/css/${
        location.hostname == 'localhost'
          ? 'track3'
          : location.host.split('.')[0].substring(3) == ''
          ? '192'
          : location.host.split('.')[0].substring(3)
      }_style.css`
    );
  }
} else {
  import(
    `../src/css/${
      location.hostname == 'localhost' ? 'track3' : location.host.split('.')[0]
    }_style.css`
  );
}

@Component({
  components: {
    'app-loading': Loading,
  },
})
export default class App extends Vue {
  env: string = '';
  mounted() {
    this.env = process.env.NODE_ENV;
    datadogRum.init({
      applicationId: 'e6d59e5f-f169-4923-80ba-0f7160f74085',
      clientToken: 'pubb750158ed4c1b8b2c66dac7bce7b0ea3',
      site: 'datadoghq.com',
      service: 'track3',
      env: this.env,
      // Specify a version number to identify the deployed version of your application in Datadog
      // version: '1.0.0',
      sampleRate: 100,
      replaySampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: 'allow',
    });

    //validacion para el login todavía no existe el dato en el LocalStore
    if (localStorage.getItem('user') != null) {
      let user = localStorage.getItem('user');
      let id = JSON.parse(user.replace(/'/g, '"')).id;
      let name =
        JSON.parse(user.replace(/'/g, '"')).nombre +
        ' ' +
        JSON.parse(user.replace(/'/g, '"')).apellidoPaterno;
      let email = JSON.parse(user.replace(/'/g, '"')).email;

      datadogRum.setUser({
        id: id,
        name: name,
        email: email,
      });
    }
    datadogRum.startSessionReplayRecording();
  }
}
</script>

<style scoped></style>
