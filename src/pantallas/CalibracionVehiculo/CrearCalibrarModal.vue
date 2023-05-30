<template>
  <ModalMantenedor :show="show">
    <CabeceraModal :titulo="objetoTitulo" @cerrar="handleCerrar">
      <VolverButton
        v-if="pasoActivoIndex > 1"
        @click="handleVolverClick"
      />&nbsp;&nbsp;
      <GuardarButton
        v-if="pasoActivoIndex === 2"
        @click="handleGuardar"
        :disabled="disabledBotones"
      />
      <ContinuarButton
        v-else
        :disabled="disabledBotones"
        @click="handleContinuarClick"
      />
    </CabeceraModal>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.buscarVehiculo">
          <BuscarVehiculoGrid @unidadChange="handleUnidadChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.informacionRecalibracion">
          <CalibracionForm
            @change="handleFormChange"
            :objeto="objeto"
            :idVehiculo="idVehiculo"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="'Recalibrar ' + objetoMensajes"
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="showConfirmacionCerrar"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="handleConfirmarCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="'Continuar Recalibrando'"
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
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import { crearCalibracion } from '@/pantallas/CalibracionVehiculo/Services/crearCalibracion';
import { fetchUltimaCalibracion } from '@/pantallas/CalibracionVehiculo/Services/fetchUltimaCalibracion';
import BuscarVehiculoGrid from '@/pantallas/CalibracionVehiculo/BuscarVehiculoGrid.vue';
import CalibracionForm from '@/pantallas/CalibracionVehiculo/CalibracionForm.vue';
import {
  CalibracionVehiculo,
  UltimaCalibracion,
  makeOdometroCrear,
  makeHorometroCrear,
} from './CalibracionVehiculo';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    VolverButton,
    ContinuarButton,
    GuardarButton,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    BuscarVehiculoGrid,
    CalibracionForm,
    Confirmation,
    MensajeValidacion,
  },
})
export default class CrearCalibrarModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) objeto: string;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionGuardar: boolean = false;
  showConfirmacionCerrar: boolean = false;
  disabledBotones: boolean = false;
  mensajeConfirmacion: any = '';

  idVehiculo: number = 0;
  unidadVehiculo: string = '';

  objetoTitulo: string = '';
  objetoMensajes: string = '';

  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud =
    this.objeto == 'odometro' ? makeOdometroCrear() : makeHorometroCrear();
  readonly funcionalidad: Funcionalidades =
    this.objeto == 'odometro'
      ? Funcionalidades.Odometro
      : Funcionalidades.Horometro;

  created() {
    if (this.objeto == 'odometro') {
      this.objetoTitulo = 'Recalibrar Odómetro';
      this.objetoMensajes = 'Odómetro';
    } else {
      this.objetoTitulo = 'Recalibrar Horómetro';
      this.objetoMensajes = 'Horómetro';
    }
  }

  handleContinuarClick() {
    if (!this.idVehiculo) {
      this.tituloValidacion = 'Seleccionar Vehículo';
      this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
      this.showValidacion = true;
      return false;
    }

    this.pasoActivoIndex++;
  }

  handleVolverClick() {
    this.disabledBotones = false;
    this.pasoActivoIndex--;
  }

  /* event handlers */

  handleCerrar() {
    this.showConfirmacionCerrar = true;
  }

  handleConfirmarCerrar(isConfirmado: boolean) {
    this.showConfirmacionCerrar = false;
    if (isConfirmado) {
      this.$emit('cerrar');
    }
  }

  async handleGuardar() {
    var isValid = await this.pasos.informacionRecalibracion.formState.validator.validateAll();

    if (isValid) {
      var isValidCalibracion = await this.validaUltimaCalibracion();
      if (isValidCalibracion) {
        this.mensajeConfirmacion =
          '¿Está seguro que desea Recalibrar el ' + this.objetoMensajes + '?';

        this.dialogConfirmacionGuardar = true;
      }
    } else {
      this.disabledBotones = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;
    var form = this.pasos.informacionRecalibracion.formState.entity;

    if (isConfirm) {
      var calibracionVehiculo: CalibracionVehiculo = {
        vehiculoId: this.idVehiculo,
        unidadVehiculo: this.unidadVehiculo,
        fecha: form.fecha,
        estado: 1,
      };

      if (this.objeto == 'odometro') {
        calibracionVehiculo.odometroPlataforma = form.odometroPlataforma;
      } else {
        calibracionVehiculo.horasMotorPlataforma = form.horasMotorPlataforma;
      }

      this.loadingService.showLoading();
      return crearCalibracion(calibracionVehiculo)
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar recalibrar el ' +
              this.objetoMensajes,
            { timeout: 3000 }
          )
        )
        .then(() => {
          this.$snotify.success(
            this.objetoMensajes + ' ha sido recalibrado de forma exitosa',
            {
              timeout: 3000,
            }
          );
          this.$emit('cerrar');
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionRecalibracion.formState = event;
    this.disabledBotones =
      this.pasos.informacionRecalibracion.formState.validator.errors.items
        .length > 0
        ? true
        : false;
  }

  handleUnidadChange(id: number, unidad: string) {
    this.idVehiculo = id;
    this.unidadVehiculo = unidad;
  }

  validaUltimaCalibracion(): Promise<boolean> {
    var form = this.pasos.informacionRecalibracion.formState.entity;
    let fechaIngresada = form.fecha;
    var valorIngresado = 0;

    if (this.objeto == 'odometro') {
      valorIngresado = form.odometroPlataforma;
    } else {
      valorIngresado = form.horasMotorPlataforma;
    }

    return fetchUltimaCalibracion(this.idVehiculo, this.objeto, false)
      .then((res: UltimaCalibracion) => {
        if (res.fecha) {
          if (res.fecha > fechaIngresada) {
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
      });
  }
}
</script>
