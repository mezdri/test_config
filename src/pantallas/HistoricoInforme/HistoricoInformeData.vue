<template>
  <div>
    <div class="mx-3" style="width: 50%">
      <v-text-field
        @input="onFilterTextBoxChanged"
        v-model="search"
        append-icon="search"
        label="Buscar..."
        single-line
        hide-details
      ></v-text-field>
    </div>
    <CabeceraTabla :permisoAccion="accionCrear">
      <template v-slot:derecha>
        <ExportarAgGridButton
          :permisoAccion="accionExportar"
          :column-defs="gridOptions.columnDefs"
          :rowData="lstInformesGenerados"
          exported-file-name="ProgramacionDeInformes"
        />
      </template>
    </CabeceraTabla>
    <MantenedorGrid
      :grid-options="gridOptions"
      :row-data="lstInformesGenerados"
      :funcionalidad-id="funcionalidad"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';

import MantenedorGridTodos from '@/reusable/Grid/MantenedorGridTodos.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import ExportarAgGridButton from '@/reusable/Grid/ExportarAgGridButton.vue';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import Confirmation from '@/components/Confirmation.vue';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import CrearProgramacionInformeModal from '@/pantallas/ProgramacionInforme/CrearProgramacionInformeModal.vue';
import EditarProgramacionInformesModal from '@/pantallas/ProgramacionInforme/EditarProgramacionInformesModal.vue';
import VerProgramacionInformeModal from '@/pantallas/ProgramacionInforme/VerProgramacionInformeModal.vue';
import { fetchHistoricoInformes } from '@/pantallas/HistoricoInforme/fetchHistoricoInformes';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import moment from 'moment';
import { Notificacion } from '@/pantallas/ProgramacionInforme/ProgramacionInforme';

@Component({
  components: {
    MantenedorGrid,
    MantenedorGridTodos,
    Confirmation,
    BuscadorMantenedor,
    ExportarAgGridButton,
    CrearButton,
    CabeceraTabla,
    CrearProgramacionInformeModal,
    ConfirmacionEliminar,
    EditarProgramacionInformesModal,
    VerProgramacionInformeModal,
  },
})
export default class HistoricoInformeData extends ComponenteBase {
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.HistoricoInforme;

  notificacion: Notificacion = null;

  constructor() {
    super();
    actionsEvent.onDescargar(this.descargarInforme);
  }

  gridApi: GridApi = null;
  lstInformesGenerados: [] = [];
  search = '';

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: '',
        field: 'id',
      },
      {
        headerName: 'Nombre del documento',
        field: 'nombreDocumento',
      },
      {
        headerName: 'Fecha de Solicitud',
        field: 'fechaCreacion',
        cellRenderer: (x: any) => {
          return this.renderFecha(x);
        },
        sortingOrder: ['desc'],
        sort: 'desc',
      },
      {
        headerName: 'Tipo de Informe',
        field: 'nombreDocumento',
        cellRenderer: (x: any) => {
          return this.renderName(x);
        },
      },
      {
        headerName: 'Formato del documento',
        field: 'nombreDocumento',
        cellRenderer: (x: any) => {
          return this.renderExtension(x);
        },
      },
      {
        headerName: 'Tamaño del documento',
        field: 'tamanoDocumento',
      },
      {
        headerName: 'Descarga',
        field: 'Documento',

        cellRenderer: this.createMapaBtn,
      },
    ],
    onGridReady: this.handleGridReady,
    isExternalFilterPresent: () => {
      return false;
    },
  };

  renderFecha(fechaAsString: any) {
    return moment(fechaAsString.value).format('DD/MM/YYYY - HH:mm');
  }

  renderExtension(file: any) {
    var extension = file.value.slice(file.value.lastIndexOf('.') + 1);
    return extension.toUpperCase();
  }

  renderName(file: any) {
    var extension = file.value.slice(0, file.value.search(/\d/));
    extension = extension.replace(/_/g, ' ');
    return extension.toUpperCase();
  }

  /* state */
  busquedaGrilla: string = '';

  /* misc */

  readonly loadingService = new LoadingService();

  doesExternalFilterPassProgramacionInformes(node: RowNode): boolean {
    if (
      this.lstInformesGenerados.length > 0 &&
      this.busquedaGrilla.length > 1
    ) {
      let busqueda = this.busquedaGrilla;

      return (
        node.data.id.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda) ||
        node.data.tipoInforme.toLowerCase().includes(busqueda) ||
        node.data.estadoEnvioTxt.toLowerCase().includes(busqueda) ||
        node.data.usuarioCreacion.toLowerCase().includes(busqueda) ||
        node.data.usuarioModificacion.toLowerCase().includes(busqueda) ||
        String(node.data.detalleError)
          .toLowerCase()
          .includes(busqueda) ||
        moment(node.data.ultimoEnvio)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaCreacion)
          .format('DD/MM/YYYY')
          .includes(busqueda) ||
        moment(node.data.fechaModificacion)
          .format('DD/MM/YYYY')
          .includes(busqueda)
      );
    }

    return true;
  }

  /* event handlers */
  handleBusqueda(consulta: string) {
    this.busquedaGrilla = consulta.toLowerCase();
    this.gridApi.onFilterChanged();
  }

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.recargaGrilla();
    this.gridApi.sizeColumnsToFit();
  }

  async recargaGrilla() {
    var resp: any = await this.fetchInformes();
    this.gridApi.setRowData(resp.data);
  }

  fetchInformes() {
    this.loadingService.showLoading();
    return fetchHistoricoInformes()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las programaciones de informes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  createMapaBtn(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'cloud_download';
    eSpan.className = 'material-icons';
    eSpan.id = params.data.id;
    eSpan.style.cssText =
      'cursor:pointer;color:#27488E;font-size: 25px;padding-top:10px;';
    eSpan.title = 'Descargar archivo';

    eSpan.addEventListener('click', () => {
      var token = params.data.documento;
      this.openDetalle(token);
    });
    return eSpan;
  }

  openDetalle(token: string) {
    var link =
      'https://track3.gpschile.com/servicios-metabase/api/InformeProgramadoGenerado?token=' +
      token;
    window.open(link, '_blank');
  }

  descargarInforme(params: any) {
    const downloadLink = document.createElement('a');
    downloadLink.href = `${params.data.documento}`;
    downloadLink.download = params.data.nombreDocumento;
    downloadLink.click();
  }

  onFilterTextBoxChanged() {
    if (this.search === null) this.search = '';
    this.gridApi.setQuickFilter(this.search.length > 1 ? this.search : '');
  }
}
</script>

<style scoped></style>
