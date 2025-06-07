from django.contrib import admin

from .models import User

admin.site.register(User)
admin.site.site_header = 'Flowmerce Admin'
admin.site.site_title = 'Flowmerce Admin Portal'
admin.site.index_title = 'Welcome to Flowmerce Admin'