try:
  import installer
  import time
  import random
  import asyncio
  import sys
  import datetime
  import json
  import requests
  import time
except ModuleNotFoundError:
  installer.moduleInstaller().installModules()

from installer import moduleInstaller
from mainFunction import urls, utils, fileManager, csvManager, InitConnection, interactAPI, timer
from color import color

class play_dice():
  def __init__(self, currency, headers):
    #Atribute fungsi utilities
    self.formatted_time = {}
    
    #Atribute fungsi Proccess Bet data
    self.currency = currency
    self.bet = {}
    self.onGame = {}
    self.dataPlaceBet_bal_reset = {}
    
    #Atribute fungsi setChance
    self.ch_on = {}
    self.ch_rand = {}
    self.ch_rand_mul = {}
    
    #Atribute fungsi Process Bet Data
    self.headers = headers
    self.dataPlaceBet_bet = {}
    self.dataPlaceBet_user = {}
    
    #Atribute fungsi initWinLose
    self.lose_data = []

    #Atribute fungsi nextbet_counter
    self.b_counter = {}
    self.entr = {}
    self.statusMultiplier = {}
    self.statusToBet = {}

    #Atribute fungis bettingBalanceCounter
    self.risk_percentage = 0
    
    #Atribute General
    self.statusWinLose = "W"
    self.statusTotalWin = 0
    self.statusTotalLose = 0
    self.statusHigherLose = 0
    self.statusRiskAlert = ""
    self.statusTotalLuck = 60
    self.statusCurrentLuck = self.statusTotalLuck
    self.statusCurrentBaseBet = 0
    self.statusBaseBalance = float(interAPI.dataBets_bal_stat)
    self.statusCurrentLose = 0
    self.statusCurrentWin = 0
    self.statusHigherWin = 0
    self.statusMaxLosing = 0
    self.statusTotalProfitCounter = 0
    self.statusProfitPersen = 0
    self.statusLastProfitPersen = 0
    self.statusCurrentChanceBetting = 0
    self.statusResultChance = 0
    self.statusMaxBetting = 0
    self.statusCurrentChance = 0
    self.statusStepStrategy = "00"
    
  def utilities(self):
      # Instance timer
      timer.time_counter()
      # Objek timer
      self.formatted_time = timer.formatted_time
      
      if utils.every(25, (self.statusTotalLose + self.statusTotalWin)):
        interAPI.response_3()
      
      if self.statusHigherLose >= 10 and self.statusRiskAlert == "Medium" and self.statusWinLose == "W":
        interAPI.response_3()
        utils.sysExit()
        
  def process_bet_data(self):
      self.bet = fileManager.dataFileJson['bet']  
      # Main data proses post
      self.bet.update({'currency': self.currency,
          'amount': fileManager.dataFileJson['Play Game']['Amount']})
  
      self.onGame = fileManager.dataFileJson['onGame']
      self.dataPlaceBet_bal_reset = self.bet['amount']
  
  def setChance(self):
      self.ch_on = str("{:0.4f}".format(99/float(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'])))
      self.ch_rand = random.randrange(int(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Min']), int(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Max']),1)
      self.ch_rand_mul = str("{:0.4f}".format(99/self.ch_rand))
  
  def initChance(self):
      chance_on = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']
      chance_random = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Random']
      
      if chance_on != "0" and chance_random == "false":
          self.bet['multiplier'] = self.ch_on
          self.bet['bet_value'] = str("{:0.2f}".format(99.99 - float(chance_on)) if self.bet['rule'] == "over" else "{:0.2f}".format(float(chance_on)))
      
      elif chance_random == "true":
          self.bet['multiplier'] = self.ch_rand_mul
          self.bet['bet_value'] = str("{:0.2f}".format(99.99 - float(self.ch_rand)) if self.bet['rule'] == "over" else "{:0.2f}".format(float(self.ch_rand)))
  
      if self.onGame['if_lose_reset'] == "true" and self.statusWinLose == "L":
          self.bet['amount'] = self.dataPlaceBet_bal_reset
      elif self.onGame['if_win_reset'] == "true" and self.statusWinLose == "W":
          self.bet['amount'] = self.dataPlaceBet_bal_reset
          
  def basebet_counter(self):
      if fileManager.dataFileJson['basebet counter'] == "true":
        self.statusCurrentBaseBet = self.statusBaseBalance/float(fileManager.dataFileJson['Play Game']['Divider'])
        if self.statusCurrentLuck > self.statusTotalLuck and (float(self.bet['amount'])/float(self.dataPlaceBet_user['amount'])) < (self.statusTotalLuck/2/float(fileManager.dataFileJson['Play Game']['Divider'])): 
          self.statusCurrentBaseBet /= self.statusTotalLuck
        else:
          self.statusCurrentBaseBet /= (self.statusTotalLuck/(self.statusCurrentLose+1))
        fileManager.dataFileJson['Play Game']['Amount'] = self.statusCurrentBaseBet
        
  def process_place_bet(self):
      response_4 = requests.post(urls[4], headers=self.headers, json=self.bet, timeout=5)
      dataPlaceBet = response_4.json()
      self.dataPlaceBet_bet = dataPlaceBet['bet']
      self.dataPlaceBet_user = dataPlaceBet['userBalance']
      
  def process_chance_counter(self):
      if fileManager.dataFileJson['Play Game']['Chance to Win']['Last Chance Game'] == "true": 
        if self.bet['rule'] == "over":
          if 99.99-float(self.dataPlaceBet_bet['result_value']) > 98.00 : 
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99 - 98.00
          else:
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99-float(self.dataPlaceBet_bet['result_value'])
        if self.bet['rule'] == "under":
          if float(self.dataPlaceBet_bet['result_value']) > 98.00 : 
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 98.00
          else:
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = self.dataPlaceBet_bet['result_value']
            
  def initWinLose(self):
      if self.dataPlaceBet_bet['state'] == "win":
        self.lose_data.clear()
        color.bgWinLose = color.bgHijau
        self.statusWinLose = "W" 
        self.statusTotalWin += 1
        self.statusTotalWin += 1
        self.statusCurrentLose = 0
        if self.statusTotalWin > self.statusHigherWin:
          self.statusHigherWin = self.statusTotalWin
      else: 
        self.lose_data.append(abs(float(self.dataPlaceBet_bet['profit'])))
        color.bgWinLose = color.bgRed
        self.statusWinLose = "L"
        self.statusCurrentLose += 1
        self.statusTotalLose += 1
        self.statusTotalWin = 0
        if self.statusCurrentLose > self.statusHigherLose:
          self.statusHigherLose = self.statusCurrentLose
      sum_lose_data = sum(self.lose_data)
      if sum_lose_data > self.statusMaxLosing:
        self.statusMaxLosing = sum_lose_data

      if self.onGame['if_lose'] != "0":
        self.bet['amount'] = str(float(self.dataPlaceBet_bet['amount']) * float(self.onGame['if_lose']))
      if self.onGame['if_win'] != "0":
        self.bet['amount'] = str(float(self.dataPlaceBet_bet['amount']) * float(self.onGame['if_win']))

      if self.statusWinLose == 'W':
        self.statusTotalProfitCounter += abs(float(self.dataPlaceBet_bet["profit"]))
      elif self.statusWinLose == 'L':
        self.statusTotalProfitCounter -= abs(float(self.dataPlaceBet_bet["profit"]))

      self.statusProfitPersen = abs(self.statusTotalProfitCounter/float(interAPI.dataBets_bal_stat)*100)
      if self.statusProfitPersen > self.statusLastProfitPersen and self.statusWinLose == "W":
        self.statusLastProfitPersen = self.statusProfitPersen

  def rule_bet_chance(self):
      if self.bet['rule'] == "over":
        self.statusCurrentChanceBetting = 99.99-float(self.bet['bet_value'])
      else: 
        self.statusCurrentChanceBetting = self.bet['bet_value']
      if self.dataPlaceBet_bet['rule'] == "over":
        self.statusResultChance = 99.99-float(self.dataPlaceBet_bet['result_value'])
      else: 
        self.statusResultChance = self.dataPlaceBet_bet['result_value']
    
  def nextbet_counter(self):
      self.b_counter = 1/(float(self.bet['multiplier'])-1)+1
      self.entr = ((self.statusCurrentLose)/100)
      self.statusMultiplier = self.b_counter+self.entr
      self.statusToBet = float(self.dataPlaceBet_bet['amount'])*self.statusMultiplier
        
  def bettingBalanceCounter(self):
      if self.statusToBet > self.statusMaxBetting :
        self.statusMaxBetting = self.statusToBet
  
      # Menghitung persentase self.statusMaxBetting  terhadap statusBalance
      self.risk_percentage = (float(utils.formated(self.statusMaxBetting, "desimal", 8)) / float(utils.formated(self.dataPlaceBet_user["amount"], "desimal", 8))) * 100

  def placeChance(self):
      fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = str(float(self.statusCurrentChance))
      playGame.nextbet_counter()
      playGame.initChance()

  def IsStrategy(self):
      if fileManager.dataFileJson['amount counter'] == "true" and self.onGame['if_lose'] == "0":
        self.bet['rule'] = "under"
        if self.statusWinLose == "W":
          self.bet['amount'] = self.statusCurrentBaseBet
        elif self.statusCurrentLose > 1: 
          self.bet['amount'] = utils.formated(self.statusToBet, "float", 8)
          self.statusCurrentChance += 3
          playGame.placeChance()
        elif float(self.bet['amount']) / float(self.dataPlaceBet_user['amount']) > (self.statusProfitPersen / 10):
          self.statusCurrentChance = random.randrange(65, 80, 5)
          self.statusStepStrategy = "00"
          playGame.placeChance()
        loss_chance_mapping = {
            0: 4,
            2: 8,
            4: 12,
            8: 16
        }
        
        if self.statusCurrentLose in loss_chance_mapping:
            self.statusCurrentChance = loss_chance_mapping[self.statusCurrentLose]
            self.statusStepStrategy = f"{self.statusCurrentLose:02}"
            playGame.placeChance()
        elif self.statusCurrentLose > 10 and self.statusCurrentLose < 12:
            self.statusCurrentChance += 8
            self.statusStepStrategy = "05"
            playGame.placeChance()
        elif self.statusCurrentLose > 14:
            self.statusCurrentChance += 12
            self.statusStepStrategy = "06"
            playGame.placeChance()
        elif self.statusProfitPersen < self.statusLastProfitPersen or self.statusCurrentLose >= self.statusHigherLose/2:
          self.statusCurrentChance += 6
          self.statusStepStrategy = "07"
          playGame.placeChance()
          try:
            self.statusCurrentLuck = self.statusTotalWin/self.statusTotalLose*100
          except ZeroDivisionError:
            self.statusCurrentLuck = 20
        elif self.statusCurrentLuck < self.statusTotalLuck and self.statusProfitPersen < self.statusLastProfitPersen:
          self.statusCurrentChance += 15
          self.statusStepStrategy = "08"
          playGame.placeChance()
        elif self.statusCurrentLuck >= self.statusTotalLuck and self.statusProfitPersen < self.statusLastProfitPersen and float(self.bet['amount']) > (float(self.dataPlaceBet_user['amount'])*0.0002):
          self.statusCurrentChance += 30
          self.statusStepStrategy = "09"
          playGame.placeChance()

      if float(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']) >= 75: 
        fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = "75"
          
  def bgTextChanger(self):
      if self.statusStepStrategy == "00":
          color.bgStep = color.bgPutih
          color.txtStep = color.txtHitam
      elif self.statusStepStrategy in {"01", "02", "03"}:
          color.bgStep = color.bgHijau
          color.txtStep = color.txtPutih
      elif self.statusStepStrategy in {"04", "05", "06"}:
          color.bgStep = color.bgKuning
          color.txtStep = color.txtHitam
      elif self.statusStepStrategy in {"07", "08"} or self.statusStepStrategy >= "09":
          color.bgStep = color.bgRed
          color.txtStep = color.txtPutih
      else:
          color.bgStep = color.bgBiru
          color.txtStep = color.txtPutih

      color.bgRiskAlert = ""
      color.txtRiskAlert = ""
      # Menentukan level risk berdasarkan persentase
      if 1 <= self.risk_percentage <= 20:
          self.statusRiskAlert = "Low"
          color.bgRiskAlert = color.bgHijau
          color.txtRiskAlert = color.txtPutih
      elif 31 <= self.risk_percentage <= 40:
          self.statusRiskAlert = "Medium"
          color.bgRiskAlert = color.bgKuning
          color.txtRiskAlert = color.txtHitam
      elif 61 <= self.risk_percentage <= 60:
          self.statusRiskAlert = "High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      elif self.risk_percentage > 60:
          self.statusRiskAlert = "Very High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      else:
          self.statusRiskAlert = "No Risk"
          color.bgRiskAlert = color.bgPutih
          color.txtRiskAlert = color.txtHitam

  def csvStdOut(self):
      # Tentukan nama file CSV dan kolom-kolomnya
      file_name = "data.csv"
      columns = ["sWL", "sRC", "sM", "sSS", "sTB", "sPC", "sLPP"]
      
      # Inisialisasi class csvManager
      csv_manager = csvManager(file_name, columns)
      
      # Tambah data baru (satu baris) ke dalam file
      csv_manager.append_data({
      "sWL": self.statusWinLose, "sRC": utils.formated(self.statusResultChance, "double",2), "sM": utils.formated(self.statusMultiplier, "double", 2), "sSS": self.statusStepStrategy,
      "sTB": utils.formated(self.statusToBet, "desimal", 8), "sPC": utils.formated(self.statusTotalProfitCounter, "desimal", 8), "sLPP": utils.formated(self.statusLastProfitPersen, "persen", 3)
      })
      
      # Membaca dan mencetak data dari file CSV
      #data = csv_manager.read_data()
      #print(data)

  def print_out(self):
      gap = color.colorText("|", color.bgEnd)
      sWL = color.colorText(self.statusWinLose, color.bgWinLose)
      sCCB = color.colorText(utils.formated(self.statusCurrentChanceBetting, "double", 2), color.bgWinLose, color.txtPutih)
      sM = color.colorText(utils.formated(self.statusMultiplier, "double", 2), color.bgUngu, color.txtPutih)
      sSS = color.colorText(self.statusStepStrategy, color.bgStep, color.txtStep)
      sTB = color.colorText(utils.formated(self.statusToBet, "desimal", 8), color.bgWinLose, color.txtKuning)
      #sDP (status data profit)
      sDP = color.colorText(utils.formated(self.dataPlaceBet_bet["profit"], "desimal", 8), color.bgWinLose)
      sPC = color.colorText(utils.formated(self.statusTotalProfitCounter, "desimal", 8), color.bgWinLose)
      sPP = color.colorText(utils.formated(self.statusProfitPersen, "persen", 3), color.bgWinLose, color.txtKuning)
      sLPP = color.colorText(utils.formated(self.statusLastProfitPersen, "persen", 3), color.bgPutih, color.txtKuning)
      print(f'{gap}{sWL}{gap}{sCCB}{gap}{sM}{gap}{sSS}{gap}{sTB}{gap}{sDP}{gap}{sPC}{gap}{sPP}{gap}')
      
      sTWL = color.colorText(f'T:{self.statusTotalWin}/{self.statusTotalLose}', color.bgUngu)
      sHWL = color.colorText(f'H:{self.statusHigherWin}/{self.statusHigherLose}', color.bgUngu)
      sCWL = color.colorText(f'C:{self.statusCurrentWin}/{self.statusCurrentLose}', color.bgUngu)
      sRC = color.colorText(f'RC:{utils.formated(self.statusResultChance, "double",2)}', color.bgWinLose, color.txtPutih)
      sCL = color.colorText(f'Lck:{utils.formated(self.statusCurrentLuck, "persen", 0)}', color.bgWinLose)
      sMB = color.colorText(f'M:{utils.formated(self.statusMaxBetting, "desimal", 8)}', color.bgWinLose)
      sRA = color.colorText(self.statusRiskAlert, color.bgRiskAlert, color.txtRiskAlert)
      sB = color.colorText(f'B:{utils.formated(self.dataPlaceBet_user["amount"], "desimal", 8)}', color.bgWinLose)
      sTIME = color.colorText(self.formatted_time, color.bgPutih, color.txtHitam)
      sys.stdout.write(f'_\r {gap}{sRC}{gap}{sB}{gap}{sRA}{gap}{sCWL}{gap}{sHWL}{gap}{sTWL}{gap}\r')
      
def dice():

  while True:
    playGame.utilities()

    try:
      playGame.setChance()
      playGame.initChance()
      playGame.basebet_counter()
      playGame.process_place_bet()
      playGame.process_chance_counter()
      playGame.initWinLose()
      playGame.rule_bet_chance()
      playGame.initChance()
      playGame.nextbet_counter()
      playGame.bettingBalanceCounter()
      playGame.placeChance()
      playGame.IsStrategy()
      playGame.bgTextChanger()
      playGame.csvStdOut()
      playGame.print_out()
      
      

      def conerror():
        time.sleep(1)
        print('\nKoneksi terputus, memuat ulang koneksi')
        try:
          try:
            print('Jalankan kembali')
            dice()
            conerror()
          except Exception as e:
            print(f'\n Error {e}, Sedang Mencoba Kembali')
        except Exception as e:
          print(f'\n Error {e}, Sedang Mencoba Kembali')
          conerror()
    except requests.exceptions.Timeout as e:
      utils.textShow(e)
      conerror()
    except (KeyError, NameError, ValueError, TypeError, IndexError, FileNotFoundError, AttributeError, IndentationError) as e:
      if playGame.statusRiskAlert == "low":
        utils.textShow(e)
        conerror()
      else:
        utils.textShow(e)
        conerror()
        utils.sysExit()
    except (ConnectionAbortedError, requests.exceptions.ConnectionError) as e:
      print(f'\nTidak dapat terhubung, periksa koneksi internet anda error {e}')
      conerror()
    except ImportError as e:
      utils.textShow(e)
      moduleInstaller()
      conerror()
    except (KeyboardInterrupt, IOError) as e:
      stop = input(f'\nPause, "y"(Lanjutkan)/"n"(Keluar): ').lower()
      if stop == "y":
        conerror()
      elif stop == "n":
        utils.sysExit()
    except Exception as e:
      utils.textShow(e)
      if playGame.statusRiskAlert == "low":
        conerror()
      else:
        ecp = input(f'\nTerjadi Error, tetapi Risk {playGame.statusRiskAlert} ingin melanjutkan? (Y/N): ').lower()
        if ecp == "y":
          dice()
        elif ecp == "n":
          print(f'Keluar Program')
          utils.sysExit()
        else:
          print(f'Pilih ya atau tidak!')
          conerror()
          utils.sysExit()

#Instance timer
timer = timer()
timer.start_time_counter()

#Instance
utils.http_A()
interAPI = interactAPI('data.json')
interAPI.startInit()
interAPI.AccessInit()
interAPI.response_0()
interAPI.currency_collector()
interAPI.response_1()
interAPI.response_2()
interAPI.response_3()
interAPI.status_info()
playGame = play_dice(interAPI.currency, interAPI.headers)


while True:
  playGame.process_bet_data()
  dice()