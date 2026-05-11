import type { Locale } from "@/lib/i18n/config";

export type MockUser = {
  id: string;
  username: string;
  name: string;
  karma: number;
};

export type MockTheoryObject = {
  id: string;
  theoryId: string;
  kind:
    | "aspect"
    | "function_position"
    | "type"
    | "intertype_relation"
    | "dichotomy"
    | "custom";
  name: string;
  slug: string;
  description: string;
  metadata?: Record<string, unknown>;
  language: Locale;
};

export type MockTheory = {
  id: string;
  authorId: string | null;
  parentTheoryId: string | null;
  name: string;
  slug: string;
  description: string;
  language: Locale;
  isSeed: boolean;
  ratingAvg: number;
  forkCount: number;
  createdAt: string;
};

export type MockEntity = {
  id: string;
  kind: "word" | "person";
  title: string;
  slug: string;
  descriptionWiki: string;
  language: Locale;
  createdBy: string | null;
  createdAt: string;
  tags: string[];
};

export type MockInterpretation = {
  id: string;
  entityId: string;
  theoryId: string;
  theoryObjectId: string;
  authorId: string;
  body: string;
  language: Locale;
  votesUp: number;
  votesDown: number;
  score: number;
  createdAt: string;
  comments: MockComment[];
};

export type MockComment = {
  id: string;
  parentCommentId: string | null;
  authorId: string;
  body: string;
  stance: "pro" | "contra" | "neutral";
  votesUp: number;
  votesDown: number;
  createdAt: string;
};

export type MockCitation = {
  id: string;
  theoryObjectId: string;
  authorName: string;
  sourceTitle: string;
  quoteText: string;
  pageRef?: string;
  language: Locale;
};

export const mockUsers: MockUser[] = [
  { id: "u1", username: "ivan_methodologist", name: "Иван Методологист", karma: 142 },
  { id: "u2", username: "anna_sociotyper", name: "Анна Социотипер", karma: 87 },
  { id: "u3", username: "alex_skeptic", name: "Алексей Скептик", karma: 53 },
  { id: "u4", username: "maria_classics", name: "Мария Классик", karma: 21 },
];

const CLASSICAL_THEORY_ID = "th-classical-ru";

export const mockTheories: MockTheory[] = [
  {
    id: CLASSICAL_THEORY_ID,
    authorId: null,
    parentTheoryId: null,
    name: "Классическая Модель А",
    slug: "classical-model-a",
    description:
      "Каноническая теория информационного метаболизма по Аугустинавичюте. 8 аспектов информации, распределённые по 8 функциям-позициям, образуют 16 типов информационного метаболизма (ТИМов).",
    language: "ru",
    isSeed: true,
    ratingAvg: 92,
    forkCount: 8,
    createdAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "th-gulenko-ru",
    authorId: "u1",
    parentTheoryId: CLASSICAL_THEORY_ID,
    name: "Гуманитарная соционика (Гуленко)",
    slug: "gulenko-humanitarian",
    description:
      "Форк классической теории с акцентом на коммуникативные модели, формы мышления и подтипы. Переопределяет семантику ЧЭ и БЭ.",
    language: "ru",
    isSeed: false,
    ratingAvg: 71,
    forkCount: 3,
    createdAt: "2025-02-14T10:00:00Z",
  },
  {
    id: "th-info-physics-ru",
    authorId: "u2",
    parentTheoryId: CLASSICAL_THEORY_ID,
    name: "Информационная физика",
    slug: "info-physics",
    description:
      "Авторская теория, переосмысливающая аспекты как операторы над пространством-временем-материей. Добавляет новый объект «мета-аспект».",
    language: "ru",
    isSeed: false,
    ratingAvg: 58,
    forkCount: 1,
    createdAt: "2025-04-02T10:00:00Z",
  },
];

export const mockTheoryObjects: MockTheoryObject[] = [
  {
    id: "to-bi",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Белая интуиция (БИ)",
    slug: "white-intuition",
    description:
      "Аспект восприятия времени, динамики, прогноза, развития процессов. Воспринимает события как разворачивающиеся последовательности.",
    metadata: { symbol: "БИ", traditional: "интуиция времени", color: "#7c5cff" },
    language: "ru",
  },
  {
    id: "to-chi",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Чёрная интуиция (ЧИ)",
    slug: "black-intuition",
    description:
      "Аспект восприятия возможностей, потенциала, сущности явлений. Различает суть в обход поверхности.",
    metadata: { symbol: "ЧИ", traditional: "интуиция возможностей", color: "#1a1a1a" },
    language: "ru",
  },
  {
    id: "to-bl",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Белая логика (БЛ)",
    slug: "white-logic",
    description:
      "Аспект структурного мышления, иерархий, системных связей и формальных правил.",
    metadata: { symbol: "БЛ", traditional: "структурная логика", color: "#3b82f6" },
    language: "ru",
  },
  {
    id: "to-chl",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Чёрная логика (ЧЛ)",
    slug: "black-logic",
    description:
      "Аспект делового мышления, эффективности, технологий, действий, направленных на конкретный результат.",
    metadata: { symbol: "ЧЛ", traditional: "деловая логика", color: "#0f172a" },
    language: "ru",
  },
  {
    id: "to-be",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Белая этика (БЭ)",
    slug: "white-ethics",
    description:
      "Аспект отношений между людьми, морали, дистанции, привязанности. Оценивает «правильно/неправильно» в межличностном смысле.",
    metadata: { symbol: "БЭ", traditional: "этика отношений", color: "#fb7185" },
    language: "ru",
  },
  {
    id: "to-che",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Чёрная этика (ЧЭ)",
    slug: "black-ethics",
    description:
      "Аспект эмоциональной энергии, страстей, экспрессии, способности заражать настроением и вовлекать.",
    metadata: { symbol: "ЧЭ", traditional: "этика эмоций", color: "#ef4444" },
    language: "ru",
  },
  {
    id: "to-bs",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Белая сенсорика (БС)",
    slug: "white-sensorics",
    description:
      "Аспект ощущений, комфорта, телесного состояния, гармонии в среде.",
    metadata: { symbol: "БС", traditional: "сенсорика ощущений", color: "#10b981" },
    language: "ru",
  },
  {
    id: "to-chs",
    theoryId: CLASSICAL_THEORY_ID,
    kind: "aspect",
    name: "Чёрная сенсорика (ЧС)",
    slug: "black-sensorics",
    description:
      "Аспект воли, силы, территории, способности удерживать пространство и навязывать форму.",
    metadata: { symbol: "ЧС", traditional: "волевая сенсорика", color: "#7c2d12" },
    language: "ru",
  },
];

export const mockEntities: MockEntity[] = [
  {
    id: "e-time",
    kind: "word",
    title: "Время",
    slug: "vremya",
    descriptionWiki:
      "Категория, обозначающая последовательность и длительность процессов. В соционике традиционно связывается с интуитивными аспектами восприятия динамики и развития.",
    language: "ru",
    createdBy: "u1",
    createdAt: "2025-03-01T10:00:00Z",
    tags: ["метафизика", "восприятие"],
  },
  {
    id: "e-svoboda",
    kind: "word",
    title: "Свобода",
    slug: "svoboda",
    descriptionWiki:
      "Понятие, обозначающее отсутствие принуждения и наличие выбора. Активно интерпретируется через различные аспекты — от ЧИ (свобода как открытость возможностей) до ЧС (свобода как отстаивание территории).",
    language: "ru",
    createdBy: "u2",
    createdAt: "2025-03-12T10:00:00Z",
    tags: ["этика", "философия"],
  },
  {
    id: "e-kant",
    kind: "person",
    title: "Иммануил Кант",
    slug: "immanuel-kant",
    descriptionWiki:
      "Немецкий философ (1724–1804), автор «Критики чистого разума». Один из самых обсуждаемых в типировании персонажей — спорят, преобладает ли у него БЛ как программная или ЧИ.",
    language: "ru",
    createdBy: "u1",
    createdAt: "2025-02-20T10:00:00Z",
    tags: ["философ", "XVIII век"],
  },
  {
    id: "e-dostoevsky",
    kind: "person",
    title: "Фёдор Достоевский",
    slug: "fyodor-dostoevsky",
    descriptionWiki:
      "Русский писатель (1821–1881). Ему дано имя одного из ТИМов. Большинство интерпретаторов сходятся на сильной БЭ, но дебаты о его реальном ТИМе продолжаются.",
    language: "ru",
    createdBy: "u3",
    createdAt: "2025-02-25T10:00:00Z",
    tags: ["писатель", "XIX век"],
  },
  {
    id: "e-irony",
    kind: "word",
    title: "Ирония",
    slug: "ironiya",
    descriptionWiki:
      "Стилистический приём и форма мышления, основанные на расхождении буквального и подразумеваемого смысла.",
    language: "ru",
    createdBy: "u4",
    createdAt: "2025-04-10T10:00:00Z",
    tags: ["риторика", "психология"],
  },
];

export const mockInterpretations: MockInterpretation[] = [
  {
    id: "i-time-bi",
    entityId: "e-time",
    theoryId: CLASSICAL_THEORY_ID,
    theoryObjectId: "to-bi",
    authorId: "u1",
    body:
      "В рамках классической Модели А «Время» — прямое имя для аспекта БИ. Аугустинавичюте определяет БИ через восприятие изменений длительностей и предчувствие хода событий. Концепт времени в обыденном языке (длится, тянется, летит) повторяет именно эту семантику.",
    language: "ru",
    votesUp: 47,
    votesDown: 3,
    score: 44,
    createdAt: "2025-03-02T10:00:00Z",
    comments: [
      {
        id: "c-1",
        parentCommentId: null,
        authorId: "u2",
        body: "Согласна, но стоит отделить физическое время от психологического — последнее ближе к БС.",
        stance: "neutral",
        votesUp: 8,
        votesDown: 1,
        createdAt: "2025-03-03T10:00:00Z",
      },
      {
        id: "c-2",
        parentCommentId: null,
        authorId: "u3",
        body: "Не согласен. У Гуленко БИ скорее «образ будущего», а время как длительность ближе к сенсорным аспектам.",
        stance: "contra",
        votesUp: 4,
        votesDown: 12,
        createdAt: "2025-03-04T10:00:00Z",
      },
    ],
  },
  {
    id: "i-time-bs",
    entityId: "e-time",
    theoryId: CLASSICAL_THEORY_ID,
    theoryObjectId: "to-bs",
    authorId: "u3",
    body:
      "Альтернативная интерпретация: бытовое переживание времени («день тянется», «утро бодрое») коренится в телесных ощущениях, а это БС, не БИ. Чисто прогностическое значение остаётся за БИ, а само Время как переживание — БС.",
    language: "ru",
    votesUp: 19,
    votesDown: 14,
    score: 5,
    createdAt: "2025-03-05T10:00:00Z",
    comments: [],
  },
  {
    id: "i-svoboda-chi",
    entityId: "e-svoboda",
    theoryId: CLASSICAL_THEORY_ID,
    theoryObjectId: "to-chi",
    authorId: "u2",
    body:
      "Свобода как открытость возможностей — прямое ЧИ. Когда человек говорит «я свободен», он имеет в виду «передо мной открыты варианты» — оператор оценки потенциала.",
    language: "ru",
    votesUp: 31,
    votesDown: 6,
    score: 25,
    createdAt: "2025-03-13T10:00:00Z",
    comments: [
      {
        id: "c-3",
        parentCommentId: null,
        authorId: "u1",
        body: "Поддерживаю. Семантика «возможностей» здесь определяющая.",
        stance: "pro",
        votesUp: 11,
        votesDown: 0,
        createdAt: "2025-03-14T10:00:00Z",
      },
    ],
  },
  {
    id: "i-svoboda-chs",
    entityId: "e-svoboda",
    theoryId: CLASSICAL_THEORY_ID,
    theoryObjectId: "to-chs",
    authorId: "u3",
    body:
      "Политическая и экзистенциальная свобода — про границы и волю. «Свобода от» — это удержание территории, что соответствует ЧС, а не ЧИ.",
    language: "ru",
    votesUp: 22,
    votesDown: 9,
    score: 13,
    createdAt: "2025-03-15T10:00:00Z",
    comments: [],
  },
  {
    id: "i-kant-bl",
    entityId: "e-kant",
    theoryId: CLASSICAL_THEORY_ID,
    theoryObjectId: "to-bl",
    authorId: "u1",
    body:
      "У Канта программная функция — БЛ. Архитектура «Критики чистого разума» — образцовая структурная логика: категории, схемы, антиномии — это операции с системой понятий, выстроенной строго иерархически.",
    language: "ru",
    votesUp: 38,
    votesDown: 5,
    score: 33,
    createdAt: "2025-02-21T10:00:00Z",
    comments: [
      {
        id: "c-4",
        parentCommentId: null,
        authorId: "u2",
        body: "Полностью согласна. Категориальный аппарат — это БЛ в чистом виде.",
        stance: "pro",
        votesUp: 14,
        votesDown: 0,
        createdAt: "2025-02-22T10:00:00Z",
      },
    ],
  },
  {
    id: "i-kant-chi",
    entityId: "e-kant",
    theoryId: "th-gulenko-ru",
    theoryObjectId: "to-chi",
    authorId: "u3",
    body:
      "В рамках Гуманитарной соционики (Гуленко) у Канта на программе скорее ЧИ: трансцендентализм — операция различения сущности и явления, а это семантика интуиции возможностей.",
    language: "ru",
    votesUp: 16,
    votesDown: 11,
    score: 5,
    createdAt: "2025-02-28T10:00:00Z",
    comments: [],
  },
  {
    id: "i-dostoevsky-be",
    entityId: "e-dostoevsky",
    theoryId: CLASSICAL_THEORY_ID,
    theoryObjectId: "to-be",
    authorId: "u4",
    body:
      "Достоевский — мастер БЭ. Его персонажи живут в плотной сети моральных обязательств; вся динамика «Братьев Карамазовых» развёртывается в координатах «должен/не должен» по отношению к ближнему.",
    language: "ru",
    votesUp: 26,
    votesDown: 4,
    score: 22,
    createdAt: "2025-02-26T10:00:00Z",
    comments: [],
  },
];

export const mockCitations: MockCitation[] = [
  {
    id: "cit-1",
    theoryObjectId: "to-bi",
    authorName: "А. Аугустинавичюте",
    sourceTitle: "Соционика. Введение",
    quoteText:
      "Интуиция времени даёт человеку ощущение протяжённости процессов и предчувствие их завершения; она работает с длительностями, а не с моментами.",
    pageRef: "с. 47",
    language: "ru",
  },
  {
    id: "cit-2",
    theoryObjectId: "to-bi",
    authorName: "В. Гуленко",
    sourceTitle: "Менеджмент слаженной команды",
    quoteText:
      "БИ — функция предвидения и стратегического сценария; её носитель видит, как сюжет развернётся за горизонт текущей сцены.",
    language: "ru",
  },
  {
    id: "cit-3",
    theoryObjectId: "to-chi",
    authorName: "А. Аугустинавичюте",
    sourceTitle: "О дуальной природе человека",
    quoteText:
      "Чёрная интуиция различает суть в обход поверхности; она оперирует не данностью, а возможностью.",
    pageRef: "с. 23",
    language: "ru",
  },
  {
    id: "cit-4",
    theoryObjectId: "to-bl",
    authorName: "А. Аугустинавичюте",
    sourceTitle: "Соционика. Введение",
    quoteText:
      "Структурная логика организует знание в иерархию правил и определений; её сила — в формальной строгости.",
    pageRef: "с. 61",
    language: "ru",
  },
  {
    id: "cit-5",
    theoryObjectId: "to-be",
    authorName: "В. Гуленко",
    sourceTitle: "Гуманитарная соционика",
    quoteText:
      "БЭ воспринимает дистанции между людьми так же отчётливо, как сенсорик — расстояния между предметами.",
    language: "ru",
  },
];

export function findUser(id: string) {
  return mockUsers.find((u) => u.id === id) ?? null;
}

export function findTheory(id: string) {
  return mockTheories.find((t) => t.id === id) ?? null;
}

export function findTheoryBySlug(slug: string, language: Locale) {
  return (
    mockTheories.find((t) => t.slug === slug && t.language === language) ?? null
  );
}

export function findTheoryObject(id: string) {
  return mockTheoryObjects.find((o) => o.id === id) ?? null;
}

export function findTheoryObjectBySlug(theoryId: string, slug: string) {
  return (
    mockTheoryObjects.find(
      (o) => o.theoryId === theoryId && o.slug === slug,
    ) ?? null
  );
}

export function findEntity(id: string) {
  return mockEntities.find((e) => e.id === id) ?? null;
}

export function findEntityBySlug(slug: string, language: Locale) {
  return (
    mockEntities.find((e) => e.slug === slug && e.language === language) ?? null
  );
}

export function listTheoryObjects(theoryId: string) {
  return mockTheoryObjects.filter((o) => o.theoryId === theoryId);
}

export function listInterpretationsForEntity(entityId: string) {
  return mockInterpretations
    .filter((i) => i.entityId === entityId)
    .sort((a, b) => b.score - a.score);
}

export function listInterpretationsForTheory(theoryId: string) {
  return mockInterpretations
    .filter((i) => i.theoryId === theoryId)
    .sort((a, b) => b.score - a.score);
}

export function listCitationsForObject(objectId: string) {
  return mockCitations.filter((c) => c.theoryObjectId === objectId);
}
