<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Asociar Eventos">
              <slot name="prependInformacionGeneral" />

              <v-layout row wrap>
                <!-- <v-flex xs12 sm6 md6>
                  <v-select
                    :label="formFields.tipoZona.label"
                    :error-messages="errors.collect(formFields.tipoZona.id)"
                    :data-vv-name="formFields.tipoZona.id"
                    v-model="formFields.tipoZona.value"
                     :items="lstColor"
                    item-text="nombre"
                    item-value="id"
                    @change="handleColorZonaChange"
                  />
                </v-flex> -->
                <v-flex xs12 sm12 md12>
                  <Buscador
                    :filter="
                      gridApiZonasEventos &&
                        gridApiZonasEventos.setQuickFilter.bind(
                          gridApiZonasEventos
                        )
                    "
                  />
                </v-flex>
              </v-layout>

              <v-flex xs12 sm12 md12>
                <v-card>
                  <MantenedorGridVerDetalle
                    :grid-options="gridOptionsZonasRutas"
                  />
                  <!-- <AsociacionGrid
                    :grid-options="gridOptionsZonasRutas"
                    :esEditar="false"
                    :headerCheckbox="false"
                  /> -->
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
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import {
  Color,
  BaseRuta,
  TipoEventoCopiloto,
  TipoEventoCopilotoSeleccionado,
  Ruta,
  MensajeSeleccionado,
} from './rutas';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { fetchMensaje } from '../Mensaje/fetchMensaje';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Mensaje } from '../Mensaje/mensaje';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
//import { GridApi, GridOptions } from 'node_modules/ag-grid-community/main';
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
export default class AsociarEventosFormDetalle extends Vue {
  @Prop({ required: false }) idRuta: number;
  @Prop({ default: (): [] => [] })
  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[];
  @Prop({ default: (): [] => [] }) lsSelectedMsj: MensajeSeleccionado[];
  @Prop({ required: false }) lstRutas: BaseRuta[];
  @Prop() rutaSeleccionada: Ruta;
  tituloEventos: string;

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];
  zonas: string[] = [];
  mensajes: Mensaje[] = [];
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);
  lstMsj: any[] = [];

  lstColor: any = [];

  lstEventos: any = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  gridApiZonasEventos: GridApi = null;

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
      label: 'Filtro por color de Zona',
      id: 'color',
      value: 0,
    },
  };

  readonly gridOptionsZonasRutas: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Código Zona',
        field: 'idZOna',
        hide: true,
      },
      {
        headerName: 'Nombre Zona',
        field: 'zonaNombre',
        suppressMovable: true,
        lockVisible: true,
        pinned: 'left',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Color',
        field: 'color',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'Evento Entrada',
        field: 'e1',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
        //cellStyle: this.cellStyle,
      },
      {
        headerName: 'Evento Exceso de Velocidad',
        field: 'e2',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Evento Velocidad bajo la mínima',
        field: 'e3',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Evento Detención',
        field: 'e4',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Evento Permanencia',
        field: 'e5',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Evento Restricción Horaria',
        field: 'e6',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Evento Salida',
        field: 'e7',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
      {
        headerName: 'Evento Próximo a entra a la Zona',
        field: 'e8',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          cellHeight: 20,
          values: ['Sí', 'No'],
        },
      },
    ],
    onGridReady: this.handleGridZonaRutasReady,
    //onCellValueChanged: this.onCellValueChanged,
    //onSelectionChanged: this.onCellValueChanged,
    singleClickEdit: false,
    // isExternalFilterPresent: this.isExternalFilterPresent,
    // doesExternalFilterPass: this.doesExternalFilterPass,
  };

  constructor() {
    super();
  }

  created() {}

  mounted() {
    this.handleRutasSeleccionadas();
    //this.stRutas, tiene las rutas y el idRuta

    // if (this.rutaSeleccionada) {
    //   this.tituloEventos = 'Editar Ruta - ' + this.rutaSeleccionada.nombre;
    //    this.$emit('titulo', this.tituloEventos);
    //   //this.handleRutasSeleccionadas();
    //   this.setColor();
    // }

    //this.chekearSeleccionados();
  }

  handleGridZonaRutasReady(event: GridReadyEvent) {
    this.gridApiZonasEventos = event.api;

    //this.setZonasSeleccionadas();
  }

  //   cellStyle(params:any) {
  //     console
  //   //let color = ;
  //   return {
  //     backgroundColor: '#ffaaaa',
  //   };
  // }

  editCell(params: any) {
    if (params.node.isSelected()) {
      return true;
    } else {
      return false;
    }
  }

  datosEventos() {
    this.loadingService.showLoading();
    this.axiosCopiloto.http
      .get('MensajeCopiloto/getMensajes')
      .then(res => {
        res.data.forEach((a: any) => {
          this.lstMsj.push({
            idMensaje: a.id,
            titulo: a.titulo,
          });
        });
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });

    this.chekearSeleccionados();
  }

  onCellValueChanged() {
    let items: any = [];
    this.gridApiZonasEventos.forEachNode(function(node) {
      items.push(node.data);
    });
    this.$emit('handleZonaEventos', items);
  }

  @Watch('lstRutas', { deep: true })
  handleRutasSeleccionadas() {
    this.chekearSeleccionados();
  }

  async chekearSeleccionados() {
    let response = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getEventoRuta/${this.rutaSeleccionada.id}`
    );
    //this.lstRutas contiene las rutas del paso anterior, ahora seleccionamos los eventos alamacenados.
    //las nuevas quedan sin seleccion
    for (let x = 0; x < response.data.length; x++) {
      for (let o = 0; o < this.lstRutas.length; o++) {
        for (
          let k = 0;
          k < this.lstRutas[o].lstTipoEventoCopiloto.length;
          k++
        ) {
          if (
            this.lstRutas[o].lstTipoEventoCopiloto[k].idZona ==
              response.data[x].idZona &&
            this.lstRutas[o].lstTipoEventoCopiloto[k].id ==
              response.data[x].idEvento
          ) {
            this.lstRutas[o].lstTipoEventoCopiloto[k].selected = true;
          }
        }
      }

      let filter = this.lstselectedTipoEvento.filter(
        z =>
          z.idZona === response.data[x].idZona &&
          z.idEvento === response.data[x].idEvento
      );

      if (filter.length === 0) {
        this.lstselectedTipoEvento.push({
          id: response.data[x].id,
          nombreRuta: response.data[x].nombreRuta,
          zonaNombre: response.data[x].zonaNombre,
          nombreEvento: response.data[x].nombreEvento,
          idEvento: response.data[x].idEvento,
          idZona: response.data[x].idZona,
        });
      }
    }
    this.setZonasSeleccionadas();
  }

  setColor() {
    this.lstColor = [
      {
        id: 1,
        nombre: 'Amarillo',
        color: 'Amarillo',
        colorhexadecimal: '#f8ff00',
      },
      { id: 2, nombre: 'Azul', color: 'Azul', colorhexadecimal: '#366d9f' },
      { id: 3, nombre: 'Rojo', color: 'Rojo', colorhexadecimal: '#ff0000' },
      { id: 4, nombre: 'Verde', color: 'Verde', colorhexadecimal: '#3ac873' },
    ];
  }

  setZonasSeleccionadas() {
    let datosGrilla: any = [];
    this.loadingService.showLoading();
    if (this.lstRutas.length > 0) {
      this.lstRutas.forEach(r => {
        datosGrilla.push({
          id: r.id,
          idZona: r.coordenadaId,
          zonaNombre: r.zonaNombre,
          color: r.color,

          e1: r.lstTipoEventoCopiloto[0].selected == true ? 'Sí' : 'No',
          e2: r.lstTipoEventoCopiloto[1].selected == true ? 'Sí' : 'No',
          e3: r.lstTipoEventoCopiloto[2].selected == true ? 'Sí' : 'No',
          e4: r.lstTipoEventoCopiloto[3].selected == true ? 'Sí' : 'No',
          e5: r.lstTipoEventoCopiloto[4].selected == true ? 'Sí' : 'No',
          e6: r.lstTipoEventoCopiloto[5].selected == true ? 'Sí' : 'No',
          e7: r.lstTipoEventoCopiloto[6].selected == true ? 'Sí' : 'No',
          e8: r.lstTipoEventoCopiloto[7].selected == true ? 'Sí' : 'No',
        });
      });

      this.gridApiZonasEventos.setRowData(datosGrilla || []);

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
    this.$emit('handleZonaEventos', datosGrilla);

    this.$emit('changeDatosEventos', datosGrilla || []);
  }

  getColorHex(color: String) {
    switch (color) {
      case '#3ac873':
        return 'Verde';
      case '#ff0000':
        return 'Rojo';
      case '#f8ff00':
        return 'Amarillo';
      case '#366d9f':
        return 'Azul';
    }
  }

  handleColorZonaChange(color: string) {
    this.tipo = color;

    this.gridApiZonasEventos.onFilterChanged();
  }

  tipo: string = '';
  isExternalFilterPresent() {
    return this.tipo != '';
  }
  doesExternalFilterPass(node: any) {
    return node.data.color == this.tipo;
  }

  async getMensajes(rutaId: number) {
    if (this.lstselectedTipoEvento.length > 0) {
      this.mensajes = (await this.fetchMensaje()) || [];

      for (let i = 0; i < this.lstselectedTipoEvento.length; i++) {
        for (let y = 0; y < this.mensajes.length; y++) {
          this.lsSelectedMsj.push({
            idMensaje: this.mensajes[y].id,
            titulo: this.mensajes[y].titulo,
            idZona: this.lstselectedTipoEvento[i].idZona,
            nombreRuta: this.lstselectedTipoEvento[i].nombreRuta,
            zonaNombre: this.lstselectedTipoEvento[i].zonaNombre,
            nombreEvento: this.lstselectedTipoEvento[i].nombreEvento,
            idEvento: this.lstselectedTipoEvento[i].idEvento,
            selected: false,
          });
        }
      }
    }

    let respMensajes = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getMensajes/${rutaId}`
    );

    //this.mensajes
    for (let x = 0; x < respMensajes.data.length; x++) {
      for (let i = 0; i < this.lsSelectedMsj.length; i++) {
        if (
          this.lsSelectedMsj[i].idMensaje == respMensajes.data[x].id &&
          this.lsSelectedMsj[i].idEvento == respMensajes.data[x].idEvento
        ) {
          this.lsSelectedMsj[i].selected = true;
        }
      }
    }
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

  handleSelectItem(
    check: boolean,
    evento: TipoEventoCopiloto,
    rutabase: BaseRuta
  ) {
    if (check == true) {
      this.lstselectedTipoEvento.push({
        id: 0,
        nombreRuta: rutabase.nombre,
        zonaNombre: rutabase.zonaNombre,
        nombreEvento: evento.nombre,
        idEvento: evento.id,
        idZona: evento.idZona,
      });

      let filter = this.lsSelectedMsj.filter(
        m => m.idEvento === evento.id && m.idZona === evento.idZona
      );
      this.lstMsj.forEach(m => {
        if (filter.length === 0) {
          this.lsSelectedMsj.push({
            idMensaje: m.idMensaje,
            titulo: m.titulo,
            idZona: evento.idZona,
            nombreRuta: rutabase.nombre,
            zonaNombre: rutabase.zonaNombre,
            nombreEvento: evento.nombre,
            idEvento: evento.id,
            selected: false,
          });
        }
      });

      // this.axiosCopiloto.http.get('MensajeCopiloto/getMensajes')
      //   .then((res) => {

      //      res.data.forEach((a: any) => {
      //         console.log(a);
      //         this.lsSelectedMsj.push({
      //         idMensaje: a.id,
      //         titulo: a.titulo,
      //         idZona: evento.idZona,
      //         nombreRuta: rutabase.nombre,
      //         zonaNombre: rutabase.zonaNombre,
      //         nombreEvento: evento.nombre,
      //         idEvento: evento.id,
      //         selected: false,
      //       });
      //       });
      //   }).finally(() => {
      //     this.loadingService.hideLoading();
      //   });
    } else {
      const index = this.lstselectedTipoEvento.findIndex(
        x => x.idEvento == evento.id && x.idZona == evento.idZona
      );

      if (index > -1) {
        this.lstselectedTipoEvento.splice(index, 1);
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
