import Vue from 'vue';

export default class HandleErrors extends Vue {
  $snotify: any;

  showError(error: any, mensajeErrorGeneral: string = ''): void {
    if (error.response !== undefined && error.response !== null) {
      let errores: any = error.response.data.errors;

      for (var propiedad in errores) {
        if (errores.hasOwnProperty(propiedad)) {
          let listaErrores: [] = errores[propiedad] as [];

          if (listaErrores.length > 0) {
            var msError: string =
              "<div class='snotifyToast__title'></div><div class='snotifyToast__body'><ul style='list-style-type: none;'>";

            for (let i: number = 0; i < listaErrores.length; i++) {
              let mensajeError: string = listaErrores[i] as string;

              msError = `${msError} <li style='list-style-type: none;'>${mensajeError}</li>`;
            }

            msError = `${msError} </ul></div>`;

            this.$snotify.html(msError, {
              type: 'error',
              timeout: 5000,
              showProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
            });
          } else {
            this.$snotify.error(error.response.data);
          }
        }
      }
    } else {
      mensajeErrorGeneral =
        mensajeErrorGeneral.length > 0
          ? mensajeErrorGeneral
          : 'Ocurrió un error durante el proceso.';
      this.$snotify.error(mensajeErrorGeneral);
    }
  }
}
