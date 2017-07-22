from __future__ import unicode_literals

from django.db import models
from renderer import markdown_render
from functools import partial
from itertools import chain

from django.contrib.auth.models import AbstractUser

class Owner(AbstractUser):
    pass

class PageContent(models.Model):

    name = models.CharField(max_length=255, blank=True, default='', null=True)
    text_content = models.TextField()
    weight = models.IntegerField(default=-1)

    _render_cache = models.TextField(null=True, blank=True)

    def __unicode__(self):
        ltc = len(self.text_content)
        elips = ''
        if ltc > 60:
            elips = '...'
        c = self.text_content[0: 60]

        return u'Page Content "{}{}"'.format(c, elips)

    def render(self, page=None):
        cache = self._render_cache
        if len(cache) == 0: cache = None
        if cache is None:
            self._render_cache = markdown_render(self.text_content)
            self.save()

        return self._render_cache


class MetaModel(models.Model):
    INT = 'i'
    TEXT = 'u'
    TYPES = (
        (INT, 'Number'),
        (TEXT, 'Text'),
        )
    name = models.CharField(max_length=100)
    meta_type = models.CharField(
        max_length=1,
        choices=TYPES,
        default=TEXT,
    )


class ColorMeta(MetaModel):

    color = models.CharField(max_length=100)


class UnitModel(models.Model):

    # File name, or rarely changing identity.
    name = models.TextField(max_length=255)
    filename = models.CharField(max_length=255, null=True, blank=True)

    # Decedency chain, noting ancestors and up.
    child_of = models.ForeignKey('self', null=True, blank=True)

    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(Owner, related_name='page_owner', null=True, blank=True)
    metas = models.ManyToManyField(MetaModel, blank=True)
    private = models.BooleanField(default=True)


class Page(UnitModel):
    '''A Songle unit, presenting a markdown file associated with
    a book.
    '''

    # Data content
    contents = models.ManyToManyField(PageContent, blank=True)

    def books(self):
        '''
        Return a list of books this page exists within
        '''
        books = Book.objects.filter(pages=self)
        if len(books) == 0:
            parent = self.child_of
            if parent is not None:
                return parent.books()
        return books

    def children(self):
        return Page.objects.filter(child_of=self)

    def children_nest(self, depth=-1):
        children = self.children()

        r = {}
        r['item'] = self
        r['depth'] = depth

        if depth == 0:
            return children

        r['children'] = children
        r['children_count'] = children.count()
        return r

    def root_page(self):
        '''
        Return the page at the very top of the ancestor tree
        The page should be an immediate decendant of a book, but
        may not be.
        '''
        # Up all trees until no child of.
        # The root page of may not have a
        r = self.child_of
        while hasattr(r, 'child_of'):
            r = r.child_of if r is not None else r
        return r

    def breadcrumbs(self, include_self=False):
        r = self
        d = dict(items=[], books=None)
        last = None
        while hasattr(r, 'child_of'):
            r = r.child_of
            if r is not None:
                d['items'].append(r)
                last = r
            else:
                books = last.books() if last is not None else self.books()
                d['books'] = books
        d['items'].reverse()
        if include_self:
            d['items'].append(self)
        return d

    def siblings(self, exclude=True):
        '''
        Return the immediate children of the parent not including
        self.

        '''
        r = []
        p = self.child_of
        if p is not None:
            r = p.children()
            r = r.exclude(pk=self.pk) if exclude else r
        else:

            for book in self.books():
                d = book.pages.exclude(pk=self.pk) if exclude else book.pages.all()
                r.extend(d)
        return r

    def sibling_next(self):
        '''
        Return the next page from the list of sibilings relative
        to self current index.
        '''
        siblings = self.siblings(exclude=False)

        get_next = False

        for page in siblings:
            if get_next:
                print 'returning', page
                return page
            if page.pk == self.pk:
                get_next = True

    def sibling_before(self):
        siblings = self.siblings(exclude=False)

        last_page = None
        for page in siblings:
            if page.pk == self.pk:
                return last_page
            last_page = page

    def render(self):
        return '\n'.join(self.render_items())

    def render_items(self):
        r = []
        for content in self.contents.all():
            r.append(content.render(self))
        return r

    def text_render(self):
        return '\n\n'.join(self.text_render_items())

    def text_render_items(self):
        r = []
        for content in self.contents.all():
            r.append(content.text_content)
        return r

    def contents_pk_list(self):
        r = []
        for content in self.contents.all():
            r.append(content.pk)
        return r

    def __unicode__(self):
        return u'"{}" id({})'.format(self.name, self.pk)

        pl = self.contents.count()
        s = '' if pl == 1 else 's'
        return u'Page {} "{}" {} content{}'.format(self.pk, self.name, pl, s)


class Book(UnitModel):
    '''A single unit of many pages, config and grouping
    to define a collection of Page classes
    '''
    # all sub children
    pages = models.ManyToManyField(Page, blank=True)

    # The initial page or the README page content.
    # This may render a different style page. (or no page)
    index_page = models.ForeignKey(Page, null=True, blank=True, related_name='index_page')

    def children_nest(self, depth=-1):
        children = self.pages

        r = {}
        r['item'] = self
        r['depth'] = depth

        if depth == 0:
            return children

        r['children'] = children
        r['children_count'] = children.count()
        return r

    def __unicode__(self):

        pl = self.pages.count()
        s = '' if pl == 1 else 's'
        return u'"{}" {} page{}'.format(self.name, pl, s)

