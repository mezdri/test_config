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
                                v-for="(itemMsj, x) in FiltroMensajes(item)"
                                :key="x"
                              >
                             
                                <v-card-text  v-if="itemMsj.idEvento == item.idEvento && isVerDetalle">
                                  <v-checkbox
                                    :label="itemMsj.titulo"
                                    :v-model="itemMsj"
                                    :value="itemMsj.id"
                                    @change="
                                      handleSelectItem($event, itemMsj, item)
                                    "
                                    :disabled="isVerDetalle"
                                  />
                                </v-card-text>
                                <v-card-text  v-else>
                                  <v-checkbox
                                    :label="itemMsj.titulo"
                                    :v-model="itemMsj"
                                    :value="itemMsj.id"
                                    @change="
                                      handleSelectItem($event, itemMsj, item)
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
  MensajeSeleccionado,
} from './rutas';
import { Mensaje } from '../Mensaje/mensaje';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class AsociarMensajesForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ required: false }) mensajes: Mensaje[];
  @Prop({ required: false })
  lstselectedTipoEvento: TipoEventoCopilotoSeleccionado[];
  @Prop({ default: false }) lsSelectedMsj: MensajeSeleccionado[];

  @Prop({ default: false }) esEditar: boolean;
  /* state */

  isFormValid: boolean = false;
  lsZonas: any[] = [];
  lsColor: Color[] = [];
  lsRuta: BaseRuta[] = [];

  constructor() {
    super();
   
  }
  
FiltroMensajes(id:any){
  if(this.isVerDetalle){
    return this.lsSelectedMsj.filter(msj => msj.idEvento == id.idEvento)
    //return this.lsSelectedMsj;
  }else{
    console.log('no es ver detalle');
    console.log(this.mensajes);
    return this.mensajes;
  }
}

  handleSelectItem(
    check: boolean,
    msj: Mensaje,
    evento: TipoEventoCopilotoSeleccionado
  ) {
    if (check != null) {
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
    } else {
      const index = this.lsSelectedMsj.findIndex(x => x.idMensaje == msj.id);
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
