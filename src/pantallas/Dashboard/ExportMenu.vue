<template>
  <div>
    <v-tooltip bottom v-model="tooltipActivator" close-delay="-3">
      <template v-slot:activator="{ on }">
        <div v-on="on" style="display: inline-block;">
          <v-menu
            v-model="menu"
            :close-on-content-click="true"
            :nudge-width="200"
            :offset-y="true"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                id="btnClass"
                fab
                v-bind="attrs"
                v-on="on"
                @click="tooltipActivator = true"
                ><v-icon id="iconClass" color="#c7cfd4">download</v-icon></v-btn
              >
            </template>
            <v-card content-class="elevation-3" @mouseover="point()">
              <v-list>
                <v-subheader>Descarga los resultados completos</v-subheader>
                <div class="btnClassList shadow-effects" @click="exportCsv">
                  <v-img
                    max-height="80"
                    :src="require('../../assets/csv.png')"
                    max-width="40"
                  ></v-img>
                  <div class="typeExportClass">
                    <h4 style="margin-left: 5px">.csv</h4>
                  </div>
                </div>
                <div class="btnClassList shadow-effects" @click="exportExcel">
                  <v-img
                    max-height="80"
                    :src="require('../../assets/xlsx.png')"
                    max-width="40"
                  ></v-img>
                  <div class="typeExportClass">
                    <h4 style="margin-left: 5px">.xlsx</h4>
                  </div>
                </div>
                <div class="btnClassList shadow-effects" @click="exportJson">
                  <v-img
                    max-height="80"
                    :src="require('../../assets/json.png')"
                    max-width="40"
                  ></v-img>
                  <div class="typeExportClass">
                    <h4 style="margin-left: 5px">.json</h4>
                  </div>
                </div>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </template>
      <span>Descarga los resultados completos</span>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import { boolean } from 'yup';
@Component
export default class ExportMenu extends Vue {
  menu: boolean = false;
  tooltipActivator: boolean = false;
  @Prop() type: string;
  mousePointAlert: boolean = false;
  @Watch('menu')
  onMenuChanged(value: string, oldValue: string) {
    if (value == 'true') {
      this.tooltipActivator = true;
    } else {
      this.tooltipActivator = false;
    }
  }

  point() {
    this.$emit('point', true);
  }

  exportCsv() {
    this.menu = false;
    this.$emit('exportData', this.type, 'csv');
    this.tooltipActivator = false;
  }
  exportExcel() {
    this.menu = false;
    this.$emit('exportData', this.type, 'xlsx');
    this.tooltipActivator = true;
  }
  exportJson() {
    this.menu = false;
    this.$emit('exportData', this.type, 'json');
    this.tooltipActivator = true;
  }
  activator() {
    return this.tooltipActivator;
  }
}
</script>

<style scoped>
#btnClass {
  width: 30px;
  min-width: 30px;
  height: 30px;
  min-height: 30px;
  background-color: transparent !important;
  box-shadow: none;
}
#iconClass {
  width: 12px;
  min-width: 12px;
  height: 12px;
  min-height: 12px;
}
.btnClassList {
  padding: 5%;
  display: flex;
  cursor: pointer;
}
.shadow-effects:hover {
  box-shadow: 3px 3px 3px 3px #c7cfd4;
}
.tooltip {
  display: inline;
  position: relative;
}
.tooltip:hover:after {
  background: #333;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  bottom: 26px;
  color: #fff;
  content: attr(title);
  left: 20%;
  padding: 5px 15px;
  position: absolute;
  z-index: 98;
  width: 220px;
}
.typeExportClass {
  width: 70%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
