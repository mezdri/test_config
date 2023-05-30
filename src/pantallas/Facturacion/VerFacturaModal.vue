<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="'Ver Detalle ' + tituloDocumento"
      @cerrar="handleCerrar"
    >
      <ImprimirButton
        @click="imprimirDetalle('printDiv')"
        v-show="imprimir.visible"
      ></ImprimirButton>
    </CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="informacionGeneral.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="informacionGeneral.visible"
          @click="handleInfoGeneral"
          color="primary"
          flat
          :value="informacionGeneral.step"
        >
          <span>Detalle {{ tituloDocumento }}</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div
      align="center"
      class="cardnew"
      id="printDiv"
      v-show="informacionGeneral.visible"
    >
      <br />
      <FacturaForm
        :facturaSeleccionada="facturaSeleccionada"
        :tipoDocumento="facturaSeleccionada.tipoDocumento"
      />
      <FacturaTable
        :facturaSeleccionada="facturaSeleccionada.lDetalleDocumento"
      />
      <FacturaResumen :facturaSeleccionada="facturaSeleccionada" />
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { editarPautaActividad } from '@/pantallas/PautasActividades/editarPautaActividad';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { Factura } from '@/pantallas/Facturacion/fetchFacturaciones';
import FacturaForm from '@/pantallas/Facturacion/FacturaForm.vue';
import FacturaTable from '@/pantallas/Facturacion/FacturaTable.vue';
import FacturaResumen from '@/pantallas/Facturacion/FacturaResumen.vue';
import ImprimirButton from '@/pantallas/Facturacion/ImprimirButton.vue';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    FacturaForm,
    FacturaTable,
    FacturaResumen,
    ImprimirButton,
  },
})
export default class VerFacturarModal extends ComponenteBaseStepper {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) facturaSeleccionada: Factura;

  funcionalidad: Funcionalidades = Funcionalidades.Facturacion;
  permisosActuales: PermisoAccionVm[] = [];
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 70,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  imprimir: PermisoAccionVm = {
    accion: 'Crear - Asociar Usuarios',
    visible: true,
    step: 2,
    codigoSubAccion: 71,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [this.informacionGeneral, this.imprimir];

  pasoActivoIndex = 1;

  created() {
    this.chequearPermisos();
  }
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;
  // showPlanMantenimiento: boolean = false;
  detalleFacturas: any = {};
  esTipoDocumento: string;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {}

  /* event handlers */
  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInfoGeneral() {
    this.showInfo = true;
  }

  imprimirDetalle(printDiv: any) {
    window.print();
  }

  get tituloDocumento() {
    if (this.facturaSeleccionada.tipoDocumento === 'FACTURA ELECTRONICA') {
      this.esTipoDocumento = 'Factura';
    } else if (
      this.facturaSeleccionada.tipoDocumento === 'NOTA DE CREDITO ELECTRONICA'
    )
      this.esTipoDocumento = 'Nota de Crédito';
    return this.esTipoDocumento;
  }
}
</script>
<style>
@media print {
  body * {
    visibility: hidden;
    height: auto;
  }
  #printDiv,
  #printDiv * {
    visibility: visible;
  }
  #printDiv {
    left: 0px;
    top: 0px;
    position: absolute;
  }

  @page {
    size: 330mm 500mm;
    margin: 14mm;
  }
}
</style>
