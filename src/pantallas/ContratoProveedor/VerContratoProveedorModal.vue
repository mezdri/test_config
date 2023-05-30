<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Configuración de Contrato"
      @cerrar="handleCerrar"
    />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <InformacionGeneralForm
        :modoVer="true"
        :show="pasoActivoIndex === pasos.informacionGeneral.step"
        :contratoProveedor="contratoProveedor"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <TiposActividad
        :modoVer="true"
        v-model="idTiposActividad"
        v-show="pasoActivoIndex === pasos.tiposActividad.step"
      />
      <PasoAsociacion
        v-show="pasoActivoIndex === pasos.asociarDispositivos.step"
      >
        <AsociarDispositivos :readonly="true" v-model="idDispositivos" />
      </PasoAsociacion>
      <CabecerasHttp
        :modoVer="true"
        :lstCabecerasHttpEditarVer="lstCabecerasHttp"
        v-show="pasoActivoIndex === pasos.cabecerasHTTP.step"
      />
      <FiltroActividad
        :modoVer="true"
        :lstScriptValidacionEditarVer="lstFiltrosActividad"
        v-show="pasoActivoIndex === pasos.filtrosActividad.step"
      />
      <MapeoColumna
        :modoVer="true"
        :lstScriptValidacionEditarVer="lstMapeosColumna"
        v-show="pasoActivoIndex === pasos.mapeoColumna.step"
      />
      <ConfiguracionMapeos
        :modoVer="true"
        :mapeoJsEditarVer="mapeoBodyJs"
        :mapeoTemplateEditarVer="mapeoBodyTemplate"
        v-if="pasoActivoIndex === pasos.configuracionMapeos.step"
      />
      <MapeoRespuesta
        :modoVer="true"
        :contratoRespuesta="contratoRespuesta"
        v-if="pasoActivoIndex === pasos.mapeoRespuesta.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';

import InformacionGeneralForm from '@/pantallas/ContratoProveedor/Step/InformacionGeneralForm.vue';
import TiposActividad from '@/pantallas/ContratoProveedor/Step/TiposActividad.vue';
import AsociarDispositivos from '@/reusable/Dispositivos/AsociarDispositivos.vue';
import CabecerasHttp from '@/pantallas/ContratoProveedor/Step/CabecerasHttp.vue';
import FiltroActividad from '@/pantallas/ContratoProveedor/Step/FiltroActividad.vue';
import MapeoColumna from '@/pantallas/ContratoProveedor/Step/MapeoColumna.vue';
import ConfiguracionMapeos from '@/pantallas/ContratoProveedor/Step/ConfiguracionMapeos.vue';
import MapeoRespuesta from '@/pantallas/ContratoProveedor/Step/MapeoRespuesta.vue';

import {
  ContratoProveedorBackend,
  CabeceraHttp,
  ScriptValidacion,
  MapeosBody,
  makePasosVerDetalle,
} from '@/interfaces/ContratoProveedor';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import { fetchByIdContratoProveedor } from '@/pantallas/ContratoProveedor/Services/fetchByIdContratoProveedor';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    ModalMantenedor,
    CabeceraModal,
    PasoAsociacion,
    InformacionGeneralForm,
    TiposActividad,
    AsociarDispositivos,
    CabecerasHttp,
    FiltroActividad,
    MapeoColumna,
    MapeoRespuesta,
    ConfiguracionMapeos,
  },
})
export default class VerContratoProveedorModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) idContratoProveedor: number;

  readonly $snotify: Snotify;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  loadingService = new LoadingService();

  /* template */
  pasoActivoIndex: number = 1;
  funcionalidad: Funcionalidades = Funcionalidades.ContratoProveedor;
  readonly pasos: PasosCrud = makePasosVerDetalle();

  contratoProveedor: ContratoProveedorBackend | void = null;
  idTiposActividad: number[] = [];
  idDispositivos: number[] = [];
  lstCabecerasHttp: CabeceraHttp[] = [];
  lstFiltrosActividad: ScriptValidacion[] = [];
  lstMapeosColumna: ScriptValidacion[] = [];
  mapeoBodyJs: MapeosBody = {};
  mapeoBodyTemplate: MapeosBody = {};
  contratoRespuesta: string = '';

  async mounted() {
    this.contratoProveedor = await this.fetchByIdContratoProveedor(
      this.idContratoProveedor
    );
  }

  /* event handlers */

  @Watch('contratoProveedor', { deep: true, immediate: true })
  handleRecepcionActividadChange() {
    if (this.contratoProveedor) {
      this.idTiposActividad = this.contratoProveedor.actividadTipos;
      this.idDispositivos = this.contratoProveedor.dispositivos;
      this.lstCabecerasHttp = this.contratoProveedor.cabecerasHttp;
      this.lstFiltrosActividad = this.contratoProveedor.filtros;
      this.lstMapeosColumna = this.contratoProveedor.mapeosColumna;
      this.mapeoBodyJs = this.contratoProveedor.mapeosBody.filter(
        m => m.tipo == 'js'
      )[0];
      this.mapeoBodyTemplate = this.contratoProveedor.mapeosBody.filter(
        m => m.tipo == 'template'
      )[0];
      this.contratoRespuesta = this.contratoProveedor.contratoRespuesta;
    }
  }

  fetchByIdContratoProveedor(id: number) {
    this.loadingService.showLoading();
    return fetchByIdContratoProveedor(id)
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'el contrato de proveedor',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
