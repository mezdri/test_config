<template>
  <div id="container" style="">
    <div class="detailPatent">
      <table>
        <tr>
          <td>Nombre</td>
          <td>{{ detail.name }}</td>
        </tr>
        <tr>
          <td>Estado</td>
          <td>{{ detail.estado }}</td>
        </tr>
        <tr>
          <td>Id Cámara</td>
          <td>{{ detail.id_camara }}</td>
        </tr>
        <tr>
          <td>Sistema</td>
          <td>{{ detail.sistema }}</td>
        </tr>
        <tr>
          <td>Canales</td>
          <td style="cursor: pointer;">
            <div
              style="display:flex; justify-content: flex-start; align-items: center"
            >
              <!-- <v-icon v-for="icon in detail.children" :key="icon.id" flat
                >videocam</v-icon
              > -->
              <v-tooltip bottom v-for="icon in detail.children" :key="icon.id">
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" flat>videocam</v-icon>
                </template>
                <span>Canal {{ icon.name }}</span>
              </v-tooltip>
            </div>
          </td>
        </tr>
        <tr>
          <td>última Conexión</td>
          <td>{{ detail.ultima_conexion }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class DetailPatent extends Vue {
  @Prop({ default: undefined }) detail: any;

  @Watch('detail', { immediate: true })
  onPatentChanged() {
    var self = this;
  }

  get childrens() {
    return this.detail.children
      .map((item: any) => {
        return item.name;
      })
      .join(', ');
  }

  get emptyPatent(): boolean {
    return !(Object.keys(this.detail).length === 0);
  }
}
</script>

<style scoped>
#container {
  height: 100%;
  width: 100%;
}
#withoutPatent {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
#textEmpty {
  margin-bottom: 12px;
  font-weight: 500;
  font-family: Asap, sans-serif;
  font-size: 1.25rem;
}
.detailPatent {
}
.rowDiv {
  display: flex;
  font-size: 1.2rem;
}
.keyDiv {
  margin-right: 15px;
  font-weight: 700;
  width: 50%;
}
.valueDiv {
  width: 50%;
}
table {
  font-family: Asap, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
