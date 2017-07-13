from django.shortcuts import render
from django.views.generic import ListView, DetailView, FormView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from models import Book, Page
from forms import BookForm
from django.urls import reverse_lazy


class BookModelList(ListView):
    model = Book


class BookDetail(DetailView):
    model = Book


class PageCreateView(CreateView):
    success_url = reverse_lazy('book-list')
    model = Page
    fields = '__all__'

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
        return super(BookCreateView, self).form_valid(form)


class BookUpdateView(UpdateView):
    model = Book
    fields = '__all__'
    success_url= reverse_lazy('book-list')


class PageUpdateView(UpdateView):
    model = Book
    fields = '__all__'
    success_url= reverse_lazy('book-list')

class PageDetail(DetailView):
    model = Page
