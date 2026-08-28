const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
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
const TAU = Math.PI * 2;
let rotation = 0;
let isSpinning = false;
let lastResult = null;

// 100 equally likely sectors. The prize table is intentionally easy to edit.
const prizes = [
  ...Array.from({length:5},()=>({title:'+1 осенний лист',icon:'🍂',category:'Валюта',description:'Один осенний лист достаётся тебе из запасов Мадам Одуванчик.'})),
  ...Array.from({length:4},()=>({title:'+2 осенних листа',icon:'🍂',category:'Валюта',description:'Сегодня судьба немного щедрее обычного.'})),
  ...Array.from({length:2},()=>({title:'+3 осенних листа',icon:'🍂',category:'Валюта',description:'Мадам Одуванчик явно сожалеет о своей математике.'})),
  ...Array.from({length:4},()=>({title:'+1 музыкальный билетик',icon:'🎟️',category:'Валюта',description:'Билетик на несуществующее представление появляется между пальцами.'})),
  ...Array.from({length:2},()=>({title:'+2 музыкальных билетика',icon:'🎟️',category:'Валюта',description:'Два билета на событие, которого ещё нет.'})),
  {title:'+1 лист + 1 билетик',icon:'🍂🎟️',category:'Валюта',description:'Судьба решила не выбирать сторону.'},

  {title:'Пуговица призрака',icon:'👻',category:'Обычный',description:'Расходник: раз за эпизод позволяет позвать одного призрака-свидетеля.'},
  {title:'Пуговица призрака',icon:'👻',category:'Обычный',description:'Призрачная пуговица. Возможно, когда-нибудь она пригодится.'},
  {title:'Счастливая монетка с дыркой',icon:'🪙',category:'Обычный',description:'Не магическая, но АМС может однажды улыбнуться её владельцу.'},
  {title:'Счастливая монетка с дыркой',icon:'🪙',category:'Обычный',description:'Кто-то явно решил, что отверстие — лучший способ избежать судьбы.'},
  {title:'Мешочек сушёных хризантем',icon:'🌼',category:'Обычный',description:'Пахнет осенью и старым деревянным домом.'},
  {title:'Мешочек сушёных хризантем',icon:'🌼',category:'Обычный',description:'Если положить под подушку, сны становятся немного страннее.'},
  {title:'Банка тыквенного мёда',icon:'🍯',category:'Обычный',description:'Сладкий, пряный и подозрительно тёплый даже после холода.'},
  {title:'Банка тыквенного мёда',icon:'🍯',category:'Обычный',description:'На крышке нацарапано: «Не спрашивай, откуда тыква».'},
  {title:'Засушенный лист Мадам Одуванчик',icon:'🍁',category:'Обычный',description:'Обычный лист, который почему-то всегда оказывается сверху остальных вещей.'},
  {title:'Старый билет в кино',icon:'🎞️',category:'Обычный',description:'На билете напечатан сеанс, которого в архиве не существует.'},
  {title:'Кусочек мела для «двери»',icon:'◈',category:'Обычный',description:'Им можно нарисовать дверь. Остальное зависит от фантазии и АМС.'},
  {title:'Маленькая осенняя свеча',icon:'🕯️',category:'Обычный',description:'Горит чуть дольше, чем должна, и пахнет мокрыми листьями.'},

  {title:'Свеча «Первый иней»',icon:'🕯️',category:'Хранитель',description:'Отгоняет слабых Шептунов и Дрём; в «Первом Луче» усиливает проявления защиты.'},
  {title:'Свеча «Первый иней»',icon:'🕯️',category:'Хранитель',description:'Пламя становится ярче, когда рядом кто-то защищает другого.'},
  {title:'Шарф-оберег',icon:'🧣',category:'Хранитель',description:'+1 к сопротивлению ментальному воздействию.'},
  {title:'Шарф-оберег',icon:'🧣',category:'Хранитель',description:'На ткани вышиты едва заметные белые цветы.'},
  {title:'Амулет «Кошачий глаз»',icon:'👁️',category:'Хранитель',description:'Раз в день позволяет увидеть сквозь Гламор.'},
  {title:'Амулет «Кошачий глаз»',icon:'👁️',category:'Хранитель',description:'На секунду показывает миру его настоящее лицо.'},
  {title:'Карта с ошибкой',icon:'🗺️',category:'Трикстер',description:'Показывает путь, которого нет, и иногда именно поэтому приводит куда нужно.'},
  {title:'Карта с ошибкой',icon:'🗺️',category:'Трикстер',description:'На ней появился новый перекрёсток, которого секунду назад не было.'},
  {title:'Ключ без замка',icon:'🗝️',category:'Трикстер',description:'Иногда открывает запертое. Иногда запирает открытое.'},
  {title:'Ключ без замка',icon:'🗝️',category:'Трикстер',description:'Любимец Трикстера. Не задавай ему лишних вопросов.'},
  {title:'Проклятая монетка',icon:'🪙',category:'Разрушитель',description:'Указывает путь, выгодный Тьме, и может дать совет с разрушительным перекосом.'},
  {title:'Венок из полевых цветов',icon:'🌼',category:'Хранитель',description:'Защищает от слабых тварей Изнанки и ярче светится у Холма.'},
  {title:'Случайный предмет Хранителя',icon:'🌿',category:'Хранитель',description:'АМС случайным образом выбирает один предмет с полки Хранителя.'},
  {title:'Случайный предмет Разрушителя',icon:'🖤',category:'Разрушитель',description:'АМС случайным образом выбирает один предмет с полки Разрушителя.'},
  {title:'Случайный предмет Трикстера',icon:'🌀',category:'Трикстер',description:'АМС случайным образом выбирает один предмет с полки Трикстера.'},
  {title:'Случайный предмет Инструмента',icon:'⚙️',category:'Инструмент',description:'АМС случайным образом выбирает один предмет с полки Инструмента.'},
  {title:'+3 осенних листа',icon:'🍂',category:'Бонус',description:'Редкий прилив осенней удачи.'},
  {title:'+3 музыкальных билетика',icon:'🎟️',category:'Бонус',description:'Кто-то явно отдал тебе чужой билетный запас.'},

  {title:'Чёрная свеча',icon:'🕯️',category:'Редкий',description:'Подпитывает Эгрегора страхом и агрессией. Усиливает ветку Разрушителя.'},
  {title:'Чёрная свеча',icon:'🕯️',category:'Редкий',description:'Пламя становится выше рядом с непроговорённой злостью.'},
  {title:'Венок из полевых цветов',icon:'🌼',category:'Редкий',description:'Защищает от слабых существ Изнанки. У Холма светится ярче.'},
  {title:'Ключ без замка',icon:'🗝️',category:'Редкий',description:'Трикстеровский ключ, которому всё равно на понятие «правильная дверь».'},
  {title:'Билет в никуда',icon:'🎟️',category:'Редкий',description:'Открывает случайную дверь — часто не ту, куда ты собирался.'},
  {title:'Плашка «Любимец Мадам Одуванчик»',icon:'🌻',category:'Редкий',description:'Особая плашка Ярмарки. Мадам Одуванчик не объясняет, что нужно сделать, чтобы её заслужить.'},
  {title:'Фон «Осенняя Изнанка»',icon:'🌙',category:'Редкий',description:'Эксклюзивный декоративный фон для оформления персонажа или профиля.'},
  {title:'Малый осколок теневого зеркала',icon:'🔮',category:'Редкий',description:'Можно обменять на один фрагмент ключа или использовать один раз для получения видения возможного будущего.'},
  {title:'Средний осколок теневого зеркала',icon:'🔮',category:'Редкий',description:'Можно обменять на один фрагмент ключа или использовать один раз для получения видения возможного будущего.'},
  {title:'Право задать АМС один сюжетный вопрос',icon:'❔',category:'Редкий',description:'АМС отвечает на один вопрос, связанный с будущим или текущей сюжетной линией.'},
  {title:'Право получить сюжетную подсказку',icon:'✦',category:'Редкий',description:'АМС выдаёт одну полезную подсказку для предстоящего эпизода.'},
  {title:'Выбери любой предмет с любой полки',icon:'🎁',category:'Редкий',description:'Игрок самостоятельно выбирает один доступный предмет с любой полки магазинчика.'},
  {title:'+5 осенних листьев',icon:'🍂',category:'Редкий',description:'Щедрый осенний выигрыш.'},
  {title:'+3 музыкальных билетика',icon:'🎟️',category:'Редкий',description:'Три билетика из старой пачки Мадам Одуванчик.'},
  {title:'Малый осколок теневого зеркала',icon:'🔮',category:'Редкий',description:'Можно обменять на один фрагмент ключа или использовать для видения возможного будущего.'},
  {title:'Средний осколок теневого зеркала',icon:'🔮',category:'Редкий',description:'Отражает один из возможных вариантов будущего.'},

  {title:'Большой осколок теневого зеркала',icon:'🔮',category:'Очень редкий',description:'Даёт одно расширенное видение возможного будущего или может быть обменян на недостающий фрагмент ключа.'},
  {title:'Монета второго шанса',icon:'🪙',category:'Очень редкий',description:'Позволяет один раз пересмотреть результат небольшой сцены или мини-испытания. Использование согласуется с АМС.'},
  {title:'Право изменить небольшую деталь будущей сцены',icon:'✦',category:'Очень редкий',description:'Одно небольшое изменение обстоятельств будущей игровой сцены по согласованию с АМС.'},
  {title:'Право получить недостающий фрагмент ключа',icon:'🗝️',category:'Очень редкий',description:'Закрывает один недостающий фрагмент одного сюжетного ключа.'},
  {title:'Эксклюзивный фон «Красная Луна»',icon:'🌕',category:'Очень редкий',description:'Редкий декоративный фон, связанный с осенней Ярмаркой.'},
  {title:'Билет в никуда — особый',icon:'🎟️',category:'Очень редкий',description:'Позволяет открыть одну дополнительную дверь или проход в рамках согласованной с АМС игровой сцены. Дверь выбирается случайно из доступных сюжетных возможностей.'},

  {title:'Кусок Мастер-ключа',icon:'🗝️',category:'Эксклюзив',description:'Подходит к любой из пяти сюжетных дверей и заменяет один полный ключ.'},
  {title:'Ключ, которого не существует',icon:'🔑',category:'Эксклюзив',description:'Открывает одну закрытую сюжетную возможность, выбранную и согласованную с АМС.'},
  {title:'Билет за кулисы',icon:'🎟️',category:'Эксклюзив',description:'Даёт право на индивидуальную короткую игровую сцену с одним NPC, который не участвует в основном эпизоде. NPC и обстоятельства выбираются вместе с АМС.'},

  {title:'Поцелуй Мадам Одуванчик',icon:'💋',category:'Шутка',description:'Описывается так, как пожелает игрок. Последствия не обещаем.'},
  {title:'«Теперь ты пахнешь тыквой»',icon:'🎃',category:'Шутка',description:'Да. Тыквой. Ничего больше.'},
  {title:'«Летом ты споткнёшься о корень»',icon:'🌳',category:'Шутка',description:'Мадам Одуванчик почему-то уверена в этом на сто процентов.'},
  {title:'«Призрак считает тебя своим бывшим»',icon:'👻',category:'Шутка',description:'Призрак отказывается объяснять отношения.'},
  {title:'«Ты выиграл. Приз пока не придумали»',icon:'🎁',category:'Шутка',description:'Предполагается, что моральная награда уже выдана.'},

  {title:'«Не открывай следующую дверь»',icon:'⚠️',category:'Шёпот',description:'Шёпот судьбы. Может пригодиться позже, а может оказаться совершенно бессмысленным.'},
  {title:'«Кто-то сегодня солжёт тебе»',icon:'🤫',category:'Шёпот',description:'Не сказано кто именно.'},
  {title:'«Ты уже видел это место во сне»',icon:'🌙',category:'Шёпот',description:'Странный шёпот без немедленного механического эффекта.'},

  {title:'+1 лист и случайный Шёпот',icon:'🍂',category:'Случайность',description:'Получаешь лист и один случайный шёпот из специальной таблицы.'},
  {title:'+1 билетик и случайный Шёпот',icon:'🎟️',category:'Случайность',description:'Получаешь билет и один случайный шёпот из специальной таблицы.'},
  {title:'Два случайных предмета магазинчика',icon:'🎁',category:'Случайность',description:'АМС случайным образом выбирает два доступных предмета из магазинчика. Они оба становятся наградой.'},
  {title:'Приз соседа по Колесу',icon:'↔️',category:'Случайность',description:'АМС определяет приз соседнего сектора и именно его выдаёт игроку.'},
  {title:'+2 дополнительных вращения',icon:'↻',category:'Случайность',description:'Текущий результат сохраняется, а лимит сегодняшних вращений увеличивается на два. Их можно использовать сразу или позже в тот же день.'},
  {title:'«Колесо решило иначе»',icon:'🎭',category:'Случайность',description:'АМС самостоятельно выбирает один из доступных призов магазинчика.'},
  {title:'Выбери любой предмет с любой полки',icon:'✦',category:'Случайность',description:'Игрок самостоятельно выбирает один доступный предмет с любой полки магазинчика.'},
  {title:'+2 осенних листа',icon:'🍂',category:'Случайность',description:'Небольшой дополнительный выигрыш.'},
  {title:'Неизвестный подарок',icon:'❔',category:'Случайность',description:'АМС сообщает приз позже. До раскрытия игрок знает только, что Колесо выбрало его намеренно.'},
  {title:'«Мадам Одуванчик остановила колесо рукой»',icon:'🌻',category:'Особый',description:'Специальный сюжетный результат. АМС может использовать его для неожиданного короткого события.'},
  {title:'Случайный предмет магазинчика',icon:'🎁',category:'Случайность',description:'АМС случайным образом выбирает один доступный предмет из магазинчика.'},
  {title:'Малый осколок теневого зеркала',icon:'🔮',category:'Редкий',description:'Можно обменять на один фрагмент ключа или использовать для одного видения возможного будущего.'}
];

if (prizes.length !== 100) console.warn('Колесо должно содержать ровно 100 секторов. Сейчас:', prizes.length);

const categoryStyles = {
  'Валюта':{fill:'#80613b',text:'#f2ddae'},'Обычный':{fill:'#4f4a42',text:'#eadfc9'},'Хранитель':{fill:'#536357',text:'#e2efd9'},
  'Разрушитель':{fill:'#633540',text:'#f1c6cf'},'Трикстер':{fill:'#63516d',text:'#ead8f3'},'Инструмент':{fill:'#575f64',text:'#dbe4e6'},
  'Бонус':{fill:'#7b5c30',text:'#f5dfb3'},'Редкий':{fill:'#69554e',text:'#f0d9c9'},'Очень редкий':{fill:'#4c3e55',text:'#eadbf3'},
  'Эксклюзив':{fill:'#7a4f3f',text:'#f5decf'},'Шутка':{fill:'#6e5940',text:'#f3e2be'},'Шёпот':{fill:'#403849',text:'#ddd1ee'},
  'Случайность':{fill:'#6a624c',text:'#f0e4bf'},'Особый':{fill:'#7a6b43',text:'#f5eac4'}
};

function drawWheel(){
  const dpr=window.devicePixelRatio||1,size=wheel.clientWidth||720,px=Math.round(size*dpr);
  if(wheel.width!==px||wheel.height!==px){wheel.width=px;wheel.height=px;}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const cx=size/2,cy=size/2,r=size*.475,segment=TAU/prizes.length;
  ctx.clearRect(0,0,size,size);ctx.save();ctx.translate(cx,cy);ctx.rotate(rotation);
  for(let i=0;i<prizes.length;i++){
    const start=-Math.PI/2+i*segment,end=start+segment,style=categoryStyles[prizes[i].category]||categoryStyles['Обычный'];
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,start,end);ctx.closePath();ctx.fillStyle=style.fill;ctx.fill();
    ctx.strokeStyle='rgba(232,221,200,.13)';ctx.lineWidth=Math.max(.7,size/900);ctx.stroke();
  }
  ctx.beginPath();ctx.arc(0,0,r*.94,0,TAU);ctx.strokeStyle='rgba(224,201,149,.4)';ctx.lineWidth=Math.max(2,size/150);ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,r*.28,0,TAU);ctx.fillStyle='#18131a';ctx.fill();ctx.strokeStyle='rgba(224,201,149,.48)';ctx.lineWidth=Math.max(1.5,size/260);ctx.stroke();ctx.restore();
}

function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function readState(){
  try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return{date:dateKey(),used:0,bonus:0,history:[]};const s=JSON.parse(raw);if(s.date!==dateKey())return{date:dateKey(),used:0,bonus:0,history:[]};return s;}catch{return{date:dateKey(),used:0,bonus:0,history:[]};}
}
function saveState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}
function availableSpins(){const s=readState();return DAILY_LIMIT+s.bonus-s.used;}
function updateCounter(){spinsLeftEl.textContent=`${Math.max(0,availableSpins())} / ${DAILY_LIMIT + readState().bonus}`;spinButton.disabled=isSpinning||availableSpins()<=0;}
function formatDate(d){return new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'medium'}).format(d);}
function pickPrize(){return prizes[Math.floor(Math.random()*prizes.length)];}
function showResult(prize,stamp){
  lastResult={prize,stamp};resultIcon.textContent=prize.icon;resultTitle.textContent=prize.title;resultDescription.textContent=prize.description;
  resultMeta.textContent=`${prize.category} · ${formatDate(stamp)}`;resultPanel.hidden=false;
  statusText.textContent='Колесо сказало своё слово.';
}
function spin(){
  if(isSpinning||availableSpins()<=0)return;
  isSpinning=true;updateCounter();resultPanel.hidden=true;statusText.textContent='Колесо слушает шёпот…';
  const index=Math.floor(Math.random()*prizes.length),segment=TAU/prizes.length;
  const target=-index*segment-(segment/2);let current=rotation%TAU;if(current<0)current+=TAU;
  let delta=target-current;if(delta<0)delta+=TAU;delta+=TAU*(5+Math.floor(Math.random()*3));
  const start=rotation,end=rotation+delta,duration=5600+Math.random()*1400,t0=performance.now();
  function frame(now){const p=Math.min(1,(now-t0)/duration),e=1-Math.pow(1-p,4);rotation=start+(end-start)*e;drawWheel();if(p<1){requestAnimationFrame(frame);}else{
      rotation=end;drawWheel();const stamp=new Date(),state=readState();state.used++;state.history.push({date:stamp.toISOString(),title:prizes[index].title});state.history=state.history.slice(-30);
      const extra=prizes[index].title==='+2 дополнительных вращения';if(extra)state.bonus+=2;saveState(state);isSpinning=false;updateCounter();showResult(prizes[index],stamp);
    }}requestAnimationFrame(frame);
}

spinButton.addEventListener('click',spin);
resetButton.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);updateCounter();statusText.textContent='Локальный лимит сброшен. Это предназначено только для тестирования.';});
closeResult.addEventListener('click',()=>resultPanel.hidden=true);
copyButton.addEventListener('click',async()=>{if(!lastResult)return;const p=lastResult.prize;text=`🍂 Шёпот судьбы\n\nСегодня я прокрутил(а) Колесо Фортуны.\n\nВыпало: ${p.icon} ${p.title}\n${p.description}\n\nДата и время: ${formatDate(lastResult.stamp)}`;try{await navigator.clipboard.writeText(text);copyButton.textContent='Скопировано ✓';setTimeout(()=>copyButton.textContent='Скопировать результат',1800);}catch{copyButton.textContent='Не удалось скопировать';setTimeout(()=>copyButton.textContent='Скопировать результат',1800);}});
window.addEventListener('resize',drawWheel);
drawWheel();updateCounter();
