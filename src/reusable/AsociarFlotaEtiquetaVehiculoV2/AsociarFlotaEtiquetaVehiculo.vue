<template>
  <div align="center">
    <v-flex :md12="esInforme" :md10="!esInforme">
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <v-form class="col-md-12">
            <StepTitle>Asociar Flotas, Etiquetas o Vehículos</StepTitle>
            <v-divider></v-divider>
            <v-layout wrap>
              <v-flex xs12 md12 lg12>
                <v-radio-group v-model="tipoAsociacion" row>
                  <v-radio
                    label="Flotas"
                    :value="tiposAsociacion.flota"
                  ></v-radio>
                  <v-radio
                    label="Etiquetas"
                    :value="tiposAsociacion.etiqueta"
                    v-if="!toPostgresService"
                  ></v-radio>
                  <v-radio
                    label="Vehículos"
                    :value="tiposAsociacion.vehiculo"
                  ></v-radio>
                  <v-radio
                    v-if="showDDR && !toPostgresService"
                    label="Vehiculos compartidos"
                    :value="tiposAsociacion.vehiculoDejadoRecibir"
                  ></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>
            <div align="left">
              <AsociarFlotas
                v-show="tipoAsociacion === tiposAsociacion.flota"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :flotas="flotas.todos"
                :flotas-seleccionadas="flotas.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                @selectionChange="handleSelectedFlotasChange"
                :show="tipoAsociacion === tiposAsociacion.flota"
              />
            </div>
            <div align="left">
              <AsociarEtiquetas
                v-show="tipoAsociacion === tiposAsociacion.etiqueta"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :etiquetas="etiquetas.todos"
                :etiquetas-seleccionadas="etiquetas.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                @selectionChange="handleSelectedEtiquetasUserChange"
                :show="tipoAsociacion === tiposAsociacion.etiqueta"
              />
            </div>
            <div align="left">
              <AsociarVehiculos
                v-show="tipoAsociacion === tiposAsociacion.vehiculo"
                test-id="AsociarFlotaEtiquetaVehiculo"
                :vehiculos="vehiculos.todos"
                :vehiculos-seleccionados="vehiculos.seleccionados"
                :readonly="readonly"
                :esEditar="esEditar"
                :columnDefs="colDefVehiculo"
                @selectionChange="handleSelectedVehiculosChange"
                :show="tipoAsociacion === tiposAsociacion.vehiculo"
              />
            </div>
            <div align="left">
              <AsociarVehiculos
                v-show="
                  tipoAsociacion === tiposAsociacion.vehiculoDejadoRecibir
                "
                test-id="AsociarFlotaEtiquetaVehiculo"
                :vehiculos="vehiculosDejadosRecibir.todos"
                :vehiculos-seleccionados="vehiculosIdSeleccionar"
                :readonly="readonly"
                :esEditar="esEditar"
                :columnDefs="colDefVehiculo"
                @selectionChange="handleSelectedVehiculosDDRChange($event)"
                :show="tipoAsociacion === tiposAsociacion.vehiculoDejadoRecibir"
              />
            </div>
          </v-form>
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { uniqBy, differenceBy } from 'lodash';

import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import AsociarFlotas from './AsociarFlotas.vue';
import AsociarEtiquetas, {
  SelectionChangeEventParams,
} from './AsociarEtiquetas.vue';
import AsociarVehiculos from './AsociarVehiculos.vue';
import {
  Etiqueta,
  fetchFlotasEtiquetasVehiculos,
  Flota,
  Vehiculo,
} from './fetchFlotasEtiquetasVehiculos';
import { fetchVehiculosDDR } from './fetchVehiculosDDR';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { makeTestId } from '@/reusable/Test/makeTestId';
import { ColDef } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

enum TiposAsociacion {
  flota,
  etiqueta,
  vehiculo,
  vehiculoDejadoRecibir,
}

type Asociacion<T> = {
  todos: T[];
  seleccionados: T[];
};

// TODO reemplazar por evento 'input' y v-model
export type AsociarFlotaEtiquetaVehiculoChangeEvent = {
  flotas: Flota[];
  etiquetas: Etiqueta[];
  vehiculos: Vehiculo[];
  vehiculosDejadosDeRecibir?: Vehiculo[];
};

@Component({
  components: { StepTitle, AsociarVehiculos, AsociarEtiquetas, AsociarFlotas },
})
export default class AsociarFlotaEtiquetaVehiculo extends Vue {
  @Prop({ default: false }) readonly: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop({ default: false }) esInforme: boolean;
  @Prop({ default: (): [] => [] }) flotasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) etiquetasIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) vehiculosIdSeleccionar: number[];
  @Prop({ default: (): [] => [] }) colDefVehiculo: Array<ColDef>;
  @Prop({ default: false }) filtroGps!: boolean;
  @Prop({ default: '' }) reportType: string;

  /* state */

  flotas: Asociacion<Flota> = {
    todos: [],
    seleccionados: [],
  };
  etiquetas: Asociacion<Etiqueta> = {
    todos: [],
    seleccionados: [],
  };
  vehiculos: Asociacion<Vehiculo> = {
    todos: [],
    seleccionados: [],
  };
  vehiculosDejadosRecibir: Asociacion<Vehiculo> = {
    todos: [],
    seleccionados: [],
  };

  /* template */
  axiosPostgres = new AxiosVue(ServicioProxy.Metabase);
  tiposAsociacion = TiposAsociacion;
  tipoAsociacion = TiposAsociacion.flota;
  makeTestId = makeTestId(this);
  vehiculoDDR: Vehiculo[];
  showDDR: boolean = false;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  emitChangeEvent() {
    const event: AsociarFlotaEtiquetaVehiculoChangeEvent = {
      flotas: this.flotas.seleccionados,
      etiquetas: this.etiquetas.seleccionados,
      vehiculos: this.vehiculos.seleccionados,
      vehiculosDejadosDeRecibir: this.vehiculosDejadosRecibir.seleccionados,
    };

    this.$emit('change', event);
  }

  /* event handlers */

  handleSelectedFlotasChange(flotas: Flota[]) {
    this.flotas.seleccionados = flotas;

    /*this.vehiculos.seleccionados = this.vehiculos.todos.filter(vehiculo =>
      flotas.find(x => x.id === vehiculo.flota.id)
    );
    this.etiquetas.seleccionados = uniqBy(
      this.vehiculos.seleccionados.flatMap(x => x.etiquetas),
      etiqueta => etiqueta.id
    );*/

    this.emitChangeEvent();
  }

  handleSelectedEtiquetasUserChange(event: SelectionChangeEventParams) {
    const { selected: etiquetas } = event;
    this.etiquetas.seleccionados = etiquetas;

    // this.vehiculos.seleccionados = this.getVehiculosPorEtiquetas(
    //   etiquetas
    // ).filter(vehiculo => {
    //   const { lastRowSelectionChanged } = event;

    //   if (
    //     vehiculo.etiquetas.find(
    //       etiqueta =>
    //         !!etiquetas.find(
    //           (etiquetaSeleccionada: Etiqueta) =>
    //             etiquetaSeleccionada.id === etiqueta.id
    //         )
    //     )
    //   ) {
    //     return true;
    //   }
    //   if (
    //     vehiculo.etiquetas.find(x => x.id === lastRowSelectionChanged.data.id)
    //   ) {
    //     return lastRowSelectionChanged.isSelected();
    //   }
    //   return true;
    // });

    //this.setFlotasSeleccionadas();
    this.emitChangeEvent();
  }

  handleSelectedEtiquetasChange(etiquetas: Etiqueta[]) {
    this.etiquetas.seleccionados = etiquetas;
    this.vehiculos.seleccionados = this.getVehiculosPorEtiquetas(etiquetas);
    this.setFlotasSeleccionadas();
  }

  getVehiculosPorEtiquetas(etiquetas: Etiqueta[]) {
    return [
      ...this.vehiculos.seleccionados,
      ...this.vehiculos.todos.filter(vehiculo =>
        vehiculo.etiquetas.find(
          etiquetaVehiculo =>
            !!etiquetas.find(
              (etiqueta: Etiqueta) => etiqueta.id === etiquetaVehiculo.id
            )
        )
      ),
    ];
  }

  handleSelectedVehiculosDDRChange(vehiculos: Vehiculo[], event: any) {
    if (this.tipoAsociacion == this.tiposAsociacion.vehiculoDejadoRecibir) {
      this.vehiculos.seleccionados = [];
      this.vehiculosDejadosRecibir.seleccionados = vehiculos;

      this.emitChangeEvent();
    }
  }

  handleSelectedVehiculosChange(vehiculos: Vehiculo[]) {
    if (this.tipoAsociacion != this.tiposAsociacion.vehiculoDejadoRecibir) {
      this.vehiculosDejadosRecibir.seleccionados = [];
      this.vehiculos.seleccionados = vehiculos;

      // const setEtiquetasSeleccionadas = () => {
      //   const etiquetasDeVehiculos: Etiqueta[] = uniqBy(
      //     this.vehiculos.seleccionados.flatMap(x => x.etiquetas),
      //     etiqueta => etiqueta.id
      //   );
      //   const vehiculoPerteneceEtiqueta = (etiqueta: Etiqueta) => (
      //     vehiculo: Vehiculo
      //   ) => !!vehiculo.etiquetas.find(x => x.id === etiqueta.id);

      //   this.etiquetas.seleccionados = etiquetasDeVehiculos.filter(etiqueta => {
      //     const perteneceEtiquetaActual = vehiculoPerteneceEtiqueta(etiqueta);
      //     return (
      //       differenceBy(
      //         this.vehiculos.todos.filter(perteneceEtiquetaActual),
      //         this.vehiculos.seleccionados.filter(perteneceEtiquetaActual),
      //         vehiculo => vehiculo.id
      //       ).length === 0
      //     );
      //   });
      // };

      // this.setFlotasSeleccionadas();
      // setEtiquetasSeleccionadas();
      this.emitChangeEvent();
    }
  }

  setFlotasSeleccionadas() {
    const flotasDeVehiculos: Flota[] = uniqBy(
      this.vehiculos.seleccionados.map(x => x.flota),
      flota => flota.id
    );
    const vehiculoPerteneceFlota = (flota: Flota) => (vehiculo: Vehiculo) =>
      vehiculo.flota.id === flota.id;

    this.flotas.seleccionados = flotasDeVehiculos.filter(flota => {
      const perteneceFlotaActual = vehiculoPerteneceFlota(flota);
      return (
        differenceBy(
          this.vehiculos.todos.filter(perteneceFlotaActual),
          this.vehiculos.seleccionados.filter(perteneceFlotaActual),
          vehiculo => vehiculo.id
        ).length === 0
      );
    });
  }

  /* lifecycle hooks */

  mounted() {
    this.cargarAsociaciones();
    this.cargarVehiculosDDR();
  }
  async cargarVehiculosDDR() {
    if (this.esInforme) {
      const asociaciones = await this.fetchVehiculosDDR();
      const { vehiculos } = asociaciones;
      this.vehiculosDejadosRecibir.todos = vehiculos;
      this.showDDR = true;
    }
  }
  fetchVehiculosDDR() {
    return fetchVehiculosDDR();
  }

  async cargarAsociaciones() {
    var asociaciones: any = await this.fetchFlotasEtiquetasVehiculos();
    if (!asociaciones) {
      return;
    }
    if (this.toPostgresService) {
      asociaciones = asociaciones.data;
    }
    console.log(asociaciones);
    const { etiquetas, flotas, vehiculos } = asociaciones;

    if (!this.filtroGps) {
      this.flotas.todos = flotas;
      this.etiquetas.todos = etiquetas;
      this.vehiculos.todos = vehiculos;
    } else {
      this.vehiculos.todos = vehiculos.filter((v: any) => !v.poseeGps);
      this.flotas.todos = uniqBy(
        this.vehiculos.todos.map(x => x.flota),
        flota => flota.id
      );
      this.etiquetas.todos = uniqBy(
        this.vehiculos.todos.flatMap(x => x.etiquetas),
        etiqueta => etiqueta.id
      );
    }

    this.handleFlotasIdSeleccionarChange();
    this.handleEtiquetasIdSeleccionarChange();
    this.handleVehiculosIdSeleccionarChange();
  }

  fetchFlotasEtiquetasVehiculos() {
    this.loadingService.showLoading();
    if (this.toPostgresService) {
      return this.axiosPostgres.http
        .post(`Metabase/PostgenericA/track/getFleetVehicleModule`, {
          clientId: this.getClientID().toString(),
          userId: this.getUserID().toString(),
          reportType: this.reportType,
        })
        .catch(() => {
          this.$snotify.error(
            `Ha ocurrido un error al intentar obtener flotas/etiquetas/vehiculos disponibles`,
            { timeout: 3000 }
          );
          return;
        })
        .finally(() => this.loadingService.hideLoading());
    } else {
      return fetchFlotasEtiquetasVehiculos()
        .catch(() => {
          this.$snotify.error(
            `Ha ocurrido un error al intentar obtener flotas/etiquetas/vehiculos disponibles`,
            { timeout: 3000 }
          );
          return;
        })
        .finally(() => this.loadingService.hideLoading());
    }
  }

  @Watch('flotasIdSeleccionar')
  handleFlotasIdSeleccionarChange() {
    this.handleSelectedFlotasChange(
      uniqBy(
        [
          ...this.flotas.seleccionados,
          ...this.flotasIdSeleccionar
            .map(id => this.flotas.todos.find(x => x.id === id))
            .filter(x => x !== undefined),
        ],
        x => x.id
      )
    );
  }

  @Watch('reportType', { immediate: true })
  onReportTypeChanged(oldValue: any, newValue: any) {
    if (
      oldValue == 'detalle_detencion_puntos' ||
      oldValue == 'estado_transmision' ||
      newValue == 'estado_transmision' ||
      newValue == 'detalle_detencion_puntos' ||
      oldValue == 'kilometros_recorridos' ||
      newValue == 'kilometros_recorridos'
    ) {
      this.cargarAsociaciones();
    }
  }

  @Watch('etiquetasIdSeleccionar')
  handleEtiquetasIdSeleccionarChange() {
    this.handleSelectedEtiquetasChange(
      uniqBy(
        [
          ...this.etiquetas.seleccionados,
          ...this.etiquetasIdSeleccionar
            .map(id => this.etiquetas.todos.find(x => x.id === id))
            .filter(x => x !== undefined),
        ],
        x => x.id
      )
    );
  }

  @Watch('vehiculosIdSeleccionar')
  handleVehiculosIdSeleccionarChange() {
    this.handleSelectedVehiculosChange(
      uniqBy(
        [
          ...this.vehiculos.seleccionados,
          ...this.vehiculosIdSeleccionar
            .map(id => this.vehiculos.todos.find(x => x.id === id))
            .filter(x => x !== undefined),
        ],
        x => x.id
      )
    );
  }
  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }

  get toPostgresService(): boolean {
    return (
      this.reportType == 'detalle_detencion_puntos' ||
      this.reportType == 'estado_transmision' ||
      this.reportType == 'kilometros_recorridos'
    );
  }
}
</script>
