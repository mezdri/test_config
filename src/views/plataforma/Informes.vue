<template>
  <app-informes-modal-nuevo :show="showModalNew"></app-informes-modal-nuevo>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import InformesMenu from '../../pantallas/Informes/partes/InformesMenu.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm'; //
import { ComponenteBase } from '../base/ComponenteBase';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
@Component({
  components: {
    'app-informes-modal-nuevo': InformesMenu,
  },
})
export default class Informes extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Informes;
  //Declarar todas las Acciones Mantenedores

  accionConsultarGenerarInforme: PermisoAccion = {
    accionCodigo: 43,
    visible: false,
  };

  accionConsultarGenerarAsociar: PermisoAccion = {
    accionCodigo: 44,
    visible: false,
  };

  accionConsultarGenerarInformacion: PermisoAccion = {
    accionCodigo: 45,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultarGenerarInforme,
    this.accionConsultarGenerarAsociar,
    this.accionConsultarGenerarInformacion,
  ];
  showModalNew: boolean = false;
  mounted() {
    if (
      this.accionConsultarGenerarInforme.visible === false &&
      this.accionConsultarGenerarAsociar.visible === false &&
      this.accionConsultarGenerarInformacion.visible === false
    ) {
      window.location.href = window.location.origin;
    } else {
      this.showModalNew = true;
    }
  }
}
</script>
