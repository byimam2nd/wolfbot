import importlib
import subprocess

class moduleInstaller:
    def __init__(self):
        # Daftar modul yang ingin dicek
        self.modules = [
            'asyncio', 'os', 'requests', 'json', 'sys', 'dnspython', 'random', 
            'time', 'datetime', 'requests_cache', 'threading', 'colorama', 
            'python-telegram-bot, rich, textual']

    def installModules(self):
        """Memeriksa dan menginstal modul yang belum terpasang."""
        for module in self.modules:
            self._check_and_install(module)

    def _check_and_install(self, module):
        """Memeriksa keberadaan modul dan menginstalnya jika tidak ditemukan."""
        try:
            importlib.import_module(module)
            print(f"{module} sudah terinstall.")
        except ModuleNotFoundError:
            print(f"{module} belum terinstall. Menginstall {module}...")
            self._install(module)

    def _install(self, module):
        """Menginstal modul menggunakan pip."""
        subprocess.run(f"pip install {module}", shell=True)