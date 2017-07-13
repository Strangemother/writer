import mistune
import mistune_contrib
from mistune_contrib import highlight


class HighlightRenderer(mistune.Renderer, highlight.HighlightMixin):

    def _nil(self):
        print 1



def markdown_render(str, **kw):
    opts = dict(
        renderer=HighlightRenderer(),
        hard_wrap=True,
    )
    opts.update(kw)
    markdown = mistune.Markdown(**opts)
    return markdown(str)
