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

class playDice():
  def __init__(self, currency, headers):
    #Atribute fungsi utilities
    self.formattedTime = {}
    
    #Atribute fungsi Proccess Bet data
    self.currency = currency
    self.bet = {}
    self.onGame = {}
    self.dataPlaceBetBalanceReset = {}
    
    #Atribute fungsi setChance
    self.setChanceOn = {}
    self.setChanceRandom = {}
    self.setChanceMultiRandom = {}
    
    #Atribute fungsi Process Bet Data
    self.headers = headers
    self.dataPlaceBet = {}
    self.dataPlaceSetBet = {}
    self.dataPlaceSetBetUser = {}
    
    #Atribute fungsi initWinLose
    self.loseData = []

    #Atribute fungsi nextbet_counter
    self.balanceCounter = {}
    self.EtrCounter = {}
    self.statusMultiplier = {}
    self.statusToBet = {}

    #Atribute fungis bettingBalanceCounter
    self.riskPercentage = 0
    
    #Atribute General
    self.statusWinLose = "W"
    self.statusTotalWin = 0
    self.statusTotalLose = 0
    self.statusHigherLose = 0
    self.statusRiskAlert = ""
    self.statusTotalLuck = 60
    self.statusCurrentLuck = self.statusTotalLuck
    self.statusCurrentBaseBet = 0
    self.statusBaseBalance = float(interAPI.dataBetsBalanceStat)
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
      timer.timeCounter()
      # Objek timer
      self.formattedTime = timer.formattedTime
      
      if utils.every(25, (self.statusTotalLose + self.statusTotalWin)):
        interAPI.responseRefreshSeed()
      
      if self.statusHigherLose >= 10 and self.statusWinLose == "W" and self.statusRiskAlert == "Medium"  or self.statusRiskAlert == "High" or self.statusRiskAlert == "Very High":
        interAPI.responseRefreshSeed()
        utils.sysExit()
        
  def proccessBetData(self):
      self.bet = fileManager.dataFileJson['bet']  
      # Main data proses post
      self.bet.update({'currency': self.currency,
          'amount': fileManager.dataFileJson['Play Game']['Amount']})
  
      self.onGame = fileManager.dataFileJson['onGame']
      self.dataPlaceBetBalanceReset = self.bet['amount']
  
  def setChance(self):
      self.setChanceOn = str("{:0.4f}".format(99/float(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'])))
      self.setChanceRandom = random.randrange(int(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Min']), int(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Max']),1)
      self.setChanceMultiRandom = str("{:0.4f}".format(99/self.setChanceRandom))
  
  def initChance(self):
      initChanceOn = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']
      initChanceRandom = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Random']
      
      if initChanceOn != "0" and initChanceRandom == "false":
          self.bet['multiplier'] = self.setChanceOn
          self.bet['bet_value'] = str("{:0.2f}".format(99.99 - float(initChanceOn)) if self.bet['rule'] == "over" else "{:0.2f}".format(float(initChanceOn)))
      
      elif initChanceRandom == "true":
          self.bet['multiplier'] = self.setChanceMultiRandom
          self.bet['bet_value'] = str("{:0.2f}".format(99.99 - float(self.setChanceRandom)) if self.bet['rule'] == "over" else "{:0.2f}".format(float(self.setChanceRandom)))
  
      if self.onGame['if_lose_reset'] == "true" and self.statusWinLose == "L":
          self.bet['amount'] = self.dataPlaceBetBalanceReset
      elif self.onGame['if_win_reset'] == "true" and self.statusWinLose == "W":
          self.bet['amount'] = self.dataPlaceBetBalanceReset
          
  def basebetCounter(self):
      if fileManager.dataFileJson['basebet counter'] == "true":
        self.statusCurrentBaseBet = self.statusBaseBalance/float(fileManager.dataFileJson['Play Game']['Divider'])
        if self.statusCurrentLuck > self.statusTotalLuck and (float(self.bet['amount'])/float(self.dataPlaceSetBetUser['amount'])) < (self.statusTotalLuck/2/float(fileManager.dataFileJson['Play Game']['Divider'])): 
          self.statusCurrentBaseBet /= self.statusTotalLuck
        else:
          self.statusCurrentBaseBet /= (self.statusTotalLuck/(self.statusCurrentLose+1))
        fileManager.dataFileJson['Play Game']['Amount'] = self.statusCurrentBaseBet
        
  def proccessPlaceBet(self):
      response_4 = requests.post(urls[4], headers=self.headers, json=self.bet, timeout=5)
      dataPlaceBet = response_4.json()
      self.dataPlaceSetBet = dataPlaceBet['bet']
      self.dataPlaceSetBetUser = dataPlaceBet['userBalance']
      
  def proccessChanceCounter(self):
      if fileManager.dataFileJson['Play Game']['Chance to Win']['Last Chance Game'] == "true": 
        if self.bet['rule'] == "over":
          if 99.99-float(self.dataPlaceSetBet['result_value']) > 98.00 : 
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99 - 98.00
          else:
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99-float(self.dataPlaceSetBet['result_value'])
        if self.bet['rule'] == "under":
          if float(self.dataPlaceSetBet['result_value']) > 98.00 : 
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 98.00
          else:
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = self.dataPlaceSetBet['result_value']
            
  def initWinLose(self):
      if self.dataPlaceSetBet['state'] == "win":
        self.loseData.clear()
        color.bgWinLose = color.bgHijau
        self.statusWinLose = "W" 
        self.statusTotalWin += 1
        self.statusCurrentWin += 1
        self.statusCurrentLose = 0
        if self.statusCurrentWin > self.statusHigherWin:
          self.statusHigherWin = self.statusCurrentWin
      else: 
        self.loseData.append(abs(float(self.dataPlaceSetBet['profit'])))
        color.bgWinLose = color.bgRed
        self.statusWinLose = "L"
        self.statusTotalLose += 1
        self.statusCurrentLose += 1
        self.statusCurrentWin = 0
        if self.statusCurrentLose > self.statusHigherLose:
          self.statusHigherLose = self.statusCurrentLose
      sumLoseData = sum(self.loseData)
      if sumLoseData > self.statusMaxLosing:
        self.statusMaxLosing = sumLoseData

      if self.onGame['if_lose'] != "0":
        self.bet['amount'] = str(float(self.dataPlaceSetBet['amount']) * float(self.onGame['if_lose']))
      if self.onGame['if_win'] != "0":
        self.bet['amount'] = str(float(self.dataPlaceSetBet['amount']) * float(self.onGame['if_win']))

      if self.statusWinLose == 'W':
        self.statusTotalProfitCounter += abs(float(self.dataPlaceSetBet["profit"]))
      elif self.statusWinLose == 'L':
        self.statusTotalProfitCounter -= abs(float(self.dataPlaceSetBet["profit"]))

      self.statusProfitPersen = abs(self.statusTotalProfitCounter/float(interAPI.dataBetsBalanceStat)*100)
      if self.statusProfitPersen > self.statusLastProfitPersen and self.statusWinLose == "W":
        self.statusLastProfitPersen = self.statusProfitPersen

  def ruleBetChance(self):
      if self.bet['rule'] == "over":
        self.statusCurrentChanceBetting = 99.99-float(self.bet['bet_value'])
      else: 
        self.statusCurrentChanceBetting = self.bet['bet_value']
      if self.dataPlaceSetBet['rule'] == "over":
        self.statusResultChance = 99.99-float(self.dataPlaceSetBet['result_value'])
      else: 
        self.statusResultChance = self.dataPlaceSetBet['result_value']
    
  def nextbetCounter(self):
      self.balanceCounter = 1/(float(self.bet['multiplier'])-1)+1
      self.EtrCounter = ((self.statusCurrentLose+(self.statusCurrentChance/2))/100)
      self.statusMultiplier = self.balanceCounter+self.EtrCounter
      self.statusToBet = float(self.dataPlaceSetBet['amount'])*self.statusMultiplier
        
  def bettingBalanceCounter(self):
      if self.statusToBet > self.statusMaxBetting :
        self.statusMaxBetting = self.statusToBet
  
      # Menghitung persentase self.statusMaxBetting  terhadap statusBalance
      self.riskPercentage = (float(utils.formated(self.statusMaxBetting, "desimal", 8)) / float(utils.formated(self.dataPlaceSetBetUser["amount"], "desimal", 8))) * 100

  def placeChance(self):
      fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = str(float(self.statusCurrentChance))
      playGame.nextbetCounter()
      playGame.initChance()

  def IsStrategy(self):
      try:
        self.statusCurrentLuck = self.statusTotalWin/self.statusTotalLose*100
      except ZeroDivisionError:
        self.statusCurrentLuck = 0
        
      if fileManager.dataFileJson['amount counter'] == "true":
        self.bet['rule'] = "under"
        if self.statusWinLose == "W":
          self.bet['amount'] = self.statusCurrentBaseBet
        elif self.statusCurrentLose > 1:
          self.bet['amount'] = utils.formated(self.statusToBet, "float", 8)
          self.statusCurrentChance += 3
          self.statusStepStrategy = "01"
          playGame.placeChance()
        elif float(self.bet['amount']) / float(self.dataPlaceSetBetUser['amount']) > (self.statusProfitPersen / 10):
          self.statusCurrentChance = random.randrange(65, 80, 5)
          self.statusStepStrategy = "02"
          playGame.placeChance()
        lossChanceMapping = {
            0: 4,
            2: 8,
            4: 12,
            8: 16
        }
        
        if self.statusCurrentLose in lossChanceMapping:
            self.statusCurrentChance = lossChanceMapping[self.statusCurrentLose]
            self.statusStepStrategy = "03"
            playGame.placeChance()
        elif self.statusCurrentLose > 8 and self.statusCurrentLose < 10:
            self.statusCurrentChance += 8
            self.statusStepStrategy = "04"
            playGame.placeChance()
        elif self.statusCurrentLose > 12:
            self.statusCurrentChance += 11
            self.statusStepStrategy = "05"
            playGame.placeChance()
        elif self.statusCurrentLose >= self.statusHigherLose/2:
          self.statusCurrentChance += 7
          self.statusStepStrategy = "06"
          playGame.placeChance()
        elif self.statusCurrentLuck < self.statusTotalLuck and self.statusProfitPersen < self.statusLastProfitPersen:
          self.statusCurrentChance += 15
          self.statusStepStrategy = "07"
          playGame.placeChance()
        elif self.statusProfitPersen < self.statusLastProfitPersen and float(self.bet['amount']) > (float(self.dataPlaceSetBetUser['amount'])*0.0002):
          self.statusCurrentChance += 20
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
      if 1 <= self.riskPercentage <= 20:
          self.statusRiskAlert = "Low"
          color.bgRiskAlert = color.bgHijau
          color.txtRiskAlert = color.txtPutih
      elif 31 <= self.riskPercentage <= 40:
          self.statusRiskAlert = "Medium"
          color.bgRiskAlert = color.bgKuning
          color.txtRiskAlert = color.txtHitam
      elif 61 <= self.riskPercentage <= 60:
          self.statusRiskAlert = "High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      elif self.riskPercentage > 60:
          self.statusRiskAlert = "Very High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      else:
          self.statusRiskAlert = "No Risk"
          color.bgRiskAlert = color.bgPutih
          color.txtRiskAlert = color.txtHitam

  def csvStdOut(self):
      # Tentukan nama file CSV dan kolom-kolomnya
      fileName = "data.csv"
      columns = ["sWL", "sRC", "sM", "sSS", "sTB", "sPC", "sLPP"]
      
      # Inisialisasi class csvManager
      csvDataManger = csvManager(fileName, columns)
      
      # Tambah data baru (satu baris) ke dalam file
      csvDataManger.append_data({
      "sWL": self.statusWinLose, "sRC": utils.formated(self.statusResultChance, "double",2), "sM": utils.formated(self.statusMultiplier, "double", 2), "sSS": self.statusStepStrategy,
      "sTB": utils.formated(self.statusToBet, "desimal", 8), "sPC": utils.formated(self.statusTotalProfitCounter, "desimal", 8), "sLPP": utils.formated(self.statusLastProfitPersen, "persen", 3)
      })
      
      # Membaca dan mencetak data dari file CSV
      #data = csvDataManger.read_data()
      #print(data)

  def printOut(self):
      gap = color.colorText("|", color.bgEnd)
      sWL = color.colorText(self.statusWinLose, color.bgWinLose)
      sCCB = color.colorText(utils.formated(self.statusCurrentChanceBetting, "double", 2), color.bgWinLose, color.txtPutih)
      sM = color.colorText(utils.formated(self.statusMultiplier, "double", 2), color.bgUngu, color.txtPutih)
      sSS = color.colorText(self.statusStepStrategy, color.bgStep, color.txtStep)
      sTB = color.colorText(utils.formated(self.statusToBet, "desimal", 8), color.bgWinLose, color.txtKuning)
      #sDP (status data profit)
      sDP = color.colorText(utils.formated(self.dataPlaceSetBet["profit"], "desimal", 8), color.bgWinLose)
      sPC = color.colorText(utils.formated(self.statusTotalProfitCounter, "desimal", 8), color.bgWinLose)
      sPP = color.colorText(utils.formated(self.statusProfitPersen, "persen", 3), color.bgWinLose, color.txtKuning)
      sLPP = color.colorText(utils.formated(self.statusLastProfitPersen, "persen", 3), color.bgWinLose, color.txtKuning)
      print(f'{gap}{sWL}{gap}{sSS}{gap}{sCCB}{gap}{sM}{gap}{sTB}{gap}{sDP}{gap}{sPC}{gap}{sPP}{gap}')
      
      sTWL = color.colorText(f'T:{self.statusTotalWin}/{self.statusTotalLose}', color.bgUngu)
      sHWL = color.colorText(f'H:{self.statusHigherWin}/{self.statusHigherLose}', color.bgUngu)
      sCWL = color.colorText(f'C:{self.statusCurrentWin}/{self.statusCurrentLose}', color.bgUngu)
      sRC = color.colorText(f'RC:{utils.formated(self.statusResultChance, "double",2)}', color.bgWinLose, color.txtPutih)
      sCL = color.colorText(f'Lck:{utils.formated(self.statusCurrentLuck, "persen", 0)}', color.bgWinLose)
      sMB = color.colorText(f'M:{utils.formated(self.statusMaxBetting, "desimal", 8)}', color.bgWinLose)
      sRA = color.colorText(self.statusRiskAlert, color.bgRiskAlert, color.txtRiskAlert)
      sB = color.colorText(f'B:{utils.formated(self.dataPlaceSetBetUser["amount"], "desimal", 8)}', color.bgWinLose)
      sTIME = color.colorText(self.formattedTime, color.bgPutih, color.txtHitam)
      sys.stdout.write(f'_\r {gap}{sRC}{gap}{sB}{gap}{sRA}{gap}{sCWL}{gap}{sHWL}{gap}{sTWL}{gap}\r')

  def conerror(self):
      time.sleep(1)
      print('\nKoneksi terputus, memuat ulang koneksi')
      try:
        try:
          print('Jalankan kembali')
          executor()
        except Exception as e:
          print(f'\n Error {e}, Sedang Mencoba Kembali')
      except Exception as e:
        print(f'\n Error {e}, Sedang Mencoba Kembali')
        playGame.conerror()



#PROGRAM EKSEKUTOR -------------------->>      

#Instance Class ( Initialize )
#Instance Class timer
timer = timer()
timer.startTimeCounter()
#Instance Class
utils.httpAdapter()

interAPI = interactAPI('data.json')
interAPI.startInit()
interAPI.AccessInit()
interAPI.responseBalance()
interAPI.currencyCollector()
interAPI.responseBets()
interAPI.responseStatusRace()
interAPI.responseRefreshSeed()
interAPI.statusInfo()

playGame = playDice(interAPI.currency, interAPI.headers)
playGame.proccessBetData()

#PROGRAM EKSEKUSI BERLANJUT
while True:
  try:
    def executor():
      #Eksekutor Objek Method
      playGame.utilities()
      playGame.setChance()
      playGame.initChance()
      playGame.basebetCounter()
      playGame.proccessPlaceBet()
      playGame.proccessChanceCounter()
      playGame.initWinLose()
      playGame.ruleBetChance()
      playGame.initChance()
      playGame.nextbetCounter()
      playGame.bettingBalanceCounter()
      playGame.placeChance()
      playGame.IsStrategy()
      playGame.bgTextChanger()
      playGame.csvStdOut()
      playGame.printOut()
    executor()

  except requests.exceptions.Timeout as e:
    utils.textShow(e)
    playGame.conerror()
  except (KeyError, NameError, ValueError, TypeError, IndexError, FileNotFoundError, AttributeError, IndentationError) as e:
    if playGame.statusRiskAlert == "low":
      utils.textShow(e)
      playGame.conerror()
    else:
      utils.textShow(e)
      playGame.conerror()
      utils.sysExit()
  except (ConnectionAbortedError, requests.exceptions.ConnectionError) as e:
    print(f'\nTidak dapat terhubung, periksa koneksi internet anda error {e}')
    playGame.conerror()
  except ImportError as e:
    utils.textShow(e)
    moduleInstaller()
    playGame.conerror()
  except (KeyboardInterrupt, IOError):
    stop = input('\nPause, "y"(Lanjutkan)/"n"(Keluar): ').lower()
    if stop == "y":
      executor()
    elif stop == "n":
      utils.sysExit()
  except Exception as e:
    utils.textShow(e)
    if playGame.statusRiskAlert == "low":
      playGame.conerror()
    else:
      ecp = input(f'\nTerjadi Error, tetapi Risk {playGame.statusRiskAlert} ingin melanjutkan? (Y/N): ').lower()
      if ecp == "y":
        playGame.conerror()
      elif ecp == "n":
        print('Keluar Program')
        utils.sysExit()
      else:
        print('Pilih ya atau tidak!')
        playGame.conerror()
        utils.sysExit()