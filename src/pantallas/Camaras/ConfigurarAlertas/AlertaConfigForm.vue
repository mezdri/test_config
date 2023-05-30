<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Configuración Alerta">
              <slot name="prependInformacionGeneral" />
              <v-flex sm4 md4>
                <div style="text-align: start;">
                  <v-text-field
                    v-model="formFields.mail.value"
                    :label="formFields.mail.label"
                    single-line
                    hide-details
                  />

                  <span
                    style="font-style: italic;margin: 0 auto;font-size: 12px;"
                    >Puede ingresar varios correos separados por punto y coma
                    (;)</span
                  >
                </div>
              </v-flex>
              <v-flex sm4 md4>
                <v-select
                  v-model="formFields.tipoAlerta.items"
                  :label="formFields.tipoAlerta.label"
                  :items="listaTiposAlerta"
                  item-text="nombre"
                  item-value="id"
                  multiple
                  @change="changeTiposAlertas"
                />
              </v-flex>
              <v-flex sm4 md4>
                <v-autocomplete
                  v-model="formFields.flota.value"
                  :label="formFields.flota.label"
                  :items="listaFlotas"
                  item-text="nombre"
                  item-value="id"
                  @change="changeFlota($event)"
                />
              </v-flex>
              <v-flex sm4 md4>
                <v-autocomplete
                  v-model="formFields.grupo.value"
                  :label="formFields.grupo.label"
                  :items="listaGrupos"
                  item-text="nombre"
                  item-value="id"
                />
              </v-flex>
              <v-flex sm4 md4 v-show="esEditar">
                <v-select
                  v-model="formFields.estado.value"
                  :label="formFields.estado.label"
                  :items="[
                    { id: true, nombre: 'Activo' },
                    { id: false, nombre: 'Inactivo' },
                  ]"
                  item-text="nombre"
                  item-value="id"
                />
              </v-flex>
              <v-flex sm2 md2>
                <div class="text-sm-center">
                  <v-btn flat icon small @click="handleModalBtnGuardarEditar">
                    <v-icon class="BtnIcon">save</v-icon>
                  </v-btn>
                </div>
              </v-flex>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <!--v-flex overload xs12 sm12 md12>
    </v-flex-->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import {
  emitFormChangeEvent,
  FormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';

import { MnsajeNuevo } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { OperacionesCrud } from '../../../reusable/Mantenedor/mantenedorUtils';

import {
  fetchTiposAlerta,
  ConfigTiposAlerta,
} from '@/pantallas/Camaras/Alertas/fetchTipoAlerta';

import { requestConfigAlerta } from '@/pantallas/Camaras/ConfigurarAlertas/requestsConfigAlerta';

import {
  ConfigFlotas,
  ConfigGrupos,
} from '@/pantallas/Camaras/Alertas/fetchFlota';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class AlertaConfigForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ required: false }) registroSeleccionado: any;
  @Prop({ default: false }) esEditar: boolean;
  @Prop() listaFlotas: ConfigFlotas[];
  @Prop() listaGrupos: ConfigGrupos[];
  //@Prop({ required: false }) alertasSeleccionadas: string[];

  listaTiposAlerta: ConfigTiposAlerta[] = [];

  /* state */

  isFormValid: boolean = false;
  //vVariables: Variables[] = [];
  files: any[] = [];

  mostrarConfirmacionEliminar: boolean = false;
  mostrarDatos: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;

  icono: any = {};
  iconoUrl = '';
  iconoBase64: string = '';
  nombre: string = '';
  mensaje: string[] = ['* Ya existe un Mensaje con este nombre.'];
  hint: string = '';
  estado: boolean = true;

  modalCrudActivo: OperacionesCrud = null;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  alertasSeleccionadas: string[] = [];

  formFields: FormFieldDefMap = {
    tipoAlerta: {
      label: 'Tipo Alerta',
      id: 'tipoAlerta',
      value: '',
      items: this.alertasSeleccionadas,
    },
    mail: {
      label: 'Mail',
      id: 'mail',
      value: '',
    },
    id: {
      label: 'Id Configuración',
      id: 'id',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'estado',
      value: '',
    },
    flota: {
      label: 'Flota',
      id: 'flota',
      value: '',
    },
    grupo: {
      label: 'Grupo',
      id: 'grupo',
      value: '',
    },
  };

  changeTiposAlertas() {
    if (this.formFields.tipoAlerta.items.includes('ALL')) {
      this.listaTiposAlerta = this.listaTiposAlerta.map(x => {
        x.disabled = x.id == 'ALL' ? false : true;
        return x;
      });
      this.formFields.tipoAlerta.items = ['ALL'];
    } else {
      this.listaTiposAlerta = this.listaTiposAlerta.map(x => {
        x.disabled = false;
        return x;
      });
    }
  }
  changeFlota(e: any) {
    this.$emit('changeFlota', this.formFields);
  }

  mounted() {
    const validator = makeValidatorDictionary(this.formFields);
    this.$validator.localize('es', validator);
    this.handleSeleccionadoChange();
  }

  handleCrearClick() {
    this.$validator.errors.clear();
    this.mostrarModalCrear = true;
  }
  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardarEditar(e: FormChangeEvent) {
    this.mostrarModalCrear = false;
  }

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  @Watch('registroSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    if (!this.registroSeleccionado) {
      return;
    }
    this.formFields.mail.value = this.registroSeleccionado.mail;
    this.formFields.id.value = this.registroSeleccionado.id;
    this.formFields.tipoAlerta.items = this.registroSeleccionado.alertas_original
      .replaceAll("'", '')
      .split(' ');
    this.formFields.estado.value =
      this.registroSeleccionado.estado == 'ACTIVO' ? true : false;
    this.formFields.flota.value = this.registroSeleccionado.flota;
    this.formFields.grupo.value = this.registroSeleccionado.grupo;
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          /*fechaAlarma: this.formFields.fechaAlarma.value,
          codVehiculo: this.formFields.codVehiculo.value,
          codFlota: null,
          flota: this.formFields.flota.value,
          patente: this.formFields.patente.value,
          numActividad: this.formFields.numActividad.value,
          velocidad: this.formFields.velocidad.value,
          tipoAlerta: this.formFields.tipoAlerta.value,
          evidencia: '',
          ubicacion:
            this.formFields.latitud.value +
            ',' +
            this.formFields.longitud.value,
          files: this.formFields.files.value,*/
        } as any,
      },
      this
    );
  }

  handleModalBtnGuardarEditar() {
    if (this.formFields.tipoAlerta.items.length == 0) {
      this.$snotify.error('Debe seleccionar un tipo de alerta', {
        timeout: 3000,
      });
      return;
    }

    // eslint-disable-next-line
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (this.formFields.mail.value == '') {
      this.$snotify.error('Debe ingresar un mail valido', { timeout: 3000 });
      return;
    }
    var validateMails: boolean = true;
    for (var mail of this.formFields.mail.value.toString().split(';')) {
      console.log(mail);
      if (!mail.toString().match(mailformat)) {
        validateMails = false;
        return;
      }
    }
    if (!validateMails) {
      return;
    }
    if (this.formFields.id.value == '' && this.esEditar) {
      this.$snotify.error('ID no valido', { timeout: 3000 });
      return;
    }
    this.crearConfigVigilanti();
  }

  async crearConfigVigilanti() {
    const body: {} = {
      id_cliente: JSON.parse(
        window.localStorage.user
      ).clienteDefecto.toString(),
      tipoAlerta: this.formFields.tipoAlerta.items,
      mail: this.formFields.mail.value,
      id: this.formFields.id.value,
      estado: this.formFields.estado.value,
      flota: this.formFields.flota.value,
      grupo: this.formFields.grupo.value,
    };
    this.$emit('handleShowLoading');
    requestConfigAlerta(body, 'crearConfigVigilanti')
      .then((response: any) => {
        if (response.status == 200) {
          if (response.data.CODIGO_RESPUESTA == '1') {
            let mensaje =
              'Configuración ' +
              (this.esEditar ? 'actualizada' : 'creada') +
              ' correctamente';
            this.$snotify.success(mensaje, { timeout: 3000 });
            this.$emit('handleHideLoading');
            this.$emit('handleCerrar');
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
          }
        } else {
          this.$snotify.error('Error de conexión', { timeout: 3000 });
        }
        //this.gridApi.setRowData(response.data.data);
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Ocurrió un error. Intente nuevamente.', {
          timeout: 3000,
        });
      })
      .finally(() => {
        //this.gridApi.setDomLayout('autoHeight');
        this.$emit('handleHideLoading');
      });
  }

  constructor() {
    super();
    this.getTiposAlertas();
  }
  created() {}

  async getTiposAlertas() {
    this.listaTiposAlerta = (await this.cargarTiposAlertas()) || [];
    this.listaTiposAlerta = this.listaTiposAlerta.map(x => {
      x['id'] = x['nombre'] == 'Todas' ? 'ALL' : x['id'];
      x['disabled'] =
        this.formFields.tipoAlerta.items.includes('ALL') && x['id'] != 'ALL'
          ? true
          : false;
      return x;
    });
  }
  cargarTiposAlertas() {
    this.$emit('handleShowLoading');
    return fetchTiposAlerta()
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de alarmas',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los tipos de alarmas',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.$emit('handleHideLoading'));
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>
