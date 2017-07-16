from django.contrib import admin

# Register your models here.
import models


class BookAdmin(admin.ModelAdmin):
    pass


class PageAdmin(admin.ModelAdmin):
    pass


class PageContentAdmin(admin.ModelAdmin):
    pass


admin.site.register(models.Book, BookAdmin)
admin.site.register(models.Page, PageAdmin)
admin.site.register(models.Owner, PageAdmin)
admin.site.register(models.UnitModel, PageAdmin)
admin.site.register(models.ColorMeta, PageAdmin)
admin.site.register(models.PageContent, PageContentAdmin)
