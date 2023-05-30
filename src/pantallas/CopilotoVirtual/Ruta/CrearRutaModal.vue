<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Crear Ruta'" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <CrearRutaForm
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
            @nombre="handlenombre"
            @changeDatosZonas="handleDatosZonas"
          />
        </CrudStepperContent>

        <CrudStepperContent :paso="pasos.asociarEventos">
          <AsociarEventosForm
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
            :lstRutas="lstRutas"
            :lstselectedTipoEvento="lstselectedTipoEvento"
            @handleZonaEventos="handleZonaEventos"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarMensajes">
          <AsociarMensajesForm
            @change="handleFormChange"
            :lstselectedTipoEvento="grillaEventoMensajes"
            :mensajes="mensajes"
            :lsSelectedMsj="lsSelectedMsj"
            :demoM="demoM"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <AsociarFlotaEtiquetaVehiculoIndividual
            :col-def-vehiculo="vehiculoColDefs"
            @change="handleAsociacionesChange"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Ruta' })"
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      :items="itemsNoValidos"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
    <v-dialog v-model="showValidacionLineal" persistent max-width="380">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title
            style="font-size: 17px; margin-left: 10px !important"
            >{{ tituloValidacion }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <span>Debe ingresar:</span>
          <br />
          <br />
          <ul>
            <li v-for="ce in camposZonaEmpty" :key="ce">{{ ce }}</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="showValidacionLineal = false"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CrearRutaForm from '@/pantallas/CopilotoVirtual/Ruta/CrearRutaForm.vue';
import AsociarEventosForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarEventosForm2.vue';
import AsociarMensajesForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesForm2.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import { fetchMensaje } from '../Mensaje/fetchMensaje';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import {
  BaseRuta,
  MensajeSeleccionado,
  Ruta,
  RutaCoordenada,
  RutaEtiqueta,
  RutaEvento,
  RutaEventoMensaje,
  RutaFlota,
  RutaVehiculo,
  TipoEventoCopilotoSeleccionado,
} from './rutas';

import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import { Mensaje } from '../Mensaje/mensaje';
import { ColDef } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { table } from 'console';

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    CrearRutaForm,
    AsociarEventosForm,
    AsociarMensajesForm,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class CrearRutaModal extends Vue {
  @Prop({ required: true }) show: boolean;

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    informacionGeneral: {
      accion: 'Crear - Crear Rutas',
      visible: true,
      step: 1,
      title: 'Crear Rutas',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    asociarEventos: {
      accion: 'Crear - Asociar Eventos',
      visible: true,
      step: 2,
      title: 'Seleccionar Eventos',
      icon: 'directions_car',
    },
    asociarMensajes: {
      accion: 'Crear - Asociar Mensajes',
      visible: true,
      step: 3,
      title: 'Seleccionar Mensajes',
      icon: 'directions_car',
    },
    asociarVehiculos: {
      accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 4,
      title: 'Asociar Vehículos',
      icon: 'directions_car',
    },
  };
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  lstRutas: BaseRuta[] = [];
  nombre: string = '';
  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[] = [];
  lstSelectedRutas: BaseRuta[] = [];
  lsSelectedMsj: MensajeSeleccionado[] = [];

  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  mensajeConfirmacion: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionGuardar: boolean = false;

  /* Event Handlers */
  mensajes: Mensaje[] = [];
  demoM: any = {};

  /* validacion */
  showValidacion: boolean = false;
  showValidacionLineal: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  itemsNoValidos: string[] = [];
  isValidCamposZonas = true;
  showAsociarVehiculos = true;
  camposZonaEmpty: any = '';
  lsRutaCoordenada: RutaCoordenada[] = [];
  lsRutaEvento: RutaEvento[] = [];
  lsRutaEventoMensaje: RutaEventoMensaje[] = [];
  lsRutaVehiculo: RutaVehiculo[] = [];
  lsFlota: RutaFlota[] = [];
  lsEtiqueta: RutaEtiqueta[] = [];

  asociacionesVehiculos: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      lockPinned: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];

  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  rutaResponse: Ruta;
  grillaEventosZona: any[];
  grillaEventoMensajes: any[] = [];

  tipoEventosMap: any = [
    { id: 1, idMap: 'e1', nombre: 'Entrada' },
    { id: 2, idMap: 'e2', nombre: 'Exceso de velocidad' },
    { id: 3, idMap: 'e3', nombre: 'Velocidad bajo la mínima' },
    { id: 4, idMap: 'e4', nombre: 'Detención' },
    { id: 5, idMap: 'e5', nombre: 'Permanencia' },
    { id: 6, idMap: 'e6', nombre: 'Restricción horaria' },
    { id: 7, idMap: 'e7', nombre: 'Salida' },
    { id: 8, idMap: 'e8', nombre: 'Próximo a entrar a la zona' },
  ];

  constructor() {
    super();
    this.pasos.informacionGeneral.permitirContinuar = this.PermiteContinuarAsociarEvento;
    this.pasos.asociarEventos.permitirContinuar = this.PermiteContinuarAsociarMensaje;
    this.pasos.asociarMensajes.permitirContinuar = this.PermiteContinuarAsociarVehiculo;
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.lstRutas = [];
    this.lstselectedTipoEvento = [];
    this.mensajes = [];
    this.lsSelectedMsj = [];
    this.asociacionesVehiculos.etiquetas = [];
    this.asociacionesVehiculos.vehiculos = [];
    this.asociacionesVehiculos.flotas = [];

    this.$emit('cerrar');
  }
  created() {
    this.loadingService.showLoading();
    this.axiosCopiloto.http
      .get('MensajeCopiloto/getMensajes')
      .then((res) => {
        let data: Mensaje[] = res.data;

        this.demoM = data.reduce(function (r: any, e: any) {
          r[e.id] = e.titulo;
          return r;
        }, {});

        //console.log(this.demo);
      })
      .finally(() => this.loadingService.hideLoading);
  }
  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
  }

  handleDatosZonas(lstBaseRuta: BaseRuta[]) {
    this.lstRutas = lstBaseRuta;
  }

  handlenombre(nombre: string) {
    this.nombre = nombre;
  }

  PermiteContinuarAsociarEvento() {
    this.mensajeValidacion = '';
    this.itemsNoValidos = [];

    if (this.nombre === '') {
      this.tituloValidacion = 'Crear Rutas';
      this.mensajeValidacion = 'Debe ingresar un nombre para la ruta';
      this.showValidacion = true;
      return false;
    } else if (this.lstRutas.length === 0) {
      this.tituloValidacion = 'Crear Rutas';
      this.mensajeValidacion = 'Debe seleccionar al menos una zona';
      this.showValidacion = true;
      return false;
    } else if (this.lstRutas.length > 0) {
      let result = true;
      this.lstRutas.forEach((zona) => {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; ///^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        let matches1;
        let matches2;
        if (zona.horaDesde != null) {
          if (zona.horaDesde != '') {
            matches1 = regex.exec(zona.horaDesde);
            if (matches1 === null) result = false;
          }
        }
        if (zona.horaHasta != null) {
          if (zona.horaHasta != '') {
            matches2 = regex.exec(zona.horaHasta);
            if (matches2 === null) result = false;
          }
        }
      });
      if (!result) {
        this.tituloValidacion = 'Formato Horas';
        this.mensajeValidacion =
          'El formato de las horas debe ser HH:mm (22:35)';
        this.showValidacion = true;
        return result;
      }
      return result;
    } else {
      return true;
    }
  }

  PermiteContinuarAsociarMensaje() {
    let glob:boolean = true;
    this.grillaEventoMensajes = [];
    this.lstselectedTipoEvento = [];
    this.grillaEventosZona.forEach((i) => {
      let tieneEvento = false;
      if (i.e1 == 'Sí') {
        let ix = 1;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e2 == 'Sí') {
        let ix = 2;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e3 == 'Sí') {
        let ix = 3;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e4 == 'Sí') {
        let ix = 4;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e5 == 'Sí') {
        let ix = 5;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e6 == 'Sí') {
        let ix = 6;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e7 == 'Sí') {
        let ix = 7;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (i.e8 == 'Sí') {
        let ix = 8;
        tieneEvento = true;
        let idRutaEvento = 0;

        let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
        this.grillaEventoMensajes.push({
          color: i.color,
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
          idRutaEvento: idRutaEvento,
          rutaEventoMensajeId: 0,
          idMensaje: 0,
        });
        this.lstselectedTipoEvento.push({
          nombreRuta: this.nombre,
          zonaNombre: i.zonaNombre,
          nombreEvento: evento[0].nombre,
          idEvento: ix,
          idZona: i.idZona,
          id: i.id,
        });
      }
      if (!tieneEvento){
              glob = false;
            }
    });
    if(!glob){
               this.tituloValidacion = 'Zona sin evento';
              this.mensajeValidacion = 'Debe seleccionar al menos un evento para cada zona';
              this.showValidacion = true;
              return false;
            }else{
              return true;
            }
    // if (this.lstselectedTipoEvento.length === 0) {
    //   this.tituloValidacion = 'Seleccionar Eventos';
    //   this.mensajeValidacion = 'Debe seleccionar al menos un evento';
    //   this.showValidacion = true;
    //   return false;
    // } else {
    //   //this.getMensajes();

    //   return true;
    // }
  }

  PermiteContinuarAsociarVehiculo() {
    let filter = this.grillaEventoMensajes.filter((g: any) => g.mensaje);
    console.log(this.grillaEventoMensajes);
    console.log(filter);
    if (filter.length === 0 || this.grillaEventoMensajes.length != filter.length) {
      this.tituloValidacion = 'Seleccionar Eventos';
      this.mensajeValidacion = 'Debe seleccionar al menos un mensaje por cada evento';
      this.showValidacion = true;
      return false;
    } else {
      return true;
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleFormChangeEventos(event: FormChangeEvent) {
    this.pasos.asociarEventos.formState = event;
    console.log('aca va la validacion de lista');
  }

  handleSwitch(isActivo: boolean) {
    if (!isActivo) {
      this.mensajeConfirmacionInactivo =
        this.$t('mensajes.crud.inactivo.mensaje') +
        ' ' +
        this.$t('mensajes.crud.crear.mensaje', {
          entidad: 'el Mensaje',
        });
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        {
          entidad: 'el Mensaje',
        }
      );
    }
  }

  async getMensajes() {
    this.mensajes = (await this.fetchMensaje()) || [];
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

  //desde aca //

  async handleGuardar() {
    const isValid = true;
    this.mensajeConfirmacion = '¿Está seguro que desea crear la Ruta? ';

    if (isValid) {
      this.dialogConfirmacionGuardar = true;
    }
  }

  handleZonaEventos(lstGrillaEventosZona: any[]) {
    this.grillaEventosZona = lstGrillaEventosZona;
  }

  async handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;
    if (isConfirm) {
      this.loadingService.showLoading();

      // try {
      let RutaBase = { id: 0, nombre: this.lstRutas[0].nombre, ClienteId: 0 };

      //Genera la ruta
      const response = await this.axiosCopiloto.http.post(
        'RutaCopiloto/saveRuta',
        RutaBase
      );
      RutaBase.id = await response.data.id;
      RutaBase.ClienteId = await response.data.clienteId;

      for (let index = 0; index < this.lstRutas.length; index++) {
        this.lsRutaCoordenada.push({
          id: 0,
          rutaId: RutaBase.id,
          coordenadaId: this.lstRutas[index].zona,
          color: this.lstRutas[index].colorHex,
          velocidadMaxima: this.lstRutas[index].velocidadMaxima,
          velocidadMinima: this.lstRutas[index].velocidadMinima,
          //permitirDetencion: 1,
          permitirDetencion: this.lstRutas[index].permitirDetencion,
          tiempoMaximo: this.lstRutas[index].tiempoMaximo,
          horaDesde: this.lstRutas[index].horaDesde,
          horaHasta: this.lstRutas[index].horaHasta,
          colorHex: this.lstRutas[index].colorHex,
          tiempoEntradaGeocerca: this.lstRutas[index].tiempoEntradaGeocerca, //12,
          //repetirMensaje: 1,
          repetirMensaje: this.lstRutas[index].repetirMensaje,
          tiempoRepetir: this.lstRutas[index].tiempoRepetir,
        });
      }

      //Genera las coordenadas
      let lsCoordenadas = await this.axiosCopiloto.http.post(
        'RutaCopiloto/saveRutaCoordenada',
        this.lsRutaCoordenada
      );

      for (let i = 0; i < lsCoordenadas.data.length; i++) {
        for (let j = 0; j < this.lstselectedTipoEvento.length; j++) {
          if (
            this.lstselectedTipoEvento[j].idZona ==
            lsCoordenadas.data[i].coordenadaId
          ) {
            this.lsRutaEvento.push({
              id: 0,
              tipoEventoCopilotoId: this.lstselectedTipoEvento[j].idEvento,
              rutaCoordenadaId: lsCoordenadas.data[i].id,
              rutaId: RutaBase.id,
            });
          }
        }
      }
      //Genera los Mensajes
      let respoRutaEvento = await this.axiosCopiloto.http.post(
        'RutaCopiloto/saveRutaEvento',
        this.lsRutaEvento
      );

      //Se obtienen los id de los eventos insertados/actualizados
      let re = respoRutaEvento.data;
      console.log(re);
      console.log(this.grillaEventoMensajes);
      re.forEach((r: any) => {
        this.grillaEventoMensajes.forEach((g: any) => {
          //Se procesan los id generados y se hacen calzar con los disponibles en la grilla
          if (
            r.tipoEventoCopilotoId === g.idEvento &&
            r.coordenadaId == g.idZona
          ) {
            let idMensaje = g.idMensaje;
            //if (idMensaje === 0) {
            //Se busca el id del mensaje según el texto seleccionado

            Object.keys(this.demoM).forEach((key) => {
              if (this.demoM[key] === g.mensaje) {
                idMensaje = key;
              }
            });
            this.lsRutaEventoMensaje.push({
              MensajeCopilotoId: idMensaje,
              RutaEventoId: r.id,
            });
          }
        });
      });

      // for (let x = 0; x < respoRutaEvento.data.length; x++) {
      //   for (let y = 0; y < this.lsSelectedMsj.length; y++) {
      //     if (
      //       respoRutaEvento.data[x].tipoEventoCopilotoId ==
      //         this.lsSelectedMsj[y].idEvento &&
      //       respoRutaEvento.data[x].coordenadaId == this.lsSelectedMsj[y].idZona
      //     ) {
      //       this.lsRutaEventoMensaje.push({
      //         MensajeCopilotoId: this.lsSelectedMsj[y].idMensaje,
      //         RutaEventoId: respoRutaEvento.data[x].id,
      //       });
      //     }
      //   }
      // }
      let responseRutaEventoMensaje = await this.axiosCopiloto.http.post(
        'RutaCopiloto/SaverutaEventoMensajes',
        this.lsRutaEventoMensaje
      );

      // guardar los vehiculos
      if (this.asociacionesVehiculos.vehiculos.length > 0) {
        for (let z = 0; z < this.asociacionesVehiculos.vehiculos.length; z++) {
          this.lsRutaVehiculo.push({
            vehiculoId: this.asociacionesVehiculos.vehiculos[z].id,
            rutaId: RutaBase.id,
          });
        }

        let responsesaveRutaVehiculo = await this.axiosCopiloto.http.post(
          'RutaCopiloto/saveRutaVehiculo',
          this.lsRutaVehiculo
        );
      }

      // guardar las Flotas
      if (this.asociacionesVehiculos.flotas.length > 0) {
        for (let z = 0; z < this.asociacionesVehiculos.flotas.length; z++) {
          this.lsFlota.push({
            flotaId: this.asociacionesVehiculos.flotas[z].id,
            rutaId: RutaBase.id,
          });
        }

        let responsesaveRutaFlota = await this.axiosCopiloto.http.post(
          'RutaCopiloto/saveRutaFlota',
          this.lsFlota
        );
      }

      //  guardar las etiquetas
      if (this.asociacionesVehiculos.etiquetas.length > 0) {
        for (let z = 0; z < this.asociacionesVehiculos.etiquetas.length; z++) {
          this.lsEtiqueta.push({
            etiquetaId: this.asociacionesVehiculos.etiquetas[z].id,
            rutaId: RutaBase.id,
          });
        }

        let responsesaveRutaEtiqueta = await this.axiosCopiloto.http.post(
          'RutaCopiloto/saveRutaEtiqueta',
          this.lsEtiqueta
        );
      }
      // } catch (error) {
      //   this.$snotify.error('Ha ocurrido un error al intentar crear la ruta', {
      //     timeout: 3000,
      //   });
      // } finally {
      //   this.loadingService.hideLoading();
      //   this.$snotify.success('La ruta ha sido creada de forma exitosa', {
      //     timeout: 3000,
      //   });

      this.pasoActivoIndex = 1;
      this.lstRutas = [];
      this.lstselectedTipoEvento = [];
      this.mensajes = [];
      this.lsSelectedMsj = [];
      this.asociacionesVehiculos.etiquetas = [];
      this.asociacionesVehiculos.vehiculos = [];
      this.asociacionesVehiculos.flotas = [];
      this.$emit('cerrarBtnGuardar');
      // }
    }
  }
}
</script>
