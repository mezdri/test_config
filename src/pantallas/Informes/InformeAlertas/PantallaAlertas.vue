<template>
  <v-layout row wrap>
    <v-flex xs12 sm6 md6>
      <v-select
        label="Alerta Base"
        v-model="tipoAlerta"
        :items="lstAlertasBaseFiltro"
        class="styled-select"
        style="margin-top: 8px"
        item-text="nombre"
        item-value="id"
        @change="setTipoAlertaBase($event)"
        :disabled="accion === 3"
      ></v-select>
    </v-flex>
    <v-flex xs12 sm6 md6>
      <v-select
        label="Tipo Alerta"
        v-model="tipoAlertaCliente"
        :items="lstAlertasCliente"
        class="styled-select"
        style="margin-top: 8px"
        item-text="nombre"
        item-value="id"
        @change="setTipoAlertaCliente($event)"
        :disabled="accion === 3"
        multiple
        flat
        no-data-text="Sin resultados"
      >
        <template v-slot:selection="{ item, index }">
          <v-chip v-if="index === 0" small>
            <span>{{ textoComprimido(item.nombre) }}</span>
          </v-chip>
          <span v-if="index === 1" class="grey--text caption"
            >(+{{ tipoAlertaCliente.length - 1 }} Alertas)</span
          >
        </template>
      </v-select>
    </v-flex>
    <FormFieldsContainer>
      <v-flex>
        <v-checkbox
          :label="formFields.checkEtiqueta.label"
          v-model="formFields.checkEtiqueta.value"
          v-if="this.show"
          @change="checkAlertas"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="formFields.checkColor.label"
          v-model="formFields.checkColor.value"
          v-if="this.show"
          @change="checkAlertas"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="formFields.checkHDOP.label"
          v-model="formFields.checkHDOP.value"
          v-if="this.show"
          @change="checkAlertas"
          :disabled="accion === 3"
        />
      </v-flex>
      <v-flex>
        <v-checkbox
          :label="formFields.checkSatelite.label"
          v-model="formFields.checkSatelite.value"
          v-if="this.show"
          @change="checkAlertas"
          :disabled="accion === 3"
        />
      </v-flex>
    </FormFieldsContainer>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Alertas from '@/pantallas/Alertas/Alertas.vue';
import { LoadingService } from '@/services/loadingService';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import {
  AlertasBaseBackend,
  AlertasCliente,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { fetchAlertasBase } from '@/pantallas/Alertas/Services/fetchAlertasBase';
import { fetchByIdAlertaBaseCliente } from '@/pantallas/Alertas/Services/fetchByIdAlertaBaseCliente';
import { Snotify } from '@/snotify/Snotify';
import InformeEventBus from '@/pantallas/Informes/partes/InformeEventBus';

@Component({
  components: { Alertas, FormFieldsContainer },
})
export default class AlertasPantalla extends Vue {
  loadingService = new LoadingService();
  @Prop() alertaBaseCliente: any;
  @Prop() alertaBaseId: string;
  @Prop({
    default(): string[] {
      return [];
    },
  })
  columnasOcultasAlertas!: any;
  @Prop({ default: 1 }) accion: number;
  readonly $snotify: Snotify;

  tipoAlerta: number = 0;
  tipoAlertaCliente: any[] = [];
  nroElementosFocus: number;

  lstAlertasBase: AlertasBaseBackend[] = [];
  lstAlertasBaseFiltro: AlertasBaseBackend[] = [];
  lstAlertasCliente: AlertasCliente[] = [];
  lstAlertasClienteFiltro: AlertasCliente[] = [];
  show: boolean = false;

  formFields: FormFieldDefMap = {
    checkEtiqueta: {
      label: 'Etiqueta',
      id: 'etiqueta',
      value: false,
    },
    checkSatelite: {
      label: 'Número de sátelites',
      id: 'nrosatelites',
      value: false,
    },
    checkHDOP: {
      label: 'HDOP',
      id: 'hdop',
      value: false,
    },
    checkColor: {
      label: 'Color',
      id: 'color',
      value: false,
    },
  };
  mounted() {
    this.fetchAlertasBase();
  }
  @Watch('tipoAlertaCliente')
  sss() {
    //console.log(this.tipoAlertaCliente)
  }

  @Watch('formFields')
  onFormFieldsChanged() {
    this.checkAlertas();
  }

  @Watch('alertaBaseCliente', { deep: true, immediate: true })
  onAlertaBaseClienteChanged() {
    this.tipoAlertaCliente = this.alertaBaseCliente;
  }

  @Watch('alertaBaseId', { deep: true, immediate: true })
  onAlertaBaseIdChanged() {
    if (this.alertaBaseId != undefined) {
      this.tipoAlerta = Number(this.alertaBaseId);
      this.setTipoAlertaBaseEdit(Number(this.alertaBaseId), 0);
    }
  }

  @Watch('columnasOcultasAlertas', { deep: true, immediate: true })
  onColumnasOcultasAlertasChanged() {
    if (this.columnasOcultasAlertas.includes('hdop')) {
      this.formFields.checkHDOP.value = true;
    }
    if (this.columnasOcultasAlertas.includes('color')) {
      this.formFields.checkColor.value = true;
    }
    if (this.columnasOcultasAlertas.includes('nrosatelites')) {
      this.formFields.checkSatelite.value = true;
    }
    if (this.columnasOcultasAlertas.includes('etiqueta')) {
      this.formFields.checkEtiqueta.value = true;
    }
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 41) {
      retorno = item.substr(0, 40) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  focus(evento: boolean) {
    if (evento === true) {
      this.nroElementosFocus = this.tipoAlertaCliente.length;
    } else if (
      evento === false &&
      this.nroElementosFocus != this.tipoAlertaCliente.length
    ) {
      //this.changeFiltro(0, false);
    }
  }

  async setTipoAlertaBase(id: number, cliente: number) {
    this.loadingService.showLoading();
    return fetchByIdAlertaBaseCliente(id)
      .then(res => {
        if (id == 48) {
          this.show = true;
        } else {
          this.show = false;
        }
        this.lstAlertasCliente = res;

        res.forEach(a => {
          this.lstAlertasClienteFiltro.push(a);
        });

        this.setTipoAlertaCliente(null);
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de Alerta Base',
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        InformeEventBus.$emit('tipoAlerta', id);
      });
  }
  async setTipoAlertaBaseEdit(id: number, cliente: number) {
    this.loadingService.showLoading();
    return fetchByIdAlertaBaseCliente(id)
      .then(res => {
        if (id == 48) {
          this.show = true;
        } else {
          this.show = false;
        }
        this.lstAlertasCliente = res;

        res.forEach(a => {
          this.lstAlertasClienteFiltro.push(a);
        });
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de Alerta Base',
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        // console.log(listAlert);
        // this.tipoAlertaCliente = listAlert;
        InformeEventBus.$emit('tipoAlerta', id);
      });
  }

  async setTipoAlertaCliente(id: any) {
    this.tipoAlertaCliente = id;
    //console.log('aca -->', this.tipoAlertaCliente);
    InformeEventBus.$emit('tipoAlertaCliente', id);
  }

  async fetchAlertasBase() {
    this.loadingService.showLoading();
    return fetchAlertasBase()
      .then(res => {
        this.lstAlertasBase = res;

        res.forEach(a => {
          this.lstAlertasBaseFiltro.push(a);
        });
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de Alerta',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }
  checkAlertas() {
    var check = [];
    if (this.formFields.checkSatelite.value) {
      check.push(this.formFields.checkSatelite.id);
    }
    if (this.formFields.checkHDOP.value) {
      check.push(this.formFields.checkHDOP.id);
    }
    if (this.formFields.checkColor.value) {
      check.push(this.formFields.checkColor.id);
    }
    if (this.formFields.checkEtiqueta.value) {
      check.push(this.formFields.checkEtiqueta.id);
    }

    InformeEventBus.$emit('checkAlerta', check);
  }

  /* handleTipoAlertaChange(idBase: number) {
    if (idBase != 0) {
      let filtro = this.lstAlertas.filter(a => a.alertaBaseId == idBase);
      this.gridApi.setRowData(filtro);
    } else {
      this.gridApi.setRowData(this.lstAlertas);
    }
  }*/
}
</script>
