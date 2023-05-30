<template>
  <div>
    <CabeceraModalEditarBase
      :titulo="titulo"
      :tituloEliminar="
        nombreEntidad
          ? $t('mensajes.crud.editar.titulo', {
              entidad: entidad,
              nombreEntidad: nombreEntidad,
            })
          : $t('mensajes.crud.editar.tituloSinNombre', {
              entidad: entidad,
            })
      "
      :entidad="entidad"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :inactivable="inactivable"
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      @inactivo="handleInactivo"
      :estadoEntidad="estadoEntidad"
      :inactivoSinAsociacion="inactivoSinAsociacion"
      :form="form"
      :pronombre="pronombre"
      :mensajeInactivo="mensajeInactivo"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Confirmation from '@/components/Confirmation.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import { FormState } from '@/reusable/Form/formUtils';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { PasosCrud } from '../Mantenedor/mantenedorUtils';
import CabeceraModalEditarBase from '@/reusable/Modal/CabeceraModalEditarBase.vue';
import { TranslateResult } from 'vue-i18n';

@Component({
  components: {
    GuardarCambiosButton,
    CabeceraModal,
    Confirmation,
    CabeceraModalEditarBase,
  },
})
export default class CabeceraModalEditar extends Vue {
  @Prop({ required: true }) titulo: string;
  @Prop({}) nombreEntidad: string;
  @Prop({ required: true }) entidad: string;
  @Prop({ required: true }) pasos: PasosCrud;
  @Prop({ required: true }) pasoActivoIndex: number;
  @Prop({ default: true }) inactivable: boolean;
  @Prop({ default: true }) estadoEntidad: boolean;
  @Prop({ default: true }) inactivoSinAsociacion: boolean;
  @Prop({ default: 'El ' }) pronombre: string;
  @Prop({ default: '' }) mensajeInactivo: string;
  @Prop({}) form: FormState;

  tituloEliminar: TranslateResult = '';

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleGuardar() {
    this.$emit('guardar');
  }

  handleInactivo() {
    this.$emit('inactivo');
  }
}
</script>
