import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownDisplay = ({ content }: { content: string }) => {
    return (
        <article className="prose prose-slate max-w-none
            prose-p:my-3 
            prose-p:leading-relaxed 
            prose-headings:my-4 
            prose-blockquote:my-4 
            prose-ul:my-2 
            prose-li:my-0 
            prose-code:px-1 
            prose-code:text-red-500 
            prose-code:before:content-[''] 
            prose-code:after:content-['']"
        >
            <ReactMarkdown>{content}</ReactMarkdown>
        </article>
    );
};

export default MarkdownDisplay;