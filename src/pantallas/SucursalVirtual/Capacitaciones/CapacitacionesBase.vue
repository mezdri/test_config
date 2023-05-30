<template>
  <div v-if="!loading">
    <WidgetUser />
    <v-flex class="sm12 md12 modulo-capacitaciones">
      <div
        v-for="item in data"
        :key="item.idcategoria"
        class="capacitaciones__btn"
      >
        <v-btn
          :class="activeBtn == Number(item.idcategoria) && 'btn--activate'"
          @click="showModal(item.idcategoria)"
        >
          <span>{{ item.categoria }}</span>
        </v-btn>
      </div>
    </v-flex>
    <ModalCapacitaciones v-if="dialog" :categoria="categoria" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import WidgetUser from '../WidgetUser.vue';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '../../../config/funcionalidades';
import { Snotify } from '@/snotify/Snotify';

import { fetchMantenedorCapacitaciones } from './fetchMantenedorCapacitaciones';
import ModalCapacitaciones from './ModalCapacitaciones.vue';

@Component({
  components: {
    ModalCapacitaciones,
    WidgetUser,
  },
})
export default class CapacitacionesBase extends Vue {
  readonly funcionalidad: Funcionalidades = Funcionalidades.capacitaciones;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  activeBtn: number = 0;
  dialog: boolean = false;
  categoria: number = 0;
  loading: boolean = false;
  data: any[] = [];

  async handleShowCategorias() {
    this.data = await this.getCategorias();
  }

  mounted() {
    this.handleShowCategorias();
  }

  showModal(categoria: string) {
    let categoriaInt = Number(categoria);
    if (this.activeBtn === categoriaInt) {
      this.dialog = !this.dialog;
      this.activeBtn = 0;
    } else {
      this.activeBtn = categoriaInt;
      this.dialog = true;
    }
    this.categoria = categoriaInt;
  }

  async getCategorias() {
    this.loading = true;
    this.loadingService.showLoading();
    return fetchMantenedorCapacitaciones(
      {},
      'api_capacitaciones/get_capacitaciones_categorias'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
        } else if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          return [];
        }
        this.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      })
      .catch((error: any) => {
        this.$snotify.error('Ocurrió un error, por favor reintente.', {
          timeout: 3000,
        });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        this.loading = false;
        return null;
      });
  }
}
</script>

<style scoped>
.capcitaciones-encabezado {
  font-weight: 600;
  color: rgb(88, 85, 85);
}

.modulo-capacitaciones {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.capacitaciones__btn button {
  padding: 25px;
  border-radius: 10px;
  text-transform: none;
  width: 300px;
}

.btn--activate {
  background-color: #ffe800 !important;
}
</style>
