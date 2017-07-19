from django.conf.urls import url
from markdown import views


urlpatterns = [
    url(r'^$', views.BookModelList.as_view(), name='book-list'),
    url(r'page/(?P<pk>[0-9]+)/$', views.PageDetail.as_view(), name='page'),
    url(r'page/add/(?P<pk>[0-9]+)/$', views.BookPageCreateView.as_view(), name='book-page-form'),
    url(r'page/add/$', views.PageCreateView.as_view(), name='page-form'),
    url(r'page/edit/(?P<pk>[0-9]+)/$', views.PageUpdateView.as_view(), name='page-form'),
    url(r'page/(?P<pk>[0-9]+)/update/$', views.PageUpdateJSONView.as_view(), name='page-update'),

    url(r'book/add/$', views.BookCreateView.as_view(), name='book-form'),
    url(r'book/edit/(?P<pk>[0-9]+)/$', views.BookUpdateView.as_view(), name='book-form'),
    url(r'book/(?P<pk>[0-9]+)/$', views.BookDetail.as_view(), name='book'),

    url(r'book/editor/(?P<pk>[0-9]+)/$', views.BookEditorDetail.as_view(), name='book-editor'),
    url(r'book/editor/(?P<pk>[0-9]+)/2/$', views.BookEditor2Detail.as_view(), name='book-editor-2'),
    url(r'book/(?P<pk>[0-9]+)/new-page/(?P<parent_pk>[0-9]+)$', views.PageCreateJSONView.as_view(), name='book-new-page'),
    url(r'book/(?P<pk>[0-9]+)/new-page/$', views.PageCreateJSONView.as_view(), name='book-new-page'),

    url(r'page/data/(?P<pk>[0-9]+)/$', views.PageContentJSON.as_view(), name='page-data'),

    url(r'book/content/new/$', views.PageContentCreateView.as_view(), name='book-content-new'),
    url(r'book/content/(?P<pk>\d+)/$', views.PageContentUpdate.as_view(), name='book-content'),
]
