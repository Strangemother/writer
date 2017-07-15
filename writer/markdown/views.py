from django.shortcuts import render
from django.views.generic import ListView, DetailView, FormView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from models import Book, Page, PageContent
from forms import BookForm, BookPageContentForm, PageContentForm
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
    model = Page

    def get_data(self, context):
        page = context.get('page', None)

        rp = None
        pk = None
        text = None

        if page is not None:
            rp = page.root_page()
            pk = page.pk
            text = page.text_render()
            ids = [x.pk for x in page.contents.all()]

        d = dict(
                text=text,
                root_page=rp.pk if rp is not None else None,
                id=pk,
                content_ids=ids
            )

        return super(PageContentJSON, self).get_data(d)

    def post(self, request, *args, **kwargs):
        print 'Post made to json content'
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


class BookPageContent(FormView):
    template_name = 'markdown/book_pagecontent.html'
    form_class = PageContentForm


class PageCreateView(CreateView):
    success_url = reverse_lazy('book-list')
    model = Page
    fields = '__all__'


class PageCreateJSONView(JSONDetailView, CreateView):
    success_url = reverse_lazy('book-list')
    model = Page
    fields = '__all__'

    def form_valid(self, form):
        # form.instance.created_by = self.request.user

        # Append to the local page
        r = super(PageCreateJSONView, self).form_valid(form)
        page_key = self.kwargs.get('pk', None)
        if page_key is not None:
            Book.objects.get(pk=page_key).pages.add(form.instance)

        return self.render_to_response(dict(
            valid=form.is_valid(),
            page_id=form.instance.pk,
            page_name=form.instance.name,
            page_text_render=form.instance.text_render(),
            )
        )


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
        page_key = self.kwargs.get('pk', None)
        if page_key is not None:
            Book.objects.get(pk=page_key).pages.add(form.instance)
        return r


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


class PageContentCreateView(CreateView):
    template_name = 'markdown/book_pagecontent.html'
    success_url = reverse_lazy('book-list')
    model = PageContent
    fields = '__all__'


class BookUpdateView(UpdateView):
    model = Book
    fields = '__all__'
    success_url = reverse_lazy('book-list')


class PageUpdateView(UpdateView):
    model = Book
    fields = '__all__'
    success_url= reverse_lazy('book-list')

class PageDetail(DetailView):
    model = Page
