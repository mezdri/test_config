<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Configuración Base"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.seleccionarCodigos">
          <SeleccionarCodigosForm
            @change="handleFormChange"
            @setCodeAct="handleCodeAct"
            @setCodeActExt="handleCodeActExt"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.agregarCampos">
          <AgregarCamposGrid @changeCampos="handleCamposChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.scriptValidacionExtendida">
          <ValidacionExtendidaForm
            @setScript="handleScriptValidacionExtendida"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.htmlTemplate">
          <HtmlTemplateForm
            @setHtml="handleTemplate"
            @setMensaje="handleMensaje"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Configuración Base' })
      "
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'la Configuración Base' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
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
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Validator } from 'vee-validate';

import moment, { Duration } from 'moment';
import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import {
  typeConfigBase,
  typeNuevosCampo,
  makepasosAlertasBaseCrear,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import SeleccionarCodigosForm from '@/pantallas/ConfigurarBase/SeleccionarCodigosForm.vue';
import AgregarCamposGrid from '@/pantallas/ConfigurarBase/AgregarCamposGrid.vue';
import ValidacionExtendidaForm from '@/pantallas/ConfigurarBase/ValidacionExtendidaForm.vue';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    Confirmation,
    ModalMantenedor,
    CabeceraModalCrear,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    SeleccionarCodigosForm,
    AgregarCamposGrid,
    ValidacionExtendidaForm,
    HtmlTemplateForm,
    MensajeValidacion,
  },
})
export default class CrearAlertasBaseModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.AlertasBase;
  permisosActuales: PermisoAccionVm[] = [];

  pasos: PasosCrud = makepasosAlertasBaseCrear();

  // Variables Globales
  readonly $snotify: Snotify;
  pasoActivoIndex: number = 1;
  showContinuar: boolean = true;
  showVolver: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  loadingService = new LoadingService();

  showValidacion: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';

  configBase: typeConfigBase = {
    camposDinamico: [],
  };

  //controllers
  readonly Controller: string = 'AlertaBase';

  constructor() {
    super();

    this.pasos.seleccionarCodigos.permitirContinuar = this.permiteContinuarSeleccionarCodigos;
    this.pasos.scriptValidacionExtendida.permitirContinuar = this.permiteContinuarScriptValidacion;
    this.pasos.htmlTemplate.permitirContinuar = this.permiteContinuarHtmlTemplate;
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.configBase = {};
    this.showContinuar = true;
    this.showVolver = false;
    this.$validator.reset();
  }

  handleCerrar() {
    this.configBase = {};
    this.pasoActivoIndex = 1;
    this.$validator.reset();
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.seleccionarCodigos.formState.validator.validateAll();

    if (isValid) {
      this.dialogConfirmacionGuardar = true;
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacionGuardar = false;

    if (val) {
      this.loadingService.showLoading();
      var form = this.pasos.seleccionarCodigos.formState.entity;
      this.configBase.nombre = form.nombre;
      this.configBase.esAcumulable = form.esAcumulable;
      this.configBase.alertaBaseTipo = TipoAlertaBase.AlertaGenerica;

      this.axios.http
        .post(`${this.Controller}`, this.configBase)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Configuración Base',
              creadoA: 'creada',
            })
          );
          this.handleCerrar();
          this.dialogConfirmacionGuardar = false;
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.crear', {
                  entidad: 'Configuración Base',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.crear', {
                entidad: 'Configuración Base',
              })
            );
          }
        });
    }
  }

  /** Paso Seleccionar codigos **/

  handleFormChange(event: FormChangeEvent) {
    this.pasos.seleccionarCodigos.formState = event;
  }

  handleCodeAct(seleccionAct: number[]) {
    this.configBase.codigosActividad = seleccionAct;
  }

  handleCodeActExt(seleccionActExt: number[]) {
    this.configBase.codigosActividadExt = seleccionActExt;
  }

  permiteContinuarSeleccionarCodigos() {
    if (
      !this.configBase.codigosActividad ||
      !this.configBase.codigosActividad.length
    ) {
      this.tituloValidacion = 'Seleccionar Actividad';
      this.mensajeValidacion = 'Debe seleccionar al menos una Actividad.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }

  /** Paso Agregar Campos **/

  handleCamposChange(lstCampos: typeNuevosCampo[]) {
    this.configBase.camposDinamico = lstCampos;
  }

  /** Paso Script Validación **/

  handleScriptValidacionExtendida(script: string) {
    this.configBase.scriptValidacionActividadExt = script;
  }

  permiteContinuarScriptValidacion() {
    if (
      !this.configBase.scriptValidacionActividadExt ||
      this.configBase.scriptValidacionActividadExt == ''
    ) {
      this.tituloValidacion = 'Ingresar Script Validación';
      this.mensajeValidacion = 'Debe ingresar un Script de Validación.';
      this.showValidacion = true;
      return false;
    }

    return true;
  }

  /** Paso Html Template **/

  handleMensaje(mensaje: string) {
    this.configBase.mensaje = mensaje;
  }

  handleTemplate(html: string) {
    this.configBase.htmlTemplate = html;
  }

  permiteContinuarHtmlTemplate() {
    if (!this.configBase.mensaje || this.configBase.mensaje == '') {
      this.tituloValidacion = 'Ingresar Mensaje';
      this.mensajeValidacion = 'Debe ingresar un Mensaje.';
      this.showValidacion = true;
      return false;
    } else if (
      !this.configBase.htmlTemplate ||
      this.configBase.htmlTemplate == ''
    ) {
      this.tituloValidacion = 'Ingresar HTML Template';
      this.mensajeValidacion = 'Debe ingresar HTML Template.';
      this.showValidacion = true;
      return false;
    }

    return true;
  }
}
</script>
