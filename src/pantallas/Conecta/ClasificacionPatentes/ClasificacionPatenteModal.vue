<template>
  <div>
    <!-- TODO cada step deberia ser un componente -->
    <v-dialog v-model="isDialogOpen" fullscreen>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="close()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Clasificacion Patentes
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>

        <v-card-text>
          <v-stepper v-model="step">
            <v-stepper-header>
              <v-stepper-step :complete="step > 1" step="1"
                >{{ labelStepper }}
              </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step :complete="step > 2" step="2"
                >Confirmar Datos
              </v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card class="mb-5">
                  <v-container>
                    <v-layout
                      align-space-around
                      justify-center
                      column
                      fill-height
                    >
                      <v-flex xs12 sm6 md12>
                        <v-text-field
                          label="Id Dispositivo"
                          disabled
                          v-model="dataGrid.id_dispositivo"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md12>
                        <v-text-field
                          label="Número Serie"
                          v-model="nro_serie"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md12>
                        <v-text-field
                          label="Sufijo Patente"
                          v-model="suf_patente"
                        ></v-text-field>
                      </v-flex>
                      <div v-if="!isConfiguration">
                        <v-flex xs12 sm6 md12 v-if="showPatentesAsignadas">
                          <h4 style="font-weight: normal;">
                            Patentes asignadas actualmente:
                          </h4>
                        </v-flex>

                        <v-flex xs12 sm6 md12 v-if="showPatentesAsignadas">
                          <v-select
                            v-model="patentes_existentes_selected"
                            :items="patentes_existentes"
                            attach
                            chips
                            label="Patentes"
                            multiple
                            item-text="nombre"
                            item-value="id"
                          ></v-select>
                        </v-flex>

                        <br /><br />
                        <v-flex xs12 sm6 md12>
                          <h4 style="font-weight: normal;">
                            Nueva Clasificación
                          </h4>
                        </v-flex>

                        <v-flex xs12 sm6 md12>
                          <v-radio-group v-model="tipoAsignacion" row>
                            <v-radio label="Cliente" value="cliente"></v-radio>
                            <v-radio
                              label="Flota/Patente"
                              value="flota"
                            ></v-radio>
                          </v-radio-group>
                        </v-flex>

                        <v-flex
                          xs12
                          sm6
                          md12
                          v-if="tipoAsignacion == 'cliente'"
                        >
                          <v-autocomplete
                            v-model="cliente"
                            :items="allClientes"
                            label="Cliente"
                            item-text="nombre"
                            item-value="id"
                          ></v-autocomplete>
                          <!--FlotaFilterAutocomplete v-model="flota" /-->
                        </v-flex>

                        <v-flex xs12 sm6 md12 v-if="tipoAsignacion == 'flota'">
                          <v-autocomplete
                            v-model="flota"
                            :items="allFlota"
                            @change="watchFlota"
                            label="Flota"
                            item-text="nombre"
                            item-value="id"
                          ></v-autocomplete>
                          <h5
                            style="color: red"
                            v-show="!flota && tipoAsignacion == 'flota'"
                          >
                            Si no encuentra la flota dentro del listado. Debe ir
                            a asignar la flota a un cliente en "<a
                              href="/Flota-Vehiculo"
                              >Configuración Flota Vehiculo</a
                            >"
                          </h5>
                          <!--FlotaFilterAutocomplete v-model="flota" /-->
                        </v-flex>
                        <v-flex
                          v-if="
                            flota &&
                              itemsCodVehiculo.length > 0 &&
                              tipoAsignacion == 'flota'
                          "
                          xs12
                          sm6
                          md12
                        >
                          <v-autocomplete
                            v-model="codVehiculoSelected"
                            :items="itemsCodVehiculo"
                            label="Patente"
                            item-text="patente_vehiculo"
                            item-value="id"
                            return-object
                          ></v-autocomplete>
                          <h5 style="color: red">
                            Si no encuentra la pantente y la camara no tendrá
                            GPS. Debe crear el vehículo en "<a
                              href="/Clasificacion-Patentes-Camaras"
                              >Configuración Plataforma/Vehiculo</a
                            >"
                          </h5>
                        </v-flex>
                      </div>
                    </v-layout>
                  </v-container>
                </v-card>
                <v-btn flat @click="close()">Cancelar</v-btn>
                <v-btn color="primary" @click="initStepDos()">
                  Continuar
                </v-btn>
              </v-stepper-content>

              <v-stepper-content step="2">
                <v-container>
                  <v-layout align-center justify-center row fill-height>
                    <v-flex xs12 sm12 md12>
                      <v-card class="mb-5" height="300px">
                        <v-container>
                          <v-layout
                            align-center
                            justify-center
                            column
                            fill-height
                          >
                            <v-input>
                              <h3>Id Camara:</h3>
                              <span style="padding-left: 10px;">{{
                                idCamara
                              }}</span>
                            </v-input>
                            <v-input>
                              <h3>Nro Serie:</h3>
                              <span style="padding-left: 10px;">{{
                                nro_serie
                              }}</span>
                            </v-input>
                            <v-input>
                              <h3>Sufijo Patente:</h3>
                              <span style="padding-left: 10px;">{{
                                suf_patente
                              }}</span>
                            </v-input>
                            <v-input>
                              <h3>Marca:</h3>
                              <span style="padding-left: 10px;">{{
                                dataGrid.marca
                              }}</span>
                            </v-input>
                            <v-input v-if="tipoAsignacion == 'cliente'">
                              <h3>Cliente:</h3>
                              <span style="padding-left: 10px;">{{
                                nombreClienteSeleccionado
                              }}</span>
                            </v-input>
                            <v-input v-if="tipoAsignacion == 'flota'">
                              <h3>Flota:</h3>
                              <span style="padding-left: 10px;">{{
                                nombreFlotaSeleccionada
                              }}</span>
                            </v-input>
                            <v-input v-if="tipoAsignacion == 'flota'">
                              <h3>Vehiculo:</h3>
                              <span style="padding-left: 10px;">{{
                                codVehiculoSelected.patente_vehiculo
                              }}</span>
                            </v-input>
                            <v-input v-if="showPatentesAsignadas">
                              <h3>Asignación Actual:</h3>
                              <span style="padding-left: 10px;">{{
                                descPatentesExistentes
                              }}</span>
                            </v-input>
                          </v-layout>
                        </v-container>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>

                <v-btn flat @click="step = 1">Volver</v-btn>
                <v-btn color="primary" @click="saveData()">
                  Guardar
                </v-btn>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { ClasificacionPatentes } from './ClasificacionPatentesService';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { FlotaFilterI, VehiculoFilterI } from '@/interfaces/Filters';
//import FlotaFilterAutocomplete from '@/components/Filters/FlotaFilterAutocomplete.vue';
import { LoadingService } from '@/services/loadingService';
import {
  DataAsociadaDispositivoI,
  DataBitacoraI,
  DataClasificadaI,
  EsquemaFlotaI,
  FlotasI,
  Flotas,
} from './ClasificacionPatentesInterfaces';

@Component({
  components: {
    //FlotaFilterAutocomplete,
  },
})
export default class ClasificacionPatenteModal extends Vue {
  clasificacionPatentes = new ClasificacionPatentes();
  headers: string[];
  desserts: string[];
  idCamara: string = '';
  step: number = 0;
  itemsFlota: DataAsociadaDispositivoI[] = [];
  itemsCodVehiculo: VehiculoFilterI[] = [];
  flota: string = '';
  allFlota: any[] = [{ id: '', nombre: '' }];
  cliente: string = '';
  allClientes: any[] = [{ id: '', nombre: '' }];
  labelStepper: string = 'Seleccione una flota y un vehiculo';

  flota_selected: any[] = [{ id: '', nombre: '' }];
  itemsEsquemas: string[] = [];
  esquemaSelected: string = '';
  codVehiculoSelected: VehiculoFilterI = {
    id: '',
    cod_vehiculo: '',
    cod_flota: '',
    patente_vehiculo: '',
  };
  isDisabledBoton: boolean = true;
  continuarBoton1: boolean = true;
  continuarBoton2: boolean = true;
  dataSend: any = {};
  nom_flota!: DataAsociadaDispositivoI;
  $snotify: any;

  dataBitacora: DataBitacoraI = {
    user_id: this.currentUser,
  };

  isDialogOpen: boolean = false;
  isClosed: boolean = false;

  patentes_existentes: any[] = [];
  patentes_existentes_selected: any[] = [];
  showPatentesAsignadas: boolean = false;
  tipoAsignacion: string = '';
  nombreFlotaSeleccionada: string = '';
  nombreClienteSeleccionado: string = '';
  descPatentesExistentes: string = '';
  nro_serie: string = '';
  suf_patente: string = '';
  esquemas: string = '';

  readonly loadingService = new LoadingService();

  @Prop() triggerDialogOpen: boolean = false;
  @Prop() dataGrid: any;
  @Prop({ default: false }) isConfiguration: boolean;

  @Watch('isConfiguration', { immediate: true })
  onModuleChanged() {
    this.labelStepper = this.isConfiguration
      ? 'Seleccione un Nro de serie y Sufijo de patente para el dispositivo'
      : 'Seleccione una flota y un vehiculo';
  }

  async open() {
    console.log(this.dataGrid);
    this.isDialogOpen = true;
    this.isClosed = false;
    this.idCamara = this.dataGrid.id_dispositivo;
    this.nro_serie = this.dataGrid.nro_serie;
    this.suf_patente = this.dataGrid.suf_patente;
    this.esquemas = this.dataGrid.esquemas;

    if (this.dataGrid.identifier !== undefined) {
      this.showPatentesAsignadas = true;
      this.patentes_existentes = this.dataGrid.identifier
        .split(',')
        .map((x: any) => {
          let y = x.split('##');
          return { id: y[1] + '__' + y[2], nombre: y[0] + ' - ' + y[3] };
        });
      this.patentes_existentes_selected = this.patentes_existentes.map(
        (x: any) => x.id
      );
    } else {
      this.showPatentesAsignadas = false;
    }
    await this.getAllFlotas();
    await this.getAllClientes();
    await this.loadSchema();
  }

  async loadSchema() {
    if (this.esquemas != '' || this.esquemas != undefined) {
      let formatSchema: string = '';
      console.log('Esquemas: ' + this.esquemas);
      let schemaList: string[] = this.esquemas.split(' ');
      for (let schema of schemaList) {
        formatSchema = schema.replaceAll("'", '').replaceAll('rut_', '');
        break;
      }
      console.log('formatSchema: ' + formatSchema);
      let client: any = this.allClientes.find((client: any) =>
        client.id.toString().includes(formatSchema)
      );
      console.log(client);
      if (client != undefined) {
        this.tipoAsignacion = 'cliente';
        this.cliente = client.id;
      }
    }
  }

  close() {
    this.step = 1;
    this.isClosed = true;
    this.flota = '';
    this.codVehiculoSelected = {
      id: '',
      cod_vehiculo: '',
      cod_flota: '',
      patente_vehiculo: '',
    };
    this.isDialogOpen = false;
    this.tipoAsignacion = '';
    this.patentes_existentes_selected = [];
    this.patentes_existentes = [];
    this.showPatentesAsignadas = false;
    this.descPatentesExistentes = '';
    this.nombreClienteSeleccionado = '';
    this.nombreFlotaSeleccionada = '';
    this.nro_serie = '';
    this.suf_patente = '';
  }

  get currentUser() {
    return this.$store.state.user.id;
  }

  initStepDos() {
    // if (this.tipoAsignacion == 'cliente' && this.cliente == '') {
    //   this.$snotify.error('Debe seleccionar un cliente para asignar', {
    //     timeout: 3000,
    //   });
    //   return false;
    // }

    if (
      this.tipoAsignacion == 'flota' &&
      (this.flota == '' || this.codVehiculoSelected.id == '')
    ) {
      this.$snotify.error('Debe seleccionar una flota/patente para asignar', {
        timeout: 3000,
      });
      return false;
    }

    //this.showPatentesAsignadas = true;
    //this.patentes_existentes

    this.step = 2;
    //this.getEsquemaFlota(this.flota);
  }

  validationBoton1() {
    if (this.flota && this.codVehiculoSelected) {
      this.continuarBoton1 = false;
    }
  }

  validationBoton2() {
    if (this.esquemaSelected != '') {
      this.continuarBoton2 = false;
    }
  }

  async saveData() {
    //TODO change this
    this.dataSend = {
      id_camara: this.idCamara,
      patente: this.codVehiculoSelected.patente_vehiculo,
      flota: this.flota,
      cliente: this.cliente,
      tipoAsignacion: this.tipoAsignacion,
      patentes_existentes_selected: this.patentes_existentes_selected,
      nro_serie: this.nro_serie,
      suf_patente: this.suf_patente,
    };
    var axiosResponse: AxiosResponse<MSResponse<FlotasI>>;
    if (this.isConfiguration) {
      axiosResponse = await this.clasificacionPatentes.postDataConfig(
        this.dataSend
      );
    } else {
      axiosResponse = await this.clasificacionPatentes.postDataClasificada(
        this.dataSend
      );
    }
    const msResponse: MSResponse<FlotasI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.$snotify.success(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.close();
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
  }

  async getAllFlotas() {
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<Flotas>
    > = await this.clasificacionPatentes.getAllFlotas();
    const msResponse: MSResponse<Flotas> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.allFlota = msResponse.data;
      this.loadingService.hideLoading();
    } else {
      this.allFlota = [];
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
    }
  }

  async getAllClientes() {
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<Flotas>
    > = await this.clasificacionPatentes.getAllClientes();
    const msResponse: MSResponse<Flotas> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.allClientes = msResponse.data;
      this.loadingService.hideLoading();
    } else {
      this.allClientes = [];
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
    }
  }

  async getDataAsociadaDispositivo(idCamara: any) {
    const axiosResponse: AxiosResponse<
      MSResponse<DataAsociadaDispositivoI>
    > = await this.clasificacionPatentes.getDataAsociadaDispositivo(idCamara);
    const msResponse: MSResponse<DataAsociadaDispositivoI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.itemsFlota = msResponse.data;
    } else {
      this.itemsFlota = [];
      this.itemsCodVehiculo = [];
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
    }
  }

  async getEsquemaFlota(cod_flota: any) {
    const axiosResponse: AxiosResponse<
      MSResponse<EsquemaFlotaI>
    > = await this.clasificacionPatentes.getEsquemaFlota(cod_flota);
    const msResponse: MSResponse<EsquemaFlotaI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.itemsEsquemas = msResponse.data.map(item => item.esquema_bd);
      if (this.itemsEsquemas[0] === '') {
        this.getEsquemaBD();
      }
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      //TODO agregar notificacion notify
    }
  }

  async getEsquemaBD() {
    const axiosResponse: AxiosResponse<
      MSResponse<EsquemaFlotaI>
    > = await this.clasificacionPatentes.getEsquemaBD();
    const msResponse: MSResponse<EsquemaFlotaI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.itemsEsquemas = msResponse.data.map(item => item.esquema_bd);
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      //TODO agregar notificacion notify
    }
  }

  async getVehicles() {
    this.loadingService.showLoading();

    const axiosResponse: AxiosResponse<
      MSResponse<VehiculoFilterI>
    > = await this.clasificacionPatentes.getVehiculos(this.flota);
    const msResponse: MSResponse<VehiculoFilterI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA == '1') {
      this.itemsCodVehiculo = msResponse.data;
      this.continuarBoton1 = false;
      this.loadingService.hideLoading();
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      //TODO agregar notificacion notify
      this.itemsCodVehiculo = [];
      this.continuarBoton1 = true;
      this.loadingService.hideLoading();
    }
  }

  @Watch('triggerDialogOpen')
  watchTriggerDialogOpen() {
    this.open();
  }

  watchFlota() {
    console.log('Presionó flota!!');
    console.log(this.isClosed);
    if (!this.isClosed) {
      let that = this;
      this.nombreFlotaSeleccionada = this.allFlota
        .filter((x: any) => x.id == that.flota)
        .map((x: any) => x.nombre)[0];
      this.getVehicles();
    } else {
      this.isClosed = false;
    }
  }

  @Watch('patentes_existentes_selected')
  watchPatExistentes() {
    let that = this;
    this.descPatentesExistentes = '';
    let arrayP = [];
    //for(let v of this.patentes_existentes_selected){
    //  this.descPatentesExistentes += ','+ this.patentes_existentes.filter( (x:any) => x.id==v.id).map( (x:any) =>x.nombre.split('-')[0]).toString();
    //}
    for (let v of this.patentes_existentes_selected) {
      arrayP.push(
        this.patentes_existentes
          .filter((x: any) => x.id == v)
          .map((x: any) => x.nombre.split('-')[0])[0]
      );
    }
    this.descPatentesExistentes = arrayP.join(', ');
  }

  @Watch('cliente')
  watchCliente() {
    let that = this;
    this.nombreClienteSeleccionado = this.allClientes
      .filter((x: any) => x.id == that.cliente)
      .map((x: any) => x.nombre)[0];
  }

  @Watch('tipoAsignacion')
  watchTipoAsignacion() {
    //console.log(this.tipoAsignacion);
  }
}
</script>
<style>
.boton {
  background-color: #ffe800 !important;
  color: black !important;
}
</style>
