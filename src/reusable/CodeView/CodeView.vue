<template>
  <div align="left">
    <v-card max-width="800" class="mx-auto">
      <codemirror
        :options="options"
        @blur="handleBlur"
        v-bind="{ ...$props, ...$attrs }"
      ></codemirror>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

var CodeMirror = require('codemirror/lib/codemirror.js');

//@ts-ignore
import { codemirror } from 'vue-codemirror';

import 'codemirror/lib/codemirror.css';
// language
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/xml/xml.js';
// language
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
// theme css
import 'codemirror/theme/eclipse.css';
// require active-line.js
import 'codemirror/addon/selection/active-line.js';
// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js';
import 'codemirror/addon/search/searchcursor.js';
// hint
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/addon/selection/active-line.js';
// highlightSelectionMatches
import 'codemirror/addon/scroll/annotatescrollbar.js';
import 'codemirror/addon/search/matchesonscrollbar.js';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/match-highlighter.js';
// keyMap
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/search.js';
import 'codemirror/keymap/sublime.js';
// foldGutter
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/fold/markdown-fold.js';
import 'codemirror/addon/fold/xml-fold.js';
//lint
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/javascript-lint.js';
import 'codemirror/addon/lint/html-lint.js';
import 'codemirror/addon/lint/lint.css';

//@ts-ignore
window.JSHINT = require('jshint').JSHINT;

@Component({
  components: {
    codemirror,
  },
})
export default class CodeView extends Vue {
  @Prop({ default: 'text/javascript' }) readonly language: string;
  @Prop({ default: false }) readonly readOnly: boolean;

  options = {
    tabSize: 4,
    mode: this.language,
    theme: 'eclipse',
    lineNumbers: true,
    line: true,
    styleSelectedText: true,
    styleActiveLine: true,
    highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
    foldGutter: true,
    gutters: [
      'CodeMirror-linenumbers',
      'CodeMirror-foldgutter',
      'CodeMirror-lint-markers',
    ],
    extraKeys: { Ctrl: 'autocomplete' },
    showCursorWhenSelecting: true,
    matchBrackets: true,
    keyMap: 'sublime',
    hintOptions: {
      completeSingle: false,
    },
    lint: {
      globalstrict: true,
      strict: false,
    },
    readOnly: this.readOnly,
  };

  handleBlur(cm: any) {
    this.$emit('blur', cm.getValue());
  }
}
</script>
