<template>
  <div align="center">
    <v-flex md12>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <v-form class="col-md-12">
            <StepTitle
              >Servicio de Descargas, Proveedores o Clientes
              Proveedor</StepTitle
            >
            <v-divider></v-divider>
            <v-layout wrap>
              <v-flex xs12 md12 lg12>
                <v-radio-group v-model="tipoAsociacion" row>
                  <v-radio
                    label="Servicio de Descarga"
                    :value="tiposAsociacion.serviciodescarga"
                  ></v-radio>
                  <v-radio
                    label="Proveedor"
                    :value="tiposAsociacion.proveedor"
                    :disabled="seleccionadosDescargas.length > 0"
                  ></v-radio>
                  <v-radio
                    label="Cliente Proveedor"
                    :value="tiposAsociacion.clientesproveedor"
                    :disabled="seleccionadosDescargas.length > 0"
                  ></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>
            <div align="left">
              <AsociarServicioDescarga
                v-show="tipoAsociacion === tiposAsociacion.serviciodescarga"
                test-id="AsociarServicioDescarga"
                :listadoDescargas="listadoDescargas"
                :infoDescargasAsignados="infoDescargasAsignados"
                :readonly="readonly"
                :esEditar="esEditar"
                :show="tipoAsociacion === tiposAsociacion.serviciodescarga"
                :esInformeProgramado="true"
                @selectionChange="selectionChangeDescarga"
              />
            </div>
            <div align="left">
              <AsociarProveedor
                v-show="tipoAsociacion === tiposAsociacion.proveedor"
                test-id="AsociarProveedor"
                :listadoProveedor="listadoProveedor"
                :infoProveedorAsignados="infoProveedorAsignados"
                :readonly="readonly"
                :esEditar="esEditar"
                :show="tipoAsociacion === tiposAsociacion.proveedor"
                :esInformeProgramado="true"
                @selectionChange="selectionChangeProveedor"
              />
            </div>
            <div align="left">
              <AsociarClientesProveedor
                v-show="tipoAsociacion === tiposAsociacion.clientesproveedor"
                test-id="AsociarClientesProveedor"
                :listadoClientesProveedor="listadoClientesProveedor"
                :infoClientesProveedorAsignados="infoClientesProveedorAsignados"
                :readonly="readonly"
                :esEditar="esEditar"
                :show="tipoAsociacion === tiposAsociacion.clientesproveedor"
                :esInformeProgramado="true"
                @selectionChange="selectionChangeClientesProveedor"
              />
            </div>
          </v-form>
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { Vue, Component, Prop } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  GridOptions,
  GridReadyEvent,
  GridApi,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import AsociarServicioDescarga from '@/pantallas/Informes/ContainerInformeDescargas/AsociarServicioDescarga.vue';
import AsociarProveedor from '@/pantallas/Informes/ContainerInformeDescargas/AsociarProveedor.vue';
import AsociarClientesProveedor from '@/pantallas/Informes/ContainerInformeDescargas/AsociarClientesProveedor.vue';
import { fetchDescargasActividad } from '@/pantallas/DescargaActividades/fetchDescargasActividad';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { fetchClientesProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import {
  descargaBackend,
  proveedorBackend,
  clienteProveedorBackend,
} from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';

enum TiposAsociacionDescarga {
  serviciodescarga,
  proveedor,
  clientesproveedor,
}

@Component({
  components: {
    FormFieldsContainer,
    MantenedorGrid,
    BuscadorOperacionCrud,
    StepTitle,
    AsociarServicioDescarga,
    AsociarProveedor,
    AsociarClientesProveedor,
  },
})
export default class ContainerInformeDescargas extends Vue {
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) esInforme: boolean;
  @Prop({ default: [] }) infoDescargasAsignados: descargaBackend[];
  @Prop({ default: [] }) infoProveedorAsignados: proveedorBackend[];
  @Prop({ default: [] })
  infoClientesProveedorAsignados: clienteProveedorBackend[];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  tiposAsociacion = TiposAsociacionDescarga;
  tipoAsociacion = TiposAsociacionDescarga.serviciodescarga;
  listadoDescargas: any = [];
  listadoProveedor: any = [];
  listadoClientesProveedor: any = [];
  listadoDescargasAll: any = [];
  listadoProveedorAll: any = [];
  listadoClientesProveedorAll: any = [];
  seleccionadosDescargas: any = [];
  seleccionadosProveedor: any = [];
  seleccionadosClientesProveedor: any = [];

  mounted() {
    this.cargarInformacionListados();
    this.seteaTipoAsociacion();
  }

  selectionChangeDescarga(listadoDes: any) {
    this.seleccionadosDescargas = listadoDes;
    this.envioDataInformesMenu();
  }

  selectionChangeProveedor(listadoProv: any) {
    this.seleccionadosProveedor = listadoProv;

    let arrCliProv: any = [];
    listadoProv.forEach((pro: any) => {
      pro.clienteProveedorId.forEach((cli: any) => {
        if (!arrCliProv.includes(cli)) arrCliProv.push(cli);
      });
    });

    this.listadoClientesProveedor = this.listadoClientesProveedorAll.filter(
      (cp: any) => arrCliProv.includes(cp.id)
    );
    this.envioDataInformesMenu();
  }

  selectionChangeClientesProveedor(listadoCliProv: any) {
    this.seleccionadosClientesProveedor = listadoCliProv;
    this.envioDataInformesMenu();
  }

  envioDataInformesMenu() {
    if (this.seleccionadosDescargas.length > 0) {
      this.seleccionadosProveedor = [];
      this.seleccionadosClientesProveedor = [];
    }

    const descargasIds: number[] = this.seleccionadosDescargas.map(
      (x: any) => x.id
    );
    const proveedoresIds: number[] = this.seleccionadosProveedor.map(
      (x: any) => x.id
    );
    const clientesprovedoresIds: number[] = this.seleccionadosClientesProveedor.map(
      (x: any) => x.id
    );

    let info = {
      infoDescarga: descargasIds,
      infoProvedor: proveedoresIds,
      infoClienteProveedor: clientesprovedoresIds,
    };

    this.$emit('infoSeleccionado', info);
  }

  seteaTipoAsociacion() {
    if (this.infoProveedorAsignados.length > 0)
      this.tipoAsociacion = TiposAsociacionDescarga.proveedor;
    else this.tipoAsociacion = TiposAsociacionDescarga.serviciodescarga;
  }

  async cargarInformacionListados() {
    this.listadoDescargasAll = (await this.fetchDescargas()) || [];
    this.listadoDescargas = this.listadoDescargasAll.map((data: any) => ({
      ...data,
      nombre: data.proveedor.nombre + '_' + data.clienteProveedor.nombre,
    }));
    this.listadoProveedorAll = (await this.fetchProveedor()) || [];
    this.listadoClientesProveedorAll =
      (await this.fetchClienteProveedor()) || [];
    this.listadoProveedor = this.listadoProveedorAll;
    this.listadoClientesProveedor = this.listadoClientesProveedorAll;
  }

  fetchDescargas() {
    this.loadingService.showLoading();
    return fetchDescargasActividad()
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Descargas de Información',
          })
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchProveedor() {
    this.loadingService.showLoading();
    return fetchProveedoresGps()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Proveedores',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }

  fetchClienteProveedor() {
    this.loadingService.showLoading();
    return fetchClientesProveedorGps()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Clientes',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>
