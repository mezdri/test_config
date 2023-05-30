<template>
  <div>
    <v-flex class="sm12 md12 modal-capacitaciones__btn">
      <v-btn
        :class="activeBtn === 1 ? 'btn--activate' : ''"
        @click="handleManuales"
        >Manuales</v-btn
      >

      <v-btn
        :class="activeBtn === 2 ? 'btn--activate' : ''"
        @click="handleTutorial"
        >Video Tutorial
      </v-btn>
    </v-flex>

    <div v-if="dialog && !loadingModal" class="modal-options">
      <section v-if="Object.keys(dataOption).length > 0" class="sm12 md12">
        <CardsCategoria :manualOption="manualOption" :dataOption="dataOption" />
      </section>

      <section v-else>
        <div class="seccion-vacia">Esta sección está vacía.</div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '../../../config/funcionalidades';
import { Snotify } from '@/snotify/Snotify';
import { fetchMantenedorCapacitaciones } from './fetchMantenedorCapacitaciones';
import CardsCategoria from './CardsCategoria.vue';

@Component({
  components: { CardsCategoria },
})
export default class ModalCapacitaciones extends Vue {
  @Prop({ default: 0, type: Number }) categoria: number;

  readonly funcionalidad: Funcionalidades = Funcionalidades.capacitaciones;
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  activeBtn: number = 0;
  dialog: boolean = false;
  manualOption: boolean = true;
  loadingModal: boolean = false;
  data: any[] = [];
  dataOption: any[] = [];

  handleManuales() {
    this.showModal(1, true);
  }

  handleTutorial() {
    this.showModal();
  }

  @Watch('categoria')
  async handleShowCategorias() {
    this.data = await this.getOpciones();
    this.dataOption = await this.data.filter(
      (item: any) =>
        Number(item.idcategoria) == Number(this.categoria) &&
        (this.manualOption
          ? item.opcionmanual === 't'
          : item.opcionmanual === 'f')
    );
  }

  showModal(activeBtn: number = 2, manualOption: boolean = false) {
    if (this.activeBtn === activeBtn) {
      this.dialog = !this.dialog;
      this.activeBtn = 0;
    } else {
      this.dialog = true;
      this.activeBtn = activeBtn;
      this.handleShowCategorias();
    }
    this.manualOption = manualOption;
  }

  async getOpciones() {
    let self = this;
    this.loadingModal = true;
    this.loadingService.showLoading();
    return fetchMantenedorCapacitaciones(
      {},
      'api_capacitaciones/get_capacitaciones_opciones'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
        } else if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          return [];
        }
        self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        this.loadingModal = false;
        return null;
      });
  }
}
</script>

<style>
.modal-capacitaciones__btn {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.modal-capacitaciones__btn button {
  padding: 25px;
  border-radius: 10px;
  text-transform: capitalize;
  width: 135px;
}

.modal-capacitaciones__btn .btn--activate {
  background-color: #ffe800 !important;
}

.modal-options {
  width: min(90%, 130rem);
  margin: 0 auto;
}
.modal-options__layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  place-items: center;
  gap: 20px;
  margin-top: 30px;
}
.modal-options__layout .card {
  border: 1px solid #050505;
  border-radius: 5px;
  display: flex;
  width: 300px;
  height: 60px;
  max-width: 100%;
}
.modal-options__layout .card .card_layout {
  width: 100%;
  text-decoration: none;
  color: inherit;
  display: flex;
  justify-content: space-between;
  padding: 0 15px;
}

.modal-options__layout .card .card_layout figure {
  display: flex;
  align-items: center;
}

.modal-options__layout .card .card_layout section {
  margin-right: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-options__layout .card section p:first-child {
  color: #0d44c8;
  font-weight: bolder;
}
.modal-options__layout .card a {
  text-decoration: none !important;
  cursor: pointer;
}

.modal-options__layout .card p {
  margin: 0;
  text-transform: capitalize;
}

.modal-options__icon {
  font-size: 30px;
}

.icon_eye {
  color: #0d83c8 !important;
}

.modal-options .seccion-vacia {
  padding: 16px;
  margin: 16px 0;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
</style>
