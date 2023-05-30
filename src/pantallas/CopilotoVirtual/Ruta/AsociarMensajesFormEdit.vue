<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" class="col-md-12">
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Asociar Mensajes">
              <v-flex xs12 sm12 md12>
                <v-expansion-panel
                  v-for="(item, i) in this.lstselectedTipoEvento"
                  :key="i"
                >
                
                  <v-expansion-panel-content>
                    <template v-slot:header>
                      <p>
                        {{ item.nombreRuta }} > {{ item.zonaNombre }} >
                        {{ item.nombreEvento }}
                      </p>
                    </template>

                    <v-card class="grey lighten-4">
                      <div>
                        <v-layout row wrap>
                          <v-flex xs12>
                            <v-layout row wrap>
                              <v-flex
                                xs3
                                v-for="(itemMsj, x) in  EventFilter(item)"
                                :key="x"
                              >
                             
                              <v-card-text v-if="itemMsj.idEvento == item.idEvento">
                                  <v-checkbox
                                    :label="itemMsj.titulo"
                                    v-model="itemMsj.selected"
                                    @change="
                                      handleSelectItem($event, itemMsj, item)
                                    "
                                  />
                              </v-card-text>
                             
                                <!-- <v-card-text
                                  v-if="itemMsj.idEvento == item.idEvento"
                                >
                                  <v-checkbox
                                    :label="itemMsj.titulo"
                                    v-model="itemMsj.selected"
                                    @change="
                                      handleSelectItem($event, itemMsj, item)
                                    "
                                  />
                                </v-card-text> -->
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
import { fetchMensaje } from '../Mensaje/fetchMensaje';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import {
  Color,
  BaseRuta,
  TipoEventoCopiloto,
  TipoEventoCopilotoSeleccionado,
  MensajeSeleccionado,
} from './rutas';
import { Mensaje, MensajeSelected } from '../Mensaje/mensaje';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class AsociarMensajesFormEdit extends Vue {
  @Prop({ default: (): [] => [] })
  readonly lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[];
  @Prop({ default: (): [] => [] }) readonly lsSelectedMsj: MensajeSeleccionado[];
  @Prop({ required: false }) idRuta: number;
  /* state */
  
  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];
  msjfor: MensajeSeleccionado[] = [];
  mensajes: Mensaje[] = [];
  //lstMensaje: MensajeSeleccionado[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }
  created() {
    //this.lstMensaje = this.lsSelectedMsj;
    
  }

  mounted() {}

  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

   EventFilter(id:any){
    //this.lstMensaje tiene la lista de mensajes
    //console.log(this.lstMensaje);
    //return this.lstMensaje.filter(msj => msj.idEvento == id.idEvento)
    
    
    return this.lsSelectedMsj.filter(msj => msj.idEvento == id.idEvento && msj.idZona == id.idZona)
  }
  handleSelectItem(
    check: boolean,
    msj: Mensaje,
    evento: TipoEventoCopilotoSeleccionado
  ) {
    if (check && check != null) {
      
      let filter = this.lsSelectedMsj.filter((m) => m.idMensaje === msj.id && m.idZona===evento.idZona && m.idEvento ===evento.idEvento);
   
      if ((filter.length === 0)&&(msj.id!= null||msj.id!=undefined)) {
        
        //
        this.lsSelectedMsj.push({
          nombreRuta: evento.nombreRuta,
          zonaNombre: evento.zonaNombre,
          nombreEvento: evento.nombreEvento,
          idEvento: evento.idEvento,
          idZona: evento.idZona,
          idMensaje: msj.id,
          titulo: msj.titulo,
          selected: true,
        });
      }
    } else {
      const index = this.lsSelectedMsj.findIndex((x) => x.idMensaje == msj.id);
      if (index > -1) {
        this.lsSelectedMsj.splice(index, 1);
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
