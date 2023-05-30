<template>
  <div>
    <input
      :ref="'input'"
      @keydown="onKeyDown($event)"
      @focusout="handleFocusout"
      v-model="value"
      type="number"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import NumericEditorBus from '@/reusable/Grid/Editors/NumericEditorBus';

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_F2 = 113;

export default Vue.extend({
  data() {
    return {
      value: '',
      cancelBeforeStart: true,
    };
  },
  methods: {
    getValue() {
      return this.value;
    },

    isCancelBeforeStart() {
      return this.cancelBeforeStart;
    },

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    // isCancelAfterEnd() {
    //   return this.value > 1000000;
    // },

    onKeyDown(event) {
      if (this.isLeftOrRight(event) || this.deleteOrBackspace(event)) {
        event.stopPropagation();
        return;
      }

      if (!this.isKeyPressedNumeric(event)) {
        if (event.preventDefault) event.preventDefault();
      }
    },

    handleFocusout(event) {
      NumericEditorBus.focusout(this.params.parentName, event);
    },

    isLeftOrRight(event) {
      return [37, 39].indexOf(event.keyCode) > -1;
    },

    getCharCodeFromEvent(event) {
      event = event || window.event;
      return typeof event.which === 'undefined' ? event.keyCode : event.which;
    },

    isCharNumeric(charStr) {
      return /\d/.test(charStr);
    },

    isKeyPressedNumeric(event) {
      const charCode = this.getCharCodeFromEvent(event);
      const charStr = String.fromCharCode(
        96 <= charCode && charCode <= 105 ? charCode - 48 : charCode
      );
      return this.isCharNumeric(charStr);
    },

    deleteOrBackspace(event) {
      return [KEY_DELETE, KEY_BACKSPACE].indexOf(event.keyCode) > -1;
    },
  },
  created() {
    this.value = this.params.value;

    // only start edit if key pressed is a number, not a letter
    this.cancelBeforeStart =
      this.params.charPress && '1234567890'.indexOf(this.params.charPress) < 0;
  },
  mounted() {
    Vue.nextTick(() => {
      // need to check if the input reference is still valid - if the edit was cancelled before it started there
      // wont be an editor component anymore
      if (this.$refs.input) {
        this.$refs.input.focus();
      }
    });
  },
});
</script>
<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
