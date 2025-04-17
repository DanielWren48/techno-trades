import { NewProductSchemaType } from '@/_dashboard/schemas/product';
import { Button } from '@/components/ui/button';
import useProductStore from '@/hooks/useProductStore';
import {
    MDXEditor,
    toolbarPlugin,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    linkPlugin,
    markdownShortcutPlugin,
    frontmatterPlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    directivesPlugin,
    linkDialogPlugin,
    BoldItalicUnderlineToggles,
    CreateLink,
    UndoRedo,
    ListsToggle,
    Separator,
    BlockTypeSelect,
    tablePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MarkdownEditorProps {
    handleTabChange: (value: string) => void
}

export default function MarkdownEditor({ handleTabChange }: MarkdownEditorProps) {
    const { productData, updateProductData, markdown, setMarkdown } = useProductStore();

    function handleSubmit() {
        updateProductData({ ...productData, description: markdown });
        handleTabChange("images");
    };

    return (
        <section className='flex flex-col gap-5 w-full'>
            <MDXEditor
                markdown={markdown}
                onChange={setMarkdown}
                plugins={[
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
                                <UndoRedo />
                                <Separator />
                                <BoldItalicUnderlineToggles />
                                <Separator />
                                <ListsToggle />
                                <Separator />
                                <BlockTypeSelect />
                                <Separator />
                                <CreateLink />
                            </>
                        )
                    }),
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    linkPlugin(),
                    markdownShortcutPlugin(),
                    frontmatterPlugin(),
                    codeBlockPlugin(),
                    codeMirrorPlugin(),
                    diffSourcePlugin(),
                    directivesPlugin(),
                    linkDialogPlugin(),
                    tablePlugin(),
                ]}
                contentEditableClassName="outline-none min-h-[500px] max-w-none text-lg px-8 py-5 text-black caret-yellow-500 
                    prose 
                    prose-p:my-3 
                    prose-p:leading-relaxed 
                    prose-headings:my-4 
                    prose-blockquote:my-4 
                    prose-ul:my-2 
                    prose-li:my-0 
                    prose-code:px-1 
                    prose-code:text-red-500 
                    prose-code:before:content-[''] 
                    prose-code:after:content-['']
                    pro
                    "
                className="border rounded-md"
                spellCheck
                placeholder={""}
            />
            <Button onClick={handleSubmit}>Continue</Button>
        </section>
    );
}