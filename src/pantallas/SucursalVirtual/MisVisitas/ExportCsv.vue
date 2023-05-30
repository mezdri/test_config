<template>
  <v-btn flat small color="primary" class="btncsv" @click="exportar('csv')">
    <v-icon class="importExportBtnIcon">cloud_download</v-icon>&nbsp;&nbsp;
    <span class="importExportBtnTexto">Exportar<br />CSV</span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { LoadingService } from '../../../services/loadingService';

@Component
export default class ExportCsv extends Vue {
  @Prop({ default: [] }) visitas: any;

  loadingService: LoadingService = new LoadingService();
  $snotify: any;
  [x: string]: any;

  exportar(tipo: string) {
    if (this.visitas.length == 0) {
      this.$snotify.error('No hay datos para exportar', { timeout: 3000 });
      return false;
    }
    this.create_csv(this.visitas, tipo);
  }

  /* lista = visitas */
  create_csv(lista: any[], tipo: string) {
    this.loadingService.showLoading();
    let header =
      'Caso;Patente;Id. Visita;Tipo Visita;Técnico;Cliente Contactado;Fecha Coordinación;Fecha Cierre Caso;Estado';
    let csvContent = '';
    if (tipo == 'csv') {
      csvContent = 'data:text/csv;charset=utf-8,';
    }
    csvContent += header + '\r\n';
    lista.forEach(function(rowObject) {
      let row =
        rowObject['caso'] +
        ';' +
        rowObject['patente'] +
        ';' +
        rowObject['identificador'] +
        ';' +
        rowObject['tipovisita'] +
        ';' +
        rowObject['tecnicoNombre'] +
        ';' +
        rowObject['clienteContactado'] +
        ';' +
        rowObject['fechaCoordinacion'] +
        ';' +
        rowObject['fechaCierre'] +
        ';' +
        rowObject['estado'];
      csvContent += row + '\r\n';
    });
    if (tipo == 'csv') {
      let encodedUri = encodeURI(csvContent);
      let link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'visitas.csv');
      link.classList.add('urldownload');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    this.loadingService.hideLoading();
  }
}
</script>

<style scoped>
.btncsv {
  height: 100%;
}
</style>
