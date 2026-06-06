<script lang="ts">
  import MarkdownIt from 'markdown-it';
  import DOMPurify from 'isomorphic-dompurify';

  interface Props {
    content: string;
    contentType: 'MARKDOWN' | 'HTML';
  }

  let { content, contentType }: Props = $props();

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });

  let renderedContent = $derived.by(() => {
    if (contentType === 'MARKDOWN') {
      const html = md.render(content);
      return DOMPurify.sanitize(html);
    }
    // HTML content — sanitize only
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img', 'ul', 'ol', 'li',
        'blockquote', 'pre', 'code', 'em', 'strong', 'del', 'table', 'thead',
        'tbody', 'tr', 'th', 'td', 'br', 'hr', 'div', 'span', 'sup', 'sub'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
    });
  });
</script>

<div class="prose prose-invert prose-lg max-w-none
  prose-headings:text-white prose-headings:font-bold
  prose-p:text-gray-300 prose-p:leading-relaxed
  prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
  prose-strong:text-white
  prose-code:text-indigo-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
  prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
  prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-400
  prose-img:rounded-lg prose-img:shadow-lg
  prose-hr:border-gray-700
  prose-li:text-gray-300
  prose-table:border-gray-700
  prose-th:text-gray-200 prose-th:border-gray-700
  prose-td:text-gray-300 prose-td:border-gray-700">
  {@html renderedContent}
</div>