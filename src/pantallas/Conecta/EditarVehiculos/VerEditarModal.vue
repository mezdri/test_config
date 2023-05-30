<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Vehículo" @cerrar="handleCerrar">
      <div
        class="numero_sim"
        style="

letter-spacing: 0.02em;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin-top: 16px;
;"
      >
        <div class="boton_crear" style="height: 37px;">
          <v-btn
            @click="editar"
            class="icon"
            style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;

margin: 0 0 0 auto;"
          >
            <span style="color: white;" class="color-blanco"
              >Guardar Cambios</span
            >
          </v-btn>
        </div>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <!-- <ContenidoModal>
      
    </ContenidoModal> -->
    <!-- :serieNumeroSeleccionado="serieNumeroSeleccionado"
    :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
    :serieactivanroSeleccionado="serieactivanroSeleccionado" -->
    <div align="center">
      <v-flex md10>
        <v-card class="rounded-card">
          <v-form ref="form" lazy-validation class="col-md-12">
            <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
              <FormFieldsContainer titulo="Asignación Detalle Vehículo">
                <slot name="prependInformacionGeneral" />

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.codigovehiculo.label"
                    v-model="formFields.codigovehiculo.value"
                    disabled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.cliente.label"
                    v-model="formFields.cliente.value"
                    disabled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.nombreflota.label"
                    v-model="formFields.nombreflota.value"
                    disabled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    :label="formFields.patente.label"
                    v-model="formFields.patente.value"
                    disabled
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-combobox
                    :label="formFields.marca.label"
                    v-model="formFields.marca.value"
                    :items="marcaslist"
                    item-text="configvalor"
                    item-value="configid"
                    @change="getmodelos"
                    v-validate="'required'"
                    :error-messages="errors.collect('marca')"
                    data-vv-name="marca"
                    required
                  />
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-combobox
                    v-if="!cambio"
                    :label="formFields.modelo.label"
                    v-model="formFields.modelo.value"
                    :disabled="modoVer"
                    :items="modelolist"
                    item-text="configvalor"
                    item-value="configid"
                    v-validate="'required'"
                    :error-messages="errors.collect('modelo')"
                    data-vv-name="modelo"
                    required
                  />
                  <v-text-field
                    v-if="cambio"
                    :label="formFields.modelo.label"
                    v-model="formFields.modelo.value"
                  />
                </v-flex>

                <v-flex xs4 sm4 md4>
                  <v-text-field
                    v-model="formFields.anio.value"
                    label="Año"
                    maxlength="4"
                    v-validate="'required|numeric|anioMaximo|anioMinimo'"
                    :error-messages="errors.collect('ano')"
                    data-vv-name="ano"
                    type="text"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4 sm4 md4>
                  <v-text-field
                    v-model="formFields.co2.value"
                    label="Emisión de Co2"
                    v-validate="'required|co2|max:10'"
                    :error-messages="errors.collect('co2')"
                    data-vv-name="co2"
                    type="text"
                  ></v-text-field>
                </v-flex>
              </FormFieldsContainer>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

// import AsociarMensajesForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesForm.vue';
import AsociarMensajesFormDetalle from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesFormDetalle.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';

import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import AsociarFlotaEtiquetaVehiculoIndividual from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

import { Vue, Component, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { fetchReportesSerie } from '@/pantallas/Conecta/EditarVehiculos/fetchReporteSerie';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import ValidaRut from '@/config/validaRut';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModalCrear,
    TextField,
    FormFieldsContainer,
    // AsociarMensajesForm,
    AsociarMensajesFormDetalle,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class VerEditarModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) nombre: any;
  @Prop({ default: null }) codigoVehiculo: any;
  @Prop({ default: null }) flota: any;
  @Prop({ default: null }) patente: any;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  vehiculosIdSeleccionar: number[] = [];
  etiquetasIdSeleccionar: number[] = [];
  flotasIdSeleccionar: number[] = [];
  correcto: boolean = true;
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  idRuta: number = null;
  demo: any = {};

  lstEventoMensajes: any[] = [];

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Editar Vehiculos',
      visible: true,
      step: 1,
      title: 'Asignación de Detalle Patente ' + this.patente,
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) nuncaEdit: boolean;
  cambio: boolean = false;
  vr: ValidaRut = new ValidaRut();
  anio: any = '';
  co2: any = '';
  dictionaryFormErrors: any = {};
  marcaslist: any[] = [];
  modelolist: any[] = [];
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly funcionalidad: Funcionalidades = Funcionalidades.EditarVehiculos;
  estadolist: any = [];
  fecha_sim: any = '';
  evt: any;
  validaDigitos: any = (rut: string): boolean => {
    let re: RegExp = new RegExp('^\\d+(\\.\\d+)?$');
    return re.test(rut);
  };
  async editar() {
    let self = this;
    this.loadingService.showLoading();
    this.anio = self.formFields.anio.value;
    this.co2 = self.formFields.co2.value;
    var y = new Date().getFullYear() + 1;
    const valideFields: boolean = await this.$validator.validateAll();
    if (valideFields) {
      if (
        !self.marcaslist.includes(self.formFields.marca.value) &&
        !self.modelolist.includes(self.formFields.modelo.value)
      ) {
        return fetchReportesSerie(
          {
            MODELO: self.formFields.modelo.value,
            MARCA: self.formFields.marca.value,
            AÑO: self.formFields.anio.value,
            VEHICULO: self.formFields.codigovehiculo.value,
            co2: self.formFields.co2.value || '',
          },
          'editar_vehiculos/crear_vehiculo'
        )
          .then((data: any) => {
            self.$snotify.success('El cambio ha sido realizado correctamente', {
              timeout: 3000,
            });
            this.handleCerrar();
          })
          .catch((error: any) => {
            if (self.formFields.modelo.value == '') {
              self.$snotify.error('El campo Modelo es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (self.formFields.marca.value == '') {
              self.$snotify.error('El campo Marca es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (self.formFields.anio.value == '') {
              self.$snotify.error('El campo Año es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (isNaN(Math.floor(this.anio))) {
              self.$snotify.error('El campo Año debe ser un número', {
                timeout: 3000,
              });

              return;
            }
            if (self.formFields.co2.value == '') {
              self.$snotify.error('El campo "Consumo de Co2" es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (isNaN(Math.floor(this.co2))) {
              self.$snotify.error(
                'El campo "Consumo de Co2" debe ser un número',
                {
                  timeout: 3000,
                }
              );

              return;
            }
            if (this.anio > y) {
              self.$snotify.error('El campo Año debe ser inferior al actual', {
                timeout: 3000,
              });

              return;
            } else {
              self.$snotify.error('Ha ocurrido un error, intente nuevamente', {
                timeout: 3000,
              });
              return;
            }
          })
          .finally(() => {
            this.loadingService.hideLoading();
            return null;
          });
      } else if (
        self.marcaslist.includes(self.formFields.marca.value) &&
        !self.modelolist.includes(self.formFields.modelo.value)
      ) {
        return fetchReportesSerie(
          {
            MODELO: self.formFields.modelo.value,
            MARCA: self.formFields.marca.value,
            AÑO: self.formFields.anio.value,
            VEHICULO: self.formFields.codigovehiculo.value,
            co2: self.formFields.co2.value || '',
          },
          'editar_vehiculos/crear_vehiculo_modelo'
        )
          .then((data: any) => {
            self.$snotify.success('El cambio ha sido realizado correctamente', {
              timeout: 3000,
            });
            this.handleCerrar();
          })
          .catch((error: any) => {
            if (self.formFields.modelo.value == '') {
              self.$snotify.error('El campo Modelo es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (self.formFields.marca.value == '') {
              self.$snotify.error('El campo Marca es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (self.formFields.anio.value == '') {
              self.$snotify.error('El campo Año es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (isNaN(Math.floor(this.anio))) {
              self.$snotify.error('El campo Año debe ser un número', {
                timeout: 3000,
              });

              return;
            }
            if (this.anio > y) {
              self.$snotify.error('El campo Año debe ser inferior al actual', {
                timeout: 3000,
              });

              return;
            }
            if (self.formFields.co2.value == '') {
              self.$snotify.error('El campo "Consumo de Co2" es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (isNaN(Math.floor(this.co2))) {
              self.$snotify.error(
                'El campo "Consumo de Co2" debe ser un número',
                {
                  timeout: 3000,
                }
              );

              return;
            } else {
              self.$snotify.error('Ha ocurrido un error, intente nuevamente', {
                timeout: 3000,
              });
            }
          })
          .finally(() => {
            this.loadingService.hideLoading();
            return null;
          });
      } else {
        return fetchReportesSerie(
          {
            MODELO: self.formFields.modelo.value,
            MARCA: self.formFields.marca.value,
            AÑO: self.formFields.anio.value,
            VEHICULO: self.formFields.codigovehiculo.value,
            co2: self.formFields.co2.value || '',
          },
          'editar_vehiculos/actualizar_vehiculo'
        )
          .then((data: any) => {
            self.$snotify.success('El cambio ha sido realizado correctamente', {
              timeout: 3000,
            });
            this.handleCerrar();
          })
          .catch((error: any) => {
            if (self.formFields.modelo.value == '') {
              self.$snotify.error('El campo Modelo es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (self.formFields.marca.value == '') {
              self.$snotify.error('El campo Marca es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (self.formFields.anio.value == '') {
              self.$snotify.error('El campo Año es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (isNaN(Math.floor(this.anio))) {
              self.$snotify.error('El campo Año debe ser un número', {
                timeout: 3000,
              });

              return;
            }
            if (this.anio > y) {
              self.$snotify.error('El campo Año debe ser inferior al actual', {
                timeout: 3000,
              });

              return;
            }
            if (self.formFields.co2.value == '') {
              self.$snotify.error('El campo "Consumo de Co2" es obligatorio', {
                timeout: 3000,
              });
              return;
            }
            if (isNaN(Math.floor(this.co2))) {
              self.$snotify.error(
                'El campo "Consumo de Co2" debe ser un número',
                {
                  timeout: 3000,
                }
              );

              return;
            } else {
              self.$snotify.error('Ha ocurrido un error, intente nuevamente', {
                timeout: 3000,
              });

              return;
            }
          })
          .finally(() => {
            this.loadingService.hideLoading();
            return null;
          });
      }
    }
    this.loadingService.hideLoading();
  }

  formFields: FormFieldDefMap = {
    codigovehiculo: {
      label: 'Código de Vehículo',
      id: this.codigoVehiculo,
      value: this.codigoVehiculo,
    },
    cliente: {
      label: 'Cliente',
      id: this.nombre,
      value: this.nombre,
    },
    nombreflota: {
      label: 'Nombre Flota',
      id: this.flota,
      value: this.flota,
    },
    patente: {
      label: 'Patente',
      id: this.patente,
      value: this.patente,
    },
    modelo: {
      label: 'Modelo',
      id: 'configid',
      value: '',
    },
    marca: {
      label: 'Marca',
      id: 'configid',
      value: '',
    },
    anio: {
      label: 'Año',
      id: '',
      value: '',
    },
    co2: {
      label: 'Emisión de Co2',
      id: 'co2',
      value: '',
    },
  };
  initialize() {
    this.getmarcas();
    let _self = this;
    Validator.extend('co2', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Co2 inválido';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: _self.validaDigitos(value),
            data: _self.validaDigitos(value)
              ? undefined
              : {
                  message: '* Co2 inválido',
                },
          });
        });
      },
    });
    this.dictionaryFormErrors = {
      custom: {
        ano: {
          required: () => config.errorMensajes.textoRequerido,
        },
        marca: {
          required: () => config.errorMensajes.textoRequerido,
        },
        modelo: {
          required: () => config.errorMensajes.textoRequerido,
        },
        co2: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  private registrarValidadores() {
    const self = this;

    const r = this.vr;
    Validator.extend('anioMaximo', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Año no puede ser mayor al próximo';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: r.validaAnioVehiculo(value),
            data: r.validaAnioVehiculo(value)
              ? undefined
              : { message: '* Año no puede ser mayor al próximo' },
          });
        });
      },
    });
    Validator.extend('anioMinimo', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* Año no puede ser menor a 1950';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: value >= 1950,
            data:
              value >= 1950
                ? undefined
                : { message: '* Año no puede ser menor a 1950' },
          });
        });
      },
    });
  }
  mounted() {
    this.initialize();
    this.registrarValidadores();
    this.handleVerDetalleClick_2();
    this.getmarcas();
  }
  async getmarcas() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { ClienteDefecto: JSON.parse(localStorage.getItem('clienteDefecto')) },
      'editar_vehiculos/marcas'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.marcaslist = data.data.MARCA;
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
  async getmodelos() {
    let self = this;
    self.formFields.modelo.value = '';
    if (!self.marcaslist.includes(self.formFields.marca.value)) {
      this.cambio = true;
      self.formFields.modelo.value = '';
      self.modelolist = [];
      return;
    }
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { MARCA: self.formFields.marca.value },
      'editar_vehiculos/modelo'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.modelolist = data.data.MODELO;
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
  handleVerDetalleClick_2() {
    let self = this;
    return fetchReportesSerie(
      {
        codigo_vehiculo: this.codigoVehiculo,
      },
      'editar_vehiculos/detalle_vehiculo_modelo'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.formFields.modelo.value = data.data.JINFO.jinfo.Modelo;
          self.formFields.marca.value = data.data.JINFO.jinfo.Marca;
          self.formFields.anio.value = data.data.JINFO.jinfo.Año;
          self.formFields.co2.value = data.data.JINFO.jinfo.Co2;
        } else {
          return;
        }
      })
      .catch((error: any) => {})
      .finally(() => {
        return null;
      });
  }
  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
/* RequerimientoGeneral: any[]=[]
  fecha_de_alta: any[]=[]
  adp: any[]=[]
  rut_cliente: any[]=[]
  cliente: any[]=[]
  flota: any[]=[]

  async getOrders_by_id(reporte_Seleccionado: any) {
    let self = this;
    this.loadingService.showLoading();
    
    return fetchReportesSerie(
      { "reporte_Seleccionado": reporte_Seleccionado },
      'ReportesSerie/informacion'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.fecha_de_alta = data.data.data[0].asigfecha_alta
          self.RequerimientoGeneral = data.data.data[0].asigrequerimiento
          self.adp = data.data.data[0].asigcrm_adp
          self.rut_cliente = data.data.data[0].asigcrm_rutcli
          self.cliente = data.data.data[0].asigcrm_cliente
          self.flota = data.data.data[0].asigcrm_flota
          
         
          return data.data.data;
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
  } */
</script>
<style></style>
