import { program } from 'commander';
import ver from 'project-version';
import { loadSettings } from './storage.js';
import { log } from './log.js';
import { enableLotsRaise } from './raise.js';
import { enableGoodsStateCheck } from './activity.js';
import { updateGoodsState } from './goods.js';
import { getUserData, enableUserDataUpdate, countTradeProfit } from './account.js';
import { updateCategoriesData } from './categories.js';

import { getMessages, sendMessage, getChatBookmarks, enableAutoResponse, getLastMessageId, getNodeByUserName } from './chat.js';
import { getOrders, getNewOrders, issueGood, searchOrdersByUserName, enableAutoIssue } from './sales.js';

process.on('uncaughtException', function(e) {
    console.log('Ошибка: необработанное исключение... Выход из программы через 2 минуты.');
    console.log(e.stack);
    setTimeout(() => {process.exit(1)}, 120000);
});

// Checking arguments
program
  .version(ver, '-v, --version')
  .usage('[OPTIONS]...')
  .option('-c, --countProfit', 'count your trade profit and exit')
  .parse(process.argv);

const options = program.opts();
if(options && options.countProfit) {
    log('Считаем заработок по продажам...', 'g');
    await countTradeProfit();
}

// Loading data
const settings = loadSettings();

log(`Получаем данные пользователя...`, 'c');
const userData = await getUserData();
if(!userData) process.exit();
log(`Привет, ${userData.userName}!`, 'm');

if(settings.lotsRaise == true)
    await updateCategoriesData();

if(settings.goodsStateCheck == true)
    await updateGoodsState();

// Starting threads
if(settings.lotsRaise == true) 
    enableLotsRaise(settings.intervals.lotsRaise * 1000);

if(settings.goodsStateCheck == true) 
    enableGoodsStateCheck(settings.intervals.goodsStateCheck * 1000);

if(settings.autoIssue == true) 
    enableAutoIssue(settings.intervals.autoIssue * 1000);

if(settings.autoResponse == true) 
    enableAutoResponse(settings.intervals.autoResponse * 1000);

if(settings.userDataUpdate == true) 
    enableUserDataUpdate(settings.intervals.userDataUpdate * 1000);