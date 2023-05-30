<template>
  <div class="layout wrap widgets">
    <v-flex
      m1
      md1
      wrapper-widget
      v-for="l in listaAlertasWidgets"
      :key="l.tipo_alarma"
      :class="l.id"
      @click="filterWidget(l.id)"
    >
      <p class="title-widget">{{ l.tipo_alarma }}</p>
      <p class="count">{{ l.total }}</p>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { isFunction } from 'lodash';
import { ConfigTiposAlerta } from '@/pantallas/Camaras/Alertas/fetchTipoAlerta';
import { AlertaWidget } from '@/pantallas/Camaras/Alertas/fetchWidgets';

import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';
import moment from 'moment';

@Component({
  components: {},
})
export default class WidgetAlerta extends Vue {
  @Prop() listaAlertasWidgets: AlertaWidget[];

  constructor() {
    super();
  }
  async mounted() {}
  filterWidget(tipo: any) {
    this.$emit('filtroWidget', tipo);
  }
}
</script>
<style>
.widgets {
  margin: 10px 0 20px !important;
}
.wrapper-widget {
  position: relative;
  border: 1px solid #fafafa;
  background: #526da5;
  padding: 10px !important;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}
.wrapper-widget.disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}
.wrapper-widget p.title-widget {
}
.wrapper-widget p.count {
  bottom: 0;
  position: absolute;
  margin-bottom: 5px;
  font-weight: bold;
}

.flex.md1 {
  max-width: none;
}
</style>
