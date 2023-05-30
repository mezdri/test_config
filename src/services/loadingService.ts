import loadingEventBus from '@/loadingEventBus';

export class LoadingService {
  showLoading(texto: string = 'Por favor espere...', key?: string): void {
    loadingEventBus.$emit('loading', true, texto, key);
  }

  hideLoading(key?: string): void {
    loadingEventBus.$emit('loading', false, undefined, key);
  }
}
