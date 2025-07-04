interface DataFileJson {
    bet: {
        currency?: string;
        amount?: string;
        rule?: string;
        multiplier?: string;
        bet_value?: string;
    };
    'Play Game': {
        Amount: string;
        'Chance to Win': {
            'Chance On': string;
            'Chance Min': string;
            'Chance Max': string;
            'Last Chance Game': string;
            'Chance Random': string;
        };
        Divider: string;
    };
    onGame: {
        if_lose_reset: string;
        if_win_reset: string;
        if_lose: string;
        if_win: string;
    };
    'basebet counter': string;
    'amount counter': string;
}

interface FileManager {
    dataFileJson: DataFileJson;
}

class PlayDice {
    // Attributes from the Python code
    currency: string;
    headers: { [key: string]: string };
    bet: {
        currency?: string;
        amount?: string;
        rule?: string;
        multiplier?: string;
        bet_value?: string;
    };
    onGame: {
        if_lose_reset: string;
        if_win_reset: string;
        if_lose: string;
        if_win: string;
    };
    dataPlaceBetBalanceReset: string;
    setChanceOn: string;
    setChanceRandom: number;
    setChanceMulRandom: string;
    dataPlaceBet: {
        bet: {
            state: string;
            profit: string;
            amount: string;
            rule: string;
            result_value: string;
        };
        userBalance: {
            amount: string;
        };
    };
    dataPlaceSetBet: {
        state: string;
        profit: string;
        amount: string;
        rule: string;
        result_value: string;
    };
    dataPlaceSetBetUser: {
        amount: string;
    };
    loseData: number[];
    balanceCounter: number;
    EtrCounter: number;
    statusMultiplier: number;
    statusToBet: number;
    riskPercentage: number;
    statusWinLose: string;
    statusTotalWin: number;
    statusTotalLose: number;
    statusHigherLose: number;
    statusRiskAlert: string;
    statusTotalLuck: number;
    statusCurrentLuck: number;
    statusCurrentBaseBet: number;
    statusBaseBalance: number;
    statusCurrentLose: number;
    statusCurrentWin: number;
    statusHigherWin: number;
    statusMaxLosing: number;
    statusTotalProfitCounter: number;
    statusProfitPersen: number;
    statusLastProfitPersen: number;
    statusCurrentChanceBetting: number;
    statusResultChance: number;
    statusMaxBetting: number;
    statusCurrentChance: number;
    statusStepStrategy: string;

    constructor(currency: string, headers: { [key: string]: string }) {
        this.currency = currency;
        this.headers = headers;
        this.bet = {};
        this.onGame = {
            if_lose_reset: "false",
            if_win_reset: "false",
            if_lose: "0",
            if_win: "0",
        };
        this.dataPlaceBetBalanceReset = "0";
        this.setChanceOn = "0";
        this.setChanceRandom = 0;
        this.setChanceMulRandom = "0";
        this.dataPlaceBet = {
            bet: {
                state: "",
                profit: "0",
                amount: "0",
                rule: "",
                result_value: "0",
            },
            userBalance: {
                amount: "0",
            },
        };
        this.dataPlaceSetBet = {
            state: "",
            profit: "0",
            amount: "0",
            rule: "",
            result_value: "0",
        };
        this.dataPlaceSetBetUser = {
            amount: "0",
        };
        this.loseData = [];
        this.balanceCounter = 0;
        this.EtrCounter = 0;
        this.statusMultiplier = 0;
        this.statusToBet = 0;
        this.riskPercentage = 0;
        this.statusWinLose = "W";
        this.statusTotalWin = 0;
        this.statusTotalLose = 0;
        this.statusHigherLose = 0;
        this.statusRiskAlert = "";
        this.statusTotalLuck = 60;
        this.statusCurrentLuck = this.statusTotalLuck;
        this.statusCurrentBaseBet = 0;
        this.statusBaseBalance = 0; // Will be initialized later
        this.statusCurrentLose = 0;
        this.statusCurrentWin = 0;
        this.statusHigherWin = 0;
        this.statusMaxLosing = 0;
        this.statusTotalProfitCounter = 0;
        this.statusProfitPersen = 0;
        this.statusLastProfitPersen = 0;
        this.statusCurrentChanceBetting = 0;
        this.statusResultChance = 0;
        this.statusMaxBetting = 0;
        this.statusCurrentChance = 0;
        this.statusStepStrategy = "00";
    }

    proccessBetData(fileManager: FileManager) {
        this.bet = fileManager.dataFileJson['bet'];
        this.bet.currency = this.currency;
        this.bet.amount = fileManager.dataFileJson['Play Game']['Amount'];
        this.onGame = fileManager.dataFileJson['onGame'];
        this.dataPlaceBetBalanceReset = this.bet.amount;
    }

    utilities() {
        // Timer logic will be handled by the serverless function runtime
    }

    setChance(fileManager: FileManager) {
        this.setChanceOn = (99 / parseFloat(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'])).toFixed(4);
        const min = parseInt(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Min']);
        const max = parseInt(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Max']);
        this.setChanceRandom = Math.floor(Math.random() * (max - min + 1)) + min;
        this.setChanceMulRandom = (99 / this.setChanceRandom).toFixed(4);
    }

    initChance(fileManager: FileManager) {
        const initChanceOn = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'];
        const initChanceRandom = fileManager.dataFileJson['Play Game']['Chance to Win']['Chance Random'];

        if (initChanceOn !== "0" && initChanceRandom === "false") {
            this.bet.multiplier = this.setChanceOn;
            this.bet.bet_value = (this.bet.rule === "over" ? 99.99 - parseFloat(initChanceOn) : parseFloat(initChanceOn)).toFixed(2);
        } else if (initChanceRandom === "true") {
            this.bet.multiplier = this.setChanceMulRandom;
            this.bet.bet_value = (this.bet.rule === "over" ? 99.99 - this.setChanceRandom : this.setChanceRandom).toFixed(2);
        }

        if (this.onGame.if_lose_reset === "true" && this.statusWinLose === "L") {
            this.bet.amount = this.dataPlaceBetBalanceReset;
        } else if (this.onGame.if_win_reset === "true" && this.statusWinLose === "W") {
            this.bet.amount = this.dataPlaceBetBalanceReset;
        }
    }

    basebetCounter(fileManager: FileManager) {
        if (fileManager.dataFileJson['basebet counter'] === "true") {
            this.statusCurrentBaseBet = this.statusBaseBalance / parseFloat(fileManager.dataFileJson['Play Game']['Divider']);
            if (this.statusCurrentLuck > this.statusTotalLuck && (parseFloat(this.bet.amount) / parseFloat(this.dataPlaceSetBetUser.amount)) < (this.statusTotalLuck / 2 / parseFloat(fileManager.dataFileJson['Play Game']['Divider']))) {
                this.statusCurrentBaseBet /= this.statusTotalLuck;
            } else {
                this.statusCurrentBaseBet /= (this.statusTotalLuck / (this.statusCurrentLose + 1));
            }
            fileManager.dataFileJson['Play Game']['Amount'] = this.statusCurrentBaseBet;
        }
    }

    async proccessPlaceBet() {
        const response = await fetch('https://wolf.bet/api/v1/bet/place', {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(this.bet),
        });
        const data = await response.json();
        this.dataPlaceBet = data;
        this.dataPlaceSetBet = data.bet;
        this.dataPlaceSetBetUser = data.userBalance;
    }

    proccessChanceCounter(fileManager: FileManager) {
        if (fileManager.dataFileJson['Play Game']['Chance to Win']['Last Chance Game'] === "true") {
            if (this.bet.rule === "over") {
                if (99.99 - parseFloat(this.dataPlaceSetBet.result_value) > 98.00) {
                    fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99 - 98.00;
                } else {
                    fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 99.99 - parseFloat(this.dataPlaceSetBet.result_value);
                }
            } else if (this.bet.rule === "under") {
                if (parseFloat(this.dataPlaceSetBet.result_value) > 98.00) {
                    fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = 98.00;
                } else {
                    fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = this.dataPlaceSetBet.result_value;
                }
            }
        }
    }

    initWinLose() {
        if (this.dataPlaceSetBet.state === "win") {
            this.loseData = [];
            this.statusWinLose = "W";
            this.statusTotalWin++;
            this.statusCurrentLose = 0;
            if (this.statusTotalWin > this.statusHigherWin) {
                this.statusHigherWin = this.statusTotalWin;
            }
        } else {
            this.loseData.push(Math.abs(parseFloat(this.dataPlaceSetBet.profit)));
            this.statusWinLose = "L";
            this.statusCurrentLose++;
            this.statusTotalLose++;
            this.statusTotalWin = 0;
            if (this.statusCurrentLose > this.statusHigherLose) {
                this.statusHigherLose = this.statusCurrentLose;
            }
        }
        const sumLoseData = this.loseData.reduce((a, b) => a + b, 0);
        if (sumLoseData > this.statusMaxLosing) {
            this.statusMaxLosing = sumLoseData;
        }

        if (this.onGame.if_lose !== "0") {
            this.bet.amount = (parseFloat(this.dataPlaceSetBet.amount) * parseFloat(this.onGame.if_lose)).toString();
        }
        if (this.onGame.if_win !== "0") {
            this.bet.amount = (parseFloat(this.dataPlaceSetBet.amount) * parseFloat(this.onGame.if_win)).toString();
        }

        if (this.statusWinLose === 'W') {
            this.statusTotalProfitCounter += Math.abs(parseFloat(this.dataPlaceSetBet.profit));
        } else if (this.statusWinLose === 'L') {
            this.statusTotalProfitCounter -= Math.abs(parseFloat(this.dataPlaceSetBet.profit));
        }

        this.statusProfitPersen = Math.abs(this.statusTotalProfitCounter / this.statusBaseBalance * 100);
        if (this.statusProfitPersen > this.statusLastProfitPersen && this.statusWinLose === "W") {
            this.statusLastProfitPersen = this.statusProfitPersen;
        }
    }

    ruleBetChance() {
        if (this.bet.rule === "over") {
            this.statusCurrentChanceBetting = 99.99 - parseFloat(this.bet.bet_value);
        } else {
            this.statusCurrentChanceBetting = parseFloat(this.bet.bet_value);
        }
        if (this.dataPlaceSetBet.rule === "over") {
            this.statusResultChance = 99.99 - parseFloat(this.dataPlaceSetBet.result_value);
        } else {
            this.statusResultChance = parseFloat(this.dataPlaceSetBet.result_value);
        }
    }

    nextbetCounter() {
        this.balanceCounter = 1 / (parseFloat(this.bet.multiplier) - 1) + 1;
        this.EtrCounter = (this.statusCurrentLose) / 100;
        this.statusMultiplier = this.balanceCounter + this.EtrCounter;
        this.statusToBet = parseFloat(this.dataPlaceSetBet.amount) * this.statusMultiplier;
    }

    bettingBalanceCounter() {
        if (this.statusToBet > this.statusMaxBetting) {
            this.statusMaxBetting = this.statusToBet;
        }
        this.riskPercentage = (this.statusMaxBetting / parseFloat(this.dataPlaceSetBetUser.amount)) * 100;
    }

    placeChance(fileManager: FileManager) {
        fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = this.statusCurrentChance.toString();
        this.nextbetCounter();
        this.initChance(fileManager);
    }

    IsStrategy(fileManager: FileManager) {
        if (fileManager.dataFileJson['amount counter'] === "true" && this.onGame.if_lose === "0") {
            this.bet.rule = "under";
            if (this.statusWinLose === "W") {
                this.bet.amount = this.statusCurrentBaseBet;
            } else if (this.statusCurrentLose > 1) {
                this.bet.amount = this.statusToBet.toFixed(8);
                this.statusCurrentChance += 3;
                this.placeChance(fileManager);
            } else if (parseFloat(this.bet.amount) / parseFloat(this.dataPlaceSetBetUser.amount) > (this.statusProfitPersen / 10)) {
                this.statusCurrentChance = Math.floor(Math.random() * (80 - 65 + 1)) + 65;
                this.statusStepStrategy = "00";
                this.placeChance(fileManager);
            }

            const lossChanceMapping: { [key: number]: number } = {
                0: 4,
                2: 8,
                4: 12,
                8: 16
            };

            if (this.statusCurrentLose in lossChanceMapping) {
                this.statusCurrentChance = lossChanceMapping[this.statusCurrentLose];
                this.statusStepStrategy = this.statusCurrentLose.toString().padStart(2, '0');
                this.placeChance(fileManager);
            } else if (this.statusCurrentLose > 10 && this.statusCurrentLose < 12) {
                this.statusCurrentChance += 8;
                this.statusStepStrategy = "05";
                this.placeChance(fileManager);
            } else if (this.statusCurrentLose > 14) {
                this.statusCurrentChance += 12;
                this.statusStepStrategy = "06";
                this.placeChance(fileManager);
            } else if (this.statusProfitPersen < this.statusLastProfitPersen || this.statusCurrentLose >= this.statusHigherLose / 2) {
                this.statusCurrentChance += 6;
                this.statusStepStrategy = "07";
                this.placeChance(fileManager);
                try {
                    this.statusCurrentLuck = this.statusTotalWin / this.statusTotalLose * 100;
                } catch (_: unknown) {
                    this.statusCurrentLuck = 20;
                }
            } else if (this.statusCurrentLuck < this.statusTotalLuck && this.statusProfitPersen < this.statusLastProfitPersen) {
                this.statusCurrentChance += 15;
                this.statusStepStrategy = "08";
                this.placeChance(fileManager);
            } else if (this.statusCurrentLuck >= this.statusTotalLuck && this.statusProfitPersen < this.statusLastProfitPersen && parseFloat(this.bet.amount) > (parseFloat(this.dataPlaceSetBetUser.amount) * 0.0002)) {
                this.statusCurrentChance += 30;
                this.statusStepStrategy = "09";
                this.placeChance(fileManager);
            }
        }

        if (parseFloat(fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']) >= 75) {
            fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On'] = "75";
        }
    }

    getRiskAlert() {
        if (this.riskPercentage >= 1 && this.riskPercentage <= 20) {
            return "Low";
        } else if (this.riskPercentage > 20 && this.riskPercentage <= 40) {
            return "Medium";
        } else if (this.riskPercentage > 40 && this.riskPercentage <= 60) {
            return "High";
        } else if (this.riskPercentage > 60) {
            return "Very High";
        } else {
            return "No Risk";
        }
    }

    logData() {
        console.log({
            sWL: this.statusWinLose,
            sRC: this.statusResultChance.toFixed(2),
            sM: this.statusMultiplier.toFixed(2),
            sSS: this.statusStepStrategy,
            sTB: this.statusToBet.toFixed(8),
            sPC: this.statusTotalProfitCounter.toFixed(8),
            sLPP: `${this.statusLastProfitPersen.toFixed(3)}%`
        });
    }
}

export { PlayDice };