<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Configuración Base"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <SeleccionarCodigosForm
        :alertaBaseSeleccionada="alertaBaseSeleccionada"
        :modoVer="true"
        v-show="pasoActivoIndex === pasos.seleccionarCodigos.step"
      />
      <AgregarCamposGrid
        :camposDinamicos="
          alertaBaseSeleccionada && alertaBaseSeleccionada.alertaCampoDinamico
        "
        :modoVer="true"
        v-if="pasoActivoIndex === pasos.agregarCampos.step"
      />
      <ValidacionExtendidaForm
        :scriptActividadExt="
          alertaBaseSeleccionada && alertaBaseSeleccionada.scriptActividadExt
        "
        :modoVer="true"
        v-if="pasoActivoIndex === pasos.scriptValidacionExtendida.step"
      />
      <HtmlTemplateForm
        :htmlTemplate="
          alertaBaseSeleccionada && alertaBaseSeleccionada.htmlBody
        "
        :mensaje="alertaBaseSeleccionada && alertaBaseSeleccionada.mensaje"
        :modoVer="true"
        v-if="pasoActivoIndex === pasos.htmlTemplateAccion.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import SeleccionarCodigosForm from '@/pantallas/ConfigurarBase/SeleccionarCodigosForm.vue';
import AgregarCamposGrid from '@/pantallas/ConfigurarBase/AgregarCamposGrid.vue';
import ValidacionExtendidaForm from '@/pantallas/ConfigurarBase/ValidacionExtendidaForm.vue';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';

import { makeAlertasBaseVerDetalle } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    SeleccionarCodigosForm,
    AgregarCamposGrid,
    ValidacionExtendidaForm,
    HtmlTemplateForm,
  },
})
export default class VerAlertaBaseModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) alertaBaseSeleccionada: AlertasBaseBackend | void;

  funcionalidad: Funcionalidades = Funcionalidades.AlertasBase;
  pasoActivoIndex: number = 1;

  readonly pasos: PasosCrud = makeAlertasBaseVerDetalle();

  /* event handlers */

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$emit('cerrar');
  }
}
</script>
