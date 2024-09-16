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
        
def dice():
  statusStepStrategy = "00"
  statusCurrentChance = 0
  statusMaxBetting = 0

  while True:
    playGame.utilities()

    try:
      playGame.setChance()
      playGame.initChance()
      playGame.basebet_counter()
      playGame.process_place_bet()
      playGame.process_chance_counter()
      playGame.initWinLose()
            

      if playGame.bet['rule'] == "over":
        statusCurrentChanceBetting = 99.99-float(playGame.bet['bet_value'])
      else: 
        statusCurrentChanceBetting = playGame.bet['bet_value']
      if playGame.dataPlaceBet_bet['rule'] == "over":
        statusResultChance = 99.99-float(playGame.dataPlaceBet_bet['result_value'])
      else: 
        statusResultChance = playGame.dataPlaceBet_bet['result_value']
      playGame.initChance()

      def nextbet_counter():
        global b_counter, entr, statusMultiplier, statusToBet
        b_counter = 1/(float(playGame.bet['multiplier'])-1)+1
        entr = ((playGame.statusCurrentLose*(playGame.statusCurrentLuck/5))/100)
        statusMultiplier = b_counter+entr
        statusToBet = float(playGame.dataPlaceBet_bet['amount'])*statusMultiplier
        return statusMultiplier, statusToBet
      nextbet_counter()
      statusMultiplier, statusToBet = nextbet_counter()
      
      color.bgRiskAlert = ""
      color.txtRiskAlert = ""
      if statusToBet > statusMaxBetting :
        statusMaxBetting = statusToBet
  
      # Menghitung persentase statusMaxBetting  terhadap sB
      risk_percentage = (float(utils.formated(statusMaxBetting, "desimal", 8)) / float(utils.formated(playGame.dataPlaceBet_user["amount"], "desimal", 8))) * 100

      def placeChance():
        fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = str(float(statusCurrentChance))
        nextbet_counter()
        playGame.initChance()

      if fileManager.dataFileJson['amount counter'] == "true" and playGame.onGame['if_lose'] == "0":
        playGame.bet['rule'] = "under"
        if playGame.statusWinLose == "W":
          playGame.bet['amount'] = playGame.statusCurrentBaseBet
        elif playGame.statusCurrentLose > 1: 
          playGame.bet['amount'] = utils.formated(statusToBet, "float", 8)
          statusCurrentChance += 3
          placeChance()
        elif float(playGame.bet['amount']) / float(playGame.dataPlaceBet_user['amount']) > (playGame.statusProfitPersen / 10):
          statusCurrentChance = random.randrange(65, 100, 5)
          statusStepStrategy = "00"
          placeChance()
        loss_chance_mapping = {
            0: 4,
            2: 8,
            4: 12,
            8: 16
        }
        
        if playGame.statusCurrentLose in loss_chance_mapping:
            statusCurrentChance = loss_chance_mapping[playGame.statusCurrentLose]
            statusStepStrategy = f"{playGame.statusCurrentLose:02}"
            placeChance()
        elif playGame.statusCurrentLose > 10 and playGame.statusCurrentLose < 12:
            statusCurrentChance += 8
            statusStepStrategy = "05"
            placeChance()
        elif playGame.statusCurrentLose > 14:
            statusCurrentChance += 12
            statusStepStrategy = "06"
            placeChance()
        elif playGame.statusProfitPersen < playGame.statusLastProfitPersen or playGame.statusCurrentLose >= playGame.statusHigherLose/2:
          statusCurrentChance += 6
          statusStepStrategy = "07"
          placeChance()
          try:
            playGame.statusCurrentLuck = playGame.statusTotalWin/playGame.statusTotalLose*100
          except ZeroDivisionError:
           playGame.statusCurrentLuck = 20
        elif playGame.statusCurrentLuck < playGame.statusTotalLuck and playGame.statusProfitPersen < playGame.statusLastProfitPersen:
          statusCurrentChance += 15
          statusStepStrategy = "08"
          placeChance()
        elif playGame.statusCurrentLuck >= playGame.statusTotalLuck and playGame.statusProfitPersen < playGame.statusLastProfitPersen and float(playGame.bet['amount']) > (float(playGame.dataPlaceBet_user['amount'])*0.0002):
          statusCurrentChance += 30
          statusStepStrategy = "09"
          placeChance()
        
      if statusStepStrategy == "00":
          color.bgStep = color.bgPutih
          color.txtStep = color.txtHitam
      elif statusStepStrategy in {"01", "02", "03"}:
          color.bgStep = color.bgHijau
          color.txtStep = color.txtPutih
      elif statusStepStrategy in {"04", "05", "06"}:
          color.bgStep = color.bgKuning
          color.txtStep = color.txtHitam
      elif statusStepStrategy in {"07", "08"} or statusStepStrategy >= "09":
          color.bgStep = color.bgRed
          color.txtStep = color.txtPutih
      else:
          color.bgStep = color.bgBiru
          color.txtStep = color.txtPutih
    
      # Menentukan level risk berdasarkan persentase
      if 1 <= risk_percentage <= 20:
          playGame.statusRiskAlert = "Low"
          color.bgRiskAlert = color.bgHijau
          color.txtRiskAlert = color.txtPutih
      elif 31 <= risk_percentage <= 40:
          playGame.statusRiskAlert = "Medium"
          color.bgRiskAlert = color.bgKuning
          color.txtRiskAlert = color.txtHitam
      elif 61 <= risk_percentage <= 60:
          playGame.statusRiskAlert = "High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      elif risk_percentage > 60:
          playGame.statusRiskAlert = "Very High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      else:
          playGame.statusRiskAlert = "No Risk"
          color.bgRiskAlert = color.bgPutih
          color.txtRiskAlert = color.txtHitam
    
      if float(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']) >= 75: 
        fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = "75"
      
      def csvStdOut():
        # Tentukan nama file CSV dan kolom-kolomnya
        file_name = "data.csv"
        columns = ["sWL", "sRC", "sM", "sSS", "sTB", "sPC", "sLPP"]
        
        # Inisialisasi class csvManager
        csv_manager = csvManager(file_name, columns)
        
        # Tambah data baru (satu baris) ke dalam file
        csv_manager.append_data({
        "sWL": playGame.statusWinLose, "sRC": utils.formated(statusResultChance, "double",2), "sM": utils.formated(statusMultiplier, "double", 2), "sSS": statusStepStrategy,
        "sTB": utils.formated(statusToBet, "desimal", 8), "sPC": utils.formated(playGame.statusTotalProfitCounter, "desimal", 8), "sLPP": utils.formated(playGame.statusLastProfitPersen, "persen", 3)
        })
        
        # Membaca dan mencetak data dari file CSV
        #data = csv_manager.read_data()
        #print(data)
      csvStdOut()
      
      def print_out():
        gap = color.colorText("|", color.bgEnd)
        sWL = color.colorText(playGame.statusWinLose, color.bgWinLose)
        sCCB = color.colorText(utils.formated(statusCurrentChanceBetting, "double", 2), color.bgWinLose, color.txtPutih)
        sM = color.colorText(utils.formated(statusMultiplier, "double", 2), color.bgUngu, color.txtPutih)
        sSS = color.colorText(statusStepStrategy, color.bgStep, color.txtStep)
        sTB = color.colorText(utils.formated(statusToBet, "desimal", 8), color.bgWinLose, color.txtKuning)
        #sDP (status data profit)
        sDP = color.colorText(utils.formated(playGame.dataPlaceBet_bet["profit"], "desimal", 8), color.bgWinLose)
        sPC = color.colorText(utils.formated(playGame.statusTotalProfitCounter, "desimal", 8), color.bgWinLose)
        sPP = color.colorText(utils.formated(playGame.statusProfitPersen, "persen", 3), color.bgWinLose, color.txtKuning)
        sLPP = color.colorText(utils.formated(playGame.statusLastProfitPersen, "persen", 3), color.bgPutih, color.txtKuning)
        print(f'{gap}{sWL}{gap}{sCCB}{gap}{sM}{gap}{sSS}{gap}{sTB}{gap}{sDP}{gap}{sPC}{gap}{sPP}{gap}')
        
        sTWL = color.colorText(f'T:{playGame.statusTotalWin}/{playGame.statusTotalLose}', color.bgUngu)
        sHWL = color.colorText(f'H:{playGame.statusHigherWin}/{playGame.statusHigherLose}', color.bgUngu)
        sCWL = color.colorText(f'C:{playGame.statusCurrentWin}/{playGame.statusCurrentLose}', color.bgUngu)
        sRC = color.colorText(f'RC:{utils.formated(statusResultChance, "double",2)}', color.bgWinLose, color.txtPutih)
        sCL = color.colorText(f'Lck:{utils.formated(playGame.statusCurrentLuck, "persen", 0)}', color.bgWinLose)
        sMB = color.colorText(f'M:{utils.formated(statusMaxBetting, "desimal", 8)}', color.bgWinLose)
        sRA = color.colorText(playGame.statusRiskAlert, color.bgRiskAlert, color.txtRiskAlert)
        sB = color.colorText(f'B:{utils.formated(playGame.dataPlaceBet_user["amount"], "desimal", 8)}', color.bgWinLose)
        sTIME = color.colorText(playGame.formatted_time, color.bgPutih, color.txtHitam)
        sys.stdout.write(f'_\r {gap}{sRC}{gap}{sB}{gap}{sRA}{gap}{sCWL}{gap}{sHWL}{gap}{sTWL}{gap}\r')
      print_out()

      def conerror():
        time.sleep(1)
        print('\nKoneksi terputus, memuat ulang koneksi')
        try:
          try:
            print('Jalankan kembali')
            dice(interAPI.dataBets_bal_stat)
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
      stop = input(f'\nProgram terhenti {e}, enter untuk keluar ').lower()
      if stop == "":
        utils.sysExit()
    except Exception as e:
      utils.textShow(e)
      if playGame.statusRiskAlert == "low":
        conerror()
      else:
        ecp = input(f'\nTerjadi Error, tetapi Risk {playGame.statusRiskAlert} ingin melanjutkan? (Y/N): ').lower()
        if ecp == "y":
          dice(interAPI.dataBets_bal_stat)
        else:
          utils.textShow(e)
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


while True:
  playGame = play_dice(interAPI.currency, interAPI.headers)
  playGame.process_bet_data()
  dice()