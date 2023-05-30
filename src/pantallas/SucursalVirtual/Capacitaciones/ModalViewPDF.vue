<template>
  <div class="modal-pdf--bg" :class="showModal ? 'visible' : ''">
    <div class="modal-pdf--layout">
      <div class="modal-border">
        <div v-if="!loading" class="modal-close">
          <p>{{ title }}</p>
          <p @click="closedModal"><strong>X</strong> <span>Cerrar</span></p>
        </div>
        <iframe
          :src="url"
          id="modal-pdf"
          title="GPS Chile File"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          @load="handleLoad"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';

@Component({ components: {} })
export default class ModalViewPDF extends Vue {
  @Prop({ default: '' }) url: string;
  @Prop({ default: '' }) title: string;

  showModal: boolean = true;
  loading: boolean = false;

  readonly loadingService = new LoadingService();

  created() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  destroyed() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closedModal();
    }
  }

  mounted() {
    this.loadingService.showLoading();
    this.loading = true;
  }

  handleLoad() {
    this.loading = false;
    this.loadingService.hideLoading();
  }

  closedModal() {
    this.showModal = false;
    this.loadingService.hideLoading();
    this.loading = false;
    setTimeout(() => {
      this.showModal = true;
      this.$emit('cerrar');
    }, 100);
  }
}
</script>

<style scoped>
.modal-pdf--bg {
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgb(2 2 2 / 55%);
  opacity: 0;
  transition: opacity 0.7s;
}
.modal-pdf--bg.visible {
  opacity: 1;
  transition: opacity 0.7s;
}

.modal-pdf--layout {
  position: fixed;
  width: 65%;
  height: 90%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  text-align: center;
}

.modal-pdf--layout .modal-border {
  width: 100%;
  padding: 0 15px 30px 15px;
  border-radius: 1px;
  background: #f5f5f5;
}

.modal-pdf--layout iframe {
  resize: both;
  overflow: auto;
  width: 100%;
  height: 80vh;
}

.modal-pdf--layout .modal-close {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap-reverse;
}
.modal-pdf--layout .modal-close p {
  color: #27498c;
  font-size: 20px;
  font-weight: 550;
  text-transform: uppercase;
  text-align: end;
  margin: 8px 0;
  transition: 0.8s;
  padding-left: 2px;
}
.modal-pdf--layout .modal-close p:last-child {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.modal-pdf--layout .modal-close p span {
  color: #585555;
  font-size: 13.5px;
  font-weight: 500;
  margin-left: 5px;
}
.modal-pdf--layout .modal-close p strong:hover {
  color: #3b6dd1;
  text-shadow: 0 0 5px gray;
}
@media (max-width: 600px) {
  .modal-pdf--layout {
    width: 95%;
  }
  .modal-pdf--layout .modal-close {
    flex-direction: column-reverse;
  }
}
</style>
