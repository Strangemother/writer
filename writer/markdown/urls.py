from django.conf.urls import url
from django.views.generic import TemplateView
from . import views


urlpatterns = [
    url(r'^$', views.BookModelList.as_view(), name='book-list'),
    url(r'page/(?P<pk>[0-9]+)/$', views.PageDetail.as_view(), name='page'),
    url(r'page/add/$', views.PageCreateView.as_view(), name='page-form'),
    url(r'page/edit/(?P<pk>[0-9]+)/$', views.PageUpdateView.as_view(), name='page-form'),
    url(r'book/add/$', views.BookCreateView.as_view(), name='book-form'),
    url(r'book/edit/(?P<pk>[0-9]+)/$', views.BookUpdateView.as_view(), name='book-form'),
    url(r'book/(?P<pk>[0-9]+)/$', views.BookDetail.as_view(), name='book'),
]
