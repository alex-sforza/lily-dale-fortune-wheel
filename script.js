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

const WEEKLY_LIMIT = 3;
const STORAGE_KEY = 'lilyDaleFortuneWheelStateV1';
const TAU = Math.PI * 2;
let rotation = 0;
let isSpinning = false;
let lastResult = null;

// 100 equally sized visual sectors. The category distribution is controlled by the order below.
const prizes = [
  { title: '+1 осенний лист', icon: '🍂', category: 'Валюта', description: 'Мадам Одуванчик нехотя возвращает тебе один осенний лист.' },
  { title: '+1 осенний лист', icon: '🍂', category: 'Валюта', description: 'Один сухой лист оказывается в твоей ладони.' },
  { title: '+1 осенний лист', icon: '🍂', category: 'Валюта', description: 'Колесо решает, что тебе полагается ещё один лист.' },
  { title: '+1 осенний лист', icon: '🍂', category: 'Валюта', description: 'Осень благосклонна. Почти.' },
  { title: '+1 осенний лист', icon: '🍂', category: 'Валюта', description: 'Тонкий кленовый лист падает точно в карман.' },
  { title: '+2 осенних листа', icon: '🍂', category: 'Валюта', description: 'Два листа тихо шуршат внутри ладони.' },
  { title: '+2 осенних листа', icon: '🍂', category: 'Валюта', description: 'Мадам Одуванчик делает вид, что этого не заметила.' },
  { title: '+2 осенних листа', icon: '🍂', category: 'Валюта', description: 'Сегодня судьба немного щедрее обычного.' },
  { title: '+2 осенних листа', icon: '🍂', category: 'Валюта', description: 'Шорох колеса приносит маленькое состояние.' },
  { title: '+3 осенних листа', icon: '🍂', category: 'Валюта', description: 'Небольшой дождь из листьев на мгновение осыпает прилавок.' },
  { title: '+3 осенних листа', icon: '🍂', category: 'Валюта', description: 'Мадам Одуванчик явно сожалеет о математике.' },
  { title: '+1 музыкальный билетик', icon: '🎟️', category: 'Валюта', description: 'Билетик на несуществующее представление появляется между пальцами.' },
  { title: '+1 музыкальный билетик', icon: '🎟️', category: 'Валюта', description: 'На билетике написано: «Только сегодня».' },
  { title: '+1 музыкальный билетик', icon: '🎟️', category: 'Валюта', description: 'Бумага пахнет пылью, сценой и чем-то очень старым.' },
  { title: '+1 музыкальный билетик', icon: '🎟️', category: 'Валюта', description: 'Колесо выдало билетик, который лучше не рассматривать слишком долго.' },
  { title: '+2 музыкальных билетика', icon: '🎟️', category: 'Валюта', description: 'Два билета на событие, которого ещё нет.' },
  { title: '+2 музыкальных билетика', icon: '🎟️', category: 'Валюта', description: 'На обороте обоих одинаковая дата, но она стёрта.' },
  { title: '+1 лист + 1 билетик', icon: '🍂🎟️', category: 'Валюта', description: 'Судьба решила не выбирать сторону.' },

  { title: 'Пуговица призрака', icon: '👻', category: 'Обычный', description: 'Расходник: раз за эпизод позволяет позвать одного призрака-свидетеля.' },
  { title: 'Пуговица призрака', icon: '👻', category: 'Обычный', description: 'На секунду кажется, что пуговица тихо вздыхает.' },
  { title: 'Счастливая монетка с дыркой', icon: '🪙', category: 'Обычный', description: 'Не магическая. Но АМС может однажды улыбнуться её владельцу.' },
  { title: 'Счастливая монетка с дыркой', icon: '🪙', category: 'Обычный', description: 'Кто-то явно решил, что отверстие — лучший способ избежать судьбы.' },
  { title: 'Мешочек сушёных хризантем', icon: '🌼', category: 'Обычный', description: 'Пахнет осенью и старым деревянным домом.' },
  { title: 'Мешочек сушёных хризантем', icon: '🌼', category: 'Обычный', description: 'Если положить под подушку, сны становятся немного страннее.' },
  { title: 'Банка тыквенного мёда', icon: '🍯', category: 'Обычный', description: 'Сладкий, пряный и подозрительно тёплый даже после холода.' },
  { title: 'Банка тыквенного мёда', icon: '🍯', category: 'Обычный', description: 'На крышке нацарапано: «Не спрашивай, откуда тыква».' },
  { title: 'Засушенный лист Мадам Одуванчик', icon: '🍁', category: 'Обычный', description: 'Обычный лист, который почему-то всегда оказывается сверху остальных вещей.' },
  { title: 'Старый билет в кино', icon: '🎞️', category: 'Обычный', description: 'На билете напечатан сеанс, которого в архиве не существует.' },
  { title: 'Кусочек мела для «двери»', icon: '◈', category: 'Обычный', description: 'Им можно нарисовать дверь. Остальное зависит от фантазии и АМС.' },
  { title: 'Маленькая осенняя свеча', icon: '🕯️', category: 'Обычный', description: 'Горит чуть дольше, чем должна, и пахнет мокрыми листьями.' },

  { title: 'Свеча «Первый иней»', icon: '🕯️', category: 'Хранитель', description: 'Отгоняет слабых Шептунов и Дрём; в «Первом Луче» усиливает проявления защиты.' },
  { title: 'Свеча «Первый иней»', icon: '🕯️', category: 'Хранитель', description: 'Пламя становится ярче, когда рядом кто-то защищает другого.' },
  { title: 'Шарф-оберег', icon: '🧣', category: 'Хранитель', description: '+1 к сопротивлению ментальному воздействию.' },
  { title: 'Шарф-оберег', icon: '🧣', category: 'Хранитель', description: 'На ткани вышиты едва заметные белые цветы.' },
  { title: 'Амулет «Кошачий глаз»', icon: '👁️', category: 'Хранитель', description: 'Раз в день позволяет увидеть сквозь Гламор.' },
  { title: 'Амулет «Кошачий глаз»', icon: '👁️', category: 'Хранитель', description: 'На секунду показывает миру его настоящее лицо.' },
  { title: 'Карта с ошибкой', icon: '🗺️', category: 'Трикстер', description: 'Показывает путь, которого нет, и иногда именно поэтому приводит куда нужно.' },
  { title: 'Карта с ошибкой', icon: '🗺️', category: 'Трикстер', description: 'На ней появился новый перекрёсток, которого секунду назад не было.' },
  { title: 'Ключ без замка', icon: '🗝️', category: 'Трикстер', description: 'Иногда открывает запертое. Иногда запирает открытое.' },
  { title: 'Ключ без замка', icon: '🗝️', category: 'Трикстер', description: 'Любимец Трикстера. Не задавай ему лишних вопросов.' },
  { title: 'Проклятая монетка', icon: '🪙', category: 'Разрушитель', description: 'Указывает путь, выгодный Тьме. В эпизоде может дать совет с разрушительным перекосом.' },
  { title: 'Венок из полевых цветов', icon: '🌼', category: 'Хранитель', description: 'Защищает от слабых тварей Изнанки и ярче светится у Холма.' },
  { title: 'Случайный предмет Хранителя', icon: '🌿', category: 'Хранитель', description: 'Колесо выбирает один обычный предмет с полки Хранителя.' },
  { title: 'Случайный предмет Разрушителя', icon: '🖤', category: 'Разрушитель', description: 'Колесо выбирает один обычный предмет с полки Разрушителя.' },
  { title: 'Случайный предмет Трикстера', icon: '🌀', category: 'Трикстер', description: 'Колесо выбирает один обычный предмет с полки Трикстера.' },
  { title: 'Случайный предмет Инструмента', icon: '⚙️', category: 'Инструмент', description: 'Колесо выбирает один обычный предмет с полки Инструмента.' },
  { title: '+3 осенних листа', icon: '🍂', category: 'Бонус', description: 'Редкий прилив осенней удачи.' },
  { title: '+3 музыкальных билетика', icon: '🎟️', category: 'Бонус', description: 'Кто-то явно отдал тебе чужой билетный запас.' },

  { title: 'Чёрная свеча', icon: '🕯️', category: 'Редкий', description: 'Подпитывает Эгрегора страхом и агрессией. Усиливает ветку Разрушителя.' },
  { title: 'Чёрная свеча', icon: '🕯️', category: 'Редкий', description: 'Пламя становится выше рядом с непроговорённой злостью.' },
  { title: 'Венок из полевых цветов', icon: '🌼', category: 'Редкий', description: 'Защищает от слабых существ Изнанки. У Холма светится ярче.' },
  { title: 'Ключ без замка', icon: '🗝️', category: 'Редкий', description: 'Трикстеровский ключ, которому всё равно на понятие «правильная дверь».' },
  { title: 'Билет в никуда', icon: '🎟️', category: 'Редкий', description: 'Открывает случайную дверь — часто не ту, куда ты собирался.' },
  { title: 'Плашка «Любимец Мадам Одуванчик»', icon: '🌻', category: 'Редкий', description: 'Очень приятное звание. Мадам Одуванчик не признаётся, что оно означает.' },
  { title: 'Фон «Осенняя Изнанка»', icon: '🌙', category: 'Редкий', description: 'Эксклюзивный декоративный фон для оформления персонажа или профиля.' },
  { title: 'Средний осколок теневого зеркала', icon: '🔮', category: 'Редкий', description: 'Можно обменять на фрагмент ключа или использовать для одного видения будущего.' },
  { title: 'Средний осколок теневого зеркала', icon: '🔮', category: 'Редкий', description: 'Осколок показывает не будущее, а один из его возможных вариантов.' },
  { title: 'Право задать АМС один сюжетный вопрос', icon: '❔', category: 'Редкий', description: 'АМС отвечает в рамках лора и текущего сюжета.' },
  { title: 'Право на небольшую сюжетную подсказку', icon: '✦', category: 'Редкий', description: 'Подсказка может касаться места, NPC, предмета или возможного риска.' },
  { title: 'Предмет любой ветки на выбор', icon: '🎁', category: 'Редкий', description: 'Можно выбрать один обычный предмет из магазина.' },
  { title: '+5 осенних листьев', icon: '🍂', category: 'Редкий', description: 'Мадам Одуванчик смотрит на тебя с таким выражением, будто передумала считать.' },
  { title: '+3 музыкальных билетика', icon: '🎟️', category: 'Редкий', description: 'Три билетика с одинаковой выцветшей печатью.' },
  { title: 'Дополнительный билет в Челлендж', icon: '🚪', category: 'Редкий', description: 'Позволяет один раз закрыть один недостающий шаг в «Семи дверях» на условиях АМС.' },

  { title: 'Видение возможного будущего', icon: '🔮', category: 'Видение', description: 'АМС показывает один из возможных вариантов развития событий.' },
  { title: 'Видение возможного будущего', icon: '🔮', category: 'Видение', description: 'Будущее не обещает, что увиденное обязательно случится.' },
  { title: 'Видение одного из пяти летних эпизодов', icon: '🚪', category: 'Видение', description: 'Короткий фрагмент одного возможного летнего пути Эгрегора.' },
  { title: 'Видение собственного персонажа в будущем', icon: '🪞', category: 'Видение', description: 'Небольшой образ персонажа после событий летнего сезона.' },
  { title: 'Видение неизвестного NPC', icon: '👤', category: 'Видение', description: 'Фрагмент человека или существа, которое ещё не вошло в историю.' },
  { title: 'Видение места, которого пока нет', icon: '🏚️', category: 'Видение', description: 'Игрок получает образ будущей локации или её аномальной версии.' },
  { title: 'Вопрос Енотику', icon: '🦝', category: 'Видение', description: 'Один вопрос Енотику. Ответ может быть совершенно честным и совершенно непонятным.' },
  { title: '«Эгрегор тебя заметил»', icon: '👁️', category: 'Видение', description: 'Особый результат для АМС: можно дать персонажу короткий персональный знак от Эгрегора.' },

  { title: 'Большой осколок теневого зеркала', icon: '🔮', category: 'Очень редкий', description: 'Редкий осколок. Может дать видение или быть обменян на ключевой фрагмент.' },
  { title: 'Монета второго шанса', icon: '🪙', category: 'Очень редкий', description: 'Позволяет один раз пересмотреть результат небольшой сцены или мини-испытания.' },
  { title: 'Право изменить небольшую деталь будущей сцены', icon: '✦', category: 'Очень редкий', description: 'Одно согласованное с АМС небольшое изменение обстоятельств летнего эпизода.' },
  { title: 'Право получить недостающий фрагмент ключа', icon: '🗝️', category: 'Очень редкий', description: 'Закрывает один недостающий фрагмент одного сюжетного ключа.' },
  { title: 'Эксклюзивный фон «Красная Луна»', icon: '🌕', category: 'Очень редкий', description: 'Редкий декоративный фон, связанный с осенней Ярмаркой.' },
  { title: '«Билет в никуда» — усиленная версия', icon: '🎟️', category: 'Очень редкий', description: 'Открывает не случайную дверь, а дверь, которую Колесо сочтёт интересной именно для этого персонажа.' },

  { title: 'Кусок Мастер-ключа', icon: '🗝️', category: 'Эксклюзив', description: 'Подходит к любой из пяти сюжетных дверей. Один из самых редких призов Ярмарки.' },
  { title: 'Ключ, которого не существует', icon: '🔑', category: 'Эксклюзив', description: 'АМС решает, какую закрытую сюжетную возможность он открывает.' },
  { title: 'Билет за кулисы', icon: '🎟️', category: 'Эксклюзив', description: 'Даёт доступ к короткой закрытой сцене с NPC, который обычно остаётся за пределами основных эпизодов.' },

  { title: 'Поцелуй Мадам Одуванчик', icon: '💋', category: 'Шутка', description: 'Описывается так, как пожелает игрок. Последствия не обещаем.' },
  { title: '«Теперь ты пахнешь тыквой»', icon: '🎃', category: 'Шутка', description: 'Да. Тыквой. Ничего больше.' },
  { title: '«Летом ты споткнёшься о корень»', icon: '🌳', category: 'Шутка', description: 'Мадам Одуванчик почему-то уверена в этом на сто процентов.' },
  { title: '«Призрак считает тебя своим бывшим»', icon: '👻', category: 'Шутка', description: 'Призрак отказывается объяснять отношения.' },
  { title: '«Ты выиграл. Приз пока не придумали»', icon: '🎁', category: 'Шутка', description: 'Предполагается, что моральная награда уже выдана.' },

  { title: '«Не открывай следующую дверь»', icon: '⚠️', category: 'Шёпот', description: 'Шёпот судьбы. Может пригодиться позже, а может быть совершенно бессмысленным.' },
  { title: '«Кто-то сегодня солжёт тебе»', icon: '🤫', category: 'Шёпот', description: 'Не сказано кто именно.' },
  { title: '«Эгрегор тебя заметил»', icon: '👁️', category: 'Шёпот', description: 'АМС может использовать этот результат как повод для персонального сюжетного знака.' },

  { title: '+1 лист и случайный Шёпот', icon: '🍂', category: 'Случайность', description: 'Получаешь лист и один случайный шёпот из специальной таблицы.' },
  { title: '+1 билетик и случайный Шёпот', icon: '🎟️', category: 'Случайность', description: 'Получаешь билет и один случайный шёпот из специальной таблицы.' },
  { title: 'Два случайных предмета', icon: '🎁', category: 'Случайность', description: 'АМС выбирает любые два доступных предмета для награды.' },
  { title: 'Приз соседа по Колесу', icon: '↔️', category: 'Случайность', description: 'АМС определяет, что бы выпало соседнему сектору, и именно это получает игрок.' },
  { title: 'Повторное вращение бесплатно', icon: '↻', category: 'Случайность', description: 'Можно сразу прокрутить Колесо ещё раз без дополнительной оплаты.' },
  { title: 'Повторное вращение — но прошлый результат сгорает', icon: '↻', category: 'Случайность', description: 'Можно рискнуть и крутить снова. Предыдущий приз при этом аннулируется.' },
  { title: '«Колесо решило иначе»', icon: '🎭', category: 'Случайность', description: 'АМС выбирает итоговый приз самостоятельно.' },
  { title: 'Противоположная ветка', icon: '⚖️', category: 'Случайность', description: 'Получаешь предмет из противоположной последней полученной ветки. Если её нет — АМС выбирает.' },
  { title: 'Случайный предмет одной из пяти веток', icon: '✦', category: 'Случайность', description: 'Хранитель, Разрушитель, Трикстер, Инструмент или Катастрофа — решает Колесо.' },
  { title: '+2 листа, но следующий бесплатный бонус закрыт', icon: '🍂', category: 'Случайность', description: 'Щедрость имеет цену: следующий бесплатный бонус не срабатывает.' },
  { title: 'Неизвестный подарок', icon: '❔', category: 'Случайность', description: 'АМС сообщает приз позже. До раскрытия игрок знает только, что Колесо выбрало его намеренно.' },
  { title: '«Мадам Одуванчик остановила колесо рукой»', icon: '🌻', category: 'Особый', description: 'Специальный сюжетный результат. АМС может использовать его для неожиданного короткого события.' },
];

// Visual palette is intentionally muted and autumnal rather than a literal 100-color rainbow.
const categoryStyles = {
  'Валюта': { fill: '#80613b', text: '#f2ddae' },
  'Обычный': { fill: '#4f4a42', text: '#eadfc9' },
  'Хранитель': { fill: '#536357', text: '#e2efd9' },
  'Разрушитель': { fill: '#633540', text: '#f1c6cf' },
  'Трикстер': { fill: '#63516d', text: '#ead8f3' },
  'Инструмент': { fill: '#575f64', text: '#dbe4e6' },
  'Бонус': { fill: '#7b5c30', text: '#f5dfb3' },
  'Редкий': { fill: '#69554e', text: '#f0d9c9' },
  'Видение': { fill: '#46556d', text: '#d9e6fb' },
  'Очень редкий': { fill: '#4c3e55', text: '#eadbf3' },
  'Эксклюзив': { fill: '#7a4f3f', text: '#f5decf' },
  'Шутка': { fill: '#6e5940', text: '#f3e2be' },
  'Шёпот': { fill: '#403849', text: '#ddd1ee' },
  'Случайность': { fill: '#6a624c', text: '#f0e4bf' },
  'Особый': { fill: '#7a6b43', text: '#f5eac4' },
};

function drawWheel() {
  const dpr = window.devicePixelRatio || 1;
  const size = wheel.clientWidth || 720;
  const px = Math.round(size * dpr);
  if (wheel.width !== px || wheel.height !== px) {
    wheel.width = px;
    wheel.height = px;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = size;
  const cx = w / 2;
  const cy = w / 2;
  const r = w * 0.475;
  const segment = TAU / prizes.length;

  ctx.clearRect(0, 0, w, w);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < prizes.length; i++) {
    const start = -Math.PI / 2 + i * segment;
    const end = start + segment;
    const style = categoryStyles[prizes[i].category] || categoryStyles['Обычный'];

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, start, end);
    ctx.closePath();
    ctx.fillStyle = style.fill;
    ctx.fill();

    ctx.strokeStyle = 'rgba(232,221,200,0.13)';
    ctx.lineWidth = Math.max(0.7, w / 900);
    ctx.stroke();
  }

  // Decorative inner and outer rings.
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.94, 0, TAU);
  ctx.strokeStyle = 'rgba(224,201,149,0.4)';
  ctx.lineWidth = Math.max(2, w / 150);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.28, 0, TAU);
  ctx.fillStyle = '#18131a';
  ctx.fill();
  ctx.strokeStyle = 'rgba(224,201,149,0.48)';
  ctx.lineWidth = Math.max(1.5, w / 260);
  ctx.stroke();

  ctx.restore();
}

function getWeekKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { week: getWeekKey(), used: 0, history: [] };
    const state = JSON.parse(raw);
    if (state.week !== getWeekKey()) return { week: getWeekKey(), used: 0, history: [] };
    return { week: state.week, used: Number(state.used) || 0, history: Array.isArray(state.history) ? state.history : [] };
  } catch {
    return { week: getWeekKey(), used: 0, history: [] };
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateCounter() {
  const state = readState();
  const left = Math.max(0, WEEKLY_LIMIT - state.used);
  spinsLeftEl.textContent = `${left} / ${WEEKLY_LIMIT}`;
  spinButton.disabled = isSpinning || left <= 0;
  spinButton.title = left <= 0 ? 'На этой неделе все три вращения уже использованы.' : '';
}

function choosePrize() {
  return Math.floor(Math.random() * prizes.length);
}

function normalizeAngle(a) {
  return ((a % TAU) + TAU) % TAU;
}

function showResult(prize, index) {
  lastResult = prize;
  resultIcon.textContent = prize.icon;
  resultTitle.textContent = prize.title;
  resultDescription.textContent = prize.description;
  resultMeta.textContent = `${prize.category} · сектор ${index + 1}`;
  resultPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setStatus(text) {
  statusText.textContent = text;
}

function spin() {
  if (isSpinning) return;
  const state = readState();
  if (state.used >= WEEKLY_LIMIT) {
    setStatus('Три вопроса судьбе на эту неделю уже заданы. Возвращайся после обновления недели.');
    updateCounter();
    return;
  }

  isSpinning = true;
  resultPanel.hidden = true;
  spinButton.disabled = true;
  setStatus('Колесо слушает… не пытайся убедить его остановиться раньше времени.');

  const prizeIndex = choosePrize();
  const segment = TAU / prizes.length;
  // Canvas pointer is at -90°. Center the selected segment underneath it.
  const targetNormalized = normalizeAngle(-(prizeIndex + 0.5) * segment);
  const currentNormalized = normalizeAngle(rotation);
  let delta = targetNormalized - currentNormalized;
  if (delta < 0) delta += TAU;
  const extraTurns = 7 + Math.floor(Math.random() * 3);
  const totalRotation = delta + extraTurns * TAU;
  const start = rotation;
  const end = rotation + totalRotation;
  const duration = 5600 + Math.random() * 900;
  const startTime = performance.now();

  function ease(t) {
    // Quintic ease-out: dramatic start, long suspenseful finish.
    return 1 - Math.pow(1 - t, 5);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    rotation = start + totalRotation * ease(progress);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    rotation = normalizeAngle(end);
    drawWheel();
    isSpinning = false;

    const nextState = readState();
    nextState.used += 1;
    nextState.history.unshift({
      at: new Date().toISOString(),
      prize: prizes[prizeIndex].title,
      category: prizes[prizeIndex].category,
      sector: prizeIndex + 1,
    });
    nextState.history = nextState.history.slice(0, 12);
    writeState(nextState);

    updateCounter();
    setStatus('Судьба сказала своё. Теперь решай, что делать с услышанным.');
    showResult(prizes[prizeIndex], prizeIndex);
  }

  requestAnimationFrame(frame);
}

function copyResult() {
  if (!lastResult) return;
  const text = `🍂 Шёпот судьбы — Ярмарка Шёпотов\n\n${lastResult.icon} ${lastResult.title}\n\n${lastResult.description}`;
  navigator.clipboard?.writeText(text).then(() => {
    const original = copyButton.textContent;
    copyButton.textContent = 'Скопировано ✓';
    setTimeout(() => { copyButton.textContent = original; }, 1800);
  }).catch(() => {
    window.prompt('Скопируй результат:', text);
  });
}

function resetLocalLimit() {
  const confirmed = window.confirm('Сбросить локальный лимит и историю на этом устройстве? Это только локальная настройка браузера.');
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  resultPanel.hidden = true;
  setStatus('Локальный лимит сброшен. Колесо снова делает вид, что ничего не помнит.');
  updateCounter();
}

spinButton.addEventListener('click', spin);
copyButton.addEventListener('click', copyResult);
closeResult.addEventListener('click', () => { resultPanel.hidden = true; });
resetButton.addEventListener('click', resetLocalLimit);
window.addEventListener('resize', drawWheel);

updateCounter();
drawWheel();
