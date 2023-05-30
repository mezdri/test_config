<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Crear Producto" @cerrar="handleCerrar">
      <div
        style="

letter-spacing: 0.02em;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin-top: 16px;
;"
      ></div>
      <div class="boton_crear" style="">
        <v-btn
          @click="editar"
          class="icon"
          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;
  
  margin: 0 0 0 auto;margin-top: 13px;
height: 38px;"
        >
          <span style="color: white;" class="color-blanco">Guardar</span>
        </v-btn>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <div align="center">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-form ref="form" lazy-validation class="col-md-12">
              <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
                <FormFieldsContainer titulo="Crear Producto">
                  <slot name="prependInformacionGeneral" />

                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.codigoProducto.label"
                      v-model="formFields.codigoProducto.value"
                      disabled
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.codigoProductoP.label"
                      v-model="formFields.codigoProductoP.value"
                      v-validate="'numeric'"
                      :error-messages="errors.collect('telefonoFijo2')"
                      data-vv-name="telefonoFijo2"
                      type="text"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.codigoInet.label"
                      v-model="formFields.codigoInet.value"
                      v-validate="'numeric'"
                      :error-messages="errors.collect('telefonoFijo')"
                      data-vv-name="telefonoFijo"
                      type="text"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.nombrecrm.label"
                      v-model="formFields.nombrecrm.value"
                      v-validate="'max:29'"
                      :error-messages="errors.collect('name')"
                      data-vv-name="name"
                      :counter="29"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      v-model="formFields.descripcionCorta.value"
                      :label="formFields.descripcionCorta.label"
                      v-validate="'max:29'"
                      :error-messages="errors.collect('name')"
                      data-vv-name="name"
                      :counter="29"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.descripcionLarga.label"
                      v-model="formFields.descripcionLarga.value"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.cuentaIngreso.label"
                      v-model="formFields.cuentaIngreso.value"
                      v-validate="'numeric'"
                      :error-messages="errors.collect('telefonoFijo3')"
                      data-vv-name="telefonoFijo3"
                      type="text"
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.cuentaCosto.label"
                      v-model="formFields.cuentaCosto.value"
                      v-validate="'numeric'"
                      :error-messages="errors.collect('telefonoFijo4')"
                      data-vv-name="telefonoFijo4"
                      type="text"
                    />
                  </v-flex>
                  <v-flex sm4 md4>
                    <v-autocomplete
                      v-model="formFields.plataforma.value"
                      :label="formFields.plataforma.label"
                      :items="plataformaList"
                      item-text="producto"
                      item-value="configid_producto"
                      clearable
                      required
                    />
                  </v-flex>
                  <v-flex sm4 md4>
                    <v-autocomplete
                      v-model="formFields.producto.value"
                      :label="formFields.producto.label"
                      :items="porductoList"
                      item-text="configvalor_clase"
                      item-value="configid_clase"
                      clearable
                      required
                    />
                  </v-flex>
                  <v-flex sm4 md4>
                    <v-autocomplete
                      v-model="formFields.tipoequipo.value"
                      :label="formFields.tipoequipo.label"
                      :items="tipoEquipoList"
                      item-text="tipoeqname"
                      item-value="tipoeqid"
                      clearable
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.estado.label"
                      v-model="formFields.estado.value"
                      disabled
                      required
                    />
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </div>
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import TextField from '@/reusable/Form/TextField.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import config from '@/config/index';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    TextField,
    FormFieldsContainer,
  },
})
export default class VerCrearModal extends Vue {
  @Prop({ default: true }) show: boolean;
  readonly funcionalidad: Funcionalidades = Funcionalidades.EditarVehiculos;

  respuesta: any;
  dictionaryFormErrors: any = {};
  optionslist: any = [
    { text: 'Equipo', value: false },
    { text: 'Periferico', value: true },
  ];

  optionslist_2: any = [
    { text: 'Vigente', value: null },
    { text: 'Baja', value: 1 },
  ];
  porductoList: any = [];
  plataformaList: any = [];
  tipoEquipoList: any = [];
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Crear Producto',
      visible: true,
      step: 1,
      title: 'Crear Producto',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { '': '' },
      'conecta_matriz_producto_comercial/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.porductoList = data.data.PRODUCTO;
          self.plataformaList = data.data.PLATAFORMA;
          self.tipoEquipoList = data.data.TIPO_EQUIPO;
          self.formFields.codigoProducto.value = String(
            Number(data.data.CODIGO_EQUIPO[0].max) + 1
          );
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  async editar() {
    this.respuesta = await this.$validator.validateAll();
    let self = this;
    this.loadingService.showLoading();

    return fetchReportesSerie(
      {
        usuarioid_alta: JSON.parse(localStorage.getItem('user')).id,
        usuariorut_alta: JSON.parse(localStorage.getItem('user'))
          .rutClienteDefecto,
        tipoprodid: this.formFields.codigoProducto.value,
        tipoproddesc_corta: this.formFields.descripcionCorta.value,
        tipoproddesc_larga: this.formFields.descripcionLarga.value,
        tipoprodcod_producto: this.formFields.codigoProductoP.value,
        tipoprodcod_inet: this.formFields.codigoInet.value,
        tipoprodcuenta_ingreso: this.formFields.cuentaIngreso.value,
        tipoprodcuenta_costo: this.formFields.cuentaCosto.value,
        tipoprodplataforma: this.formFields.plataforma.value,
        tipoprodclase: this.formFields.producto.value, //
        tipoeqid: this.formFields.tipoequipo.value, //
        tipoprodnombre_crm: this.formFields.nombrecrm.value,
      },
      'conecta_matriz_producto_comercial/crear_producto'
    )
      .then((data: any) => {
        if (this.respuesta == false) {
          self.$snotify.error('Por favor ingrese los campos requeridos.', {
            timeout: 3000,
          });
          return;
        }
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.handleCerrar();
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  formFields: FormFieldDefMap = {
    nombrecrm: {
      label: 'Nombre en CRM*',
      id: '',
      value: '',
    },
    codigoProducto: {
      label: 'ID de Producto',
      id: '',
      value: '',
    },
    codigoProductoP: {
      label: 'Código de Producto*',
      id: '',
      value: '',
    },
    codigoInet: {
      label: 'Código de INET*',
      id: '',
      value: '',
    },
    descripcionCorta: {
      label: 'Descripción Corta*',
      id: '',
      value: '',
    },
    descripcionLarga: {
      label: 'Descripción Larga*',
      id: '',
      value: '',
    },
    cuentaIngreso: {
      label: 'Cuenta Ingreso',
      id: '',
      value: '',
    },
    cuentaCosto: {
      label: 'Cuenta Costo',
      id: '',
      value: '',
    },
    producto: {
      label: 'Clase Producto',
      id: '',
      value: '',
    },
    plataforma: {
      label: 'Plataforma',
      id: '',
      value: '',
    },
    tipoequipo: {
      label: 'Tipo Equipo',
      id: '',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'Vigente',
      value: 'Vigente',
    },
  };

  mounted() {
    this.getEquipos();

    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Nombre solo debe contener letras y/o espacios.',
        },
        ubicacion: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Paterno solo debe contener letras y/o espacios.',
        },
        apellidoMaterno: {
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Materno solo debe contener letras y/o espacios.',
        },
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        contrasena: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
        },
        direccion: {
          max: () => config.errorMensajes.maxLength,
        },
        telefonoFijo: {
          max: () => config.errorMensajes.maxLength,
          numeric: () => 'El campo debe ser unicamente numérico',
        },
        telefonoFijo2: {
          max: () => config.errorMensajes.maxLength,
          numeric: () => 'El campo debe ser unicamente numérico',
        },
        telefonoFijo3: {
          max: () => config.errorMensajes.maxLength,
          numeric: () => 'El campo debe ser unicamente numérico',
        },
        telefonoFijo4: {
          max: () => config.errorMensajes.maxLength,
          numeric: () => 'El campo debe ser unicamente numérico',
        },
        celular: {
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaNacimiento: {
          mayorDeEdad: () => config.errorMensajes.fechaMayoriaEdad,
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrarCrear');
  }
}
</script>
<style></style>
