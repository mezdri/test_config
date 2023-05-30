<template>
  <div align="center">
    <v-flex>
      <v-form ref="form" lazy-validation class="col-md-12">
        <v-container grid-list-md text-xs-center>
          <StepTitle>Configurar Notificación</StepTitle>
          <v-divider></v-divider>
          <v-layout wrap>
            <v-flex sm12 md6>
              <v-select
                :items="lstTipoNotificacion"
                item-text="value"
                item-value="id"
                v-model="tipoNotificacion"
                @change="handledTipoNotificacion"
              />
            </v-flex>
            <v-flex xs12 sm6 md6>
              <BuscadorOperacionCrud
                v-show="tipoNotificacion == 1"
                :filter="
                  gridApiListaDistribucion &&
                    gridApiListaDistribucion.setQuickFilter.bind(
                      gridApiListaDistribucion
                    )
                "
              />
              <BuscadorOperacionCrud
                v-show="tipoNotificacion == 2"
                :filter="
                  gridApiContacto &&
                    gridApiContacto.setQuickFilter.bind(gridApiContacto)
                "
              />
              <BuscadorOperacionCrud
                v-show="tipoNotificacion == 3"
                :filter="
                  gridApiUsuario &&
                    gridApiUsuario.setQuickFilter.bind(gridApiUsuario)
                "
              />
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex md12>
              <v-card v-show="tipoNotificacion == 1">
                <AsociacionGrid
                  v-if="!modoVer"
                  :esEditar="modoEditar"
                  :headerCheckbox="true"
                  :grid-options="gridOptionsListaDistribucion"
                />
                <MantenedorGridVerDetalle
                  v-else
                  :grid-options="gridOptionsListaDistribucion"
                  :row-data="lstDistribucionSeleccionada"
                />
              </v-card>
              <v-card v-show="tipoNotificacion == 2">
                <AsociacionGrid
                  v-if="!modoVer"
                  :esEditar="modoEditar"
                  :headerCheckbox="true"
                  :grid-options="gridOptionsContacto"
                />
                <MantenedorGridVerDetalle
                  v-else
                  :grid-options="gridOptionsContacto"
                  :row-data="lstContactosSeleccionada"
                />
              </v-card>
              <v-card v-show="tipoNotificacion == 3">
                <AsociacionGrid
                  v-if="!modoVer"
                  :esEditar="modoEditar"
                  :headerCheckbox="true"
                  :grid-options="gridOptionsUsuarios"
                />
                <MantenedorGridVerDetalle
                  v-else
                  :grid-options="gridOptionsUsuarios"
                  :row-data="lstUsuariosSeleccionados"
                />
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
        <v-container style="padding: 0px 10px 0px 10px"> </v-container>
      </v-form>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import config from '@/config/index';
import store from '@/store';

import { ServicioProxy, TipoFrecuenciasCalendario } from '@/config/enums';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';

import CrearCalendarioModal from '@/pantallas/Alertas/CrearCalendarioModal.vue';
import { CalendarioNuevoForm } from '@/pantallas/Calendarios/Calendario';

import {
  fetchListDistrContactosUsuarios,
  ListDistrContactosUsuarios,
} from '@/reusable/ListDistrContactosUsuarios/fetchListDistrContactosUsuarios';

import { crearCalendario } from '@/pantallas/Alertas/Services/crearCalendario';
import { fetchCalendarios } from '@/pantallas/Alertas/Services/fetchCalendarios';
import { TipoNotificacion, AlertaBackend } from '@/interfaces/Alertas';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import { IConductor, IConductorCopiloto } from '@/interfaces/Conductores';

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    AsociacionGrid,
    MantenedorGridVerDetalle,
    AgregarButton,
    FormFieldsContainer,
    CrearCalendarioModal,
  },
})
export default class ConfigurarNotificacionForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() alertaSeleccionada: IConductorCopiloto;
  @Prop({default:false}) conductor:IConductor;
  @Prop() editItemCopiloto:IConductorCopiloto;

  @Prop() checkSelected: number[];

  formFields: FormFieldDefMap = {
    notificaEmail: {
      label: 'Email',
      id: 'notificaEmail',
      value: false,
    },
    notificaWhatsApp: {
      label: 'WhatsApp',
      id: 'notificaWhatsApp',
      value: false,
    },
    notificaSms: {
      label: 'SMS',
      id: 'notificaSms',
      value: false,
    },
  };

  lstTipoNotificacion: any = [
    {
      id: 1,
      value: 'Lista de Distribución',
    },
    {
      id: 2,
      value: 'Contactos',
    },
    {
      id: 3,
      value: 'Usuarios',
    },
  ];

  /* state */

  tipoNotificacion = 1;
  //mostrarModalCalendario: boolean = false;
  lstDistribucion: TipoNotificacion[] = [];
  lstDistribucionSeleccionada: TipoNotificacion[] = [];
  lstContactos: TipoNotificacion[] = [];
  lstContactosSeleccionada: TipoNotificacion[] = [];
  lstUsuarios: TipoNotificacion[] = [];
  lstUsuariosSeleccionados: TipoNotificacion[] = [];
  lstCalendario: CalendarioNuevoForm[] = [];
  lstCalendarioSeleccionado: CalendarioNuevoForm[] = [];

  axiosAlerta: AxiosVue = new AxiosVue(ServicioProxy.Alerta);

  conductorItem:IConductor;

  /* aggrid */

  gridApiListaDistribucion: GridApi = null;
  gridApiContacto: GridApi = null;
  gridApiUsuario: GridApi = null;
  gridApiCalendario: GridApi = null;

  /* template */

  readonly gridOptionsListaDistribucion: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipo',
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
      },
    ],
    onGridReady: this.handleGridListaDistribucionReady,
    onSelectionChanged: this.handleListaDistribucionCheck,
  };

  readonly gridOptionsContacto: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipo',
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
      },
    ],
    onGridReady: this.handleGridContactoReady,
    onSelectionChanged: this.handleContactoCheck,
  };

  readonly gridOptionsUsuarios: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipo',
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
      },
    ],
    onGridReady: this.handleGridUsuarioReady,
    onSelectionChanged: this.handleUsuarioCheck,
  };

  readonly gridOptionsCalendario: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombreCalendario',
        lockVisible: true,
      },
      {
        headerName: 'Frecuencia',
        field: 'frecuenciaSeleccionada',
        cellRenderer: (r: any) => {
          return TipoFrecuenciasCalendario[r.data.frecuenciaSeleccionada];
        },
      },
      {
        headerName: 'Fecha Inicio',
        field: 'fechaInicioTxt',
      },
      {
        headerName: 'Fecha Fin',
        field: 'fechaFinTxt',
      },
    ],
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  mounted() {
  
    this.conductorItem = this.conductor;
   

    this.handleFormChange(this.formFields);
    this.handleAlertaSeleccionadaChange();
    this.handleCopiloto();
  }

  /* Modo editar y ver */

  setListaDistribucionSeleccionadas() {
    this.lstDistribucionSeleccionada = [];
    if (this.alertaSeleccionada) {
      if (
        this.alertaSeleccionada.listaDistribucion &&
        this.alertaSeleccionada.listaDistribucion.length > 0
      ) {
        this.alertaSeleccionada.listaDistribucion.forEach(l => {
          this.lstDistribucionSeleccionada.push(
            this.lstDistribucion.find(c => c.id == l)
          );
          this.gridApiListaDistribucion.forEachNode(function(node: any) {
            if (node.data.id == l) {
              node.setSelected(true);
            }
          });
        });
      }
    }
  }

  setContactosSeleccionados() {
    this.lstContactosSeleccionada = [];
    if (this.alertaSeleccionada) {
      if (
        this.alertaSeleccionada.contactos &&
        this.alertaSeleccionada.contactos.length > 0
      ) {
        this.alertaSeleccionada.contactos.forEach(l => {
          this.lstContactosSeleccionada.push(
            this.lstContactos.find(c => c.id == l)
          );
          this.gridApiContacto.forEachNode(function(node: any) {
            if (node.data.id == l) {
              node.setSelected(true);
            }
          });
        });
      }
    }
  }

  setUsuariosSeleccionados() {
    this.lstUsuariosSeleccionados = [];
   
    if (this.alertaSeleccionada) {
      if (
        this.alertaSeleccionada.usuarios &&
        this.alertaSeleccionada.usuarios.length > 0
      ) {
        
        this.alertaSeleccionada.usuarios.forEach(l => {
          this.lstUsuariosSeleccionados.push(
            this.lstUsuarios.find(c => c.id == l)
          );
          this.gridApiUsuario.forEachNode(function(node: any) {
            if (node.data.id == l) {
              node.setSelected(true);
            }
          });
        });
      }
    }
  }

  // setCalendariosSeleccionados() {
  //   this.lstCalendarioSeleccionado = [];
  //   if (this.alertaSeleccionada) {
  //     if (this.alertaSeleccionada.notificacionCalendario) {
  //       this.alertaSeleccionada.notificacionCalendario.forEach(l => {
  //         this.lstCalendarioSeleccionado.push(
  //           this.lstCalendario.find(c => c.id == l)
  //         );
  //         this.gridApiCalendario.forEachNode(function(node: any) {
  //           if (node.data.id == l) {
  //             node.setSelected(true);
  //           }
  //         });
  //       });
  //     }
  //   }
  // }

  /* Tipo notificacion */

  async cargarListDistrContactosUsuarios() {
    const response = await this.fetchListDistrContactosUsuarios();
    if (!response) {
      return;
    }

   

    this.lstDistribucion = response.listaDistribucion;
    this.lstContactos = response.contactos;
    this.lstUsuarios = response.usuarios;

    this.gridApiListaDistribucion.setRowData(this.lstDistribucion);
    this.gridApiContacto.setRowData(this.lstContactos);
    this.gridApiUsuario.setRowData(this.lstUsuarios);

   
    this.setListaDistribucionSeleccionadas();
    this.setContactosSeleccionados();
    this.setUsuariosSeleccionados();
  }

  fetchListDistrContactosUsuarios() {
    this.loadingService.showLoading();
    return fetchListDistrContactosUsuarios()
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error(
              'Ocurrió un error al obtener lista de distribución'
            );
          }
        } else {
          this.$snotify.error(
            'Ocurrió un error al obtener lista de distribución'
          );
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async handleGridListaDistribucionReady(event: GridReadyEvent) {
    this.gridApiListaDistribucion = event.api;
    
    await this.cargarListDistrContactosUsuarios();
  }

  async handleGridContactoReady(event: GridReadyEvent) {
    this.gridApiContacto = event.api;
  }

  async handleGridUsuarioReady(event: GridReadyEvent) {
    this.gridApiUsuario = event.api;
  }

  handleListaDistribucionCheck() {
    var seleccion: number[] = [];
    if (this.gridApiListaDistribucion.getSelectedRows().length > 0) {
      this.gridApiListaDistribucion.getSelectedRows().forEach(d => {
        seleccion.push(d.id);
      });
    }

    this.$emit('distribucionSelect', seleccion, 1);
  }

  handleContactoCheck() {
    var seleccion: number[] = [];
    if (this.gridApiContacto.getSelectedRows().length > 0) {
      this.gridApiContacto.getSelectedRows().forEach(d => {
        seleccion.push(d.id);
      });
    }

    this.$emit('distribucionSelect', seleccion, 2);
  }

  handleUsuarioCheck() {
    var seleccion: number[] = [];
    if (this.gridApiUsuario.getSelectedRows().length > 0) {
      this.gridApiUsuario.getSelectedRows().forEach(d => {
        seleccion.push(d.id);
      });
    }

    this.$emit('distribucionSelect', seleccion, 3);
  }

  handledTipoNotificacion() {
    this.$emit('tipoNotificacionSeleccionado', this.tipoNotificacion);
  }

  /* Tipo de notificacion */

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
   
    emitFormChangeEvent(this.$emit.bind(this), {
      entity: {
        notificaGps: fields.notificaWhatsApp.value,
        notificaBrowser: fields.notificaSms.value,
        notificaEmail: fields.notificaEmail.value,
      } as AlertaBackend,
      validator: this.$validator,
      isDirty: Object.keys(this.fields).some(key => this.fields[key].dirty),
    });
  }

   @Watch('editItemCopiloto', { deep: true })
   handleCopiloto(){
      
     
     if(this.editItemCopiloto){
      if(this.gridApiUsuario!=null)this.gridApiUsuario.deselectAll();
       if(this.gridApiContacto!=null)this.gridApiContacto.deselectAll();
       if(this.gridApiListaDistribucion!=null)this.gridApiListaDistribucion.deselectAll();

       this.alertaSeleccionada = this.editItemCopiloto;
       
        /************** */
      this.setListaDistribucionSeleccionadas();
    this.setContactosSeleccionados();
    this.setUsuariosSeleccionados();
      /**************** */

      //this.handleAlertaSeleccionadaChange();
     }
   }

  @Watch('alertaSeleccionada', { deep: true })
  handleAlertaSeleccionadaChange() {
  
    if (this.alertaSeleccionada) {
      this.formFields.notificaWhatsApp.value = this.alertaSeleccionada.whatsApp;
      this.formFields.notificaSms.value = this.alertaSeleccionada.sms;
      this.formFields.notificaEmail.value = this.alertaSeleccionada.email;

     
    }
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  addCheck(check: boolean, tipoNotificacion: string) {
    if (check != null) {
     
      if (tipoNotificacion == 'notificaWhatsApp') {
        this.checkSelected.push(1);
      }
    } else {
      console.log('NOOOOO Seleccionado');
    }
  }
}
</script>
