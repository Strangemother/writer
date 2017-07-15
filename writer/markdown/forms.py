from django.forms import ModelForm
from django import forms
from models import Book, PageContent

class BookForm(ModelForm):
    class Meta:
        model = Book
        fields = '__all__'


class PageContentForm(ModelForm):
    class Meta:
        model = PageContent
        fields = '__all__'


class BookPageContentForm(forms.Form):
    '''
    A single fragment from a page markdown push
    '''
    content = forms.CharField(widget=forms.Textarea)
