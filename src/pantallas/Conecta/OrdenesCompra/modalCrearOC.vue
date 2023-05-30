<template>
  <ModalMantenedor :show="show" v-model="show">
    <CabeceraModal titulo="Orden de Compra" @cerrar="closeModal">
      <div
        class="numero_sim"
        style=" letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 16px; ;"
      >
        <div class="boton_crear" style="height: 37px;">
          <v-btn
            v-if="id_orden_compra == null"
            style="background-color:#ff6c00 !important; border-color:#ff6c00 !important; padding-right: 20px; display: block; margin: 0 0 0 auto;"
            color="primary"
            @click="crear()"
            class="icon"
          >
            <!-- <v-icon dark left style="color: black;">add_circle_outline</v-icon> -->
            <span style="color: white;" class="color-blanco">GUARDAR</span>
          </v-btn>

          <v-btn
            v-if="id_orden_compra != null"
            style="background-color:#ff6c00 !important; border-color:#ff6c00 !important; padding-right: 20px; display: block; margin: 0 0 0 auto; "
            color="primary"
            @click="editar()"
            class="icon"
          >
            <!-- <v-icon dark left style="color: black;">add_circle_outline</v-icon> -->
            <span style="color: white;" class="color-blanco"
              >GUARDAR CAMBIOS</span
            >
          </v-btn>
        </div>
      </div>
    </CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.informacionGeneral.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.informacionGeneral.visible"
          @click="handleInfoGeneral"
          color="primary"
          flat
          :value="pasos.informacionGeneral.step"
        >
          <span>Información General</span>
          <v-icon>info</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div align="center" class="cardnew" v-show="showInfo">
      <br />

      <div align="center" class="orden_compra">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-form ref="form" lazy-validation class="col-md-12">
              <v-container grid-list-md>
                <h1 v-if="id_orden_compra != null">
                  Editar Orden de Compra: {{ id_orden_compra }}
                </h1>
                <h1 v-if="id_orden_compra == null">
                  Crear Orden de Compra
                </h1>
                <FormFieldsContainer titulo="">
                  <!--  https://fonts.google.com/icons  -->

                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="valor_id_orden_compra"
                      prepend-icon="123"
                      color="primary"
                      label="Número"
                      @input=""
                      disabled
                    ></v-text-field>
                  </v-flex>

                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="descrip"
                      class="inputfieldform"
                      prepend-icon="description"
                      color="primary"
                      label="Descripción (Requerido)"
                      v-validate="'required'"
                      @input=""
                    >
                    </v-text-field>
                  </v-flex>

                  <v-flex sm3 md3>
                    <DatePicker
                      locale="es-cl"
                      class="inputfieldform"
                      v-model="fecha_alta"
                      color="primary"
                      label="Fecha emisión"
                      disabled
                      @input=""
                    >
                    </DatePicker>
                  </v-flex>

                  <v-flex sm3 md3>
                    <DatePicker
                      locale="es-cl"
                      class="inputfieldform"
                      v-model="fecha_llegada"
                      color="primary"
                      label="Fecha Llegada "
                      v-bind:disabled="id_orden_compra == null"
                      @input=""
                    >
                    </DatePicker>
                  </v-flex>

                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="rut_contable"
                      prepend-icon="person"
                      class="inputfieldform"
                      color="primary"
                      v-validate="'required'"
                      label="Cuenta costo (Requerido)"
                      @input=""
                    >
                    </v-text-field>
                  </v-flex>

                  <v-flex sm3 md3>
                    <v-autocomplete
                      item-text="proveedorrazon"
                      :items="lista_proveedores"
                      v-model="rut_proveedor"
                      class="inputfieldform"
                      item-value="proveedorrut"
                      label="Razón (Requerido)"
                      v-validate="'required'"
                      prepend-icon="supervisor_account"
                    >
                    </v-autocomplete>
                  </v-flex>

                  <v-flex sm3 md3>
                    <v-autocomplete
                      item-text="tipoeqname_inet"
                      :items="lista_equipos"
                      v-model="equipo"
                      class="inputfieldform"
                      item-value="tipoeqid"
                      label="Equipo (Requerido)"
                      v-validate="'required'"
                      prepend-icon="home_repair_service"
                    >
                    </v-autocomplete>
                  </v-flex>

                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="cantidad"
                      class="inputfieldform"
                      prepend-icon="production_quantity_limits"
                      color="primary"
                      label="Cantidad (Requerido)"
                      v-validate="'required|validateNumberAndSemicolon'"
                      :error-messages="errors.collect('canti')"
                      data-vv-name="canti"
                      @input=""
                    >
                    </v-text-field>
                  </v-flex>

                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="precio"
                      prepend-icon="price_change"
                      color="primary"
                      class="inputfieldform"
                      label="Precio (Requerido)"
                      v-validate="'required|validateNumberAndSemicolon'"
                      :error-messages="errors.collect('precio')"
                      data-vv-name="precio"
                      @input=""
                    >
                    </v-text-field>
                  </v-flex>

                  <!-- 
                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="INETBodega"
                      prepend-icon="warehouse"
                      color="primary"
                      class="inputfieldform"
                      label="INETBodega"
                      disabled
                      @input=""
                    >
                    </v-text-field>
                  </v-flex>
                  -->

                  <!--
                  <v-flex sm3 md3>
                    <v-text-field
                      v-model="INETCuenta"
                      prepend-icon="warehouse"
                      color="primary"
                      class="inputfieldform"
                      label="INETCuenta"
                      :error-messages="errors.collect('cuentainet')"
                      data-vv-name="cuentainet"
                      disabled
                      @input=""
                    >
                    </v-text-field>
                  </v-flex>
                  -->

                  <!--
                  <v-flex sm3 md3>

                    <v-autocomplete
                      item-text="key"
                      item-value="value"
                      :items="lista_InetOpera"
                      v-model="opera"
                      class="inputfieldform"
                      
                      label="Opera"
                      v-validate="'required'"
                      prepend-icon="warehouse"
                      data-vv-name="codopera"
                      :error-messages="errors.collect('codopera')"
                    >
                    </v-autocomplete>
                  </v-flex>
                  -->

                  <v-flex sm3 md3>
                    <v-autocomplete
                      item-text="configvalor"
                      :items="lista_estados"
                      v-model="estado"
                      item-value="configid"
                      class="inputfieldform"
                      v-validate="'required'"
                      label="Estado (Requerido)"
                      prepend-icon="book"
                      :disabled="bloquea_dropdown_estado == true"
                    ></v-autocomplete>
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </div>
    </div>

    <!-- INICIO DIALOG CONFIRM-->
    <app-confirmacion
      :show="mostrarModalCONFIRMAR"
      :titulo="$t('Confirmación')"
      :mensaje="Modal_confirmar_TEXTO"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    />
    <!-- FIN DIALOG CONFIRM-->
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

import { AlertaGrilla } from '@/pantallas/Camaras/Alertas/fetchAlerta';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import moment from 'moment';
import { fetchOrdenesCompra } from './fetchOrdenesCompra';
import Confirmation from '@/components/Confirmation.vue';
import ValidaRut from '@/config/validaRut';
import config from '@/config/index';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    FormFieldsContainer,
    DatePicker,
    'app-confirmacion': Confirmation,
  },
})
export default class modalCrearOC extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: false }) dialog: boolean;
  @Prop({ default: null }) id_orden_compra: any; // VALOR RECIBIDO DESDE LA PANTALLA ANTERIOR. LO USAMOS PARA VER SI ES CREACION O EDICION
  @Prop({ default: null }) valor_id_orden_compra: any; //valor con el id. calculado por un MS (get_proximo_id_ms) usado para cargar el id que usara en el textbox y el es valor que se envia en el crear
  //@Prop({ default: null }) po_sel: any;

  @Prop({ default: null }) descrip: any;
  @Prop({ default: null }) fecha_alta: any;
  @Prop({ default: null }) fecha_llegada: any;
  @Prop({ default: null }) rut_contable: any;
  @Prop({ default: null }) rut_proveedor: any;
  @Prop({ default: null }) equipo: any;
  //@Prop({ default: null }) IdProv: any;
  @Prop({ default: null }) cantidad: any;
  @Prop({ default: null }) precio: any;
  //@Prop({ default: null }) INETBodega: any;
  //@Prop({ default: null }) INETCuenta: any;
  //@Prop({ default: null }) opera: any;
  @Prop({ default: null }) estado: any;
  @Prop({ default: null }) lista_equipos: any;
  @Prop({ default: null }) lista_estados: any;
  @Prop({ default: null }) lista_proveedores: any;
  lista_InetOpera: any = [];
  bloquea_dropdown_estado: boolean = false;

  archivoB64: any = '';
  fileName: any = '';
  mostrarModalCONFIRMAR: boolean = false;
  Modal_confirmar_TEXTO: any = '';
  dictionaryFormErrors: any = {};
  vr: ValidaRut = new ValidaRut();

  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };

  showInfo: boolean = true;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  async confirmCallback(val: boolean) {
    console.log('confirmCallback', val);
    if (val == true) {
      this.handle_MS_editar();
    } else {
      this.mostrarModalCONFIRMAR = false;
    }
  }

  handleInfoGeneral() {
    this.showInfo = true;
  }
  editar() {
    // en el click solo muestro el modal de confirmacion
    this.mostrarModalCONFIRMAR = true;
    //en el callback del editar llamo handle_MS_editar que va al microservicio

    this.Modal_confirmar_TEXTO =
      '¿Está seguro que desea editar la orden de compra ' +
      this.id_orden_compra +
      ' ?';
    if (this.estado == 5) {
      this.Modal_confirmar_TEXTO =
        '¿Está seguro que desea Anular la orden de compra ' +
        this.id_orden_compra +
        ' ?';
    }
  }

  getCliente() {
    /*  TODO VERIFICAR */
    let user = localStorage.getItem('user');
    let clienteDefecto = JSON.parse(
      localStorage.getItem('user').replace(/'/g, '"')
    ).clienteDefecto;
    return clienteDefecto;
  }

  async handle_MS_editar() {
    this.loadingService.showLoading(undefined, 'editar');
    return fetchOrdenesCompra(
      {
        id_orden_compra: this.id_orden_compra, //USAMOS EL VALOR QUE VIENE DESDE LA PANTALLA ANTERIOR
        descrip: this.descrip,
        fecha_alta: this.fecha_alta,
        fecha_llegada: this.fecha_llegada,
        rut_contable: this.rut_contable,
        rut_proveedor: this.rut_proveedor,
        equipo: this.equipo,
        cantidad: this.cantidad,
        precio: this.precio,
        estado: this.estado,
        user_id: this.getUserID(),
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/editar'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('editar');
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          this.$snotify.success(data.data.MENSAJE_RESPUESTA);
        }

        this.closeModal();
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async prefill_dropdowns() {
    const EQ = await this.getEqupos();
    this.lista_equipos = EQ.LISTA;

    const EST = await this.get_lista_estados();
    this.lista_estados = EST.LISTA;

    const PROV = await this.get_lista_proveedores();
    this.lista_proveedores = PROV.LISTA;
    console.log(this.lista_estados);

    const PROXIMO_ID = await this.get_proximo_id_ms();

    //const GET_INET = await this.get_configs_inet();
  }

  async pull_data_from_orden_compra() {
    const OC = await this.getOrders_by_id(this.id_orden_compra);
    console.log(OC.LISTA);
    this.id_orden_compra = OC['Compra Número'];
    this.valor_id_orden_compra = OC['Compra Número'];
    this.descrip = OC['Descripción'];
    this.fecha_alta = moment(OC['Fecha Emisión'], 'YYYY-MM-DD');
    this.fecha_llegada = moment(OC['Fecha Llegada'], 'YYYY-MM-DD');
    this.rut_contable = OC['Cuenta Costo'];
    this.rut_proveedor = OC['Rut Proveedor'];
    this.equipo = OC['tipoeq'];
    this.cantidad = OC['Cantidad Solicitada'];
    this.precio = OC['Precio'];
    this.estado = OC['Estado'];
  }

  mounted() {
    console.log('onDialogChanged');
    console.log('abro modal');
    this.initialize();
    this.registrarValidadores();
    this.prefill_dropdowns();
    if (this.id_orden_compra) {
      this.pull_data_from_orden_compra();
    }
  }

  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    console.log(id);
    return id;
  }

  crear() {
    if (this.validavacios() == false) {
      return 0;
    }

    this.loadingService.showLoading(undefined, 'crear');
    return fetchOrdenesCompra(
      {
        id_orden_compra: this.valor_id_orden_compra, //MANDAMOS EL VALOR DEL TEXTBOX CON EL ID
        descrip: this.descrip,
        fecha_alta: this.fecha_alta,
        fecha_llegada: this.fecha_llegada,
        rut_contable: this.rut_contable,
        rut_proveedor: this.rut_proveedor,
        equipo: this.equipo,
        cantidad: this.cantidad,
        precio: this.precio,
        estado: this.estado,
        user_id: this.getUserID(),
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/crear'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('crear');
        if (Number(data.data.CODIGO_RESPUESTA) > 1) {
          this.$snotify.error(data.data.MENSAJE_RESPUESTA);
        } else {
          this.$snotify.success(data.data.MENSAJE_RESPUESTA);
        }

        this.closeModal();
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async getEqupos() {
    this.loadingService.showLoading(undefined, 'getEqupos');
    return fetchOrdenesCompra(
      {
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaGetTipoEQ'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('getEqupos');
        const obj: any = data.data.data;

        return obj;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async getOrders_by_id(oc: any) {
    this.loadingService.showLoading(undefined, 'getOrders_by_id');
    console.log('getOrders con id ' + oc);
    return fetchOrdenesCompra(
      {
        id_orden_compra: oc,
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
        orden_compra: this.id_orden_compra,
        not_filtered: true,
      },
      'conectaOrdenesCompra'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('getOrders_by_id');
        return data.data.data;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async get_lista_proveedores() {
    console.log('get_lista_proveedores ');
    this.loadingService.showLoading(undefined, 'get_lista_proveedores');
    return fetchOrdenesCompra(
      {
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
      },
      'conectaOrdenesCompra/get_lista_proveedores'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('get_lista_proveedores');
        return data.data.PROVEEDORES;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  async get_lista_estados() {
    console.log('get_lista_estados ');
    this.loadingService.showLoading(undefined, 'get_lista_estados');
    return fetchOrdenesCompra(
      {
        id_usuario: this.getUserID(),
        id_cliente: this.getCliente(),
        modulo_id: '147',
        id_orden_compra: this.id_orden_compra,
      },
      'conectaOrdenesCompra/get_lista_estados'
    )
      .then((data: any) => {
        this.loadingService.hideLoading('get_lista_estados');
        console.log('bloquea_dropdown=' + data.data.bloquea_dropdown);
        if (data.data.bloquea_dropdown == true) {
          this.bloquea_dropdown_estado = true;
        }
        return data.data.ESTADOS;
      })
      .catch((error: any) => {
        return null;
      })
      .finally(() => {
        return null;
      });
  }

  inputdate() {
    console.log(this.show);
    console.log('inputdate');
  }

  closeModal() {
    console.log('closeModal');
    this.$emit('modalOrdenCompraEmit', false);
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        precio: {
          required: () => config.errorMensajes.textoRequerido,
          numeric: config.errorMensajes.soloNumeros,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  } //end initialize()

  private registrarValidadores() {
    const self = this;
    Validator.extend('validateNumberAndSemicolon', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) || '* El campo solo puede incluir números'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: /^[0-9,.]*$/.test(value),
            data:
              value == true
                ? undefined
                : {
                    message: '* El campo solo puede incluir números',
                  } /*  podria ir disabled del boton enviar */,
          });
        });
      },
    });
    Validator.extend('canti', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) || '* El campo solo puede incluir números'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: /^[0-9,.]*$/.test(value),
            data:
              value == true
                ? undefined
                : {
                    message: '* El campo solo puede incluir número',
                  },
          });
        });
      },
    });
    Validator.extend('codopera', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) || '* El campo solo puede incluir números'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: /^[0-9]*$/.test(value),
            data:
              value == true
                ? undefined
                : {
                    message: '* El campo solo puede incluir número',
                  },
          });
        });
      },
    });
  } // end regitrarValidadores

  validavacios() {
    var OK = true;
    /*
    if (this.PO == null) {
      this.$snotify.error('Número de Orden de Compra es mandatorio');
      OK = false;
      return OK;
    }
    */
    if (this.descrip == null) {
      this.$snotify.error('Descripción es mandatorio');
      OK = false;
      return OK;
    }

    /*
    if(this.fecha_alta==null){
      this.$snotify.error("Fecha de alta es mandatoria")
      OK=false;
    }
    if(this.fecha_llegada==null){
      this.$snotify.error("Fecha de Llegada es mandatoria")
      OK=false;
      return OK;
    }
    */

    if (this.rut_contable == null) {
      this.$snotify.error('Cuenta costo es mandatorio');
      OK = false;
      return OK;
    }
    if (this.rut_proveedor == null) {
      this.$snotify.error('Razón es mandatorio');
      OK = false;
      return OK;
    }
    if (this.equipo == null) {
      this.$snotify.error('Equipo es mandatoria');
      OK = false;
      return OK;
    }
    if (this.cantidad == null) {
      this.$snotify.error('Cantidad es mandatorio');
      OK = false;
      return OK;
    }
    if (this.precio == null) {
      this.$snotify.error('Precio es mandatorio');
      OK = false;
      return OK;
    }

    if (this.estado == null) {
      this.$snotify.error('Estado es mandatorio');
      OK = false;
      return OK;
    }
    return OK;
  } // end validavacios

  async get_proximo_id_ms() {
    if (this.id_orden_compra == null) {
      this.loadingService.showLoading(undefined, 'get_proximo_id_ms');
      return fetchOrdenesCompra(
        {
          id_usuario: this.getUserID(),
          id_cliente: this.getCliente(),
          modulo_id: '147',
        },
        'conectaOrdenesCompra/get_proximo_id_ms'
      )
        .then((data: any) => {
          if (Number(data.data.CODIGO_RESPUESTA) > 1) {
            this.$snotify.error(data.data.MENSAJE_RESPUESTA);
          } else {
            this.valor_id_orden_compra = data.data.data;
          }
          this.loadingService.hideLoading('get_proximo_id_ms');
          return data.data;
        })
        .catch((error: any) => {
          return null;
        })
        .finally(() => {
          return null;
        });
    } else {
      console.log('no need for getting id');
    }
  }
}
</script>
