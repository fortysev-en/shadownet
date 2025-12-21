from django.contrib import admin
from .models import Host, HostConnection, TerminalData

# Register your models here.
admin.site.register(Host)
admin.site.register(HostConnection)
admin.site.register(TerminalData)
