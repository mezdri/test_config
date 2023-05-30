<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Crear Solicitud'" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <SolicitudForm @change="handleFormChange" />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Solicitud',
        })
      "
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="mostrarErrorCrear"
      :titulo="getTituloErrorCrear"
      :mensaje="getMensajeErrorCrear"
      v-on:modalConfirmationEmit="handleCerrar"
      :mostrarBoton="false"
      :textoBtnSi="`Aceptar`"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';

import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';

import SolicitudForm from '@/pantallas/Solicitudes/SolicitudForm.vue';
import {
  crearSolicitud,
  CreacionSolicitud,
} from '@/pantallas/Solicitudes/crearSolicitud';

import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';

import { Solicitud } from './Solicitud';

import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

type CrearFormState = {
  entity: Solicitud;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    GuardarButton,
    ContinuarButton,
    VolverButton,
    Confirmation,
    SolicitudForm,
    CabeceraModalCrear,
    NavegacionModalCrud,
    CrudStepperItems,
    CrudStepperHeader,
    CrudStepperContent,
  },
})
export default class CrearSolicitudModal extends Vue {
  @Prop({ required: true }) show: boolean;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';
  btnBloquear: boolean = true;
  validForm: boolean = true;
  disableGuardar: boolean = false;

  mostrarErrorCrear: boolean = false;
  tituloErrorCrear: string = 'Error al Crear Solicitud';
  mensajeErrorCrear: string = '';

  isValid = false;

  form: CrearFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Información General',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  get getTituloErrorCrear() {
    return this.tituloErrorCrear;
  }

  get getMensajeErrorCrear() {
    return this.mensajeErrorCrear;
  }

  /* event handlers */

  handleCerrar() {
    this.mostrarErrorCrear = false;
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();

    if (isValid) {
      this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
        entidad: 'la Solicitud',
      });
      this.dialogConfirmacionGuardar = true;
    } else {
      this.disableGuardar = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;

    if (isConfirm) {
      let formulario: any = this.form.entity;
      //datos que uno manda al servicio
      let nuevaSolicitud: CreacionSolicitud = {
        IDPlataforma: '140390001',
        ContactoNombre: formulario.ContactoNombre,
        ContactoApellidos: formulario.ContactoApellidos,
        ContactoTelefono: formulario.ContactoTelefono,
        ContactoEmail: formulario.ContactoEmail,
        Titulo: formulario.Titulo,
        Descripcion: formulario.Descripcion,
        IDOrigen: '100000001', //'2',
        IDTipo: '3',
        Idepc: '00000000-0000-0000-0000-000000000000',
        Categoria: {
          IDSubcategoria: formulario.Subcategoria,
          IDCategoria: formulario.Categoria,
          Categoria: '',
          Subcategoria: '',
        },
        //ListaArchivo: [{}]
      };

      this.loadingService.showLoading();
      return crearSolicitud(nuevaSolicitud)
        .catch(error => {
          if (error.response !== undefined) {
            if (error.response.status !== 401) {
              this.$snotify.error(
                'Ha ocurrido un error al intentar crear solicitud.'
              );
            } else if (error.response.status === 205) {
              this.mostrarErrorCrear = true;
              this.mensajeErrorCrear = error.data.Detalle;
              /* this.$snotify.error(
                'Ha ocurrido un error al intentar crear solicitud.'
              ); */
            }
          } else {
            if (error.data !== undefined) {
              if (error.data.Detalle !== 'Exitoso') {
                this.mostrarErrorCrear = true;
                this.mensajeErrorCrear = error.data.Detalle;
                /* this.$snotify.error(
                  'Ha ocurrido un error al intentar crear solicitud',
                  { timeout: 3000 }
                ); */
              }
            }
          }
        })
        .then((x: any) => {
          if (x.data.Estado === '0') {
            this.$snotify.success(
              'Solicitud de Caso N° ' +
                x.data.Caso.Numero +
                ' ha sido creada de forma exitosa',
              {
                timeout: 3000,
              }
            );
          } else if (x.data.Estado === '4') {
            this.mostrarErrorCrear = true;
            this.mensajeErrorCrear = x.data.Detalle;
            /* this.$snotify.success(
              'Ha ocurrido un error al intentar crear solicitud',
              {
                timeout: 3000,
              }
            ); */
          }
          this.handleCerrar();
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    this.form = event;
    if (this.disableGuardar) {
      const isValid = await this.form.validator.validateAll();
      if (isValid) {
        this.disableGuardar = false;
      }
    }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
  }
}
</script>
