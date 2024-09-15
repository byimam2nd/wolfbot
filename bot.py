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
from mainFunction import urls, utils, fileManager, csvManager, InitConnection, interactAPI
from color import color

# Waktu memulai aplikasi pertama kali
start_time = datetime.datetime.now()

#Instance
interAPI = interactAPI()
interAPI.startInit()
interAPI.AccessInit()
interAPI.response_0()
interAPI.currency_collector()
interAPI.response_1()
interAPI.response_2()
interAPI.response_3()
interAPI.status_info()

#Objek
headers = interAPI.headers
responses = interAPI.responses
currency = interAPI.currency
dataBets_bal_stat = interAPI.dataBets_bal_stat


def dice():
  data_bet = '''{
    "bet": {
      "currency": "doge",
      "game": "dice",
      "amount": "0.0000001",
      "rule": "under",
      "multiplier": "1.98",
      "bet_value": "50"
    }
  }'''
  
  def process_bet_data(data_bet):
      data = json.loads(data_bet)
      bet = data['bet']  # Main data proses post
      bet.update({
          'currency': currency,
          'amount': fileManager.dataFileJson['Play Game']['Amount']
      })
  
      onGame = fileManager.dataFileJson['onGame']
      dataPlaceBet_bal_reset = bet['amount']
  
      return bet, onGame, dataPlaceBet_bal_reset
  bet, onGame, dataPlaceBet_bal_reset = process_bet_data(data_bet)

  statusWinLose = "W"
  statusCurrentWin = 0
  statusCurrentLose = 0
  statusHigherWin = 0
  statusHigherLose = 0
  statusTotalWin = 0
  statusTotalLose = 0
  statusTotalLuck = 60
  statusCurrentLuck = statusTotalLuck
  statusStepStrategy = "00"
  statusCurrentChance = 0
  statusMaxBetting = 0
  statusMaxLosing = 0
  statusRiskAlert = ""
  statusCurrentBaseBet = 0
  statusTotalProfitCounter = 0
  statusProfitPersen = 0
  statusLastProfitPersen = 0
  statusBaseBalance = float(dataBets_bal_stat)

  while True:
    if utils.every(25, (statusTotalLose + statusTotalWin)):
      interAPI.response_3()
    
    if statusHigherLose >= 10 and statusRiskAlert == "Medium" and statusWinLose == "W":
      interAPI.response_3()
      utils.sysExit()
    
    count_time = (datetime.datetime.now() - start_time).total_seconds()
    hours, minutes = divmod(count_time, 3600)[0], divmod(count_time % 3600, 60)[0]
    formatted_time = f"{int(hours):02}:{int(minutes):02}:{int(count_time % 60):02}"

    try:
      ch_on = str("{:0.4f}".format(99/float(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'])))
      ch_rand = random.randrange(int(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Min']), int(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Max']),1)
      ch_rand_mul = str("{:0.4f}".format(99/ch_rand))
      
      def initChance():
        chance_on = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']
        chance_random = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Random']
        
        if chance_on != "0" and chance_random == "false":
            bet['multiplier'] = ch_on
            bet['bet_value'] = str("{:0.2f}".format(99.99 - float(chance_on)) if bet['rule'] == "over" else "{:0.2f}".format(float(chance_on)))
        
        elif chance_random == "true":
            bet['multiplier'] = ch_rand_mul
            bet['bet_value'] = str("{:0.2f}".format(99.99 - float(ch_rand)) if bet['rule'] == "over" else "{:0.2f}".format(float(ch_rand)))
    
        if onGame['if_lose_reset'] == "true" and statusWinLose == "L":
            bet['amount'] = dataPlaceBet_bal_reset
        elif onGame['if_win_reset'] == "true" and statusWinLose == "W":
            bet['amount'] = dataPlaceBet_bal_reset
      initChance()

      def basebet_counter():
        global statusCurrentBaseBet
        if fileManager.dataFileJson['basebet counter'] == "true":
          statusCurrentBaseBet = statusBaseBalance/float(fileManager.dataFileJson['Play Game']['Divider'])
          if statusCurrentLuck > statusTotalLuck and (float(bet['amount'])/float(dataPlaceBet_user['amount'])) < (statusTotalLuck/2/float(fileManager.dataFileJson['Play Game']['Divider'])): 
            statusCurrentBaseBet /= statusTotalLuck
          else:
            statusCurrentBaseBet /= (statusTotalLuck/(statusCurrentLose+1))
          fileManager.dataFileJson['Play Game']['Amount'] = statusCurrentBaseBet
        return statusCurrentBaseBet
      statusCurrentBaseBet = basebet_counter()
      
      def process_place_bet(bet):
          response_4 = requests.post(urls[4], headers=headers, json=bet, timeout=5)
          dataPlaceBet = response_4.json()
          dataPlaceBet_bet = dataPlaceBet['bet']
          dataPlaceBet_user = dataPlaceBet['userBalance']
          return dataPlaceBet, dataPlaceBet_bet, dataPlaceBet_user
      
      dataPlaceBet, dataPlaceBet_bet, dataPlaceBet_user = process_place_bet(bet)

      if fileManager.dataFileJson['Play Game']['Chance to Win']['Last Chance Game'] == "true": 
        if bet['rule'] == "over":
          if 99.99-float(dataPlaceBet_bet['result_value']) > 98.00 : 
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99 - 98.00
          else:
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99-float(dataPlaceBet_bet['result_value'])
        if bet['rule'] == "under":
          if float(dataPlaceBet_bet['result_value']) > 98.00 : 
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 98.00
          else:
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = dataPlaceBet_bet['result_value']
      lose_data = []
      if dataPlaceBet['bet']['state'] == "win":
        lose_data.clear()
        color.bgWinLose = color.bgHijau
        statusWinLose = "W" 
        statusTotalWin += 1
        statusCurrentWin += 1
        statusCurrentLose = 0
        if statusCurrentWin > statusHigherWin:
          statusHigherWin = statusCurrentWin
      else: 
        lose_data.append(abs(float(dataPlaceBet_bet['profit'])))
        color.bgWinLose = color.bgRed
        statusWinLose = "L"
        statusCurrentLose += 1
        statusTotalLose += 1
        statusCurrentWin = 0
        if statusCurrentLose > statusHigherLose:
          statusHigherLose = statusCurrentLose
      sum_lose_data = sum(lose_data)
      if sum_lose_data > statusMaxLosing:
        statusMaxLosing = sum_lose_data

      if onGame['if_lose'] != "0":
        bet['amount'] = str(float(dataPlaceBet_bet['amount']) * float(onGame['if_lose']))
      if onGame['if_win'] != "0":
        bet['amount'] = str(float(dataPlaceBet_bet['amount']) * float(onGame['if_win']))

      if statusWinLose == 'W':
        statusTotalProfitCounter += abs(float(dataPlaceBet_bet["profit"]))
      elif statusWinLose == 'L':
        statusTotalProfitCounter -= abs(float(dataPlaceBet_bet["profit"]))

      statusProfitPersen = abs(statusTotalProfitCounter/float(dataBets_bal_stat)*100)
      if statusProfitPersen > statusLastProfitPersen and statusWinLose == "W":
        statusLastProfitPersen = statusProfitPersen

      if bet['rule'] == "over":
        statusCurrentChanceBetting = 99.99-float(bet['bet_value'])
      else: 
        statusCurrentChanceBetting = bet['bet_value']
      if dataPlaceBet_bet['rule'] == "over":
        statusResultChance = 99.99-float(dataPlaceBet_bet['result_value'])
      else: 
        statusResultChance = dataPlaceBet_bet['result_value']
      initChance()

      def nextbet_counter():
        global b_counter, entr, statusMultiplier, statusToBet
        b_counter = 1/(float(bet['multiplier'])-1)+1
        entr = ((statusCurrentLose*(statusCurrentLuck/5))/100)
        statusMultiplier = b_counter+entr
        statusToBet = float(dataPlaceBet_bet['amount'])*statusMultiplier
        return statusMultiplier, statusToBet
      nextbet_counter()
      statusMultiplier, statusToBet = nextbet_counter()
      
      color.bgRiskAlert = ""
      color.txtRiskAlert = ""
      if statusToBet > statusMaxBetting :
        statusMaxBetting = statusToBet
  
      # Menghitung persentase statusMaxBetting  terhadap sB
      risk_percentage = (float(utils.formated(statusMaxBetting, "desimal", 8)) / float(utils.formated(dataPlaceBet_user["amount"], "desimal", 8))) * 100

      def placeChance():
        fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = str(float(statusCurrentChance))
        nextbet_counter()
        initChance()

      if fileManager.dataFileJson['amount counter'] == "true" and onGame['if_lose'] == "0":
        bet['rule'] = "under"
        if statusWinLose == "W":
          bet['amount'] = statusCurrentBaseBet
        elif statusCurrentLose > 1: 
          bet['amount'] = utils.formated(statusToBet, "float", 8)
          statusCurrentChance += 3
          placeChance()
        elif float(bet['amount']) / float(dataPlaceBet_user['amount']) > (statusProfitPersen / 10):
          statusCurrentChance = random.randrange(65, 100, 5)
          statusStepStrategy = "00"
          placeChance()
        loss_chance_mapping = {
            0: 4,
            2: 8,
            4: 12,
            8: 16
        }
        
        if statusCurrentLose in loss_chance_mapping:
            statusCurrentChance = loss_chance_mapping[statusCurrentLose]
            statusStepStrategy = f"{statusCurrentLose:02}"
            placeChance()
        elif statusCurrentLose > 10 and statusCurrentLose < 12:
            statusCurrentChance += 8
            statusStepStrategy = "05"
            placeChance()
        elif statusCurrentLose > 14:
            statusCurrentChance += 12
            statusStepStrategy = "06"
            placeChance()
        elif statusProfitPersen < statusLastProfitPersen or statusCurrentLose >= statusHigherLose/2:
          statusCurrentChance += 6
          statusStepStrategy = "07"
          placeChance()
          try:
            statusCurrentLuck = statusTotalWin/statusTotalLose*100
          except ZeroDivisionError:
           statusCurrentLuck = 20
        elif statusCurrentLuck < statusTotalLuck and statusProfitPersen < statusLastProfitPersen:
          statusCurrentChance += 15
          statusStepStrategy = "08"
          placeChance()
        elif statusCurrentLuck >= statusTotalLuck and statusProfitPersen < statusLastProfitPersen and float(bet['amount']) > (float(dataPlaceBet_user['amount'])*0.0002):
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
          statusRiskAlert = "Low"
          color.bgRiskAlert = color.bgHijau
          color.txtRiskAlert = color.txtPutih
      elif 31 <= risk_percentage <= 40:
          statusRiskAlert = "Medium"
          color.bgRiskAlert = color.bgKuning
          color.txtRiskAlert = color.txtHitam
      elif 61 <= risk_percentage <= 60:
          statusRiskAlert = "High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      elif risk_percentage > 60:
          statusRiskAlert = "Very High"
          color.bgRiskAlert = color.bgRed
          color.txtRiskAlert = color.txtPutih
      else:
          statusRiskAlert = "No Risk"
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
        "sWL": statusWinLose, "sRC": utils.formated(statusResultChance, "double",2), "sM": utils.formated(statusMultiplier, "double", 2), "sSS": statusStepStrategy,
        "sTB": utils.formated(statusToBet, "desimal", 8), "sPC": utils.formated(statusTotalProfitCounter, "desimal", 8), "sLPP": utils.formated(statusLastProfitPersen, "persen", 3)
        })
        
        # Membaca dan mencetak data dari file CSV
        #data = csv_manager.read_data()
        #print(data)
      csvStdOut()
      
      def print_out():
        gap = color.colorText("|", color.bgEnd)
        sWL = color.colorText(statusWinLose, color.bgWinLose)
        sRC = color.colorText(utils.formated(statusResultChance, "double",2), color.bgWinLose, color.txtPutih)
        sCCB = color.colorText(utils.formated(statusCurrentChanceBetting, "double", 2), color.bgAbuAbu2, color.txtPutih)
        sM = color.colorText(utils.formated(statusMultiplier, "double", 2), color.bgUngu, color.txtPutih)
        sSS = color.colorText(statusStepStrategy, color.bgStep, color.txtStep)
        sTB = color.colorText(utils.formated(statusToBet, "desimal", 8), color.bgWinLose, color.txtKuning)
        #sDP (status data profit)
        sDP = color.colorText(utils.formated(dataPlaceBet_bet["profit"], "desimal", 8), color.bgWinLose)
        sPC = color.colorText(utils.formated(statusTotalProfitCounter, "desimal", 8), color.bgWinLose)
        sPP = color.colorText(utils.formated(statusProfitPersen, "persen", 3), color.bgWinLose, color.txtKuning)
        sLPP = color.colorText(utils.formated(statusLastProfitPersen, "persen", 3), color.bgPutih, color.txtKuning)
        print(f'{gap}{sWL}{gap}{sRC}{gap}{sM}{gap}{sSS}{gap}{sTB}{gap}{sDP}{gap}{sPC}{gap}{sPP}{gap}')
        
        sTWL = color.colorText(f'T:{statusTotalWin}/{statusTotalLose}', color.bgUngu)
        sHWL = color.colorText(f'H:{statusHigherWin}/{statusHigherLose}', color.bgUngu)
        sCWL = color.colorText(f'C:{statusCurrentWin}/{statusCurrentLose}', color.bgUngu)
        sCL = color.colorText(f'Lck:{utils.formated(statusCurrentLuck, "persen", 0)}', color.bgWinLose)
        sMB = color.colorText(f'M:{utils.formated(statusMaxBetting, "desimal", 8)}', color.bgWinLose)
        sRA = color.colorText(statusRiskAlert, color.bgRiskAlert, color.txtRiskAlert)
        sB = color.colorText(f'B:{utils.formated(dataPlaceBet_user["amount"], "desimal", 8)}', color.bgWinLose)
        sTIME = color.colorText(formatted_time, color.bgPutih, color.txtHitam)
        sys.stdout.write(f'_\r {gap}{sRA}{gap}{sB}{gap}{sCL}{gap}{sCWL}{gap}{sHWL}{gap}{sTWL}{gap}\r')
      print_out()

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
      if statusRiskAlert == "low":
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
      if statusRiskAlert == "low":
        conerror()
      else:
        ecp = input(f'\nTerjadi Error, tetapi Risk {statusRiskAlert} ingin melanjutkan? (Y/N): ').lower()
        if ecp == "y":
          dice()
        else:
          utils.textShow(e)
          conerror()
          utils.sysExit()
while True:
  dice()