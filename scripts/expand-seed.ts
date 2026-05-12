/**
 * Idempotently adds canonical Socionics objects to the seeded
 * "Классическая Модель А" theory: 8 function positions, 16 TIMs,
 * 14 intertype relations, 15 Reinin attributes.
 *
 * Safe to run on every deploy — checks each (theoryId, slug) before
 * inserting.
 */

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/server/db/schema";

const CLASSICAL_SLUG = "classical-model-a";
const LANG = "ru" as const;

type ObjectSeed = {
  kind:
    | "aspect"
    | "function_position"
    | "type"
    | "intertype_relation"
    | "dichotomy"
    | "custom";
  slug: string;
  name: string;
  description: string;
  metadata?: Record<string, unknown>;
  position?: number;
};

const FUNCTION_POSITIONS: ObjectSeed[] = [
  {
    kind: "function_position",
    slug: "programmatic",
    name: "Программная функция (1)",
    description:
      "Базовая, сильная и осознаваемая. Несёт главную информационную программу личности — то, что человек делает уверенно, постоянно и охотно. Через неё формируется самосознание и стратегия жизни.",
    metadata: { index: 1, blockName: "Эго", strength: "strong", awareness: "conscious" },
    position: 1,
  },
  {
    kind: "function_position",
    slug: "creative",
    name: "Творческая функция (2)",
    description:
      "Сильная, осознаваемая, инструментальная. Реализует программную через ситуационно подстраиваемое творчество. Гибкая, но всегда обслуживает первую.",
    metadata: { index: 2, blockName: "Эго", strength: "strong", awareness: "conscious" },
    position: 2,
  },
  {
    kind: "function_position",
    slug: "role",
    name: "Ролевая функция (3)",
    description:
      "Слабая, но осознаваемая. Использует «социальную маску» для адаптации в незнакомой обстановке. Включается из чувства долга, утомляет.",
    metadata: { index: 3, blockName: "Супер-эго", strength: "weak", awareness: "conscious" },
    position: 3,
  },
  {
    kind: "function_position",
    slug: "painful",
    name: "Болевая функция (4, ТНС)",
    description:
      "Точка наименьшего сопротивления. Слабая, осознаваемая, ранимая. Любая критика по этому аспекту воспринимается как личное оскорбление. Человек избегает действовать здесь.",
    metadata: { index: 4, blockName: "Супер-эго", strength: "weak", awareness: "conscious" },
    position: 4,
  },
  {
    kind: "function_position",
    slug: "suggestive",
    name: "Внушаемая функция (5)",
    description:
      "Слабая, неосознаваемая, открытая для воздействия. Человек охотно принимает информацию по этому аспекту извне, особенно от дуала. Ощущается как «зона счастья».",
    metadata: { index: 5, blockName: "Супер-ид", strength: "weak", awareness: "unconscious" },
    position: 5,
  },
  {
    kind: "function_position",
    slug: "activational",
    name: "Активационная функция (6)",
    description:
      "Слабая, неосознаваемая, референтная. Поддержка извне по этому аспекту мобилизует и поднимает тонус. Включается ситуативно, ненадолго.",
    metadata: { index: 6, blockName: "Супер-ид", strength: "weak", awareness: "unconscious" },
    position: 6,
  },
  {
    kind: "function_position",
    slug: "limiting",
    name: "Ограничительная функция (7)",
    description:
      "Сильная, неосознаваемая, контролирующая. Включается когда нужно поставить границы или сказать «нет». Работает фоном, не привлекая внимания самого носителя.",
    metadata: { index: 7, blockName: "Ид", strength: "strong", awareness: "unconscious" },
    position: 7,
  },
  {
    kind: "function_position",
    slug: "background",
    name: "Фоновая функция (8, демонстративная)",
    description:
      "Сильная, неосознаваемая, демонстрируется без рефлексии. Человек «само собой» делает это хорошо, не считая ценным. Поддерживает программу второго в дуальной паре.",
    metadata: { index: 8, blockName: "Ид", strength: "strong", awareness: "unconscious" },
    position: 8,
  },
];

const TIMS: ObjectSeed[] = [
  {
    kind: "type",
    slug: "ile",
    name: "ИЛЭ — Дон Кихот (Искатель)",
    description:
      "Интуитивно-логический экстраверт. Программа — ЧИ (возможности), творческая — БЛ (структура). Генератор идей и гипотез, ищет новое и нестандартное.",
    metadata: {
      short: "ИЛЭ",
      mbti: "ENTP",
      quadra: "Alpha",
      aliases: ["Дон Кихот", "Искатель"],
      base: "ЧИ",
      creative: "БЛ",
    },
  },
  {
    kind: "type",
    slug: "sei",
    name: "СЭИ — Дюма (Посредник)",
    description:
      "Сенсорно-этический интроверт. Программа — БС (комфорт), творческая — ЧЭ (эмоции). Создатель уютной атмосферы, мастер сглаживания напряжений.",
    metadata: {
      short: "СЭИ",
      mbti: "ISFP",
      quadra: "Alpha",
      aliases: ["Дюма", "Посредник"],
      base: "БС",
      creative: "ЧЭ",
    },
  },
  {
    kind: "type",
    slug: "ese",
    name: "ЭСЭ — Гюго (Энтузиаст)",
    description:
      "Этико-сенсорный экстраверт. Программа — ЧЭ (эмоции), творческая — БС (комфорт). Душа компании, заражает энтузиазмом, организует праздник.",
    metadata: {
      short: "ЭСЭ",
      mbti: "ESFJ",
      quadra: "Alpha",
      aliases: ["Гюго", "Энтузиаст"],
      base: "ЧЭ",
      creative: "БС",
    },
  },
  {
    kind: "type",
    slug: "lii",
    name: "ЛИИ — Робеспьер (Аналитик)",
    description:
      "Логико-интуитивный интроверт. Программа — БЛ (структура), творческая — ЧИ (возможности). Систематизатор, строит понятийные схемы, ищет принципы.",
    metadata: {
      short: "ЛИИ",
      mbti: "INTJ",
      quadra: "Alpha",
      aliases: ["Робеспьер", "Аналитик"],
      base: "БЛ",
      creative: "ЧИ",
    },
  },
  {
    kind: "type",
    slug: "eie",
    name: "ЭИЭ — Гамлет (Наставник)",
    description:
      "Этико-интуитивный экстраверт. Программа — ЧЭ (эмоции), творческая — БИ (время). Драматург жизни, видит будущее через эмоциональные сценарии.",
    metadata: {
      short: "ЭИЭ",
      mbti: "ENFJ",
      quadra: "Beta",
      aliases: ["Гамлет", "Наставник"],
      base: "ЧЭ",
      creative: "БИ",
    },
  },
  {
    kind: "type",
    slug: "lsi",
    name: "ЛСИ — Максим (Инспектор)",
    description:
      "Логико-сенсорный интроверт. Программа — БЛ (структура), творческая — ЧС (воля). Систематизатор и контролёр, любит порядок, иерархию и правила.",
    metadata: {
      short: "ЛСИ",
      mbti: "ISTJ",
      quadra: "Beta",
      aliases: ["Максим Горький", "Инспектор"],
      base: "БЛ",
      creative: "ЧС",
    },
  },
  {
    kind: "type",
    slug: "sle",
    name: "СЛЭ — Жуков (Маршал)",
    description:
      "Сенсорно-логический экстраверт. Программа — ЧС (воля), творческая — БЛ (структура). Силовой лидер, тактик, добивается результата через волю и контроль.",
    metadata: {
      short: "СЛЭ",
      mbti: "ESTP",
      quadra: "Beta",
      aliases: ["Жуков", "Маршал"],
      base: "ЧС",
      creative: "БЛ",
    },
  },
  {
    kind: "type",
    slug: "iei",
    name: "ИЭИ — Есенин (Лирик)",
    description:
      "Интуитивно-этический интроверт. Программа — БИ (время), творческая — ЧЭ (эмоции). Романтик, мечтатель, чувствует ход времени и настроение момента.",
    metadata: {
      short: "ИЭИ",
      mbti: "INFP",
      quadra: "Beta",
      aliases: ["Есенин", "Лирик"],
      base: "БИ",
      creative: "ЧЭ",
    },
  },
  {
    kind: "type",
    slug: "see",
    name: "СЭЭ — Наполеон (Политик)",
    description:
      "Сенсорно-этический экстраверт. Программа — ЧС (воля), творческая — БЭ (отношения). Лидер через харизму и личные связи, амбициозный, чувствует расстановку сил.",
    metadata: {
      short: "СЭЭ",
      mbti: "ESFP",
      quadra: "Gamma",
      aliases: ["Наполеон", "Политик"],
      base: "ЧС",
      creative: "БЭ",
    },
  },
  {
    kind: "type",
    slug: "ili",
    name: "ИЛИ — Бальзак (Критик)",
    description:
      "Интуитивно-логический интроверт. Программа — БИ (время), творческая — ЧЛ (дело). Скептик-прогнозист, видит тренды, отслеживает риски и закономерности.",
    metadata: {
      short: "ИЛИ",
      mbti: "INTP",
      quadra: "Gamma",
      aliases: ["Бальзак", "Критик"],
      base: "БИ",
      creative: "ЧЛ",
    },
  },
  {
    kind: "type",
    slug: "lie",
    name: "ЛИЭ — Джек Лондон (Предприниматель)",
    description:
      "Логико-интуитивный экстраверт. Программа — ЧЛ (дело), творческая — БИ (время). Стратег эффективности, оценивает выгоду и временное окно возможностей.",
    metadata: {
      short: "ЛИЭ",
      mbti: "ENTJ",
      quadra: "Gamma",
      aliases: ["Джек Лондон", "Предприниматель"],
      base: "ЧЛ",
      creative: "БИ",
    },
  },
  {
    kind: "type",
    slug: "esi",
    name: "ЭСИ — Драйзер (Хранитель)",
    description:
      "Этико-сенсорный интроверт. Программа — БЭ (отношения), творческая — ЧС (воля). Моральный страж, чувствует «правильность» дистанции и нравственного выбора.",
    metadata: {
      short: "ЭСИ",
      mbti: "ISFJ",
      quadra: "Gamma",
      aliases: ["Драйзер", "Хранитель"],
      base: "БЭ",
      creative: "ЧС",
    },
  },
  {
    kind: "type",
    slug: "lse",
    name: "ЛСЭ — Штирлиц (Администратор)",
    description:
      "Логико-сенсорный экстраверт. Программа — ЧЛ (дело), творческая — БС (комфорт). Управленец-практик, систематизирует работу, заботится о технологичности и быте.",
    metadata: {
      short: "ЛСЭ",
      mbti: "ESTJ",
      quadra: "Delta",
      aliases: ["Штирлиц", "Администратор"],
      base: "ЧЛ",
      creative: "БС",
    },
  },
  {
    kind: "type",
    slug: "eii",
    name: "ЭИИ — Достоевский (Гуманист)",
    description:
      "Этико-интуитивный интроверт. Программа — БЭ (отношения), творческая — ЧИ (возможности). Тонкий чувствует моральный смысл, понимает мотивы людей, склонен к идеализму.",
    metadata: {
      short: "ЭИИ",
      mbti: "INFJ",
      quadra: "Delta",
      aliases: ["Достоевский", "Гуманист"],
      base: "БЭ",
      creative: "ЧИ",
    },
  },
  {
    kind: "type",
    slug: "iee",
    name: "ИЭЭ — Гексли (Советчик)",
    description:
      "Интуитивно-этический экстраверт. Программа — ЧИ (возможности), творческая — БЭ (отношения). Видит потенциал в людях, помогает им найти своё место и поверить в себя.",
    metadata: {
      short: "ИЭЭ",
      mbti: "ENFP",
      quadra: "Delta",
      aliases: ["Гексли", "Советчик"],
      base: "ЧИ",
      creative: "БЭ",
    },
  },
  {
    kind: "type",
    slug: "sli",
    name: "СЛИ — Габен (Мастер)",
    description:
      "Сенсорно-логический интроверт. Программа — БС (комфорт), творческая — ЧЛ (дело). Тонкий ценитель качества, мастер технологий, ценит автономию и эргономику.",
    metadata: {
      short: "СЛИ",
      mbti: "ISTP",
      quadra: "Delta",
      aliases: ["Габен", "Мастер"],
      base: "БС",
      creative: "ЧЛ",
    },
  },
];

const ITO: ObjectSeed[] = [
  {
    kind: "intertype_relation",
    slug: "identity",
    name: "Тождественные",
    description:
      "Полное совпадение функциональной модели. Глубокое взаимопонимание, но без развития: оба видят мир одинаково и не дополняют друг друга.",
    metadata: { symmetric: true, beneficence: "comfortable" },
  },
  {
    kind: "intertype_relation",
    slug: "duality",
    name: "Дуальные",
    description:
      "Идеальное дополнение: программная одного совпадает с внушаемой другого. Наибольший психологический комфорт и взаимная подзарядка.",
    metadata: { symmetric: true, beneficence: "ideal" },
  },
  {
    kind: "intertype_relation",
    slug: "activation",
    name: "Активация",
    description:
      "Партнёр стимулирует, но утомляет. Программная одного на референтной (6-й) другого — приятно вначале, тяжело надолго.",
    metadata: { symmetric: true, beneficence: "stimulating" },
  },
  {
    kind: "intertype_relation",
    slug: "mirror",
    name: "Зеркальные",
    description:
      "Одни и те же сильные функции, но программная и творческая поменяны местами. Хорошо в работе, спорно в близких отношениях.",
    metadata: { symmetric: true, beneficence: "productive" },
  },
  {
    kind: "intertype_relation",
    slug: "business",
    name: "Деловые",
    description:
      "Совпадает программная по аспекту, но разная по знаку. Эффективны в совместном труде и решении задач.",
    metadata: { symmetric: true, beneficence: "productive" },
  },
  {
    kind: "intertype_relation",
    slug: "mirage",
    name: "Миражные",
    description:
      "Поверхностное взаимопонимание, расслабляют, но не двигают вперёд. Хороши для отдыха.",
    metadata: { symmetric: true, beneficence: "comfortable" },
  },
  {
    kind: "intertype_relation",
    slug: "semi-duality",
    name: "Полудуальные",
    description:
      "Половина дуальной комплементарности. Приятно, но не глубокое дополнение.",
    metadata: { symmetric: true, beneficence: "comfortable" },
  },
  {
    kind: "intertype_relation",
    slug: "kindred",
    name: "Родственные",
    description:
      "Одинаковая программная, но разные творческие. Лёгкое начальное «узнавание» с быстрым осознанием расхождения в подходах.",
    metadata: { symmetric: true, beneficence: "neutral" },
  },
  {
    kind: "intertype_relation",
    slug: "quasi-identity",
    name: "Квазитождественные",
    description:
      "Программная одного — на роли (3-й) другого. Иллюзия родства разрушается при глубоком разговоре.",
    metadata: { symmetric: true, beneficence: "neutral" },
  },
  {
    kind: "intertype_relation",
    slug: "conflict",
    name: "Конфликтные",
    description:
      "Программная одного — на болевой (4-й) другого. Худшее напряжение, бесконечные взаимные ранения по ТНС.",
    metadata: { symmetric: true, beneficence: "destructive" },
  },
  {
    kind: "intertype_relation",
    slug: "super-ego",
    name: "Суперэго",
    description:
      "Программная одного — на ролевой (3-й) другого. Восхищение издалека, дискомфорт при сближении.",
    metadata: { symmetric: true, beneficence: "tense" },
  },
  {
    kind: "intertype_relation",
    slug: "contrary",
    name: "Полная противоположность",
    description:
      "Все аспекты в перевернутых функциях. Дальняя дистанция комфортна, близкая — труднопереносима.",
    metadata: { symmetric: true, beneficence: "tense" },
  },
  {
    kind: "intertype_relation",
    slug: "request-sender",
    name: "Социальный заказ (заказчик)",
    description:
      "Асимметричное отношение: заказчик передаёт «социальный заказ» подзаказному. Заказчик чувствует превосходство.",
    metadata: { symmetric: false, role: "sender", pair: "request" },
  },
  {
    kind: "intertype_relation",
    slug: "request-receiver",
    name: "Социальный заказ (подзаказный)",
    description:
      "Подзаказный находится под влиянием заказчика, ловит его сигналы как важные. Стремится оправдать ожидания.",
    metadata: { symmetric: false, role: "receiver", pair: "request" },
  },
  {
    kind: "intertype_relation",
    slug: "audit-sender",
    name: "Социальная ревизия (ревизор)",
    description:
      "Ревизор воздействует на болевую подревизного. Со стороны ревизора отношение кажется «нормальным», подревизного — давит.",
    metadata: { symmetric: false, role: "auditor", pair: "audit" },
  },
  {
    kind: "intertype_relation",
    slug: "audit-receiver",
    name: "Социальная ревизия (подревизный)",
    description:
      "Подревизный находится под прицельной критикой ревизора по болевой. Самые травматичные асимметричные отношения.",
    metadata: { symmetric: false, role: "auditee", pair: "audit" },
  },
];

const REININ: ObjectSeed[] = [
  {
    kind: "dichotomy",
    slug: "extraversion-introversion",
    name: "Экстраверсия / Интроверсия",
    description:
      "Юнгианский базис: ориентация на объект (внешнее, экстраверсия) против ориентации на субъект (внутреннее, интроверсия).",
    metadata: { pole_a: "Экстраверт", pole_b: "Интроверт", jungian: true, order: 1 },
  },
  {
    kind: "dichotomy",
    slug: "rationality-irrationality",
    name: "Рациональность / Иррациональность",
    description:
      "Юнгианский базис: преобладание судящих функций (логика/этика) против преобладание воспринимающих (сенсорика/интуиция).",
    metadata: { pole_a: "Рационал", pole_b: "Иррационал", jungian: true, order: 2 },
  },
  {
    kind: "dichotomy",
    slug: "logic-ethics",
    name: "Логика / Этика",
    description:
      "Юнгианский базис: судящая ось — объективные закономерности (логика) против человеческих отношений (этика).",
    metadata: { pole_a: "Логик", pole_b: "Этик", jungian: true, order: 3 },
  },
  {
    kind: "dichotomy",
    slug: "sensorics-intuition",
    name: "Сенсорика / Интуиция",
    description:
      "Юнгианский базис: воспринимающая ось — данности и факты (сенсорика) против образов и возможностей (интуиция).",
    metadata: { pole_a: "Сенсорик", pole_b: "Интуит", jungian: true, order: 4 },
  },
  {
    kind: "dichotomy",
    slug: "statics-dynamics",
    name: "Статика / Динамика",
    description:
      "Признак Рейнина: восприятие мира как набора устойчивых форм против потока изменений.",
    metadata: { pole_a: "Статик", pole_b: "Динамик", jungian: false, order: 5 },
  },
  {
    kind: "dichotomy",
    slug: "democracy-aristocracy",
    name: "Демократия / Аристократия",
    description:
      "Признак Рейнина: оценка людей по индивидуальным качествам (демократы) против групповой принадлежности (аристократы).",
    metadata: { pole_a: "Демократ", pole_b: "Аристократ", jungian: false, order: 6 },
  },
  {
    kind: "dichotomy",
    slug: "tactics-strategy",
    name: "Тактика / Стратегия",
    description:
      "Признак Рейнина: оптимизация ближайших шагов (тактики) против удержания дальней цели (стратеги).",
    metadata: { pole_a: "Тактик", pole_b: "Стратег", jungian: false, order: 7 },
  },
  {
    kind: "dichotomy",
    slug: "constructivism-emotivism",
    name: "Конструктивизм / Эмотивизм",
    description:
      "Признак Рейнина: дистанцированно-предметная коммуникация (конструктивисты) против эмоционально-вовлечённой (эмотивисты).",
    metadata: { pole_a: "Конструктивист", pole_b: "Эмотивист", jungian: false, order: 8 },
  },
  {
    kind: "dichotomy",
    slug: "carefree-foresight",
    name: "Беспечность / Предусмотрительность",
    description:
      "Признак Рейнина: открытость к новому без подготовки (беспечные) против тщательной подготовки и опоры на опыт (предусмотрительные).",
    metadata: { pole_a: "Беспечный", pole_b: "Предусмотрительный", jungian: false, order: 9 },
  },
  {
    kind: "dichotomy",
    slug: "yielding-stubborn",
    name: "Уступчивость / Упрямство",
    description:
      "Признак Рейнина: лёгкое расставание со своим ради другого (уступчивые) против отстаивания своего (упрямые).",
    metadata: { pole_a: "Уступчивый", pole_b: "Упрямый", jungian: false, order: 10 },
  },
  {
    kind: "dichotomy",
    slug: "merry-serious",
    name: "Весёлость / Серьёзность",
    description:
      "Признак Рейнина: лёгкая эмоциональная атмосфера (весёлые) против сдержанной деловой (серьёзные).",
    metadata: { pole_a: "Весёлый", pole_b: "Серьёзный", jungian: false, order: 11 },
  },
  {
    kind: "dichotomy",
    slug: "process-result",
    name: "Процесс / Результат",
    description:
      "Признак Рейнина: погружение в текущее действие (процессники) против ориентации на конечный итог (результатёры).",
    metadata: { pole_a: "Процессник", pole_b: "Результатёр", jungian: false, order: 12 },
  },
  {
    kind: "dichotomy",
    slug: "positivism-negativism",
    name: "Позитивизм / Негативизм",
    description:
      "Признак Рейнина: акцент на наличие свойств и возможностей (позитивисты) против акцента на отсутствие и ограничения (негативисты).",
    metadata: { pole_a: "Позитивист", pole_b: "Негативист", jungian: false, order: 13 },
  },
  {
    kind: "dichotomy",
    slug: "questim-declatim",
    name: "Квестимность / Деклатимность",
    description:
      "Признак Рейнина: вопрошающая речь, отражающая поиск истины (квестимы) против утверждающей, декларативной (деклатимы).",
    metadata: { pole_a: "Квестим", pole_b: "Деклатим", jungian: false, order: 14 },
  },
  {
    kind: "dichotomy",
    slug: "judicious-resolute",
    name: "Рассудительность / Решительность",
    description:
      "Признак Рейнина: предпочтение комфорта и обдумывания (рассудительные) против быстрого мобилизованного действия (решительные).",
    metadata: { pole_a: "Рассудительный", pole_b: "Решительный", jungian: false, order: 15 },
  },
];

const ALL_OBJECTS: ObjectSeed[] = [
  ...FUNCTION_POSITIONS,
  ...TIMS,
  ...ITO,
  ...REININ,
];

const GENERATIONS_THEORY = {
  slug: "theory-of-generations",
  name: "Теория поколений признаков (Чурюмов–Шанери)",
  description:
    "Математическое расширение Классической Модели А. Формализует её через матрицы Адамара и принцип фрактальности: 4 уровня информационной организации (Дуон → Метабон → Аспектон → Социон), иерархия признаков Рейнина по поколениям, мета-признаки. Авторство: С. Чурюмов (математический каркас), дополнение Шанери (мета-вертикаль и законы наследования).",
};

const GENERATIONS_OBJECTS: ObjectSeed[] = [
  {
    kind: "custom",
    slug: "duon",
    name: "Дуон",
    description:
      "Первый фрактальный уровень (порядок 2). Базовая бинарная различительная операция: «да/нет», «свой/чужой». Два элемента.",
    metadata: { hadamardOrder: 2, fractalLevel: 1 },
  },
  {
    kind: "custom",
    slug: "metabon",
    name: "Метабон",
    description:
      "Второй фрактальный уровень (порядок 4). Четыре элемента — четыре квадры или четыре темперамента, получающиеся как тензорное произведение двух Дуонов.",
    metadata: { hadamardOrder: 4, fractalLevel: 2 },
  },
  {
    kind: "custom",
    slug: "aspecton",
    name: "Аспектон",
    description:
      "Третий фрактальный уровень (порядок 8). Восемь информационных аспектов Модели А как тензорное произведение трёх Дуонов: рацио/иррацио × экстра/интро × логика-этика/сенсорика-интуиция.",
    metadata: { hadamardOrder: 8, fractalLevel: 3 },
  },
  {
    kind: "custom",
    slug: "socion",
    name: "Социон",
    description:
      "Четвёртый фрактальный уровень (порядок 16). Шестнадцать ТИМов как тензорное произведение четырёх Дуонов. На этом уровне возникают интертипные отношения как алгебра.",
    metadata: { hadamardOrder: 16, fractalLevel: 4 },
  },
  {
    kind: "dichotomy",
    slug: "generation",
    name: "Поколение признака",
    description:
      "Иерархия итераций фрактализации. Признаки 1-го поколения (юнгианские) фундаментальнее признаков 4-го поколения. Объясняет, почему одни дихотомии «весомее» других в наблюдении.",
    metadata: { meta: true, pole_a: "Раннее поколение", pole_b: "Позднее поколение" },
  },
  {
    kind: "dichotomy",
    slug: "meta-verticality",
    name: "Мета-вертикаль (Коллективизм / Индивидуализм)",
    description:
      "Авторское дополнение Шанери: ось, отделяющая ориентированные на коллектив квадры (Альфа, Бета) от ориентированных на личность (Гамма, Дельта). Мета-признак второго порядка над квадрами.",
    metadata: { meta: true, pole_a: "Коллективизм", pole_b: "Индивидуализм" },
  },
  {
    kind: "custom",
    slug: "law-1-generation-hierarchy",
    name: "Закон 1: Иерархия поколений",
    description:
      "Признаки более раннего поколения формируют структурную основу для признаков более позднего. Юнгианские дихотомии (1-е поколение) — фундамент, признаки Рейнина — следствия и комбинации.",
    metadata: { lawNumber: 1 },
  },
  {
    kind: "custom",
    slug: "law-2-xnor-pairing",
    name: "Закон 2: Парность через XNOR",
    description:
      "Третий признак рождается из логической операции XNOR над двумя исходными. Эта закономерность объясняет неслучайную группировку признаков в квадры и связки Рейнина.",
    metadata: { lawNumber: 2 },
  },
  {
    kind: "custom",
    slug: "law-3-hamming-distance",
    name: "Закон 3: Расстояние Хэмминга",
    description:
      "Близость двух ТИМов измеряется количеством несовпадающих бинарных признаков. Шкала: 0 (тождественные) — 15 (полная противоположность). Объясняет «градации» интертипных отношений.",
    metadata: { lawNumber: 3 },
  },
  {
    kind: "custom",
    slug: "law-4-abelian-group",
    name: "Закон 4: Абелева группа социона",
    description:
      "16 ТИМов образуют абелеву группу относительно XOR над их признаковыми векторами. Любое интертипное отношение — элемент этой группы. Социон математически замкнут.",
    metadata: { lawNumber: 4 },
  },
];

export async function runExpandSeed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  console.log("[expand-seed] connecting...");
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema, casing: "snake_case" });

  const theory = await db.query.theories.findFirst({
    where: and(
      eq(schema.theories.slug, CLASSICAL_SLUG),
      eq(schema.theories.language, LANG),
    ),
  });

  if (!theory) {
    console.warn(
      `[expand-seed] theory '${CLASSICAL_SLUG}' (${LANG}) not found — skipping`,
    );
    await client.end({ timeout: 5 });
    return;
  }

  console.log(
    `[expand-seed] expanding theory '${theory.name}' (${theory.id})`,
  );

  let added = 0;
  let skipped = 0;

  for (const obj of ALL_OBJECTS) {
    const existing = await db.query.theoryObjects.findFirst({
      where: and(
        eq(schema.theoryObjects.theoryId, theory.id),
        eq(schema.theoryObjects.slug, obj.slug),
      ),
    });
    if (existing) {
      skipped++;
      continue;
    }
    await db.insert(schema.theoryObjects).values({
      theoryId: theory.id,
      kind: obj.kind,
      name: obj.name,
      slug: obj.slug,
      description: obj.description,
      metadata: obj.metadata ?? null,
      position: obj.position ?? 0,
      language: LANG,
    });
    added++;
  }

  console.log(`[expand-seed] classical: added=${added}, skipped=${skipped}`);

  // --- Generations theory (Чурюмов–Шанери) ---
  let generationsTheory = await db.query.theories.findFirst({
    where: and(
      eq(schema.theories.slug, GENERATIONS_THEORY.slug),
      eq(schema.theories.language, LANG),
    ),
  });

  if (!generationsTheory) {
    const [inserted] = await db
      .insert(schema.theories)
      .values({
        name: GENERATIONS_THEORY.name,
        slug: GENERATIONS_THEORY.slug,
        description: GENERATIONS_THEORY.description,
        language: LANG,
        isSeed: false,
        parentTheoryId: theory.id,
        ratingAvg: 0,
        authorId: null,
      })
      .returning();
    generationsTheory = inserted!;
    console.log(`[expand-seed] created generations theory ${generationsTheory.id}`);
  }

  let gAdded = 0;
  let gSkipped = 0;
  for (const obj of GENERATIONS_OBJECTS) {
    const existing = await db.query.theoryObjects.findFirst({
      where: and(
        eq(schema.theoryObjects.theoryId, generationsTheory.id),
        eq(schema.theoryObjects.slug, obj.slug),
      ),
    });
    if (existing) {
      gSkipped++;
      continue;
    }
    await db.insert(schema.theoryObjects).values({
      theoryId: generationsTheory.id,
      kind: obj.kind,
      name: obj.name,
      slug: obj.slug,
      description: obj.description,
      metadata: obj.metadata ?? null,
      position: obj.position ?? 0,
      language: LANG,
    });
    gAdded++;
  }
  console.log(`[expand-seed] generations: added=${gAdded}, skipped=${gSkipped}`);

  await client.end({ timeout: 5 });
}

const isMain =
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMain) {
  runExpandSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[expand-seed] failed:", err);
      process.exit(1);
    });
}
