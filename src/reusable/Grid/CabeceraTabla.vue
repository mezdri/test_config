<template>
  <div>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs12 sm6 md6>
        <div>
          <slot name="izquierda" />
        </div>
      </v-flex>
      <v-flex
        xs12
        sm6
        :md4="permisoAccion.visible"
        :md6="!permisoAccion.visible"
      >
        <div align="right" style="padding-top:15px">
          <slot name="centro" />
        </div>
      </v-flex>
      <v-flex
        xs12
        sm6
        md2
        style="padding-right:0px;"
        v-show="permisoAccion.visible"
      >
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <slot name="derecha" />
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

@Component({})
export default class CabeceraTabla extends Vue {
  @Prop({
    default: () => ({
      accionCodigo: 0,
      visible: true,
      moduloCodigo: 0,
    }),
  })
  permisoAccion: PermisoAccion;
}
</script>
