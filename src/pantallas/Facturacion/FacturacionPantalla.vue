<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Facturación</v-tab>
    </v-tabs>
    <v-divider />
    <Facturaciones />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Facturaciones from '@/pantallas/Facturacion/Facturaciones.vue';

@Component({
  components: { Facturaciones },
})
export default class FacturacionPantalla extends Vue {
  /* mounted() {
    const script_content = `window.$zopim||(function(d,s){var z=$zopim=function(c){z._.push(c)},$=z.s=
d.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set.
_.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute("charset","utf-8");
$.src="https://v2.zopim.com/?2gNocFXk9MdIIXCgdxDk9Gcsimvsly0I";z.t=+new Date;$.
type="text/javascript";e.parentNode.insertBefore($,e)})(document,"script");`;
    const script_tag = document.createElement('script');
    script_tag.type = 'text/javascript';
    script_tag.text = script_content;
    document.body.appendChild(script_tag);
  } */
}
</script>
