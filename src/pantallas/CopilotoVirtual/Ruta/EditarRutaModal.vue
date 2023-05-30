<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear :titulo="'Editar Ruta'" @cerrar="handleCerrar">
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
          <!-- <CrearRutaFormEdit
            :isVerDetalle="false"
            :esEditar="true"
            :rutasDetalles="rutasDetalles"
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
            @changeDatosZonas="handleDatosZonas"
          /> -->
          <CrearRutaForm
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
            @nombre="handlenombre"
            @changeDatosZonas="handleDatosZonas"
            :rutaSeleccionada="rutaSeleccionada"
            :modoEditar="true"
          />
        </CrudStepperContent>

        <CrudStepperContent :paso="pasos.asociarEventos">
          <!-- <AsociarEventosForm
            @change="handleFormChange"
            @estadoSwitch="handleSwitch"
            :lstRutas="lstRutas"
            :lstselectedTipoEvento="lstselectedTipoEvento"
            :lsSelectedMsj="lsSelectedMsj"
            :modoEditar="true"
            :idRuta="idRuta"
          /> -->
          <AsociarEventosFormEdit
            @change="handleFormChangeAsociar"
            @estadoSwitch="handleSwitch"
            :idRuta="idRuta"
            :lstRutas="lstRutas"
            :lstselectedTipoEvento="lstselectedTipoEvento"
            :lsSelectedMsj="lsSelectedMsj"
            :rutaSeleccionada="rutaSeleccionada"
            @handleZonaEventos="handleZonaEventos"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarMensajes">
          <AsociarMensajesFormEdit
            :lstselectedTipoEvento="grillaEventoMensajes"
            :mensajes="mensajeSeleccionados"
            :lsSelectedMsj="lsSelectedMsj"
            :idRuta="idRuta"
            :demoM="demo"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <AsociarFlotaEtiquetaVehiculoIndividual
            :col-def-vehiculo="vehiculoColDefs"
            :vehiculosIdSeleccionar="vehiculosIdSeleccionar"
            :flotasIdSeleccionar="flotasIdSeleccionar"
            :etiquetasIdSeleccionar="etiquetasIdSeleccionar"
            :esEditar="true"
            @change="handleAsociacionesChange"
            v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="$t('mensajes.crud.editar.titulo', { entidad: 'Ruta' })"
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CrearRutaFormEdit from '@/pantallas/CopilotoVirtual/Ruta/CrearRutaFormEdit.vue';
import AsociarEventosFormEdit from '@/pantallas/CopilotoVirtual/Ruta/AsociarEventosFormEdit2.vue';
import AsociarMensajesFormEdit from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesFormEdit2.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import { CrearRuta } from '@/pantallas/CopilotoVirtual/Ruta/CrearRuta';
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
  RutaFlota,
  RutaVehiculo,
  TipoEventoCopiloto,
  TipoEventoCopilotoSeleccionado,
} from './rutas';

import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import { Mensaje, MensajeSelected } from '../Mensaje/mensaje';
import { ColDef } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import CrearRutaForm from '@/pantallas/CopilotoVirtual/Ruta/CrearRutaForm.vue';
import AsociarEventosForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarEventosForm.vue';

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    CrearRutaFormEdit,
    CrearRutaForm,
    AsociarEventosFormEdit,
    AsociarEventosForm,
    AsociarMensajesFormEdit,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class EditarRutaModal extends Vue {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) rutaSeleccionada: Ruta;

  rutasDetalles: BaseRuta[] = [];

  pasoActivoIndex = 1;

  rutaBase: any = {
    id: '',
    nombre: '',
  };

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

  tituloEvento: string;
  lstRutas: BaseRuta[] = [];
  lstRutaCoordenada: RutaCoordenada[] = [];
  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[] = [];
  lstSelectedRutas: BaseRuta[] = [];
  lsSelectedMsj: MensajeSeleccionado[] = [];

  grillaEventoMensajes: any[] = [];

  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  mensajeConfirmacion: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  idRuta: number = null;
  /* Event Handlers */
  mensajes: Mensaje[] = [];
  mensajeSeleccionados: MensajeSelected[] = [];
  eventosCopiloto: TipoEventoCopiloto[] = [];

  /* validacion */
  showValidacion: boolean = false;
  showValidacionLineal: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  itemsNoValidos: string[] = [];
  isValidCamposZonas = true;
  showAsociarVehiculos = true;
  camposZonaEmpty: any = '';
  vehiculosIdSeleccionar: number[] = [];
  etiquetasIdSeleccionar: number[] = [];
  flotasIdSeleccionar: number[] = [];
  nombre: string = '';

  lsRutaVehiculo: RutaVehiculo[] = [];
  lsFlota: RutaFlota[] = [];
  lsEtiqueta: RutaEtiqueta[] = [];

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

  demo: any = {};

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
  lsRutaEvento: any = [];
  lsRutaEventoMensaje: any = [];
  tituloEventos: string;
  grillaEventosZona: any[];

  constructor() {
    super();
    this.pasos.informacionGeneral.permitirContinuar =
      this.PermiteContinuarAsociarEvento;
    this.pasos.asociarEventos.permitirContinuar =
      this.PermiteContinuarAsociarMensaje;
    this.pasos.asociarMensajes.permitirContinuar =
      this.PermiteContinuarAsociarVehiculo;
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.rutasDetalles = [];
    this.lstselectedTipoEvento = [];
    this.mensajeSeleccionados = [];
    this.lsSelectedMsj = [];
    this.idRuta = null;
    this.vehiculosIdSeleccionar = [];
    this.flotasIdSeleccionar = [];
    this.etiquetasIdSeleccionar = [];
    this.lstRutas = [];

    this.mensajes = [];
    this.lsRutaEventoMensaje = [];
    this.lsRutaEvento = [];
    this.rutasDetalles = [];
    this.asociacionesVehiculos.etiquetas = [];
    this.asociacionesVehiculos.vehiculos = [];
    this.asociacionesVehiculos.flotas = [];
    this.lsFlota = [];
    this.lsEtiqueta = [];
    this.lsRutaVehiculo = [];
    //this.demo = {};
    this.$emit('cerrar');
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
  }

  handlenombre(nombre: string) {
    this.nombre = nombre;
  }

  handleDatosZonas(lstBaseRuta: BaseRuta[]) {
    this.rutasDetalles = lstBaseRuta;
    this.lstRutas = lstBaseRuta;
  }

  PermiteContinuarAsociarEvento() {
    this.mensajeValidacion = '';
    this.itemsNoValidos = [];

    // debugger;
    if (this.rutasDetalles.length === 0) {
      this.tituloValidacion = 'Editar Rutas';
      this.mensajeValidacion = 'Debe agregar al menos una ruta';
      this.showValidacion = true;
      return false;
      //return false;
    } else if (this.rutasDetalles.length > 0) {
      let result = true;

      this.rutasDetalles.forEach((zona) => {
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
      this.chekearSeleccionados();
      return result;
    } else {
      //this.lstRutas = this.rutasDetalles;
      this.chekearSeleccionados();

      return true;
    }
  }

  PermiteContinuarAsociarMensaje() {
    
     let glob:boolean = true;
    

    if (this.lstselectedTipoEvento.length === 0 && this.grillaEventosZona.length===0) {
      this.tituloValidacion = 'Seleccionar Eventos';
      this.mensajeValidacion = 'Debe seleccionar al menos un evento';
      this.showValidacion = true;
      return false;
    } else if(this.grillaEventosZona.length>0){
    
      this.grillaEventosZona.forEach((i) => {
        let tieneEvento = false;
            if (i.e1 == 'Sí') {
              
              tieneEvento = true;
              
            }
            if (i.e2 == 'Sí') {
              
              tieneEvento = true;
             
            }
            if (i.e3 == 'Sí') {
              
              tieneEvento = true;
             
            }
            if (i.e4 == 'Sí') {
             
              tieneEvento = true;
             
            }
            if (i.e5 == 'Sí') {
              
              tieneEvento = true;
              
            }
            if (i.e6 == 'Sí') {
              
              tieneEvento = true;
             
            }
            if (i.e7 == 'Sí') {
              
              tieneEvento = true;
             
            }
            if (i.e8 == 'Sí') {
              
              tieneEvento = true;
             
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
              this.lstselectedTipoEvento = [];
      this.grillaEventoMensajes = [];

      //Se obtienen los eventos de la ruta, para sacar ID auto-incremental de la BBDD
      this.loadingService.showLoading();
      this.axiosCopiloto.http
        .get(`RutaCopiloto/getEventoRuta/${this.rutaSeleccionada.id}`)
        .then((response: any) => {
          let datos = response.data;
         let tieneEventoGlo = true;
          this.grillaEventosZona.forEach((i) => {
             let tieneEvento = false;
            if (i.e1 == 'Sí') {
              let ix = 1;
              tieneEvento = true;
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d = datos.find(
                (d: any) => d.idEvento == ix && d.idZona == i.idZona
              );
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
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
              let d =
                datos.find(
                  (d: any) => d.idEvento == ix && d.idZona == i.idZona
                ) || 0;
              let idRutaEvento = 0;
              if (d != undefined) idRutaEvento = d.id;

              let evento = this.tipoEventosMap.filter((t: any) => t.id === ix);
              this.grillaEventoMensajes.push({
                color: i.color,
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
                idRutaEvento: idRutaEvento,
              });
              this.lstselectedTipoEvento.push({
                nombreRuta: this.rutaSeleccionada.nombre,
                zonaNombre: i.zonaNombre,
                nombreEvento: evento[0].nombre,
                idEvento: ix,
                idZona: i.idZona,
                id: i.id,
              });
            }
           
           
          });
            
          this.loadingService.showLoading();
          this.axiosCopiloto.http
            .get(`RutaCopiloto/getMensajesDetalle/${this.rutaSeleccionada.id}`)
            .then((response: any) => {
              let datos = response.data;

              this.grillaEventoMensajes.forEach((g) => {
                let d = datos.find(
                  (d: any) => d.rutaEventoId == g.idRutaEvento
                );
                if (d != undefined) {
                  this.$set(g, 'rutaEventoMensajeId', d.rutaEventoMensajeId);
                  this.$set(g, 'idMensaje', d.id);
                } else {
                  this.$set(g, 'rutaEventoMensajeId', 0);
                  this.$set(g, 'idMensaje', 0);
                }
              });
            })
            .finally(() => this.loadingService.hideLoading());
        })
        .finally(() => this.loadingService.hideLoading());

      return true;
            }
    } 
  }

  async chekearSeleccionados() {
    this.loadingService.showLoading();
    this.lsSelectedMsj = [];
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
        (z) =>
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

    //this.getMensajes(this.rutaSeleccionada.id);
    this.loadingService.hideLoading();
  }

  PermiteContinuarAsociarVehiculo() {
   
    let filter = this.grillaEventoMensajes.filter((g: any) => g.mensaje);
   
    if (filter.length === 0 || this.grillaEventoMensajes.length != filter.length) {
      this.tituloValidacion = 'Seleccionar Eventos';
      this.mensajeValidacion = 'Debe seleccionar al menos un mensaje por cada evento';
      this.showValidacion = true;
      return false;
    } else {
      this.getVehiculos(this.rutaSeleccionada.id);
      return true;
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }
  handleFormChangeAsociar(event: FormChangeEvent) {
    this.pasos.asociarEventos.formState = event;
  }

  handleFormChangeEventos(event: FormChangeEvent) {
    this.pasos.asociarEventos.formState = event;
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

  handleGuardar() {
    const isValid = true;
    this.tituloValidacion = 'Editar Rutas';
    this.mensajeConfirmacion = '¿Está seguro que desea editar la Ruta? ';

    if (isValid) {
      this.dialogConfirmacionGuardar = true;
    }
  }

   async handleConfirmacionGuardar(isConfirm: boolean) {
     try {
      this.loadingService.showLoading();
      
    this.dialogConfirmacionGuardar = false;
    if (isConfirm) {
     

      // try {
      this.rutaSeleccionada.nombre = this.nombre;
      let RutaBase = this.rutaSeleccionada;
      this.$set(RutaBase, 'estado', 1);

      // //Update la ruta
      //
      const response = await this.axiosCopiloto.http.put(
        'RutaCopiloto/updateRuta',
        RutaBase
      ).finally(()=>{this.loadingService.showLoading();});
     
      //Genera las coordenadas - se guardan/actualizan los sitios asociados a la ruta
      let lsCoordenadas = await this.axiosCopiloto.http.put(
        `RutaCopiloto/updateRutaCoordenada/${RutaBase.id}`,
        this.lstRutas
      ).finally(()=>{
        this.loadingService.showLoading();
        this.$snotify.success('Las zonas de la ruta han sido actualizadas', {
          timeout: 3000,
        });
      });

      //resultados de los id insertados/actualizados
      let r = lsCoordenadas.data.result;

      //lstselectedTipoEvento, tiene que tener los eventos seleccionados por zonas
      //ver como se obtienen losd atos desde las grillas

      r.forEach((z: any) => {
        this.grillaEventoMensajes.forEach((g: any) => {
          if (z.coordenadaId == g.idZona) {
            this.lsRutaEvento.push({
              id: g.idRutaEvento,
              tipoEventoCopilotoId: g.idEvento,
              rutaCoordenadaId: z.id,
              rutaId: RutaBase.id,
            });
          }
        });
      });

      

      //Genera los Mensajes
      let respoRutaEvento = await this.axiosCopiloto.http.put(
        `RutaCopiloto/updateRutaEvento/${RutaBase.id}`,
        this.lsRutaEvento,{ 
      headers: {
          'Access-Control-Allow-Origin': '*',
       }
},
      ).finally(()=>{
        this.loadingService.showLoading();
        this.$snotify.success('Los eventos de las zonas han sido actualizadas', {
          timeout: 3000,
        });
      });

      //Se obtienen los id de los eventos insertados/actualizados
      let re = respoRutaEvento.data.result;

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

            Object.keys(this.demo).forEach((key) => {
              if (this.demo[key] === g.mensaje) {
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

      let responseRutaEventoMensaje = await this.axiosCopiloto.http.put(
        `RutaCopiloto/updateRutaEventoMensajes/${RutaBase.id}`,
        this.lsRutaEventoMensaje
      ).finally(()=>{
        this.loadingService.showLoading();
        this.$snotify.success('Los mensajes de los eventos han sido actualizados.', {
          timeout: 3000,
        });
      });
      //   .catch(() => {
      //     this.lsRutaEventoMensaje = [];
      //   });

      // // guardar los vehiculos
      if (this.asociacionesVehiculos.vehiculos.length > 0) {
        for (let z = 0; z < this.asociacionesVehiculos.vehiculos.length; z++) {
          this.lsRutaVehiculo.push({
            vehiculoId: this.asociacionesVehiculos.vehiculos[z].id,
            rutaId: RutaBase.id,
          });
        }

        let responsesaveRutaVehiculo = await this.axiosCopiloto.http.put(
          `RutaCopiloto/updateRutaVehiculo/${RutaBase.id}`,
          this.lsRutaVehiculo
        );
      }

      // // guardar las Flotas
      if (this.asociacionesVehiculos.flotas.length > 0) {
        for (let z = 0; z < this.asociacionesVehiculos.flotas.length; z++) {
          this.lsFlota.push({
            flotaId: this.asociacionesVehiculos.flotas[z].id,
            rutaId: RutaBase.id,
          });
        }

        let responsesaveRutaFlota = await this.axiosCopiloto.http.put(
          `RutaCopiloto/updateRutaFlota/${RutaBase.id}`,
          this.lsFlota
        );
      }

      // //  guardar las etiquetas
      if (this.asociacionesVehiculos.etiquetas.length > 0) {
        for (let z = 0; z < this.asociacionesVehiculos.etiquetas.length; z++) {
          this.lsEtiqueta.push({
            etiquetaId: this.asociacionesVehiculos.etiquetas[z].id,
            rutaId: RutaBase.id,
          });
        }

        let responsesaveRutaEtiqueta = await this.axiosCopiloto.http.put(
          `RutaCopiloto/updateEtiqueta/${RutaBase.id}`,
          this.lsEtiqueta
        );
      }
      // // } catch (error) {
      // //   this.$snotify.error('Ha ocurrido un error al intentar crear la ruta', {
      // //     timeout: 3000,
      // //   });
      // // } finally {
        
        this.$snotify.success('La ruta ha sido editada de forma exitosa', {
          timeout: 3000,
        });

      this.pasoActivoIndex = 1;
      this.lstRutas = [];
      this.lstselectedTipoEvento = [];
      this.mensajes = [];
      this.lsSelectedMsj = [];
      this.lsRutaEventoMensaje = [];
      this.lsRutaEvento = [];
      this.rutasDetalles = [];
      this.asociacionesVehiculos.etiquetas = [];
      this.asociacionesVehiculos.vehiculos = [];
      this.asociacionesVehiculos.flotas = [];
      this.grillaEventosZona = [];
      this.lsRutaVehiculo = [];
      this.lsEtiqueta = [];
      this.lsFlota = [];
      this.vehiculosIdSeleccionar = [];
      this.flotasIdSeleccionar = [];
      this.etiquetasIdSeleccionar = [];
      this.$emit('cerrarBtnGuardar');
      // }
    }
   }catch(error) {
     console.log(error);
       this.$snotify.error('Ha ocurrido un error al intentar editar la ruta', {
          timeout: 3000,
        });
   }finally {
      this.loadingService.hideLoading();
    }
  }

  async guardarNuevaRuta() {
    const nombreRuta = this.rutasDetalles[0];
    const response = this.axiosCopiloto.http.post(
      `RutaCopiloto/saveRuta`,
      nombreRuta
    );
  }

  created() {
    this.loadingService.showLoading();
    this.axiosCopiloto.http
      .get('MensajeCopiloto/getMensajes')
      .then((res) => {
        let data: Mensaje[] = res.data;

        this.demo = data.reduce(function (r: any, e: any) {
          r[e.id] = e.titulo;
          return r;
        }, {});
      })
      .finally(() => this.loadingService.hideLoading);
  }

  mounted() {
    if (this.rutaSeleccionada) {
      this.rutaBase.id = this.rutaSeleccionada.id;
      this.rutaBase.nombre = this.rutaSeleccionada.nombre;
      this.getMensajes(this.rutaSeleccionada.id);
    }
    this.idRuta = this.rutaBase.id;

    this.handleRutasSeleccionadas();
  }

  @Watch('rutaSeleccionada')
  handleRutasSeleccionadas() {
    if (!this.rutaSeleccionada) {
      return;
    } else {
      this.idRuta = this.rutaBase.id;

      //this.datosGrillaFormCrear();
      // this.getMensajes(this.rutaSeleccionada.id);
    }
  }
  async datosGrillaFormCrear() {
    this.rutasDetalles = [];

    let response = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getRutaDetalle/${this.rutaBase.id}`
    );

    for (let index = 0; index < response.data.length; index++) {
      let filter = this.rutasDetalles.filter(
        (m) => m.zona === response.data[index].zona
      );

      if (filter.length === 0) {
        this.rutasDetalles.push({
          nombre: response.data[index].nombre,
          zonaNombre: response.data[index].zonaNombre,
          zona: response.data[index].zona,
          colorHex: response.data[index].colorHx,
          velocidadMinima: response.data[index].vmin,
          velocidadMaxima: response.data[index].vmax,
          pdetenciontxt: response.data[index].pdetenciontxt,
          permitirDetencion: response.data[index].permitirDetencion,
          repetirMensaje: response.data[index].repetirMensaje,
          rmensajetxt: response.data[index].rmensajetxt,
          tiempoMaximo: response.data[index].tiempoMaximo,
          tiempoRepetir: response.data[index].tiempoRepetir,
          horaDesde: response.data[index].hdesde,
          horaHasta: response.data[index].hhasta,
          tiempoEntradaGeocerca: response.data[index].tiempoEntradaGeocerca,
          lstTipoEventoCopiloto: [], //eventoResponse.data,
          lstRutaEventoMensaje: [],
          id: response.data[index].Id,
          rutaId: response.data[index].rutaId,
          color: response.data[index].colorHx,
          coordenadaId: response.data[index].zona,
        });

        // this.lstRutaCoordenada.push({
        //     id: response.data[index].rutaCoordenadaId,
        //     rutaId: response.data[index].rutaId,
        //     coordenadaId: response.data[index].coordenadaId,
        //     color: response.data[index].colorHx,
        //     velocidadMaxima: response.data[index].vmax,
        //     velocidadMinima: response.data[index].vmin,
        //     permitirDetencion: response.data[index].pdetencion,
        //     tiempoMaximo: response.data[index].tmin,
        //     horaDesde: response.data[index].hdesde,
        //     horaHasta: response.data[index].hhasta,
        //     colorHex: response.data[index].colorHx,
        //     tiempoEntradaGeocerca: response.data[index].tiempoEntradaGeocerca,
        //     repetirMensaje: response.data[index].rmensaje,
        //     tiempoRepetir: response.data[index].trmensaje
        // });
      }
    }

    this.getVehiculos(this.rutaBase.id);
  }

  async getVehiculos(rutaId: number) {
    let vehiculos = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getVehiculos/${rutaId}`
    );

    this.vehiculosIdSeleccionar = vehiculos.data[0];
    this.flotasIdSeleccionar = vehiculos.data[1];
    this.etiquetasIdSeleccionar = vehiculos.data[2];
  }

  handleZonaEventos(lstGrillaEventosZona: any[]) {
    this.grillaEventosZona = lstGrillaEventosZona;
  }

  async getMensajes(rutaId: number) {
    this.loadingService.showLoading();

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

    this.loadingService.showLoading();
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
    this.loadingService.hideLoading();
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
}
</script>
