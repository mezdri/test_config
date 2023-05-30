<template>
  <div class="dashboard">
    <div class="layout wrap widgets">
      <v-flex
        m1
        md1
        wrapper-widget
        id="cardDashboard"
        v-for="item in widgetList"
        :key="item.key"
        :class="item.title.replace(' ', '_')"
        @click="filtroWidget(item)"
      >
        <p class="titleCard">
          {{
            item.title
              .replace('VEHICULOS', 'VEHÍCULOS')
              .replace('BOTON', 'BOTÓN')
          }}
        </p>
        <p class="count">{{ item.value }}</p>
      </v-flex>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { MSResponse } from '@/interfaces/MS';
import { AxiosResponse } from 'axios';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';

@Component({
  name: 'Datatables',
  components: {},
})
export default class WidgetControl extends Vue {
  @Prop({ default: [] }) widgetList!: { title: string; value: any; key: any }[];
  loadingService = new LoadingService();
  widgetSelected: any = '';
  $snotify: any;
  filtroWidget(item: any) {
    let list: any;
    let tipo: any = item.key;
    let new_selected = item.title.replace(' ', '_');
    if (
      this.widgetSelected == new_selected ||
      new_selected == 'TOTAL_VEHICULOS'
    ) {
      list = document.querySelectorAll('.dashboard #cardDashboard.disabled');
      for (let i = 0; i < list.length; ++i) {
        list[i].classList.remove('disabled');
      }
      this.widgetSelected = null;
      TorreControlInstance.$emit('filtroWidgets', 0, this.widgetList);
      return;
    }
    TorreControlInstance.$emit('filtroWidgets', tipo, this.widgetList);
    list = document.querySelectorAll('.dashboard #cardDashboard.disabled');
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.remove('disabled');
    }
    list = document.querySelectorAll(
      '.dashboard #cardDashboard:not(.' + new_selected + ')'
    );
    for (let i = 0; i < list.length; ++i) {
      list[i].classList.add('disabled');
    }
    this.widgetSelected = new_selected;
    TorreControlInstance.$emit('selectWidget', tipo);
  }
}
</script>

<style>
#cardDashboard {
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #fafafa;
  background: #526da5;
  color: white;
  cursor: pointer;
}
#cardDashboard:hover {
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
#cardDashboard.disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

.widgets {
  margin: 10px 0 20px !important;
  justify-content: center;
  align-items: center;
  -webkit-box-pack: center;
}
.wrapper-widget {
  height: 80px;
  border-radius: 10px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: 1px solid #fafafa;
  background: #526da5;
  color: white;
  cursor: pointer;
  font-weight: bold;
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
.titleCard {
  font-weight: 900;
  font-size: 1.6vmin;
}

.flex.md1 {
  max-width: none;
}
</style>
