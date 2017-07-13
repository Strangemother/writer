from django.contrib import admin

# Register your models here.
from models import Book, Page, PageContent


class BookAdmin(admin.ModelAdmin):
    pass


class PageAdmin(admin.ModelAdmin):
    pass


class PageContentAdmin(admin.ModelAdmin):
    pass


admin.site.register(Book, BookAdmin)
admin.site.register(Page, PageAdmin)
admin.site.register(PageContent, PageContentAdmin)
