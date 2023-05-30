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
                                    :v-model="itemEvent.selected"
                                    :value="itemEvent.id"
                                    @change="
                                      handleSelectItem($event, itemEvent, item)
                                    "
                                    :disabled="isVerDetalle"
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
import { Mensaje } from '../Mensaje/mensaje';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { fetchMensaje } from '../Mensaje/fetchMensaje';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class AsociarEventosForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ required: false }) lstRutas: BaseRuta[];
  @Prop({ default: false }) modoEditar: boolean;
   @Prop({ required: false }) idRuta: number;
  @Prop({ default: (): [] => [] })
  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[];
  @Prop({ default: (): [] => [] }) lsSelectedMsj: MensajeSeleccionado[];
  @Prop ({required:false}) rutasDetalles:BaseRuta[];

  /* state */

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];

  
  zonas: string[] = [];
  mensajes: Mensaje[] = [];
  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  formFields: FormFieldDefMap = {
    checkTipoEvento: {
      label: 'nombre',
      id: 'id',
      value: false,
    },
  };
  loadingService: any;
  $snotify: any;

  constructor() {
    super();
  }

  mounted(){
   
    if((this.modoEditar)||(this.isVerDetalle)){
     
       //this.datosEventos();
    }
  }
  async datosEventos() {
    let response = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getRutaDetalle/${this.idRuta}`
    );

    for (let i = 0; i < response.data.length; i++) {
      this.lsRuta.push({
        nombre: response.data[i].nombre,
        zonaNombre: response.data[i].zonaNombre,
        zona: response.data[i].zona,
        colorHex: response.data[i].colorHex,
        velocidadMinima: response.data[i].vmin,
        velocidadMaxima: response.data[i].vmax,
        pdetenciontxt: response.data[i].pdetenciontxt,
        permitirDetencion: response.data[i].pdetencion,
        repetirMensaje: response.data[i].rmensaje,
        rmensajetxt: response.data[i].rmensajetxt,
        tiempoMaximo: response.data[i].tmin,
        tiempoRepetir: response.data[i].trmensaje,
        horaDesde: response.data[i].hdesde,
        horaHasta: response.data[i].hhasta,
        tiempoEntradaGeocerca: null,
        lstTipoEventoCopiloto: [],
        lstRutaEventoMensaje: [],
        id:response.data[i].Id,
        rutaId:response.data[i].rutaId,
        color:response.data[i].colorHx,
        coordenadaId:response.data[i].zona
      });

      //desde acá se pone bueno

      this.lsRuta[i].lstTipoEventoCopiloto = [
        {
          id: 1,
          idZona: this.lsRuta[i].zona,
          nombre: 'Entrada',
          selected: false,
        },
        {
          id: 2,
          idZona: this.lsRuta[i].zona,
          nombre: 'Exceso de velocidad',
          selected: false,
        },
        {
          id: 3,
          idZona: this.lsRuta[i].zona,
          nombre: 'Velocidad bajo la mínima',
          selected: false,
        },
        {
          id: 4,
          idZona: this.lsRuta[i].zona,
          nombre: 'Detención',
          selected: false,
        },
        {
          id: 5,
          idZona: this.lsRuta[i].zona,
          nombre: 'Permanencia',
          selected: false,
        },
        {
          id: 6,
          idZona: this.lsRuta[i].zona,
          nombre: 'Restricción horaria',
          selected: false,
        },
        {
          id: 7,
          idZona: this.lsRuta[i].zona,
          nombre: 'Salida',
          selected: false,
        },
        {
          id: 8,
          idZona: this.lsRuta[i].zona,
          nombre: 'Próximo a entrar a la zona',
          selected: false,
        },
      ];
    }

    this.chekearSeleccionados();
  }

  async chekearSeleccionados() {
   
    let response = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getEventoRuta/${this.idRuta}`
    );
 
    for (let x = 0; x < response.data.length; x++) {
      for (let o = 0; o < this.lsRuta.length; o++) {
        for (let k = 0; k < this.lsRuta[o].lstTipoEventoCopiloto.length; k++) {
          if (
            this.lsRuta[o].lstTipoEventoCopiloto[k].idZona ==
              response.data[x].idZona &&
            this.lsRuta[o].lstTipoEventoCopiloto[k].id ==
              response.data[x].idEvento
          ) {
            console.log(this.lsRuta[o]);
            this.lsRuta[o].lstTipoEventoCopiloto[k].selected = true;
          }
        }
      }
      this.lstselectedTipoEvento.push({
        id:response.data[x].Id,
        nombreRuta: response.data[x].nombreRuta,
        zonaNombre: response.data[x].zonaNombre,
        nombreEvento: response.data[x].nombreEvento,
        idEvento: response.data[x].idEvento,
        idZona: response.data[x].idZona,
      });

      
    }
   
  }

  async getMensajes(rutaId: number) {
    if (this.lstselectedTipoEvento.length > 0) {
      console.log('nunca entra');
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
  
    if ((check != null)) {
     
      this.lstselectedTipoEvento.push({
        id:0,
        nombreRuta: rutabase.nombre,
        zonaNombre: rutabase.zonaNombre,
        nombreEvento: evento.nombre,
        idEvento: evento.id,
        idZona: evento.idZona,
        
      });
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
