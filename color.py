import colorama
from colorama import Fore, Back, Style

colorama.init(autoreset=True)

class color:
    # Reset style
    RESET = Style.RESET_ALL

    # Background colors
    bgBiru = '\x1b[1;37;44m'
    bgAbuAbu = '\x1b[1;30;100m'
    bgAbuAbu2 = '\x1b[1;37;100m'
    bgRed = "\033[48;5;88m"
    bgHijau = "\033[48;2;0;128;0m"
    bgPutih = "\033[48;5;15m"
    bgKuning = "\033[48;5;226m"
    bgUngu = "\033[48;5;55m"
    bgEnd = '\x1b[0m'
    bgWinLose = 0
    bgStep = 0

    # Text colors
    txtKuning = "\033[1;34;93m"
    txtAbuAbu = '\033[1;90m'
    txtHijau = '\033[92m'
    txtRed = '\033[1;91m'
    txtPutih = '\033[97m'
    txtHitam = '\033[38;5;0m'
    txtReset = '\033[0;0m'

    @staticmethod
    def colorText(text, bgColor, txtColor=txtPutih):
        """
        Mengembalikan teks dengan warna latar belakang dan warna teks yang ditentukan.

        :param text: Teks yang akan diwarnai.
        :param bg_color: Warna latar belakang.
        :param txt_color: Warna teks.
        :return: Teks yang diformat dengan warna.
        """
        return f'{bgColor}{txtColor}{text}{color.RESET}'
