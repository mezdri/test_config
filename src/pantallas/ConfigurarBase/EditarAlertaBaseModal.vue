<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      :titulo="'Editar Configuración Base: ' + alertaBaseSeleccionada.nombre"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      entidad="Configuración Base"
      :nombreEntidad="
        alertaBaseSeleccionada ? alertaBaseSeleccionada.nombre : ''
      "
      :pasoActivoIndex="pasoActivoIndex"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <SeleccionarCodigosForm
        :alertaBaseSeleccionada="alertaBaseSeleccionada"
        @change="handleFormChange"
        @setCodeAct="handleCodeAct"
        @setCodeActExt="handleCodeActExt"
        v-show="pasoActivoIndex === pasos.seleccionarCodigos.step"
        :esEditar="true"
      />
      <AgregarCamposGrid
        :camposDinamicos="camposDinamicos"
        :modoEditar="true"
        @changeCampos="handleCamposChange"
        v-if="pasoActivoIndex === pasos.agregarCampos.step"
      />
      <ValidacionExtendidaForm
        :scriptActividadExt="scriptActividadExt"
        @setScript="handleScriptValidacionExtendida"
        v-if="pasoActivoIndex === pasos.scriptValidacionExtendida.step"
      />
      <HtmlTemplateForm
        :htmlTemplate="htmlTemplate"
        :mensaje="mensaje"
        @setHtml="handleTemplate"
        @setMensaje="handleMensaje"
        v-if="pasoActivoIndex === pasos.htmlTemplateAccion.step"
      />
    </ContenidoModal>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Validator } from 'vee-validate';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { AxiosVue } from '@/AxiosVue';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import {
  AlertasBaseBackend,
  typeNuevosCampo,
  typeConfigBase,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import SeleccionarCodigosForm from '@/pantallas/ConfigurarBase/SeleccionarCodigosForm.vue';
import AgregarCamposGrid from '@/pantallas/ConfigurarBase/AgregarCamposGrid.vue';
import ValidacionExtendidaForm from '@/pantallas/ConfigurarBase/ValidacionExtendidaForm.vue';
import HtmlTemplateForm from '@/pantallas/ConfigurarBase/HtmlTemplateForm.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { ServicioProxy, TipoAlertaBase } from '@/config/enums';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import Vue from 'vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { makeAlertasBaseEditar } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    CabeceraModalEditar,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    Confirmation,
    SeleccionarCodigosForm,
    AgregarCamposGrid,
    ValidacionExtendidaForm,
    HtmlTemplateForm,
    MensajeValidacion,
  },
})
export default class EditarAlertaBaseModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop() alertaBaseSeleccionada: AlertasBaseBackend;

  funcionalidad: Funcionalidades = Funcionalidades.AlertasBase;
  permisosActuales: PermisoAccionVm[] = [];

  readonly pasos: PasosCrud = makeAlertasBaseEditar();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  readonly $snotify: Snotify;
  loadingService = new LoadingService();
  pasoActivoIndex: number = 1;

  showValidacion: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';

  readonly Controller: string = 'AlertaBase';

  camposDinamicos: typeNuevosCampo[] = [];
  scriptActividadExt: string = '';
  htmlTemplate: string = '';
  mensaje: string = '';

  configBase: typeConfigBase = {};

  constructor() {
    super();

    this.pasos.seleccionarCodigos.permitirContinuar = this.permiteContinuarSeleccionarCodigos;
    this.pasos.scriptValidacionExtendida.permitirContinuar = this.permiteContinuarScriptValidacion;
    this.pasos.htmlTemplateAccion.permitirContinuar = this.permiteContinuarHtmlTemplate;
  }

  /* event handlers */

  @Watch('alertaBaseSeleccionada', { deep: true })
  handleAlertaSeleccionadaChange() {
    if (this.alertaBaseSeleccionada) {
      this.scriptActividadExt = this.alertaBaseSeleccionada.scriptActividadExt;
      console.log(this.alertaBaseSeleccionada.alertaCampoDinamico);
      this.camposDinamicos = this.alertaBaseSeleccionada.alertaCampoDinamico;
      this.htmlTemplate = this.alertaBaseSeleccionada.htmlBody;
      this.mensaje = this.alertaBaseSeleccionada.mensaje;

      this.configBase.codigosActividad = [];
      this.alertaBaseSeleccionada.alertaBaseCodigoActividad.forEach(a => {
        this.configBase.codigosActividad.push(a.actividadTipoId);
      });

      this.configBase.codigosActividadExt = [];
      this.alertaBaseSeleccionada.alertaBaseDispositivo.forEach(a => {
        this.configBase.codigosActividadExt.push(a.dispositivoId);
      });
    }
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.seleccionarCodigos.formState.validator.validateAll();

    if (isValid) {
      if (!this.configBase.codigosActividad) {
        this.muestraMensajeValidacion(
          'Seleccionar Código',
          'Debe seleccionar al menos una Actividad.'
        );
      } else if (!this.scriptActividadExt || this.scriptActividadExt == '') {
        this.muestraMensajeValidacion(
          'Script Validación',
          'Debe ingresar un Script de Validación.'
        );
      } else if (!this.mensaje || this.mensaje == '') {
        this.muestraMensajeValidacion(
          'HTML Template',
          'Debe ingresar un Mensaje.'
        );
      } else if (!this.htmlTemplate || this.htmlTemplate == '') {
        this.muestraMensajeValidacion(
          'HTML Template',
          'Debe ingresar HTML Template.'
        );
      } else {
        this.confirmCallback(true);
      }
    }
  }

  async confirmCallback(val: boolean) {
    if (val) {
      this.loadingService.showLoading();
      this.configBase.alertaBaseTipo = TipoAlertaBase.AlertaGenerica;
      this.configBase.id = this.alertaBaseSeleccionada.id;
      this.configBase.nombre = this.pasos.seleccionarCodigos.formState.entity.nombre;
      this.configBase.esAcumulable = this.pasos.seleccionarCodigos.formState.entity.esAcumulable;
      this.configBase.camposDinamico = this.camposDinamicos;

      this.configBase.scriptValidacionActividadExt = this.scriptActividadExt;
      this.configBase.htmlTemplate = this.htmlTemplate;
      this.configBase.mensaje = this.mensaje;

      this.axios.http
        .put(`${this.Controller}`, this.configBase)
        .then(res => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.editar', {
              entidad: 'Alerta Base',
            })
          );
          this.handleCerrar();
          this.loadingService.hideLoading();
        })
        .catch(error => {
          this.loadingService.hideLoading();
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.editar', {
                  entidad: 'Alerta Base',
                })
              );
            }
          } else {
            this.$snotify.error(
              this.$t('mensajes.mensajesError.editar', {
                entidad: 'Alerta Base',
              })
            );
          }
        });
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.seleccionarCodigos.formState = event;
  }

  handleCodeAct(seleccionAct: number[]) {
    this.configBase.codigosActividad = seleccionAct;
  }

  handleCodeActExt(seleccionActExt: number[]) {
    this.configBase.codigosActividadExt = seleccionActExt;
  }

  handleCamposChange(lstCampos: typeNuevosCampo[]) {
    this.camposDinamicos = lstCampos;
  }

  handleScriptValidacionExtendida(script: string) {
    this.scriptActividadExt = script;
  }

  handleMensaje(mensaje: string) {
    this.mensaje = mensaje;
  }

  handleTemplate(html: string) {
    this.htmlTemplate = html;
  }

  /** Validaciones **/

  permiteContinuarSeleccionarCodigos() {
    if (
      !this.configBase.codigosActividad ||
      !this.configBase.codigosActividad.length
    ) {
      this.muestraMensajeValidacion(
        'Seleccionar Código',
        'Debe seleccionar al menos una Actividad.'
      );

      return false;
    }
    return true;
  }

  permiteContinuarScriptValidacion() {
    if (!this.scriptActividadExt || this.scriptActividadExt == '') {
      this.muestraMensajeValidacion(
        'Script Validación',
        'Debe ingresar un Script de Validación.'
      );
      return false;
    }

    return true;
  }

  permiteContinuarHtmlTemplate() {
    if (!this.mensaje || this.mensaje == '') {
      this.muestraMensajeValidacion(
        'HTML Template',
        'Debe ingresar un Mensaje.'
      );
      return false;
    } else if (!this.htmlTemplate || this.htmlTemplate == '') {
      this.muestraMensajeValidacion(
        'HTML Template',
        'Debe ingresar HTML Template.'
      );
      return false;
    }

    return true;
  }

  muestraMensajeValidacion(titulo: string, mensaje: string) {
    this.tituloValidacion = titulo;
    this.mensajeValidacion = mensaje;
    this.showValidacion = true;
  }
}
</script>
