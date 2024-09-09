try:
  import installer
  import color
  import mainFunction
except ModuleNotFoundError:
  installer.modulInstaller()

from installer import modulInstaller
from mainFunction import urls, dataFileJson, colorText, formated, requests, time, telegram, random, sysExit, sys, every, clearSystem, textShow, csv, csvData
from color import bgHijau, bgRed, bgPutih, bgKuning, bgBiru, bgEnd, bgUngu, bgAbuAbu2, txtPutih, txtKuning, txtHitam, Reset
bgWinLose = color.bgWinLose
bgStep = color.bgStep
txtStep = color.txtStep

# mengambil nilai access_token dan masuk
headers = 0
def get_access():
  global headers
  try:
    access_token = dataFileJson['Account']['Access Token']
    headers = {'Authorization': f'Bearer {access_token}'}
    print("Authentication berhasil")
    return access_token, headers
  except KeyError:
    print("Cek kembali access token anda")
    sysExit()

def initConnection(): 
  clearSystem()
  mainFunction.get_json('data.json', dataFileJson)
  get_access()

initConnection()

#Daftar Program GET & POST Server
accessCounter = 0
print('Mencoba akses masuk')
while True:
  if accessCounter > (len(mainFunction.dns_servers_list)*10):
    clearSystem()
    print('Cek kestabilan koneksi anda')
    initConnection()
    accessCounter = 0
  try:
    mainFunction.http_A()
    #Tambahkan parameter verify=False untuk menggunakan HTTP/2
    print('\n---------Connection Checker---------')
    responses = []
    for i, url in enumerate(urls[:3]):
      response = requests.get(url, headers=headers, verify=False)
      responses.append(response)
      print(f'Server {i+1} status code {response.status_code}')
    print('------------------------------------\n')
    print('Akses masuk berhasil, memulai program')
    accessCounter = 0
    break
  except Exception as e:
    accessCounter += 1
    clearSystem()
    print(f'Akses di tolak error : {e}, mencoba menghubungkan kembali.')
    mainFunction.current_dns_server_index += 1
    if mainFunction.current_dns_server_index >= len(mainFunction.dns_servers_list):
        mainFunction.current_dns_server_index = 0
    initConnection()

#Cek Server 0
#print(json.dumps(response_0.json(), indent=2))
dataBalance = responses[0].json()
dataBalance_balances = dataBalance['balances']
dataBalance_base = []
for balance in dataBalance_balances:
    currency = balance['currency']
    amount = balance['amount']
    dataBalance_base.append([currency, amount])

# menentukan lebar kolom
currency = ""
def mata_uang():
  global currency
  print('\n')
  print("----------Crypto Currency----------")
  index_width = len(str(len(dataBalance_base)))
  name_width = max(len(name) for name, _ in dataBalance_base)
  for i, (name, value) in enumerate(dataBalance_base, start=1):
      print(f"{i:>{index_width}}.  {name:<{name_width}} : {value}")
  currency = "usdt"#input("Masukkan nama mata uang: ").lower()
  mainFunction.time.sleep(3)
  clearSystem()
mata_uang()

#Cek Server 1
#print(json.dumps(response_1.json(), indent=2))
dataBets = responses[1].json()
dataBets_base = []
if currency in dataBets['dice']:
    stats = dataBets['dice'][currency]
    for bal in dataBalance_balances:
        if bal['currency'] == currency.lower():
            dataBets_bal_stat = bal['amount']
            dataBets_total_bets = stats['total_bets']
            dataBets_win = stats['win']
            dataBets_lose = stats['lose']
            dataBets_profit = stats['profit']
            dataBets_wager_crpt = stats['waggered']
            dataBets_wager_usd = stats['waggered_usd']
            dataBets_base.append([dataBets_bal_stat, dataBets_total_bets, dataBets_win, dataBets_lose, dataBets_profit, dataBets_wager_crpt, dataBets_wager_usd])
else:
    print(f'Mata Uang {currency} tidak di temukan')

#Cek Server 2
#print(json.dumps(response_2.json(), indent=2))
dataStatsRace = responses[2].json()
race_data = dataStatsRace['race']
user_data = race_data['user']
dataStatsRace_user = user_data['login']
dataStatsRace_vip = user_data['vip_level']
dataStatsRace_rank = race_data['rank']
dataStatsRace_join = user_data['joined']

data_seed = ""  # membuat variabel global
response_3 = 0
def refresh_seed():
  global response_3
  #Cek Server 3
  response_3 = requests.post(urls[3], headers=headers)
  #print(f'Server Kode {response_3.status_code} for {urls[3]}')
  #print(json.dumps(response_3.json(), indent=2))
  global data_seed  # menggunakan variabel global
  dataSeedRefresh = response_3.json()
  data_seed = dataSeedRefresh['seed']
  #print(f"data_seed {' '*(col_width_p-len('data_seed: '))} : {data_seed}")

col_width_p = 15
col_width_v = 30

#print status yang berada di atas layar
def user_stats():
  print("\n----------Stats Info----------")
  print(f'User{" "*(col_width_p-len("User"))}: {dataStatsRace_user}')
  print(f'Balance {currency}{" "*(col_width_p-len("Balance "+currency))}: {dataBets_bal_stat}')
  print(f'Currency{" "*(col_width_p-len("Currency"))}: {currency.upper()}')
  print(f'Total Bets{" "*(col_width_p-len("Total Bets"))}: {dataBets_total_bets}')
  print(f'Win{" "*(col_width_p-len("Win"))}: {dataBets_win}')
  print(f'Lose{" "*(col_width_p-len("Lose"))}: {dataBets_lose}')
  print(f'Profit{" "*(col_width_p-len("Profit"))}: {dataBets_profit}')
  print(f'Waggered {currency}{" "*(col_width_p-len("Waggered "+currency))}: {dataBets_wager_crpt}')
  print(f'Waggered usd{" "*(col_width_p-len("Waggered USD"))}: {dataBets_wager_usd}')
  print(f'Rank{" "*(col_width_p-len("Rank"))}: {dataStatsRace_rank}')
  print(f'VIP{" "*(col_width_p-len("VIP"))}: {dataStatsRace_vip}')
  print(f'Join{" "*(col_width_p-len("Join"))}: {dataStatsRace_join}')
  print('\n')
  mainFunction.time.sleep(3)
  
user_stats()
start_time = mainFunction.datetime.datetime.now()
refresh_seed()
mainFunction.cache_init()

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

  data = mainFunction.json.loads(data_bet)
  bet = data['bet'] #main data proses post
  bet['currency'] = currency
  bet['amount'] = dataFileJson['Play Game']['Amount']

  onGame = dataFileJson['onGame']
  dataPlaceBet_bal_reset = bet['amount']

  telebotWin = 0
  telebotLose = 0
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
  #print('sebelum post' + json.dumps(bet, indent=2))
  while True:
    if (statusTotalLose+statusTotalWin) > 50:
      if every(50, (statusTotalLose+statusTotalWin)):
        refresh_seed()
    if statusHigherLose >= 10 and statusRiskAlert == "Medium" and statusWinLose == "W":
      refresh_seed()
      sysExit()
    current_time = mainFunction.datetime.datetime.now()
    count_time = current_time - start_time
    hours, remainder = divmod(count_time.total_seconds(), 3600)
    minutes, seconds = divmod(remainder, 60)
    formatted_time = f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}"
    try:
      ch_on = str("{:0.4f}".format(99/float(dataFileJson['Play Game']['Chance to Win']['Chance On'])))
      ch_rand = random.randrange(int(dataFileJson['Play Game']['Chance to Win']['Chance Min']), int(dataFileJson['Play Game']['Chance to Win']['Chance Max']),1)
      ch_rand_mul = str("{:0.4f}".format(99/ch_rand))
      
      def initChance():
        chance_on = dataFileJson['Play Game']['Chance to Win']['Chance On']
        chance_random = dataFileJson['Play Game']['Chance to Win']['Chance Random']
        
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
        if dataFileJson['basebet counter'] == "true":
          statusCurrentBaseBet = statusBaseBalance/float(dataFileJson['Play Game']['Divider'])
          if statusCurrentLuck > statusTotalLuck and (float(bet['amount'])/float(dataPlaceBet_user['amount'])) < (statusTotalLuck/2/float(dataFileJson['Play Game']['Divider'])): 
            statusCurrentBaseBet /= statusTotalLuck
          else:
            statusCurrentBaseBet /= (statusTotalLuck/(statusCurrentLose+1))
          dataFileJson['Play Game']['Amount'] = statusCurrentBaseBet
        return statusCurrentBaseBet
      statusCurrentBaseBet = basebet_counter()

      #print('sebelum post' + json.dumps(bet, indent=2))
      response_4 = requests.post(urls[4], headers=headers, json=bet, timeout=5)
      #print('sudah di post' + json.dumps(bet, indent=2))
      dataPlaceBet = response_4.json()
      #print(json.dumps(dataPlaceBet, indent=2))
      dataPlaceBet_bet = dataPlaceBet['bet']
      dataPlaceBet_user = dataPlaceBet['userBalance']

      if dataFileJson['Play Game']['Chance to Win']['Last Chance Game'] == "true": 
        if bet['rule'] == "over":
          if 99.99-float(dataPlaceBet_bet['result_value']) > 98.00 : 
            dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99 - 98.00
          else:
            dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99-float(dataPlaceBet_bet['result_value'])
        if bet['rule'] == "under":
          if float(dataPlaceBet_bet['result_value']) > 98.00 : 
            dataFileJson['Play Game']['Chance to Win']['Chance On'] = 98.00
          else:
            dataFileJson['Play Game']['Chance to Win']['Chance On'] = dataPlaceBet_bet['result_value']
      lose_data = []
      if dataPlaceBet['bet']['state'] == "win":
        lose_data.clear()
        bgWinLose = bgHijau
        statusWinLose = "W" 
        statusTotalWin += 1
        statusCurrentWin += 1
        statusCurrentLose = 0
        if statusCurrentWin > statusHigherWin:
          statusHigherWin = statusCurrentWin
      else: 
        lose_data.append(abs(float(dataPlaceBet_bet['profit'])))
        bgWinLose = bgRed
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
      
      bgRiskAlert = ""
      txtRiskAlert = ""
      if statusToBet > statusMaxBetting :
        statusMaxBetting = statusToBet
  
      # Menghitung persentase statusMaxBetting  terhadap sB
      risk_percentage = (float(formated(statusMaxBetting, "desimal", 8)) / float(formated(dataPlaceBet_user["amount"], "desimal", 8))) * 100

      def placeChance():
        dataFileJson['Play Game']['Chance to Win']['Chance On'] = str(float(statusCurrentChance))
        nextbet_counter()
        initChance()

      if dataFileJson['amount counter'] == "true" and onGame['if_lose'] == "0":
        bet['rule'] = "under"
        if statusWinLose == "W":
          bet['amount'] = statusCurrentBaseBet
        elif statusCurrentLose > 1: 
          bet['amount'] = formated(statusToBet, "float", 8)
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
          bgStep = bgPutih
          txtStep = txtHitam
      elif statusStepStrategy in {"01", "02", "03"}:
          bgStep = bgHijau
          txtStep = txtPutih
      elif statusStepStrategy in {"04", "05", "06"}:
          bgStep = bgKuning
          txtStep = txtHitam
      elif statusStepStrategy in {"07", "08"} or statusStepStrategy >= "09":
          bgStep = bgRed
          txtStep = txtPutih
      else:
          bgStep = bgBiru
          txtStep = txtPutih
    
      # Menentukan level risk berdasarkan persentase
      if 1 <= risk_percentage <= 20:
          statusRiskAlert = "Low"
          bgRiskAlert = bgHijau
          txtRiskAlert = txtPutih
      elif 31 <= risk_percentage <= 40:
          statusRiskAlert = "Medium"
          bgRiskAlert = bgKuning
          txtRiskAlert = txtHitam
      elif 61 <= risk_percentage <= 60:
          statusRiskAlert = "High"
          bgRiskAlert = bgRed
          txtRiskAlert = txtPutih
      elif risk_percentage > 60:
          statusRiskAlert = "Very High"
          bgRiskAlert = bgRed
          txtRiskAlert = txtPutih
      else:
          statusRiskAlert = "No Risk"
          bgRiskAlert = bgPutih
          txtRiskAlert = txtHitam
    
      if float(dataFileJson['Play Game']['Chance to Win']['Chance On']) >= 75: 
        dataFileJson['Play Game']['Chance to Win']['Chance On'] = "75"
      
      def csvStdOut():
        # Tentukan nama file CSV dan kolom-kolomnya
        file_name = "data.csv"
        columns = ["sWL", "sRC", "sM", "sSS", "sTB", "sPC", "sLPP", "sTIME"]
        
        # Inisialisasi class csvData
        csv_manager = csvData(file_name, columns)
        
        # Tambah data baru (satu baris) ke dalam file
        csv_manager.append_data({
        "sWL": statusWinLose, "sRC": formated(statusResultChance, "double",2), "sM": formated(statusMultiplier, "double", 2), "sSS": statusStepStrategy,
        "sTB": formated(statusToBet, "desimal", 8), "sPC": formated(statusTotalProfitCounter, "desimal", 8), "sLPP": formated(statusLastProfitPersen, "persen", 3), "sTIME": formatted_time
        })
        
        # Membaca dan mencetak data dari file CSV
        data = csv_manager.read_data()
        #print(data)
      csvStdOut()
      
      def print_out():
        gap = colorText("|", bgEnd)
        sWL = colorText(statusWinLose, bgWinLose)
        sRC = colorText(formated(statusResultChance, "double",2), bgWinLose, txtPutih)
        sCCB = colorText(formated(statusCurrentChanceBetting, "double", 2), bgAbuAbu2, txtPutih)
        sM = colorText(formated(statusMultiplier, "double", 2), bgUngu, txtPutih)
        sSS = colorText(statusStepStrategy, bgStep, txtStep)
        sTB = colorText(formated(statusToBet, "desimal", 8), bgWinLose, txtKuning)
        #sDP (status data profit)
        sDP = colorText(formated(dataPlaceBet_bet["profit"], "desimal", 8), bgWinLose)
        sPC = colorText(formated(statusTotalProfitCounter, "desimal", 8), bgWinLose)
        sPP = colorText(formated(statusProfitPersen, "persen", 3), bgWinLose, txtKuning)
        sLPP = colorText(formated(statusLastProfitPersen, "persen", 3), bgPutih, txtKuning)
        print(f'{gap}{sWL}{gap}{sRC}{gap}{sM}{gap}{sSS}{gap}{sTB}{gap}{sDP}{gap}{sPC}{gap}{sPP}{gap}')
        
        sTWL = colorText(f'T:{statusTotalWin}/{statusTotalLose}', bgUngu)
        sHWL = colorText(f'H:{statusHigherWin}/{statusHigherLose}', bgUngu)
        sCWL = colorText(f'C:{statusCurrentWin}/{statusCurrentLose}', bgUngu)
        sCL = colorText(f'Lck:{formated(statusCurrentLuck, "persen", 0)}', bgWinLose)
        sMB = colorText(f'M:{formated(statusMaxBetting, "desimal", 8)}', bgWinLose)
        sRA = colorText(statusRiskAlert, bgRiskAlert, txtRiskAlert)
        sB = colorText(f'B:{formated(dataPlaceBet_user["amount"], "desimal", 8)}', bgWinLose)
        sTIME = colorText(formatted_time, bgPutih, txtHitam)
        sys.stdout.write(f'_\r {gap}{sRA}{gap}{sB}{gap}{sCL}{gap}{sCWL}{gap}{sHWL}{gap}{sTWL}{gap}\r')
      print_out()

      pesan = f'Balance: {float(dataPlaceBet_user["amount"]):.8f}\nChance in: {float(statusCurrentChanceBetting):0>5.2f}\nChance Result: {float(statusResultChance):0>5.2f}\nBet on Win: {float(statusToBet):.8f}\nProfit: {float(dataPlaceBet_bet["profit"]):.8f}\nProfit %(on/target): {float(statusProfitPersen):0>3.3f}/{float(statusLastProfitPersen):0>3.3f}%\nHighest Bet: {float(statusMaxBetting):.8f}\nTotal Win/Lose: {statusTotalWin}/{statusTotalLose}\nHigher Win/Lose: {statusHigherWin}/{statusHigherLose}\nLucky: {float(statusCurrentLuck):.2f}%\nTime in: {formatted_time}'

      bot_token = ""
      chat_id = 832658254
      async def init_bot_tel():
        bot = telegram.Bot(token=bot_token)
        await bot.sendMessage(chat_id=chat_id, text=pesan)
      if statusCurrentLose >= 7: 
        telebotLose = 1
      if telebotLose == 1 and statusCurrentWin == 1 and statusCurrentLose > 6: 
        telebotWin = 1
      if telebotLose == 1 and telebotWin == 1:
        asyncio.run(init_bot_tel())
        telebotWin = 0
        telebotLose = 0

      def conerror():
        time.sleep(1)
        print('\nKoneksi terputus, memuat ulang koneksi')
        try:
          dice()
          conerror()
        except Exception as e:
          print(f'\n Error {e}, Sedang Mencoba Kembali')
          conerror()
    except requests.exceptions.Timeout as e:
      textShow(e)
      conerror()
    except (KeyError, NameError, ValueError, TypeError, IndexError, FileNotFoundError, AttributeError, IndentationError) as e:
      if statusRiskAlert == "low":
        textShow(e)
        conerror()
      else:
        textShow(e)
        conerror()
        sysExit()
    except (ConnectionAbortedError, requests.exceptions.ConnectionError) as e:
      print(f'\nTidak dapat terhubung, periksa koneksi internet anda error {e}')
      conerror()
    except ImportError as e:
      textShow(e)
      modulInstaller()
      conerror()
    except (KeyboardInterrupt, IOError) as e:
      stop = input(f'\nProgram terhenti {e}, enter untuk keluar ').lower()
      if stop == "":
        sysExit()
    except Exception as e:
      textShow(e)
      if statusRiskAlert == "low":
        conerror()
      else:
        ecp = input(f'\nTerjadi Error, tetapi Risk {statusRiskAlert} ingin melanjutkan? (Y/N): ').lower()
        if ecp == "y":
          dice()
        else:
          textShow(e)
          conerror()
          sysExit()
      #print(json.dumps(bet, indent=2))
      #print(json.dumps(dataPlaceBet, indent=2))
      #print(f'Successful request to {response_4.status_code} {urls[4]}')

while True:
  mainFunction.cache_init()
  dice()