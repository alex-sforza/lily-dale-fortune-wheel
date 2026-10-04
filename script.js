const gameCard = document.querySelector('.game-card');
const machineIcon = document.getElementById('machineIcon');
const machineTitle = document.getElementById('machineTitle');
const machineCategory = document.getElementById('machineCategory');
const spinButton = document.getElementById('spinButton');
const resetButton = document.getElementById('resetButton');
const spinsLeftEl = document.getElementById('spinsLeft');
const statusText = document.getElementById('statusText');
const resultPanel = document.getElementById('resultPanel');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultDescription = document.getElementById('resultDescription');
const resultMeta = document.getElementById('resultMeta');
const copyButton = document.getElementById('copyButton');
const closeResult = document.getElementById('closeResult');

const DAILY_LIMIT = 1;
const STORAGE_KEY = 'lilyDaleFortuneWheelStateV2';
let isSpinning = false;
let lastResult = null;

// 100 equally likely sectors. The prize table is intentionally easy to edit.
const prizes = [
  ...Array.from({length:5},()=>({title:'+1 осенний лист',icon:'🍂',category:'Валюта',description:'Получаешь 1 осенний лист.'})),
  ...Array.from({length:4},()=>({title:'+2 осенних листа',icon:'🍂',category:'Валюта',description:'Получаешь 2 осенних листа.'})),
  ...Array.from({length:2},()=>({title:'+3 осенних листа',icon:'🍂',category:'Валюта',description:'Получаешь 3 осенних листа.'})),
  {title:'+5 осенних листьев',icon:'🍂',category:'Валюта',description:'Получаешь 5 осенних листьев.'},

  ...Array.from({length:4},()=>({title:'+1 билетик флешмоба',icon:'🎟️',category:'Валюта',description:'Получаешь 1 билетик флешмоба.'})),
  ...Array.from({length:2},()=>({title:'+2 билетика флешмоба',icon:'🎟️',category:'Валюта',description:'Получаешь 2 билетика флешмоба.'})),
  ...Array.from({length:2},()=>({title:'+3 билетика флешмоба',icon:'🎟️',category:'Валюта',description:'Получаешь 3 билетика флешмоба.'})),
  {title:'+1 лист + 1 билетик флешмоба',icon:'🍂🎟️',category:'Валюта',description:'Получаешь 1 осенний лист и 1 билетик флешмоба.'},

  ...Array.from({length:3},()=>({title:'Пуговица призрака',icon:'👻',category:'Коллекция Мадам Одуванчик',description:'Коллекционный предмет для сбора коллекции Мадам Одуванчик.'})),
  ...Array.from({length:3},()=>({title:'Мешочек сушёных хризантем',icon:'🌼',category:'Коллекция Мадам Одуванчик',description:'Коллекционный предмет для сбора коллекции Мадам Одуванчик.'})),
  ...Array.from({length:3},()=>({title:'Банка тыквенного мёда',icon:'🍯',category:'Коллекция Мадам Одуванчик',description:'Коллекционный предмет для сбора коллекции Мадам Одуванчик.'})),
  ...Array.from({length:3},()=>({title:'Засушенный лист Мадам Одуванчик',icon:'🍁',category:'Коллекция Мадам Одуванчик',description:'Коллекционный предмет для сбора коллекции Мадам Одуванчик.'})),
  ...Array.from({length:3},()=>({title:'Старый билет в кино',icon:'🎞️',category:'Коллекция Мадам Одуванчик',description:'Коллекционный предмет для сбора коллекции Мадам Одуванчик.'})),

  ...Array.from({length:2},()=>({title:'Счастливая монетка с дыркой',icon:'🪙',category:'Предмет',description:'Счастливый сувенир Ярмарки. Особого механического эффекта не имеет.'})),
  ...Array.from({length:2},()=>({title:'Кусочек мела для «двери»',icon:'◈',category:'Предмет',description:'Позволяет нарисовать дверь; дальнейший эффект определяется в сюжетной сцене.'})),
  ...Array.from({length:3},()=>({title:'Маленькая осенняя свеча',icon:'🕯️',category:'Предмет',description:'Позволяет осветить темноту в сюжетном эпизоде.'})),

  ...Array.from({length:2},()=>({title:'Свеча «Первый иней»',icon:'🕯️',category:'Хранитель',description:'Отгоняет слабых Шептунов и Дрём; в «Первом Луче» усиливает проявления защиты.'})),
  ...Array.from({length:2},()=>({title:'Шарф-оберег',icon:'🧣',category:'Хранитель',description:'Повышает сопротивление персонажа ментальному воздействию.'})),
  ...Array.from({length:2},()=>({title:'Амулет «Кошачий глаз»',icon:'👁️',category:'Хранитель',description:'Раз в день позволяет увидеть сквозь Гламор.'})),
  ...Array.from({length:2},()=>({title:'Карта с ошибкой',icon:'🗺️',category:'Трикстер',description:'Показывает путь, которого нет; результат его использования определяется в сюжетной сцене.'})),
  ...Array.from({length:2},()=>({title:'Ключ без замка',icon:'🗝️',category:'Трикстер',description:'Может открыть запертое или запереть открытое; эффект определяется в сюжетной сцене.'})),
  ...Array.from({length:2},()=>({title:'Проклятая монетка',icon:'🪙',category:'Разрушитель',description:'Может указать путь или решение, выгодное разрушительной ветке.'})),
  ...Array.from({length:2},()=>({title:'Венок из полевых цветов',icon:'🌼',category:'Хранитель',description:'Защищает от слабых существ Изнанки; возле Холма его действие усиливается.'})),

  ...Array.from({length:3},()=>({title:'Билет в никуда',icon:'🎟️',category:'Редкий',description:'Позволяет открыть случайную дверь или проход; куда он приведёт, определяет АМС.'})),
  ...Array.from({length:2},()=>({title:'Плашка «Любимец Мадам Одуванчик»',icon:'🌻',category:'Редкий',description:'Эксклюзивная плашка Ярмарки для профиля.'})),
  ...Array.from({length:2},()=>({title:'Фон «Осенняя Изнанка»',icon:'🌙',category:'Редкий',description:'Эксклюзивный фон для оформления профиля.'})),

  ...Array.from({length:5},()=>({title:'Малый осколок теневого зеркала',icon:'🔮',category:'Осколок',description:'Малые осколки можно собирать и объединять в средний или большой осколок теневого зеркала.'})),
  ...Array.from({length:3},()=>({title:'Средний осколок теневого зеркала',icon:'🔮',category:'Осколок',description:'Даёт малое видение возможного будущего.'})),
  ...Array.from({length:2},()=>({title:'Большой осколок теневого зеркала',icon:'🔮',category:'Осколок',description:'Даёт расширенное видение возможного будущего или позволяет получить недостающий фрагмент ключа.'})),

  ...Array.from({length:2},()=>({title:'Право задать АМС один сюжетный вопрос',icon:'❔',category:'Сюжетный',description:'Можно задать АМС один вопрос о текущем сюжете или возможном будущем.'})),
  ...Array.from({length:2},()=>({title:'Право получить сюжетную подсказку',icon:'✦',category:'Сюжетный',description:'АМС выдаёт одну полезную подсказку для сюжетного эпизода или загадки.'})),
  ...Array.from({length:2},()=>({title:'Право получить недостающий фрагмент ключа',icon:'🗝️',category:'Сюжетный',description:'Получаешь один недостающий фрагмент выбранного сюжетного ключа.'})),
  {title:'Кусок Мастер-ключа',icon:'🗝️',category:'Эксклюзив',description:'Может заменить недостающий фрагмент любого сюжетного ключа.'},
  {title:'Ключ, которого не существует',icon:'🔑',category:'Эксклюзив',description:'Позволяет открыть одну закрытую сюжетную возможность по согласованию с АМС.'},

  ...Array.from({length:3},()=>({title:'Выбери любой предмет с любой полки',icon:'🎁',category:'Магазин',description:'Самостоятельно выбери один доступный предмет с любой полки магазинчика.'})),
  ...Array.from({length:4},()=>({title:'Случайный предмет магазинчика',icon:'🎁',category:'Магазин',description:'АМС случайным образом выбирает один доступный предмет из магазинчика.'})),
  ...Array.from({length:5},()=>({title:'Случайный Предмет Коллекции',icon:'💿',category:'Коллекция',description:'Получаешь один случайный предмет из доступных коллекций.'})),
  ...Array.from({length:3},()=>({title:'Случайный подарок от АМС',icon:'🎁',category:'Подарок',description:'Получаешь случайный подарок, который выбирает АМС.'})),

  ...Array.from({length:2},()=>({title:'Поцелуй Мадам Одуванчик',icon:'💋',category:'Шутка',description:'Шуточная награда без механического бонуса.'})),
  ...Array.from({length:2},()=>({title:'«Теперь ты пахнешь тыквой»',icon:'🎃',category:'Шутка',description:'Шуточный временный эффект для отыгрыша.'})),
  {title:'Неизвестный подарок',icon:'❔',category:'Подарок',description:'Содержимое подарка АМС раскрывает позже.'}
];

if (prizes.length !== 100) console.warn('Таблица автомата должна содержать ровно 100 исходов. Сейчас:', prizes.length);

function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function readState(){
  try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return{date:dateKey(),used:0,bonus:0,history:[]};const s=JSON.parse(raw);if(s.date!==dateKey())return{date:dateKey(),used:0,bonus:0,history:[]};return s;}catch{return{date:dateKey(),used:0,bonus:0,history:[]};}
}
function saveState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}
function availableSpins(){const s=readState();return DAILY_LIMIT-s.used;}
function updateCounter(){spinsLeftEl.textContent=`${Math.max(0,availableSpins())} / ${DAILY_LIMIT}`;spinButton.disabled=isSpinning||availableSpins()<=0;}
function formatDate(d){return new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'medium'}).format(d);}
function showResult(prize,stamp){
  lastResult={prize,stamp};resultIcon.textContent=prize.icon;resultTitle.textContent=prize.title;resultDescription.textContent=prize.description;
  resultMeta.textContent=`${prize.category} · ${formatDate(stamp)}`;resultPanel.hidden=false;
  statusText.textContent='Автомат выбрал результат.';
}
function renderMachine(prize){
  machineIcon.textContent=prize.icon;
  machineTitle.textContent=prize.title;
  machineCategory.textContent=prize.category;
}
function spin(){
  if(isSpinning||availableSpins()<=0)return;
  isSpinning=true;updateCounter();resultPanel.hidden=true;gameCard.classList.add('running');
  statusText.textContent='Автомат перебирает возможные судьбы…';
  const finalPrize=prizes[Math.floor(Math.random()*prizes.length)];
  const started=performance.now();
  let delay=70,last=0;
  function tick(now){
    const elapsed=now-started;
    if(now-last>=delay){
      renderMachine(prizes[Math.floor(Math.random()*prizes.length)]);
      last=now;
      if(elapsed>1800)delay=120;
      if(elapsed>3000)delay=190;
      if(elapsed>4100)delay=300;
    }
    if(elapsed<5000){requestAnimationFrame(tick);return;}
    renderMachine(finalPrize);
    const stamp=new Date(),state=readState();
    state.used++;state.history.push({date:stamp.toISOString(),title:finalPrize.title});state.history=state.history.slice(-30);
    saveState(state);isSpinning=false;gameCard.classList.remove('running');updateCounter();showResult(finalPrize,stamp);
  }
  requestAnimationFrame(tick);
}

spinButton.addEventListener('click',spin);
resetButton.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);updateCounter();statusText.textContent='Локальный лимит сброшен. Это предназначено только для тестирования.';});
closeResult.addEventListener('click',()=>resultPanel.hidden=true);
copyButton.addEventListener('click',async()=>{if(!lastResult)return;const p=lastResult.prize;text=`🍂 Шёпот судьбы\n\nСегодня я испытал(а) удачу в автомате «Шёпот судьбы».\n\nВыпало: ${p.icon} ${p.title}\n${p.description}\n\nДата и время: ${formatDate(lastResult.stamp)}`;try{await navigator.clipboard.writeText(text);copyButton.textContent='Скопировано ✓';setTimeout(()=>copyButton.textContent='Скопировать результат',1800);}catch{copyButton.textContent='Не удалось скопировать';setTimeout(()=>copyButton.textContent='Скопировать результат',1800);}});
updateCounter();
