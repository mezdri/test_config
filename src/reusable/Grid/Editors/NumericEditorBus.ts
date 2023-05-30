import Vue from 'vue';

export const numericEditorBus = {
  focusout: 'focusout',
};

class NumericEditorBus extends Vue {
  focusout(id: string, event: FocusEvent) {
    this.$emit(numericEditorBus.focusout, id, event);
  }

  handleFocusout(myid: string, callbackfn: (event: FocusEvent) => void) {
    this.$on(numericEditorBus.focusout, (id: string, event: FocusEvent) => {
      if (id === myid) {
        callbackfn(event);
      }
    });
  }
}

export default new NumericEditorBus();
