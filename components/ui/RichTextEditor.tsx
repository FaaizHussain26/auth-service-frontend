"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import "ckeditor5/ckeditor5.css";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CKEditorField = dynamic<EditorProps>(
  async () => {
    const [{ CKEditor }, { ClassicEditor, Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Link, List, Alignment, BlockQuote, Autoformat, FontColor, FontBackgroundColor }] =
      await Promise.all([import("@ckeditor/ckeditor5-react"), import("ckeditor5")]);

    const Editor: ComponentType<EditorProps> = ({ value, onChange }) => (
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(_event, editor) => onChange(editor.getData())}
        config={{
          licenseKey: "GPL",
          plugins: [Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Link, List, Alignment, BlockQuote, Autoformat, FontColor, FontBackgroundColor],
          toolbar: [
            "heading", "|",
            "bold", "italic", "underline", "strikethrough", "|",
            "fontColor", "fontBackgroundColor", "|",
            "bulletedList", "numberedList", "|",
            "alignment", "|",
            "link", "blockQuote", "|",
            "undo", "redo",
          ],
        }}
      />
    );
    return Editor;
  },
  {
    ssr: false,
    loading: () => <div className="flex h-40 items-center justify-center text-sm text-ink-500">Loading editor…</div>,
  },
);

export function RichTextEditor({ value, onChange }: EditorProps) {
  return (
    <div className="rounded-field border border-surface-border [&_.ck-editor__editable]:min-h-[160px] [&_.ck-editor__editable]:rounded-t-none [&_.ck-editor__editable]:rounded-b-field [&_.ck-toolbar]:rounded-t-field [&_.ck-toolbar]:rounded-b-none [&_.ck-toolbar]:border-0 [&_.ck-toolbar]:border-b [&_.ck-toolbar]:border-surface-border [&_.ck-content]:border-0">
      <CKEditorField value={value} onChange={onChange} />
    </div>
  );
}
