import importlib
import subprocess
import pkg_resources

def modulInstaller():
  # daftar module yang ingin di cek
  modules = ['asyncio', 'os', 'requests', 'json', 'sys', 'dnspython', 'random', 'time', \
  'datetime', 'requests_cache', 'threading', 'colorama', 'python-telegram-bot']

  # cek dan install module yang belum terinstall
  for module in modules:
      try:
          importlib.import_module(module)
          print(f"{module} sudah terinstall.")
      except ModuleNotFoundError:
          print(f"{module} belum terinstall. Menginstall {module}...")
          subprocess.run(f"pip install {module}", shell=True)