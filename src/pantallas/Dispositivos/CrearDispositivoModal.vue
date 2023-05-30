<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Crear Dispositivo'" @cerrar="handleCerrar">
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
          <DispositivoForm
            test-id="CrearDispositivoModal"
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Dispositivo' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      test-id="CrearDispositivo"
    />
  </ModalMantenedor>
  <!-- <ModalMantenedor :show="show">
    <CabeceraModal titulo="Crear Dispositivo" @cerrar="handleCerrar">
      <GuardarButton @click="handleGuardarClick" :disabled="hasErrors" />
    </CabeceraModal>
    <v-stepper v-model="pasoActivoIndex">
      <v-stepper-header>
        <v-stepper-step
          v-show="pasos.informacionGeneral.visible"
          :complete="pasoActivoIndex > pasos.informacionGeneral.step"
          :step="pasos.informacionGeneral.step"
          >Información General</v-stepper-step
        >
      </v-stepper-header>
      <v-stepper-items class="cardnew">
        <v-stepper-content
          v-show="pasos.informacionGeneral.visible"
          :step="pasos.informacionGeneral.step"
        >
          <DispositivoForm
            test-id="CrearDispositivoModal"
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
          />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Dispositivo' })"
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      test-id="CrearDispositivo"
    ></Confirmation>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="handleCierreConfirmacionCerrar"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor> -->
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import DispositivoForm from '@/pantallas/Dispositivos/DispositivoForm.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { DispositivoNuevo } from '@/pantallas/Dispositivos/Dispositivos';
import { crearDispositivo } from '@/pantallas/Dispositivos/crearDispositivo';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

type CrearDispositivoFormState = {
  entity: DispositivoNuevo;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    DispositivoForm,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
  },
})
export default class CrearDispositivoModal extends Vue {
  @Prop({ required: true }) show: boolean;

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
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  dialogConfirmacion: boolean = false;

  form: CrearDispositivoFormState = {
    entity: null,
    validator: null,
  };

  /* Event Handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const isValid = await this.pasos.informacionGeneral.formState.validator.validateAll();

    if (isValid) {
      this.handleSwitch(this.pasos.informacionGeneral.formState.entity.estado);
      this.dialogConfirmacion = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacion = false;
    if (isConfirm) {
      this.loadingService.showLoading();
      return crearDispositivo(this.pasos.informacionGeneral.formState.entity)
        .then(() => {
          this.$snotify.success('Dispositivo ha sido creado de forma exitosa', {
            timeout: 3000,
          });
          this.handleCerrar();
        })
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar crear el dispositivo',
            {
              timeout: 3000,
            }
          )
        )
        .finally(() => {
          this.loadingService.hideLoading();
          this.$emit('cerrarBtnGuardar');
        });
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Dispositivo',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        {
          entidad: 'el Dispositivo',
        }
      );
    }
  }
}
// export default class CrearDispositivoModal extends Vue {
//   @Prop({ default: true }) show: boolean;

//   pasoActivoIndex = 1;
//   pasos = {
//     informacionGeneral: {
//       accion: 'Crear - Información General',
//       visible: true,
//       step: 1,
//     },
//   };
//   form: CrearDispositivoFormState = {
//     entity: null,
//     validator: null,
//     isDirty: null,
//   };
//   dialogConfirmacionClose: boolean = false;
//   disableBtnContinuar: boolean = false;
//   hasErrors = false;
//   isValid = false;
//   dialogConfirmacion: boolean = false;
//   mensajeConfirmacionInactivo: any = '';

//   /* misc */

//   readonly $snotify: Snotify;
//   readonly loadingService = new LoadingService();

//   /* event handlers */

//   handleCerrar() {
//     this.dialogConfirmacionClose = true;
//   }

//   handleCierreConfirmacionCerrar(isConfirmado: boolean) {
//     this.dialogConfirmacionClose = false;
//     if (!isConfirmado) {
//       return;
//     }
//     this.$emit('cerrar');
//   }

//   async handleGuardarClick() {
//     this.isValid = await this.form.validator.validateAll();
//     const estado = this.form.entity.estado === 1 ? true : false;
//     if (this.isValid) {
//       this.hasErrors = true;
//       this.handleSwitch(estado);
//       this.dialogConfirmacion = true;
//     } else {
//       this.form.isDirty = true;
//       this.hasErrors = true;
//     }
//   }

//   async confirmCallback(val: boolean) {
//     this.dialogConfirmacion = false;
//     this.hasErrors = false;
//     if (val) {
//       this.loadingService.showLoading();
//       return crearDispositivo(this.form.entity)
//         .then(() =>
//           this.$snotify.success(
//             this.$t('mensajes.mensajesExito.crear', {
//               entidad: 'Dispositivo',
//               creadoA: 'creado',
//             })
//           )
//         )
//         .catch(() =>
//           this.$snotify.error(
//             `Ha ocurrido un error al intentar crear el dispositivo.`,
//             { timeout: 3000 }
//           )
//         )
//         .finally(() => {
//           this.loadingService.hideLoading();
//           this.$emit('cerrarBtnGuardar');
//         });
//     }
//   }

//   async handleFormChange(event: FormChangeEvent) {
//     this.form = event;
//     if (this.form.isDirty) {
//       this.hasErrors = this.form.validator.errors.items.length > 0;
//     }
//   }
//   handleSwitch(isActivo: boolean) {
//     if (!isActivo) {
//       this.mensajeConfirmacionInactivo =
//         this.$t('mensajes.crud.inactivo.mensaje') +
//         ' ' +
//         this.$t('mensajes.crud.crear.mensaje', {
//           entidad: 'el Dispositivo',
//         });
//     } else {
//       this.mensajeConfirmacionInactivo = this.$t(
//         'mensajes.crud.crear.mensaje',
//         {
//           entidad: 'el Dispositivo',
//         }
//       );
//     }
//   }
// }
</script>
