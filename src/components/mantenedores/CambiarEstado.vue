<template>
  <v-layout row justify-center>
    <v-dialog v-model="show" persistent max-width="650">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeModal(false)">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title
            style="font-size:17px;margin-left: 10px !important"
            >{{ titulo }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="form" v-model="validForm" lazy-validation>
            <v-layout row wrap class="light--text">
              <v-flex xs7>
                <br />
                <span
                  >El estado de las siguientes registros será cambiado a</span
                >
              </v-flex>
              <v-flex xs5>
                <v-select
                  :items="estados"
                  item-text="nombre"
                  item-value="id"
                  label="Estados"
                  v-validate="'required'"
                  v-model="selectedEstado"
                  :error-messages="errors.collect('estado')"
                  data-vv-name="estado"
                  required
                ></v-select>
              </v-flex>
            </v-layout>
          </v-form>
          <br />
          <v-divider></v-divider>
          <v-layout row wrap>
            <v-flex md12>
              <ag-grid-vue
                style="width: 100%; height: 250px; font-family: 'Asap', sans-serif;"
                class="ag-theme-material"
                :columnDefs="columnsDefs"
                :rowData="data"
                pagination="true"
                paginationPageSize="10"
                :localeText="localeText"
                :rowHeight="40"
                :gridReady="onGridReady"
              ></ag-grid-vue>
            </v-flex>
          </v-layout>

          <h3 style="font-weight: normal;">
            ¿Desea cambiar el estado de estos registros?
          </h3>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="closeModal(false)">Cancelar</v-btn>
          <v-btn
            color="primary"
            :disabled="!validForm"
            @click="grabarCambioEstado()"
            >Guardar Cambios</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import { EstadoEntidad } from '@/config/enums';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { GridApi, ColumnApi, ColDef, GridReadyEvent } from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
  },
})
export default class CambiarEstado extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: 'Cambiar estado' }) titulo!: string;
  @Prop({ default: [] }) columnas!: CambioEstadoInterface[];
  @Prop({ default: [] }) data!: any;
  @Prop({ default: '' }) entidad!: string;

  $snotify: any;
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnsDefs: Array<ColDef> = [];
  estadosClass: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosClass.getEstadosVisibles();
  selectedEstado: any = [];
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  entidadApi: string = this.entidad;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
    this.setColumnas();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.selectedEstado = [];
    if (this.show) {
      this.setColumnas();
    }
  }

  setColumnas() {
    this.columnas.forEach((col: CambioEstadoInterface) => {
      if (col.nombreColumna == 'Estado') {
        this.columnsDefs.push({
          headerName: col.nombreColumna,
          field: col.idColumna,
          cellRenderer: (r: any) => {
            return EstadoEntidad[r.data.estado];
          },
        });
      } else {
        this.columnsDefs.push({
          headerName: col.nombreColumna,
          field: col.idColumna,
        });
      }
    });
  }

  closeModal(val: boolean) {
    this.$emit('modalCambioEstadoEmit', false);
    this.show = false;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  grabarCambioEstado() {
    let he = new HandleErrors();
    this.$validator.validateAll().then(res => {
      if (res) {
        let index = 1;
        this.data.forEach((item: any) => {
          let model: any = [];

          switch (this.entidad.toLowerCase()) {
            case 'perfil':
              this.axios = new AxiosVue(ServicioProxy.GestionUsuario);
              model = {
                Id: item.id,
                Nombre: item.nombre,
                Estado: this.selectedEstado,
              };
              break;
            case 'rol':
              this.axios = new AxiosVue(ServicioProxy.GestionUsuario);
              model = {
                Id: item.id,
                Nombre: item.name,
                Estado: this.selectedEstado,
              };
              break;
            case 'usuario':
              this.axios = new AxiosVue(ServicioProxy.GestionUsuario);
              model = {
                Id: item.id,
                Nombre: item.nombre,
                ApellidoPaterno: item.apellidoPaterno,
                ApellidoMaterno: item.apellidoMaterno,
                Rut: item.rut,
                Direccion: item.direccion,
                Telefono: item.telefono,
                FechaNacimiento: new Date(),
                Email: item.email,
                Estado: this.selectedEstado,
              };
              break;
            case 'conductor':
              this.axios = new AxiosVue(ServicioProxy.Vehiculo);
              model = {
                id: item.id,
                rut: item.rut,
                nombre: item.nombre,
                apellidoPaterno: item.apellidoPaterno,
                apellidoMaterno: item.apellidoMaterno,
                referencia: item.referencia,
                email: item.email,
                telefono: item.telefono,
                fechaNacimiento: item.fechaNacimiento,
                fechaVencimientoRut: item.fechaVencimientoRut,
                conductorGrupoId: item.conductorGrupoId,
                idElectroctonico: item.idElectroctonico,
                //foto: null,
                Estado: this.selectedEstado,
              };
              break;
            case 'vehiculo':
              this.axios = new AxiosVue(ServicioProxy.Vehiculo);
              model = {
                id: item.id,
                vehiculoTipoId: item.vehiculoTipoId,
                vehiculoModeloId: item.vehiculoModeloId,
                vehiculoTipoCombustibleId: item.vehiculoTipoCombustibleId,
                vehiculoTipoPeajeId: item.vehiculoTipoPeajeId,
                vehiculoTipoTransmisionId: item.vehiculoTipoTransmisionId,
                color: item.color,
                ano: item.ano,
                patente: item.patente,
                referencia: item.referencia,
                numeroMotor: item.numeroMotor,
                numeroChasis: item.numeroChasis,
                vin: item.vin,
                unidad: item.unidad,
                poseeTag: item.poseeTag,
                estado: this.selectedEstado,
              };
              break;
            case 'zona':
              this.axios = new AxiosVue(ServicioProxy.Gps);
              model = {
                id: item.id,
                ClienteId: item.clienteId,
                Nombre: item.nombre,
                Descripcion: item.descripcion,
                Direccion: item.direccion,
                TipoGeometria: item.tipoGeometria,
                //'Poligono': this.editedItem.poligono,
                // 'Circunferencia': this.editedItem.circunferencia,
                // 'Rectangulo': this.editedItem.rectangulo,
                // 'Marcador': this.editedItem.marcador,
                VelocidadMaxima: item.velocidadMaxima,
                Notas: item.notas,
                TipoZonaId: item.tipoZonaId,
                grupoId: item.grupoId,
                estado: this.selectedEstado,
              };
              break;
            case 'tipolugar':
              this.axios = new AxiosVue(ServicioProxy.Gps);
              model = {
                id: item.id,
                clienteId: item.clienteId,
                Nombre: item.nombre,
                Descripcion: item.descripcion,
                estado: this.selectedEstado,
              };
              break;
            case 'tipolugarinteres':
              this.axios = new AxiosVue(ServicioProxy.Gps);
              model = {
                id: item.id,
                Nombre: item.nombre,
                Descripcion: item.descripcion,
                estado: this.selectedEstado,
              };
              break;
          }

          this.axios.http
            .put(this.entidadApi, model)
            .then(res => {
              if (index == this.data.length) {
                this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
                this.closeModal(false);
              }
              index += 1;
            })
            .catch(err => {
              //he.showError(err);
              this.$snotify.success(this.$t('mensajes.mensajesError.editar'));
            });
        });
      }
    });
  }
}
</script>
