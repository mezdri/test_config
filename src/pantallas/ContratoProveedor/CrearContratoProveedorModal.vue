<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Configuración de Contrato"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        :estado-id="estadoId"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <InformacionGeneralForm
            @change="handleFormChange"
            @estadoSwitch="handleEstadoSwitch"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.tiposActividad">
          <TiposActividad v-model="idTiposActividad" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarDispositivos">
          <PasoAsociacion>
            <AsociarDispositivos v-model="idDispositivos" />
          </PasoAsociacion>
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.cabecerasHTTP">
          <CabecerasHttp @change="handleCabecerasChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.filtrosActividad">
          <FiltroActividad @change="handleFiltrosActividadChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.mapeoColumna">
          <MapeoColumna @change="handleMapeosColumnaChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.configuracionMapeos">
          <ConfiguracionMapeos
            @blurMapeoJs="handleMapeoJsBlur"
            @blurMapeoTemplate="handleMapeoTemplateBlur"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.mapeoRespuesta">
          <MapeoRespuesta @blur="handleMapeoRespuestaBlur" />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Configuración de Contrato',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="permiteContinuarConfirm"
      :titulo="tituloPermiteContinuar"
      :mensaje="mensajePermiteContinuar"
      :mostrarBoton="false"
      v-on:modalConfirmationEmit="permiteContinuarConfirm = false"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad, TipoAlertaBase } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Validator } from 'vee-validate';

import moment, { Duration } from 'moment';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import InformacionGeneralForm from '@/pantallas/ContratoProveedor/Step/InformacionGeneralForm.vue';
import TiposActividad from '@/pantallas/ContratoProveedor/Step/TiposActividad.vue';
import AsociarDispositivos from '@/reusable/Dispositivos/AsociarDispositivos.vue';
import CabecerasHttp from '@/pantallas/ContratoProveedor/Step/CabecerasHttp.vue';
import FiltroActividad from '@/pantallas/ContratoProveedor/Step/FiltroActividad.vue';
import MapeoColumna from '@/pantallas/ContratoProveedor/Step/MapeoColumna.vue';
import ConfiguracionMapeos from '@/pantallas/ContratoProveedor/Step/ConfiguracionMapeos.vue';
import MapeoRespuesta from '@/pantallas/ContratoProveedor/Step/MapeoRespuesta.vue';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';

import {
  ContratoProveedorBackend,
  CabeceraHttp,
  ScriptValidacion,
  MapeosBody,
  makePasosCrear,
} from '@/interfaces/ContratoProveedor';

type CrearFormState = {
  entity: ContratoProveedorBackend;
  validator: Validator;
};

@Component({
  components: {
    Confirmation,
    ModalMantenedor,
    CabeceraModalCrear,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
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
export default class CrearContratoProveedorModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.ContratoProveedor;
  readonly pasos: PasosCrud = makePasosCrear();

  // Variables Globales
  readonly $snotify: Snotify;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  loadingService = new LoadingService();
  dialogConfirmacion: boolean = false;
  pasoActivoIndex: number = 1;

  idTiposActividad: number[] = [];
  idDispositivos: number[] = [];
  lstCabecerasHttp: CabeceraHttp[] = [];
  lstFiltrosActividad: ScriptValidacion[] = [];
  lstMapeosColumna: ScriptValidacion[] = [];
  mapeoBodyJs: MapeosBody = {};
  mapeoBodyTemplate: MapeosBody = {};
  contratoRespuesta: string = '';
  mensajeConfirmacionInactivo: any = '';

  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';

  mounted() {
    this.pasos.informacionGeneral.permitirContinuar = this.permiteContinuarInformacionGeneral;
    this.pasos.mapeoColumna.permitirContinuar = this.permiteContinuarMapeosColumna;
    this.pasos.configuracionMapeos.permitirContinuar = this.permiteContinuarConfiguracionMapeo;
    this.pasos.mapeoRespuesta.permitirContinuar = this.permiteContinuarMapeoRespuesta;
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.$validator.reset();
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$validator.reset();
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();

    if (isValid) {
      this.handleEstadoSwitch(
        this.pasos.informacionGeneral.formState.entity.estado
      );
      this.dialogConfirmacion = true;
    }
  }

  handleConfirmacionGuardar(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.loadingService.showLoading();
      var form = this.pasos.informacionGeneral.formState.entity;
      var contratoProveedor: ContratoProveedorBackend = {};

      if (form.estado == EstadoEntidad.Activo) {
        contratoProveedor = {
          ...form,
          actividadTipos: this.idTiposActividad,
          dispositivos: this.idDispositivos,
          cabecerasHttp: this.lstCabecerasHttp,
          filtros: this.lstFiltrosActividad,
          mapeosColumna: this.lstMapeosColumna,
          contratoRespuesta: this.contratoRespuesta,
        };

        contratoProveedor.mapeosBody = [];

        if (this.mapeoBodyJs)
          contratoProveedor.mapeosBody.push(this.mapeoBodyJs);
        if (this.mapeoBodyTemplate)
          contratoProveedor.mapeosBody.push(this.mapeoBodyTemplate);
      } else {
        contratoProveedor = {
          ...form,
        };
      }

      this.axios.http
        .post('Integracion/Contrato', contratoProveedor)
        .then(() => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Configuración de Contrato',
              creadoA: 'creado',
            })
          );
          this.$emit('crear');
        })
        .catch(() =>
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'Configuración de Contrato',
            })
          )
        )
        .finally(() => this.loadingService.hideLoading());
    }
  }

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado;
  }

  /* Informacion general */

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  permiteContinuarInformacionGeneral() {
    var form = this.pasos.informacionGeneral.formState.entity;

    if (!form.endpoint || form.endpoint == '') {
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

  permiteContinuarMapeosColumna() {
    if (!this.lstMapeosColumna || this.lstMapeosColumna.length == 0) {
      this.permiteContinuarConfirm = true;
      this.tituloPermiteContinuar = 'Mapeo de Columna';
      this.mensajePermiteContinuar =
        'Debe agregar al menos un Mapeo de Columna.';

      return false;
    }

    return true;
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

  permiteContinuarConfiguracionMapeo() {
    var isMapeoJs = this.mapeoBodyJs.script && this.mapeoBodyJs.script != '';
    var isMapeoTemplate =
      this.mapeoBodyTemplate.script && this.mapeoBodyTemplate.script != '';

    if (!isMapeoJs && !isMapeoTemplate) {
      this.permiteContinuarConfirm = true;
      this.tituloPermiteContinuar = 'Configuración de Mapeo';
      this.mensajePermiteContinuar =
        'Debe agregar al menos una Configuración de Mapeo.';

      return false;
    }

    return true;
  }

  /* Mapeo Respuesta */

  handleMapeoRespuestaBlur(valor: string) {
    this.contratoRespuesta = valor;
  }

  permiteContinuarMapeoRespuesta() {
    if (!this.contratoRespuesta || this.contratoRespuesta == '') {
      this.permiteContinuarConfirm = true;
      this.tituloPermiteContinuar = 'Mapeo de Respuesta';
      this.mensajePermiteContinuar = 'Debe agregar Mapeo de Respuesta.';

      return false;
    }

    return true;
  }

  handleEstadoSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'la Configuración de Contrato',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Configuración de Contrato' }
      );
    }
  }
}
</script>
