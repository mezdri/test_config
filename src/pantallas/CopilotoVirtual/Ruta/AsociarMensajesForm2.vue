<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Asociar Mensajes">
              <slot name="prependInformacionGeneral" />

              <v-layout row wrap>
                <!-- <v-flex xs12 sm6 md6>
                  <v-select
                    :label="formFields.tipoZona.label"
                    :error-messages="errors.collect(formFields.tipoZona.id)"
                    :data-vv-name="formFields.tipoZona.id"
                    v-model="formFields.tipoZona.value"
                    item-text="nombre"
                    item-value="id"
                  />
                </v-flex> -->
                <v-flex xs12 sm12 md12>
                  <Buscador
                    :filter="
                      gridApiEventosMensajes &&
                        gridApiEventosMensajes.setQuickFilter.bind(
                          gridApiEventosMensajes
                        )
                    "
                  />
                </v-flex>
              </v-layout>

              <v-flex xs12 sm12 md12>
                <v-card>
                  <!-- <MantenedorGridVerDetalle
                   
                    :grid-options="gridOptionsZonasRutas"
                    :row-data="lsZonas"
                  /> -->
                  <AsociacionGrid
                    :grid-options="gridOptionsEventosMensajes"
                    :esEditar="true"
                    :headerCheckbox="true"
                  />
                </v-card>
                <!-- <MantenedorGrid :grid-options="gridOptions" /> -->
              </v-flex>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { fetchMensaje } from '../Mensaje/fetchMensaje';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import {
  Color,
  BaseRuta,
  TipoEventoCopiloto,
  TipoEventoCopilotoSeleccionado,
  MensajeSeleccionado,
} from './rutas';
import { Mensaje, MensajeSelected } from '../Mensaje/mensaje';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';

import Buscador from '@/reusable/Grid/Buscador.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
    Buscador,
    MantenedorGridVerDetalle,
    AsociacionGrid,
  },
})
export default class AsociarMensajesFormEdit extends Vue {
  @Prop({ default: (): [] => [] })
  readonly lstselectedTipoEvento: any[];
  @Prop({ default: (): [] => [] })
  readonly lsSelectedMsj: MensajeSeleccionado[];
  @Prop({ required: false }) idRuta: number;
  @Prop({ required: false }) demoM: any;
  /* state */

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];
  msjfor: MensajeSeleccionado[] = [];
  mensajes: Mensaje[] = [];
  //lstMensaje: MensajeSeleccionado[] = [];

  lstMsj: any = {};
  valores: any = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  gridApiEventosMensajes: GridApi = null;

  formFields: FormFieldDefMap = {
    estado: {
      label: 'Estado',
      id: 'id',
      value: '',
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    tipoZona: {
      label: 'Filtro por Evento',
      id: 'color',
      value: 0,
    },
  };

  gridOptionsEventosMensajes: GridOptions = {
    columnDefs: [
      {
        headerName: 'Nombre Zona',
        field: 'zonaNombre',
        suppressMovable: true,
        lockVisible: true,
        //rowGroup: true,
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Color',
        field: 'color',
        filter: 'agSetColumnFilter',
        width:300
      },
      {
        headerName: 'Nombre Evento',
        field: 'nombreEvento',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Mensaje',
        field: 'mensaje',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: Object.values(this.lstMsj), //[{"1":"m1","2":"m2"}]//  this.lstMsj//this.extractValues(this.lstMsj)
        },

        //cellStyle: this.cellStyle,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Código Mensaje',
        field: 'idMensaje',
        hide: true,
      },
      {
        headerName: 'Código Ruta Evento',
        field: 'idRutaEvento',
        hide: true,
      },
    ],
    onGridReady: this.handleGridZonaRutasReady,
    // onCellValueChanged: this.onCellValueChanged,
    // onSelectionChanged: this.onCellValueChanged,
    singleClickEdit: true,
    // isExternalFilterPresent: this.isExternalFilterPresent,
    // doesExternalFilterPass: this.doesExternalFilterPass,
  };

  constructor() {
    super();
  }

  created() {
    if (Object.keys(this.demoM).length > 0) {
      this.lstMsj = this.demoM;
    }
  }

  extractValues(mappings: any) {
    return Object.keys(mappings);
  }

  fetchMensaje() {
    this.loadingService.showLoading();
    return fetchMensaje()
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'los mensajes',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  editCell(params: any) {
    if (params.node.isSelected()) {
      return true;
    } else {
      return false;
    }
  }

  mounted() {}

  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  EventFilter(id: any) {
    //this.lstMensaje tiene la lista de mensajes
    //console.log(this.lstMensaje);
    //return this.lstMensaje.filter(msj => msj.idEvento == id.idEvento)

    return this.lsSelectedMsj.filter(
      msj => msj.idEvento == id.idEvento && msj.idZona == id.idZona
    );
  }

   handleGridZonaRutasReady(event: GridReadyEvent) {
     console.log('en el grid');
     this.handleMensajes();
     console.log(this.lstMsj);
    this.gridApiEventosMensajes = event.api;

  
  }

  @Watch('lstselectedTipoEvento', { deep: true })
  handleRutasSeleccionadas() {
    this.setZonasSeleccionadas();
  }

  @Watch('demoM')
  handleMensajes() {
    console.log(this.demoM);
    console.log(this.lstMsj);
    console.log('mensajes listos');
    this.lstMsj = this.demoM;

      //Se recorren las columnas de la tabla
    this.gridOptionsEventosMensajes.columnDefs.forEach((c: any) => {
      // if(c.headerName==="Nombre Zona"){
      //   let parms = c;
      //   parms.rowGroup = true;
      // }
      //se busca la columna que contiene los mensajes
      if (c.headerName === 'Mensaje') {
        let parms = c;
        //se asignan los valores del arreglo
        parms.cellEditorParams.values = Object.values(this.lstMsj);
      }
    });
    this.setZonasSeleccionadas();
  }

  setZonasSeleccionadas() {
    if (this.lstselectedTipoEvento.length > 0) {
      let datosGrilla: any = [];

      // this.lstselectedTipoEvento.forEach((r) => {
      //   datosGrilla.push({
      //     id: r.id,
      //     zonaNombre: r.zonaNombre,
      //     color: this.getColorHex(r.color),
      //     e1: r.lstTipoEventoCopiloto[0].selected == true ? 'Sí' : 'No',
      //     e2: r.lstTipoEventoCopiloto[1].selected == true ? 'Sí' : 'No',
      //     e3: r.lstTipoEventoCopiloto[2].selected == true ? 'Sí' : 'No',
      //     e4: r.lstTipoEventoCopiloto[3].selected == true ? 'Sí' : 'No',
      //     e5: r.lstTipoEventoCopiloto[4].selected == true ? 'Sí' : 'No',
      //     e6: r.lstTipoEventoCopiloto[5].selected == true ? 'Sí' : 'No',
      //     e7: r.lstTipoEventoCopiloto[6].selected == true ? 'Sí' : 'No',
      //     e8: r.lstTipoEventoCopiloto[7].selected == true ? 'Sí' : 'No',
      //   });
      // });

      this.gridApiEventosMensajes.setRowData(this.lstselectedTipoEvento || []);
     

      this.loadingService.showLoading();
      this.gridApiEventosMensajes.forEachNode(n => {
        //se asignan los mensajes para todos los eventos que están almacenados
        //los idMensajes en 0 son eventos nuevos.
        if (n.data.idMensaje > 0) {
          n.setDataValue('mensaje', this.lstMsj[n.data.idMensaje]);
        }
      });
       this.gridApiEventosMensajes.selectAll();
      this.loadingService.hideLoading();
      // this.lstRutas.forEach((zs) => {
      //    this.gridApiZonasEventos.forEachNode(function (node: any) {
      //       node.data.id = zs.id;
      //       node.data.nombre = zs.zonaNombre;
      //       node.data.tipo = zs.colorHx;
      //       // node.data.hdesde = zs.horaDesde;
      //       // node.data.hhasta = zs.horaHasta;
      //       // //node.data.nombre = zs.nombre;
      //       // node.data.pdetencion = zs.pdetencion;
      //       // node.data.pdetenciontxt = zs.pdetenciontxt;
      //       // node.data.velocidadMin = zs.velocidadMinima;
      //       // node.data.velocidadMax = zs.velocidadMaxima;
      //       // node.data.rmensajetxt = zs.rmensajetxt;
      //       // node.data.trmensaje = zs.trmensaje;
      //       // node.data.tiempoEntradaGeocerca = zs.tiempoEntradaGeocerca;
      //       // node.data.tmin = zs.tmin;
      //       // node.data.rutaId = zs.rutaId;
      //       // node.data.rutaCorId = zs.zona;
      //       // node.data.Id = zs.id;

      //       //node.setSelected(true);

      //   });
      // });

      //this.gridApiZonasRutas.refreshCells();
    }
    this.loadingService.hideLoading();
  }

  handleSelectItem(
    check: boolean,
    msj: Mensaje,
    evento: TipoEventoCopilotoSeleccionado
  ) {
    if (check && check != null) {
      let filter = this.lsSelectedMsj.filter(
        m =>
          m.idMensaje === msj.id &&
          m.idZona === evento.idZona &&
          m.idEvento === evento.idEvento
      );

      if (filter.length === 0 && (msj.id != null || msj.id != undefined)) {
        //
        this.lsSelectedMsj.push({
          nombreRuta: evento.nombreRuta,
          zonaNombre: evento.zonaNombre,
          nombreEvento: evento.nombreEvento,
          idEvento: evento.idEvento,
          idZona: evento.idZona,
          idMensaje: msj.id,
          titulo: msj.titulo,
          selected: true,
        });
      }
    } else {
      const index = this.lsSelectedMsj.findIndex(x => x.idMensaje == msj.id);
      if (index > -1) {
        this.lsSelectedMsj.splice(index, 1);
      }
    }
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
