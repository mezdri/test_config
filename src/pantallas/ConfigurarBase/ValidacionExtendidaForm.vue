<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <FormFieldsContainer titulo="Script Validación">
              <slot name="prependValidacion" />
              <v-layout row wrap>
                <v-flex md12>
                  <CodeView
                    @blur="handleBlur"
                    v-model="valorScript"
                    :readOnly="modoVer"
                  ></CodeView>
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import CodeView from '@/reusable/CodeView/CodeView.vue';

@Component({
  components: {
    StepTitle,
    CodeView,
    FormFieldsContainer,
  },
})
export default class ValidacionExtendidaForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() scriptActividadExt: string;

  valorScript: string = '';

  mounted() {
    this.handleScriptActividadExtChange();
  }

  @Watch('scriptActividadExt', { deep: true })
  handleScriptActividadExtChange() {
    if (this.scriptActividadExt) {
      this.valorScript = this.scriptActividadExt ? this.scriptActividadExt : '';
    }
  }

  handleBlur(valor: string) {
    this.$emit('setScript', valor);
  }
}
</script>
