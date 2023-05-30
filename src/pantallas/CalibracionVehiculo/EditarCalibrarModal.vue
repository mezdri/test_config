<template>
  <ModalMantenedor :show="show">
    <CabeceraModal :titulo="objetoTitulo" @cerrar="handleCerrarConfirm">
      <GuardarCambiosButton
        @click="handleGuardar"
        :disabled="disabledBotones"
      />
    </CabeceraModal>
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <CalibracionForm
        @change="handleFormChange"
        :modoEditar="true"
        :objeto="objeto"
        :calibracionSeleccionada="calibracionSeleccionada"
        v-show="pasoActivoIndex === pasos.informacionRecalibracion.step"
      />
    </ContenidoModal>
    <Confirmation
      :show="showConfirmacionCerrar"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="handleCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="'Editar Recalibración ' + objetoMensajes"
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';

import BuscarVehiculoGrid from '@/pantallas/CalibracionVehiculo/BuscarVehiculoGrid.vue';
import CalibracionForm from '@/pantallas/CalibracionVehiculo/CalibracionForm.vue';
import { editarCalibracion } from '@/pantallas/CalibracionVehiculo/Services/editarCalibracion';
import { CalibracionVehiculo, UltimaCalibracion } from './CalibracionVehiculo';
import { fetchUltimaCalibracion } from '@/pantallas/CalibracionVehiculo/Services/fetchUltimaCalibracion';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    CabeceraModal,
    GuardarCambiosButton,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    BuscarVehiculoGrid,
    CalibracionForm,
    Confirmation,
    MensajeValidacion,
  },
})
export default class EditarCalibrarModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) objeto: string;
  @Prop() calibracionSeleccionada: CalibracionVehiculo;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionGuardar: boolean = false;
  showConfirmacionCerrar: boolean = false;
  disabledBotones: boolean = false;
  mensajeConfirmacion: any = '';
  showGuardar: boolean = false;

  objetoTitulo: string = '';
  objetoMensajes: string = '';

  idVehiculo: number = 0;
  unidadVehiculo: string = '';

  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  pasoActivoIndex = 1;
  pasos: PasosCrud = {
    informacionRecalibracion: {
      accion: 'Editar - Informacion Recalibracion',
      visible: true,
      step: 1,
      title: 'Información Recalibración',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  created() {
    if (this.objeto == 'odometro') {
      this.objetoTitulo = 'Editar Recalibración Odómetro';
      this.objetoMensajes = 'Odómetro';
    } else {
      this.objetoTitulo = 'Editar Recalibración Horómetro';
      this.objetoMensajes = 'Horómetro';
    }
  }

  /* event handlers */

  handleCerrarConfirm() {
    this.showConfirmacionCerrar = true;
  }

  handleCerrar(isConfirmado: boolean) {
    this.showConfirmacionCerrar = false;
    if (isConfirmado) {
      this.$emit('cerrar');
    }
  }

  async handleGuardar() {
    let isValid = await this.pasos.informacionRecalibracion.formState.validator.validateAll();

    if (isValid) {
      let isValidCalibracion = await this.validaUltimaCalibracion();
      if (isValidCalibracion) {
        this.mensajeConfirmacion = this.$t('mensajes.crud.editar.mensaje', {
          entidad: 'Recalibrar el ' + this.objetoMensajes,
        });

        this.dialogConfirmacionGuardar = true;
      }
    } else {
      this.disabledBotones = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;
    let form = this.pasos.informacionRecalibracion.formState.entity;

    if (isConfirm) {
      var calibracionVehiculo: CalibracionVehiculo = {
        id: this.calibracionSeleccionada.id,
        vehiculoId: this.calibracionSeleccionada.vehiculoId,
        unidadVehiculo: this.calibracionSeleccionada.unidadVehiculo,
        fecha: form.fecha,
        estado: 1,
      };

      if (this.objeto == 'odometro') {
        calibracionVehiculo.odometroPlataforma = form.odometroPlataforma;
      } else {
        calibracionVehiculo.horasMotorPlataforma = form.horasMotorPlataforma;
      }

      this.loadingService.showLoading();
      return editarCalibracion(calibracionVehiculo)
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar recalibrar el ' +
              this.objetoMensajes,
            { timeout: 3000 }
          )
        )
        .then(() => {
          this.$snotify.success(
            'Los cambios han sido guardados de forma exitosa',
            {
              timeout: 3000,
            }
          );
          this.handleCerrar(true);
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  validaUltimaCalibracion() {
    this.loadingService.showLoading();
    let form = this.pasos.informacionRecalibracion.formState.entity;
    let fechaIngresada = form.fecha;
    let valorIngresado = 0;

    if (this.objeto == 'odometro') {
      valorIngresado = form.odometroPlataforma;
    } else {
      valorIngresado = form.horasMotorPlataforma;
    }

    return fetchUltimaCalibracion(
      this.calibracionSeleccionada.vehiculoId,
      this.objeto,
      true
    )
      .then((res: UltimaCalibracion) => {
        if (res.fecha) {
          if (res.fecha.format('L') > fechaIngresada.format('L')) {
            this.tituloValidacion = 'Fecha Recalibración';
            this.mensajeValidacion =
              'La Recalibración del  ' +
              this.objetoMensajes +
              ' debe ser con fecha posterior a la ultima ingresada.';
            this.showValidacion = true;

            return false;
          }
        }

        return true;
      })
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar validar la Recalibración ' +
            this.objetoMensajes,
          { timeout: 3000 }
        );

        return false;
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionRecalibracion.formState = event;

    this.disabledBotones =
      this.pasos.informacionRecalibracion.formState.validator.errors.items
        .length > 0
        ? true
        : false;
  }
}
</script>
