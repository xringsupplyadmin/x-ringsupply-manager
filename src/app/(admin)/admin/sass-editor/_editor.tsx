"use client";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-scss";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-searchbox";

export default function SassEditor(
  props: {
    sheetId: string;
  } & React.ComponentProps<typeof AceEditor>,
) {
  return (
    <AceEditor
      mode="scss"
      theme="monokai"
      name={props.sheetId}
      enableLiveAutocompletion={true}
      enableBasicAutocompletion={true}
      {...props}
    />
  );
}
