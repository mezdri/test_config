<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" class="col-md-12">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Asociar Eventos">
              <v-flex xs12 sm12 md12>
                <v-expansion-panel>
                  <v-expansion-panel-content
                    v-for="item in this.lstRutas"
                    :key="item.zona"
                  >
                    <template v-slot:header>
                      <div>
                        <p>{{ item.nombre }} > {{ item.zonaNombre }}</p>
                      </div>
                    </template>
                    <v-card class="grey lighten-4">
                      <div>
                        <v-layout row wrap>
                          <v-flex xs12>
                            <v-layout row wrap>
                              <v-flex
                                xs3
                                v-for="itemEvent in item.lstTipoEventoCopiloto"
                                :key="itemEvent.id"
                              >
                                <v-card-text>
                                  <v-checkbox
                                    :label="itemEvent.nombre"
                                    v-model="itemEvent.selected"
                                    @change="
                                      handleSelectItem($event, itemEvent, item)
                                    "
                                  />
                                </v-card-text>
                              </v-flex>
                            </v-layout>
                          </v-flex>
                        </v-layout>
                      </div>
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-flex>
            </FormFieldsContainer>
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

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class AsociarEventosFormEdit extends Vue {
  @Prop({ required: false }) idRuta: number;
  @Prop({ default: (): [] => [] })
  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[];
  @Prop({ default: (): [] => [] }) lsSelectedMsj: MensajeSeleccionado[];
  @Prop({ required: false }) lstRutas: BaseRuta[];
  @Prop() rutaSeleccionada: Ruta;

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];
  zonas: string[] = [];
  mensajes: Mensaje[] = [];
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);
  lstMsj:any[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }

  created() {
    
  }
  mounted() {
   if(this.rutaSeleccionada){
    
     this.datosEventos();
   }
    
    //this.chekearSeleccionados();
  }

  datosEventos() {
    this.loadingService.showLoading();
    this.axiosCopiloto.http.get('MensajeCopiloto/getMensajes')
      .then((res) => {

         res.data.forEach((a: any) => {
            
            this.lstMsj.push({
            idMensaje: a.id,
            titulo: a.titulo,
           
          });
          });
      }).finally(() => {
        this.loadingService.hideLoading();
      });
    
    // let response = await this.axiosCopiloto.http.get(
    //   `RutaCopiloto/getRutaDetalle/${this.idRuta}`
    // );

    // for (let i = 0; i < response.data.length; i++) {
    //   //Se llena con los ya guardados en la BBDD
    //   //this.lstRutas --> Corresponde a lo que viene desde paso anterior
    //   this.lsRuta.push({
    //     nombre: response.data[i].nombre,
    //     zonaNombre: response.data[i].zonaNombre,
    //     zona: response.data[i].zona,
    //     colorHx: response.data[i].colorHx,
    //     vmin: response.data[i].vmin,
    //     vmax: response.data[i].vmax,
    //     pdetenciontxt: response.data[i].pdetenciontxt,
    //     pdetencion: response.data[i].pdetencion,
    //     rmensaje: response.data[i].rmensaje,
    //     rmensajetxt: response.data[i].rmensajetxt,
    //     tmin: response.data[i].tmin,
    //     trmensaje: response.data[i].trmensaje,
    //     hdesde: response.data[i].hdesde,
    //     hhasta: response.data[i].hhasta,
    //     tiempoEntradaGeocerca: null,
    //     lstTipoEventoCopiloto: [],
    //     lstRutaEventoMensaje: [],
    //   });

    //   //desde acá se pone bueno

    //   this.lsRuta[i].lstTipoEventoCopiloto = [
    //     {
    //       id: 1,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Entrada',
    //       selected: false,
    //     },
    //     {
    //       id: 2,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Exceso de velocidad',
    //       selected: false,
    //     },
    //     {
    //       id: 3,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Velocidad bajo la mínima',
    //       selected: false,
    //     },
    //     {
    //       id: 4,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Detención',
    //       selected: false,
    //     },
    //     {
    //       id: 5,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Permanencia',
    //       selected: false,
    //     },
    //     {
    //       id: 6,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Restricción horaria',
    //       selected: false,
    //     },
    //     {
    //       id: 7,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Salida',
    //       selected: false,
    //     },
    //     {
    //       id: 8,
    //       idZona: this.lsRuta[i].zona,
    //       nombre: 'Próximo a entrar a la zona',
    //       selected: false,
    //     },
    //   ];
    // }
    //this.$emit('rutasSel', this.lsRuta);
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
        for (let k = 0; k < this.lstRutas[o].lstTipoEventoCopiloto.length; k++) {
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
      
      let filter = this.lstselectedTipoEvento.filter(z => z.idZona === response.data[x].idZona && z.idEvento===response.data[x].idEvento);
      
       if(filter.length ===0){
         this.lstselectedTipoEvento.push({
           id:response.data[x].id,
        nombreRuta: response.data[x].nombreRuta,
        zonaNombre: response.data[x].zonaNombre,
        nombreEvento: response.data[x].nombreEvento,
        idEvento: response.data[x].idEvento,
        idZona: response.data[x].idZona,
      });
       }
      
    }
   
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
        id:0,
        nombreRuta: rutabase.nombre,
        zonaNombre: rutabase.zonaNombre,
        nombreEvento: evento.nombre,
        idEvento: evento.id,
        idZona: evento.idZona,
      });
      
        let filter = this.lsSelectedMsj.filter((m) => m.idEvento === evento.id && m.idZona===evento.idZona);
          this.lstMsj.forEach(m=>{
          
       if(filter.length === 0){
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
