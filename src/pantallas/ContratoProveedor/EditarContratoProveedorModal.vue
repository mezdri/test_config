<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Configuración de Contrato"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      entidad="Configuración de Contrato"
      :nombreEntidad="contratoProveedor ? contratoProveedor.nombre : ''"
      :pasoActivoIndex="pasoActivoIndex"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <InformacionGeneralForm
        :contratoProveedor="contratoProveedor"
        :show="pasoActivoIndex === pasos.informacionGeneral.step"
        :modoEditar="true"
        @change="handleFormChange"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <TiposActividad
        :modoEditar="true"
        v-model="idTiposActividad"
        v-show="pasoActivoIndex === pasos.tiposActividad.step"
      />
      <PasoAsociacion
        v-show="pasoActivoIndex === pasos.asociarDispositivos.step"
      >
        <AsociarDispositivos :esEditar="true" v-model="idDispositivos" />
      </PasoAsociacion>
      <CabecerasHttp
        :modoEditar="true"
        :lstCabecerasHttpEditarVer="
          contratoProveedor && contratoProveedor.cabecerasHttp
        "
        @change="handleCabecerasChange"
        v-show="pasoActivoIndex === pasos.cabecerasHTTP.step"
      />
      <FiltroActividad
        :modoEditar="true"
        :lstScriptValidacionEditarVer="
          contratoProveedor && contratoProveedor.filtros
        "
        @change="handleFiltrosActividadChange"
        v-show="pasoActivoIndex === pasos.filtrosActividad.step"
      />
      <MapeoColumna
        :modoEditar="true"
        :lstScriptValidacionEditarVer="
          contratoProveedor && contratoProveedor.mapeosColumna
        "
        @change="handleMapeosColumnaChange"
        v-show="pasoActivoIndex === pasos.mapeoColumna.step"
      />
      <ConfiguracionMapeos
        :mapeoJsEditarVer="mapeoBodyJs"
        :mapeoTemplateEditarVer="mapeoBodyTemplate"
        @blurMapeoJs="handleMapeoJsBlur"
        @blurMapeoTemplate="handleMapeoTemplateBlur"
        v-if="pasoActivoIndex === pasos.configuracionMapeos.step"
      />
      <MapeoRespuesta
        :contratoRespuesta="contratoRespuesta"
        @blur="handleMapeoRespuestaBlur"
        v-if="pasoActivoIndex === pasos.mapeoRespuesta.step"
      />
    </ContenidoModal>
    <Confirmation
      :show="permiteContinuarConfirm"
      :titulo="tituloPermiteContinuar"
      :mensaje="mensajePermiteContinuar"
      :items="itemsNoValidos"
      :mostrarBoton="false"
      v-on:modalConfirmationEmit="permiteContinuarConfirm = false"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
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
  makePasosEditar,
} from '@/interfaces/ContratoProveedor';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import Confirmation from '@/components/Confirmation.vue';

import { fetchByIdContratoProveedor } from '@/pantallas/ContratoProveedor/Services/fetchByIdContratoProveedor';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    ModalMantenedor,
    CabeceraModalEditar,
    PasoAsociacion,
    InformacionGeneralForm,
    TiposActividad,
    AsociarDispositivos,
    CabecerasHttp,
    FiltroActividad,
    MapeoColumna,
    MapeoRespuesta,
    ConfiguracionMapeos,
    Confirmation,
  },
})
export default class EditarContratoProveedorModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) idContratoProveedor: number;

  /* template */
  pasoActivoIndex: number = 1;
  funcionalidad: Funcionalidades = Funcionalidades.ContratoProveedor;
  readonly pasos: PasosCrud = makePasosEditar();

  // Variables Globales
  readonly $snotify: Snotify;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  loadingService = new LoadingService();

  contratoProveedor: ContratoProveedorBackend | void = null;
  idTiposActividad: number[] = [];
  idDispositivos: number[] = [];
  lstCabecerasHttp: CabeceraHttp[] = [];
  lstFiltrosActividad: ScriptValidacion[] = [];
  lstMapeosColumna: ScriptValidacion[] = [];
  mapeoBodyJs: MapeosBody = {};
  mapeoBodyTemplate: MapeosBody = {};
  contratoRespuesta: string = '';
  mensajeConfirmacionInactivo: any = '';
  dialogConfirmacionGuardar: boolean = false;
  modificable: boolean = true;
  estadoEntidad: boolean = true;

  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';
  itemsNoValidos: string[] = [];

  async mounted() {
    this.contratoProveedor = await this.fetchByIdContratoProveedor(
      this.idContratoProveedor
    );

    this.pasos.informacionGeneral.permitirContinuar = this.permiteContinuarInformacionGeneral;
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

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    var form = this.pasos.informacionGeneral.formState.entity;
    var isValid = true;

    if (form.estado == EstadoEntidad.Activo) {
      isValid = this.validaCamposObligatorios();
    }

    if (isValid) {
      var contratoProveedorEditar: ContratoProveedorBackend = {
        ...form,
        id: this.idContratoProveedor,
        actividadTipos: this.idTiposActividad,
        dispositivos: this.idDispositivos,
        cabecerasHttp: this.lstCabecerasHttp,
        filtros: this.lstFiltrosActividad,
        mapeosColumna: this.lstMapeosColumna,
        contratoRespuesta: this.contratoRespuesta,
      };

      contratoProveedorEditar.mapeosBody = [];

      if (this.mapeoBodyJs)
        contratoProveedorEditar.mapeosBody.push(this.mapeoBodyJs);
      if (this.mapeoBodyTemplate)
        contratoProveedorEditar.mapeosBody.push(this.mapeoBodyTemplate);

      this.loadingService.showLoading();
      this.axios.http
        .put('Integracion/Contrato', contratoProveedorEditar)
        .then(() => {
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.$emit('guardar');
        })
        .catch(() =>
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'))
        )
        .finally(() => this.loadingService.hideLoading());
    }
  }

  fetchByIdContratoProveedor(id: number) {
    this.loadingService.showLoading();
    return fetchByIdContratoProveedor(id)
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'Configuración de Contrato',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  validaCamposObligatorios() {
    var nombreEntidad = this.pasos.informacionGeneral.formState.entity.nombre;
    this.itemsNoValidos = [];

    this.tituloPermiteContinuar =
      'Editar Configuración de Contrato: ' + nombreEntidad;
    this.mensajePermiteContinuar = 'Debe completar los siguientes campos:';

    //MapeoColumna
    if (!this.lstMapeosColumna || this.lstMapeosColumna.length == 0) {
      this.itemsNoValidos.push('Mapeo de  Columna');
    }

    //MapeoJs
    var isMapeoJs =
      this.mapeoBodyJs &&
      this.mapeoBodyJs.script &&
      this.mapeoBodyJs.script != '';
    var isMapeoTemplate =
      this.mapeoBodyTemplate &&
      this.mapeoBodyTemplate.script &&
      this.mapeoBodyTemplate.script != '';

    if (!isMapeoJs && !isMapeoTemplate) {
      this.itemsNoValidos.push('Conf. de Mapeos');
    }

    //Mapeo Respuesta
    if (!this.contratoRespuesta || this.contratoRespuesta == '') {
      this.itemsNoValidos.push('Mapeo de Respuesta');
    }

    if (this.itemsNoValidos && this.itemsNoValidos.length > 0) {
      this.permiteContinuarConfirm = true;
      return false;
    }

    return true;
  }

  /* Informacion general */

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
      this.modificable = true;
      this.estadoEntidad = false;
    } else {
      this.modificable = true;
      this.estadoEntidad = true;
    }
  }

  handleInactivo() {}

  permiteContinuarInformacionGeneral() {
    var form = this.pasos.informacionGeneral.formState.entity;

    if (!form.endpoint || form.endpoint == '') {
      this.itemsNoValidos = null;
      this.permiteContinuarConfirm = true;
      this.tituloPermiteContinuar = 'Información General';
      this.mensajePermiteContinuar = 'Debe completar el campo Endpoint.';

      return false;
    }

    return true;
  }

  /* Cabeceras HTTP */

  handleCabecerasChange(cabecerasHttp: CabeceraHttp[]) {
    this.lstCabecerasHttp = cabecerasHttp;
  }

  /* Filtros actividad */

  handleFiltrosActividadChange(filtrosActividad: ScriptValidacion[]) {
    this.lstFiltrosActividad = filtrosActividad;
  }

  /* Mapeos columna */

  handleMapeosColumnaChange(mapeosColumna: ScriptValidacion[]) {
    this.lstMapeosColumna = mapeosColumna;
  }

  /* Configuracion mapeos */

  handleMapeoJsBlur(valor: string) {
    this.mapeoBodyJs = {
      tipo: 'js',
      script: valor,
    };
  }

  handleMapeoTemplateBlur(valor: string) {
    this.mapeoBodyTemplate = {
      tipo: 'template',
      script: valor,
    };
  }

  /* Mapeo Respuesta */

  handleMapeoRespuestaBlur(valor: string) {
    this.contratoRespuesta = valor;
  }
}
</script>
