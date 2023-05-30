<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="'Ver Detalle Función Global'"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <InformacionGeneral
        :modoVer="true"
        :funcionGlobal="funcionGlobal"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import {
  makeFuncionGlobalPasosVerDetalle,
  FuncionGlobal,
} from '@/pantallas/FuncionesGlobales/servicios/Funciones';

import InformacionGeneral from '@/pantallas/FuncionesGlobales/InformacionGeneral.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import { Snotify } from '@/snotify/Snotify';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    ContinuarButton,
    VolverButton,
    GuardarCambiosButton,
    ModalMantenedor,
    CabeceraModal,
    InformacionGeneral,
  },
})
export default class VerDetalleFuncionesGlobales extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) funcionGlobal: FuncionGlobal;

  /* template */

  pasoActivoIndex: number = 1;
  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.FuncionesGlobales;
  readonly pasos: PasosCrud = makeFuncionGlobalPasosVerDetalle();
  /* misc */

  readonly $snotify: Snotify;

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
