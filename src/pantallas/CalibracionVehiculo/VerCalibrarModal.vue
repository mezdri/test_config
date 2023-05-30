<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="objetoTitulo"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <BuscarVehiculoGrid
        :modoVer="true"
        :calibracionSeleccionada="calibracionSeleccionada"
        v-show="pasoActivoIndex === pasos.buscarVehiculo.step"
      />
      <CalibracionForm
        :modoVer="true"
        :objeto="objeto"
        :calibracionSeleccionada="calibracionSeleccionada"
        v-show="pasoActivoIndex === pasos.informacionRecalibracion.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import BuscarVehiculoGrid from '@/pantallas/CalibracionVehiculo/BuscarVehiculoGrid.vue';
import CalibracionForm from '@/pantallas/CalibracionVehiculo/CalibracionForm.vue';
import {
  CalibracionVehiculo,
  makeOdometroVerDetalle,
  makeHorometroVerDetalle,
} from './CalibracionVehiculo';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    ContenidoModal,
    CrudStepsNavBar,
    BuscarVehiculoGrid,
    CalibracionForm,
  },
})
export default class VerCalibrarModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) objeto: string;
  @Prop() calibracionSeleccionada: CalibracionVehiculo;

  objetoTitulo: string = '';

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud =
    this.objeto == 'odometro'
      ? makeOdometroVerDetalle()
      : makeHorometroVerDetalle();
  readonly funcionalidad: Funcionalidades =
    this.objeto == 'odometro'
      ? Funcionalidades.Odometro
      : Funcionalidades.Horometro;

  created() {
    if (this.objeto == 'odometro') {
      this.objetoTitulo = 'Ver Detalle Recalibración Odómetro';
    } else {
      this.objetoTitulo = 'Ver Detalle Recalibración Horómetro';
    }
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
