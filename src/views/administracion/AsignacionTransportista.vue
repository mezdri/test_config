<template>
  <v-layout>
    <v-container fluid grid-list-md>
      <v-card>
        <v-flex md12>
          <v-card>
            <v-form ref="form" lazy-validation class="col-md-12">
              <v-container>
                <v-layout>
                  <v-flex class="flex-column">
                    <h2 class="h2_title" style="margin-top: 12px !important">
                      Asignación
                    </h2>
                    <div>Vehículo | Transportista</div>
                  </v-flex>
                </v-layout>
                <v-flex class="flex-column">
                  <AsignacionFiltroPlataforma ref="asignacionPlataforma" />
                </v-flex>
              </v-container>
              <v-container>
                <AsignacionBusqueda ref="asignacionBusqueda" />
                <v-card>
                  <TabGridSeleccion ref="asignacionSeleccion" />
                  <!-- <GridPatentes /> -->
                </v-card>
                <AsignacionPersonal ref="asignacionPersonal" />
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </v-card>
    </v-container>
  </v-layout>
</template>

<script lang="ts">
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Component } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import AsignacionFiltroPlataforma from '@/components/Asignaciones/AsignacionFiltroPlataforma.vue';
import AsignacionBusqueda from '@/components/Asignaciones/AsignacionBusqueda.vue';
import AsignacionPersonal from '@/components/Asignaciones/AsignacionPersonal.vue';
import GridResumen from '@/components/Asignaciones/GridResumen.vue';
import TabGridSeleccion from '@/components/Asignaciones/TabGridSeleccion.vue';
import GridPatentes from '@/components/Asignaciones/GridPatentes.vue';
import AsociarVehiculos from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarVehiculos.vue';
import store from '@/store';
import GridSeleccion from '@/components/Asignaciones/GridSeleccion.vue';
import { asociacionEventBus } from '@/setup';

@Component({
  components: {
    AsignacionFiltroPlataforma,
    AsignacionBusqueda,
    AsignacionPersonal,
    GridResumen,
    GridSeleccion,
    GridPatentes,
    AsociarVehiculos,
    TabGridSeleccion,
  },
})
export default class Asignaciones extends ComponenteBase {
  constructor() {
    super();
  }

  seleccion: number = 0;

  readonly funcionalidad: Funcionalidades =
    Funcionalidades.AsignacionTransportista;

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionCrear];
  mounted() {
    asociacionEventBus.$on('asignacionReady', (asignacion: any) => {
      console.log(asignacion);
      const refPlataforma = this.$refs.asignacionPlataforma as any;
      const refTransportista = this.$refs.asignacionPersonal as any;
      const refBusqueda = this.$refs.asignacionBusqueda as any;
      const refGridSeleccion = this.$refs.asignacionSeleccion as any;
      asociacionEventBus.$emit('resetGrillas');
      refPlataforma.reset();
      refBusqueda.reset();
      refTransportista.reset();
      refGridSeleccion.reset();
      if (asignacion)
        this.$snotify.success(
          this.$t('mensajes.mensajesAsociacionesExito.editarMasivo')
        );
    });
  }
}
</script>
