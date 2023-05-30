<template>
  <div class="solicitudes">
    <WidgetUser />
    <mis-solicitudes-filters
      @filter="getFilter($event)"
      @lstCuenta="grupoCuenta($event)"
      @exportar="exportarExcel($event)"
    ></mis-solicitudes-filters>
    <mis-solicitudes-table
      :tableData="tableData"
      :totalItems="totalRegistros"
    ></mis-solicitudes-table>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import WidgetUser from '@/pantallas/SucursalVirtual/WidgetUser.vue';
import { MisSolicitudesHeaders } from './table_headers';
import MisSolicitudesTable from './table.vue';
import MisSolicitudesFilters from './filters.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { misSolicitudesService } from './MisSolicitudesService';
import { LoadingService } from '@/services/loadingService';

@Component({
  components: {
    WidgetUser,
    MisSolicitudesTable,
    MisSolicitudesFilters,
  },
})
export default class MisSolicitudes extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  readonly funcionalidad: Funcionalidades = Funcionalidades.MisSolicitudes;

  headers: any[] = MisSolicitudesHeaders;
  tableData: any[] = [];
  totalRegistros: number = 0;
  filters: any = {};

  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }

  mounted() {
    this.initialCharge();
    this.getSolicitudes();
  }

  grupoCuenta(e: any) {
    this.filters.LstCuentas = e;
  }

  initialCharge() {
    this.filters = {
      IdCliente: null,
      IdRazo: null,
      IdCategoria: '',
      fechadesde: '',
      fechahasta: '',
      LstCuentas: '',
      filtroTexto: '',
      OrderBy: 'caso.CreatedOn',
      Orden: 'DESC',
    };
  }

  filtroSolicitudes(filtros: any) {
    if (filtros.empresa.value == '') {
      this.$snotify.error('Debe seleccionar una empresa', { timeout: 3000 });
      return false;
    }
    if (filtros.estado.value == '') {
      this.$snotify.error('Debe seleccionar un estado', { timeout: 3000 });
      return false;
    }
  }

  async solicitudInicial() {}

  async getSolicitudes() {
    var res: any = (await this.obtenerSolicitudes()) || [];
    if (res.CODIGO_RESPUESTA === '1') {
      this.tableData = res.data[0];
      this.totalRegistros = res.data[1];
    }
  }
  obtenerSolicitudes() {
    this.loadingService.showLoading();
    return misSolicitudesService(this.filters)
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las solicitudes',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las solicitudes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  getFilter(e: any) {
    this.filters = e;
    this.getSolicitudes();
  }

  exportarExcel(event: any) {
    if (typeof require !== 'undefined') {
      const XLSX = require('xlsx');

      let dataToExport = this.tableData.map(e => ({
        Título: e.titulo.replace(/(\r\n|\n|\r)/gm, ''),
        'Nº Solicitud': e.num_solicitud.replace(/(\r\n|\n|\r)/gm, ''),
        'Razón Social': e.razon_social.replace(/(\r\n|\n|\r)/gm, ''),
        RUT: e.rut.replace(/(\r\n|\n|\r)/gm, ''),
        Ejecutivo: e.ejecutivo.replace(/(\r\n|\n|\r)/gm, ''),
        Tipo: e.tipo.replace(/(\r\n|\n|\r)/gm, ''),
        'Fecha creación': e.fecha_creacion.replace(/(\r\n|\n|\r)/gm, ''),
        Descripción: e.descripcion.replace(/(\r\n|\n|\r)/gm, ''),
        Estado: e.estado.replace(/(\r\n|\n|\r)/gm, ''),
      }));

      let data = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      const filename = 'Documento';
      XLSX.utils.book_append_sheet(workbook, data, filename);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }
  }

  @Watch('filters.LstCuentas')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.getSolicitudes();
  }
}
</script>
<style scoped>
.solicitudes {
  margin-top: 30px;
}
</style>
