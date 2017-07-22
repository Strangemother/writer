from django.shortcuts import render
from django.views.generic import ListView, DetailView, FormView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from models import Book, Page, PageContent
from forms import BookForm, BookPageContentForm, PageContentForm, FileUploadForm

from django import VERSION as DJ_VER
if DJ_VER[1] < 10:
    from django.core.urlresolvers import reverse as reverse_lazy
else:
    from django.urls import reverse_lazy

from django.http import JsonResponse
from django.views.generic.detail import BaseDetailView
from django.views.generic import TemplateView


class JSONResponseMixin(object):
    """
    A mixin that can be used to render a JSON response.
    """
    def render_to_json_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        return JsonResponse(
            self.get_data(context),
            **response_kwargs
        )

    def get_data(self, context):
        """
        Returns an object that will be serialized as JSON by json.dumps().
        """
        # Note: This is *EXTREMELY* naive; in reality, you'll need
        # to do much more complex handling to ensure that arbitrary
        # objects -- such as Django model instances or querysets
        # -- can be serialized as JSON.
        return context


class JSONDetailView(JSONResponseMixin, BaseDetailView):
    def render_to_response(self, context, **response_kwargs):
        return self.render_to_json_response(context, **response_kwargs)


class JSONView(JSONResponseMixin, TemplateView):
    def render_to_response(self, context, **response_kwargs):
        return self.render_to_json_response(context, **response_kwargs)


class PageContentJSON(JSONDetailView):
    '''
    JSON page content - get and post.
    '''
    model = Page

    def get_data(self, context):
        page = context.get('page', None)

        rp = None
        pk = None
        text = None

        ids = [] # [x.pk for x in page.contents.all()]
        blocks = []
        if page is not None:
            rp = page.root_page()
            pk = page.pk
            text = page.text_render()
            contents = page.contents.all().order_by('weight')
            for cb in contents:
                ids.append(cb.pk)
                o = dict(
                    text=cb.text_content,
                    id=cb.pk,
                )
                blocks.append(o)

        d = dict(
                # text=text,
                root_page=rp.pk if rp is not None else None,
                id=pk,
                content_blocks=blocks,
                content_ids=ids,
            )

        return super(PageContentJSON, self).get_data(d)

    def post(self, request, *args, **kwargs):
        '''
        Post made to json content
        '''
        f = PageContentForm(request.POST)

        valid = f.is_valid()

        _id = None
        if valid:
            opk = f.data.get('id')
            if opk is not None:
                item = PageContent.objects.get(pk=opk)
                f = PageContentForm(request.POST, instance=item)

            page_content = f.save()
            _id = page_content.pk

            page_pk = self.kwargs.get('pk', None)
            if page_pk is not None:
                page = self.model.objects.get(pk=page_pk)
                page.contents.add(page_content)

        d = dict(
            valid=valid,
            errors=f.errors,
            id=_id,
            )

        return JsonResponse(d)

        # view = AuthorInterest.as_view()
        # return view(request, *args, **kwargs)


class BookModelList(ListView):
    model = Book


class BookDetail(DetailView):
    model = Book

class BookEditorDetail(BookDetail):
    template_name = 'markdown/book_write.html'

class BookEditor2Detail(BookDetail):
    template_name = 'markdown/book_write_2.html'


class BookPageContent(FormView):
    template_name = 'markdown/book_pagecontent.html'
    form_class = PageContentForm


class PageCreateView(CreateView):
    success_url = reverse_lazy('book-list')
    model = Page
    fields = '__all__'


class BookPageCreateView(CreateView):
    '''
    Create a page and append to a book using the associated book id.
    '''
    success_url = reverse_lazy('book-list')
    model = Page
    fields = '__all__'

    def get_success_url(self):
        return reverse_lazy('page', kwargs=dict(pk=self.object.pk))

    def form_valid(self, form):
        # form.instance.created_by = self.request.user

        # Append to the local page
        r = super(BookPageCreateView, self).form_valid(form)

        # Add first content block
        pc = PageContent(text_content='# {}'.format(form.instance.name))
        pc.save()
        form.instance.contents.add(pc)

        parent_page_key = self.kwargs.get('parent_pk', None)
        if parent_page_key is not None:
            page = Page.objects.get(pk=parent_page_key)
            form.instance.child_of = page
            form.instance.save()
        else:
            page_key = self.kwargs.get('pk', None)
            if page_key is not None:
                Book.objects.get(pk=page_key).pages.add(form.instance)

        return r


class PageUpdateView(UpdateView):
    model = Book
    fields = '__all__'
    success_url= reverse_lazy('book-list')


class PageCreateJSONView(JSONDetailView, BookPageCreateView):

    def form_valid(self, form):
        # form.instance.created_by = self.request.user

        # Append to the local page
        r = super(PageCreateJSONView, self).form_valid(form)
        child_of = None
        if form.instance.child_of is not None:
            child_of = form.instance.child_of.pk

        return self.render_to_response(dict(
            valid=form.is_valid(),
            page_id=form.instance.pk,
            page_child_of=child_of,
            page_name=form.instance.name,
            page_text_render=form.instance.text_render(),
            )
        )


class PageUpdateJSONView(JSONDetailView, UpdateView):
    model = Page
    fields = ['name'] # '__all__'
    success_url= reverse_lazy('book-list')


    def form_valid(self, form):
        # form.instance.created_by = self.request.user

        # Append to the local page
        prev_name = form.initial.get('name', None)
        r = super(PageUpdateJSONView, self).form_valid(form)

        return self.render_to_response(dict(
            valid=form.is_valid(),
            page_id=form.instance.pk,
            page_child_of=form.instance.child_of.pk if form.instance.child_of else None,
            prev_name=prev_name,
            page_name=form.instance.name,
            # page_text_render=form.instance.text_render(),
            )
        )


class BookCreateView(CreateView):
    success_url = reverse_lazy('book-list')
    model = Book
    fields = '__all__'

    def get_form(self, *args, **kw):
        form = super(BookCreateView, self).get_form(*args, **kw)
        # form.fields['due_date'].widget.attrs.update({'class': 'datetimepicker'})
        return form

    def form_valid(self, form):
        # form.instance.created_by = self.request.user
        r = super(BookCreateView, self).form_valid(form)
        return r


class PageContentUpdate(UpdateView):
    '''
    A Single fragement of a page consists of some renderable content
    '''
    template_name = 'markdown/book_pagecontent.html'
    model = PageContent
    fields = '__all__'
    success_url = reverse_lazy('book-list')


from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


class PageContentCreateView(CreateView):
    template_name = 'markdown/book_pagecontent.html'
    success_url = reverse_lazy('book-list')
    model = PageContent
    fields = '__all__'


class BookUpdateView(UpdateView):
    model = Book
    fields = '__all__'
    success_url = reverse_lazy('book-list')


class PageDetail(DetailView):
    model = Page


class PageExportView(PageDetail):
    template_name = 'markdown/page_export.html'


class FileUploadView(JSONDetailView, FormView):
    success_url = reverse_lazy('book-list')
    form_class = FileUploadForm

    def post(self, request, *args, **kwargs):
        form_class = self.get_form_class()
        form = self.get_form(form_class)
        files = request.FILES.getlist('file_field')
        if form.is_valid():
            import pdb; pdb.set_trace()  # breakpoint bd5d91ec //

            # path = default_storage.save(p, ContentFile(image.read()))
