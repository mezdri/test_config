<template>
  <div>
    <vue-snotify></vue-snotify>
    <app-sidebar></app-sidebar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <!-- <v-footer :fixed="fixed" app class="pa-3" dark color="primary" style="font-color:white;">
        <v-spacer></v-spacer>
        <div> <strong>&copy; {{ new Date().getFullYear() }}</strong> </div>
    </v-footer>-->
    <!-- <ComponenteChat v-if="mostrarChat"></ComponenteChat> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import SideBar from '../components/SideBar.vue';
import { Component, Emit } from 'vue-property-decorator';
import InicioPantalla from '@/pantallas/Inicio/InicioPantalla.vue';
import store from '@/store';
import ComponenteChat from '@/reusable/Chat/ComponenteChat.vue';

@Component({
  components: {
    InicioPantalla,
    'app-sidebar': SideBar,
    ComponenteChat,
  },
})
export default class Home extends Vue {
  fixed: boolean = false;
  mostrarChat: boolean = false;

  mounted() {
    this.permisosChat();
  }

  permisosChat() {
    if (store.state.permisoChat) {
      this.mostrarChat = true;
    } else {
      this.mostrarChat = false;
    }
  }
}
</script>
