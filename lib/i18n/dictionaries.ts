import type { Locale } from "./config";

export type Dictionary = {
  appName: string;
  tagline: string;
  nav: {
    entities: string;
    theories: string;
    login: string;
    register: string;
    profile: string;
  };
  home: {
    popularEntities: string;
    popularTheories: string;
    intro: string;
    explore: string;
    empty: string;
  };
  entities: {
    title: string;
    subtitle: string;
    kindWord: string;
    kindPerson: string;
    kindMaterial: string;
    addNew: string;
    tags: string;
    backToList: string;
  };
  notifications: {
    title: string;
    empty: string;
    markAllRead: string;
    seeAll: string;
  };
  search: {
    placeholder: string;
    title: string;
    noResults: string;
    entitiesSection: string;
    theoriesSection: string;
    publicationsSection: string;
    usersSection: string;
    questionsSection: string;
    pollsSection: string;
    groupsSection: string;
    groupPostsSection: string;
  };
  material: {
    embedUrl: string;
    embedHint: string;
    sourceUrl: string;
    sourceHint: string;
    iframeBlocked: string;
  };
  bookmarks: {
    title: string;
    empty: string;
    types: Record<
      | "entity"
      | "interpretation"
      | "theory"
      | "theory_object"
      | "publication"
      | "product",
      string
    >;
  };
  schools: {
    title: string;
    subtitle: string;
    empty: string;
    addButton: string;
    loginToAdd: string;
    name: string;
    namePlaceholder: string;
    slug: string;
    description: string;
    foundedYear: string;
    foundedPlace: string;
    foundedPlacePlaceholder: string;
    founderName: string;
    founderNamePlaceholder: string;
    founderHint: string;
    founderLabel: string;
    websiteUrl: string;
    create: string;
    literatureTitle: string;
    literatureEmpty: string;
    membersTitle: string;
    sourcesShort: string;
    membersShort: string;
    addSourceButton: string;
    addSourceConfirm: string;
    sourceKind: string;
    sourceTitle: string;
    sourceAuthors: string;
    sourceYear: string;
    sourceUrl: string;
    sourceDescription: string;
    sourceKinds: Record<
      | "book"
      | "article"
      | "paper"
      | "video"
      | "podcast"
      | "website"
      | "other",
      string
    >;
    join: string;
    leave: string;
  };
  trending: {
    title: string;
    subtitle: string;
  };
  influences: {
    title: string;
    empty: string;
    add: string;
    influencerUsername: string;
    influencerExternal: string;
    note: string;
    addExternalHelp: string;
  };
  mentor: {
    available: string;
    seeking: string;
    flagsTitle: string;
    pageTitle: string;
    pageSubtitle: string;
    tabAvailable: string;
    tabSeeking: string;
    emptyAvailable: string;
    emptySeeking: string;
    contact: string;
    contactNoChannel: string;
    karmaShort: string;
  };
  collections: {
    title: string;
    subtitle: string;
    empty: string;
    create: string;
    name: string;
    namePlaceholder: string;
    description: string;
    isPublic: string;
    privateLabel: string;
    itemsShort: string;
    backToOwner: string;
    addItemTitle: string;
    addItemHint: string;
    menu: {
      buttonTitle: string;
      heading: string;
      empty: string;
      newCollection: string;
      newPlaceholder: string;
      createButton: string;
      loginToSave: string;
      savedInCount: string;
    };
  };
  leaderboard: {
    title: string;
    subtitle: string;
    empty: string;
    ranges: Record<"week" | "month" | "all", string>;
  };
  badges: {
    title: string;
    labels: Record<
      | "first_interpretation"
      | "author_10"
      | "author_50"
      | "commentator_25"
      | "theorist"
      | "forked"
      | "voice"
      | "expert"
      | "mentor"
      | "creator",
      string
    >;
  };
  questions: {
    title: string;
    subtitle: string;
    empty: string;
    askButton: string;
    loginToAsk: string;
    loginToAnswer: string;
    formTitle: string;
    titlePlaceholder: string;
    formBody: string;
    bodyPlaceholder: string;
    bodyHint: string;
    resolved: string;
    answersWord: string;
    answersShort: string;
    answerButton: string;
    answerPlaceholder: string;
    publishAnswer: string;
    acceptButton: string;
    acceptedLabel: string;
  };
  events: {
    title: string;
    subtitle: string;
    empty: string;
    addButton: string;
    loginToAdd: string;
    formTitle: string;
    description: string;
    startAt: string;
    endAt: string;
    location: string;
    locationPlaceholder: string;
    locationUrl: string;
    publish: string;
    organizerLabel: string;
    rsvpTitle: string;
    rsvpLogin: string;
    attendeesShort: string;
    attendeesTitle: string;
    kinds: Record<"online" | "offline" | "hybrid", string>;
    rsvp: Record<"going" | "maybe" | "interested", string>;
  };
  theories: {
    title: string;
    subtitle: string;
    forks: string;
    fork: string;
    forkTitle: string;
    forkHint: string;
    parent: string;
    seed: string;
    interpretationsInTheory: string;
    objectsTitle: string;
  };
  theoryObject: {
    citations: string;
    citationsEmpty: string;
    descriptionTitle: string;
    backToTheory: string;
  };
  interpretation: {
    inTheory: string;
    onObject: string;
    by: string;
    karma: string;
    score: string;
    comments: string;
    stancePro: string;
    stanceContra: string;
    stanceNeutral: string;
    addComment: string;
    addInterpretation: string;
    filterByTheory: string;
    allTheories: string;
    loginToReply: string;
  };
  comment: {
    bodyPlaceholder: string;
    publish: string;
  };
  actions: {
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirmTitle: string;
    confirmDelete: string;
    confirmDeleteInterpretation: string;
    confirmDeleteEntity: string;
    confirmDeleteTheory: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    passwordHint: string;
    username: string;
    usernameHint: string;
    displayName: string;
    optional: string;
    submitLogin: string;
    submitRegister: string;
    or: string;
    google: string;
    haveAccount: string;
    noAccount: string;
    placeholder: string;
    invalidCredentials: string;
    registeredButLoginFailed: string;
    logout: string;
  };
  addInterpretation: {
    theory: string;
    theoryObject: string;
    body: string;
    bodyPlaceholder: string;
    bodyHint: string;
    selectTheory: string;
    selectObject: string;
    selectBoth: string;
    publish: string;
    cancel: string;
    loginToAdd: string;
  };
  addEntity: {
    button: string;
    kind: string;
    title: string;
    titleWordPlaceholder: string;
    titlePersonPlaceholder: string;
    slug: string;
    slugHint: string;
    description: string;
    descriptionPlaceholder: string;
    descriptionHint: string;
    create: string;
    loginToAdd: string;
  };
  profile: {
    joined: string;
    karma: string;
    interpretations: string;
    comments: string;
    entities: string;
    theories: string;
    followers: string;
    following: string;
    topInterpretation: string;
    controversialInterpretation: string;
    favoriteObjects: string;
    favoriteTheory: string;
    recentInterpretations: string;
    theoriesAuthored: string;
    noInterpretations: string;
    noTheories: string;
    notFound: string;
    inEntity: string;
    inTheory: string;
    forks: string;
    editButton: string;
    displayName: string;
    bio: string;
    bioPlaceholder: string;
    imageUrl: string;
    imageHint: string;
    follow: string;
    unfollow: string;
    bioEmpty: string;
    rolesTitle: string;
    rolesHint: string;
    rolesCustomPlaceholder: string;
    manageLinks: string;
    manageAffiliations: string;
    addLink: string;
    linksClose: string;
    linkLabelPlaceholder: string;
    linksTitle: string;
    schoolsLabel: string;
    schoolsHint: string;
  };
  publications: {
    title: string;
    addButton: string;
    empty: string;
    kindArticle: string;
    kindVideo: string;
    formTitle: string;
    videoUrl: string;
    videoHint: string;
    bodyArticle: string;
    bodyVideoDescription: string;
    tags: string;
    tagsPlaceholder: string;
    tagsHint: string;
    publish: string;
    backToProfile: string;
    referencesTitle: string;
    importButton: string;
    importTitle: string;
    importHint: string;
    importUrlPlaceholder: string;
    importPreview: string;
    importCreate: string;
    importedFrom: string;
  };
  products: {
    title: string;
    addButton: string;
    empty: string;
    kindLabel: string;
    formTitle: string;
    description: string;
    price: string;
    priceHint: string;
    priceOnRequest: string;
    currency: string;
    url: string;
    urlHint: string;
    publish: string;
    reviewsCount: string;
    reviewsTitle: string;
    leaveReview: string;
    yourReview: string;
    reviewPlaceholder: string;
    publishReview: string;
    loginToReview: string;
    ownerNoReview: string;
    backToProfile: string;
    kinds: Record<
      "course" | "consultation" | "book" | "typing" | "workshop" | "other",
      string
    >;
  };
  addTheory: {
    button: string;
    name: string;
    namePlaceholder: string;
    slug: string;
    description: string;
    parent: string;
    parentHint: string;
    noParent: string;
    copyObjects: string;
    create: string;
  };
  addTheoryObject: {
    button: string;
    kind: string;
    name: string;
    slug: string;
    description: string;
    create: string;
    kinds: Record<
      | "aspect"
      | "function_position"
      | "type"
      | "intertype_relation"
      | "dichotomy"
      | "custom",
      string
    >;
  };
  feed: {
    title: string;
    subtitle: string;
  };
  entityRelations: {
    title: string;
    empty: string;
    addButton: string;
    target: string;
    pickTarget: string;
    kind: string;
    customLabel: string;
    customLabelPlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    optional: string;
    create: string;
    kinds: Record<
      | "related"
      | "synonym"
      | "antonym"
      | "part_of"
      | "contains"
      | "example_of"
      | "instance_of"
      | "causes"
      | "caused_by"
      | "precedes"
      | "follows"
      | "custom",
      string
    >;
  };
  stats: {
    title: string;
    subtitle: string;
    totalsHeading: string;
    weeklyHeading: string;
    labels: Record<
      | "users"
      | "entities"
      | "theories"
      | "interpretations"
      | "comments"
      | "votes"
      | "publications"
      | "schools"
      | "questions"
      | "events"
      | "newInterpretations"
      | "newComments"
      | "newUsers",
      string
    >;
  };
  versioning: {
    history: string;
    historyEmpty: string;
    revisionLabel: string;
    by: string;
    backToCurrent: string;
    diffBetween: string;
    current: string;
    noDiff: string;
  };
  coauthors: {
    title: string;
    add: string;
    addPlaceholder: string;
    remove: string;
    empty: string;
    notFound: string;
    selfNotAllowed: string;
    added: string;
  };
  dm: {
    title: string;
    subtitle: string;
    empty: string;
    sendButton: string;
    placeholder: string;
    sendToProfile: string;
    me: string;
    backToList: string;
    threadEmpty: string;
    unreadShort: string;
    typingPlaceholder: string;
  };
  polls: {
    title: string;
    subtitle: string;
    empty: string;
    create: string;
    loginToCreate: string;
    questionLabel: string;
    questionPlaceholder: string;
    descriptionLabel: string;
    slugLabel: string;
    optionLabel: string;
    addOption: string;
    removeOption: string;
    closesAt: string;
    publish: string;
    voteHint: string;
    voteCount: string;
    voted: string;
    closed: string;
    backToList: string;
    by: string;
  };
  annotations: {
    title: string;
    helper: string;
    selectFirst: string;
    addButton: string;
    bodyPlaceholder: string;
    publish: string;
    empty: string;
    quoteLabel: string;
    findInText: string;
  };
  onboarding: {
    skip: string;
    back: string;
    next: string;
    finish: string;
    counter: string;
    explore: string;
    replay: string;
    welcomeTitle: string;
    welcomeBody: string;
    contentTitle: string;
    contentBody: string;
    contentLinkLabel: string;
    interpretationsTitle: string;
    interpretationsBody: string;
    socialTitle: string;
    socialBody: string;
    socialLinkLabel: string;
    authorTitle: string;
    authorBody: string;
    qaTitle: string;
    qaBody: string;
    advancedTitle: string;
    advancedBody: string;
    advancedLinkLabel: string;
    finalTitle: string;
    finalBody: string;
    finalCta: string;
  };
  checklist: {
    title: string;
    subtitle: string;
    hide: string;
    done: string;
    progressFmt: string;
    steps: {
      profileFilled: { label: string; cta: string };
      interpretationPublished: { label: string; cta: string };
      commented: { label: string; cta: string };
      voted: { label: string; cta: string };
      followed: { label: string; cta: string };
      authored: { label: string; cta: string };
    };
  };
  hints: {
    stance: string;
    karma: string;
    slug: string;
    citations: string;
    theoryRequired: string;
    interpretationBody: string;
  };
  apiKeys: {
    title: string;
    subtitle: string;
    docsLink: string;
    create: string;
    empty: string;
    labelLabel: string;
    labelPlaceholder: string;
    scopesLabel: string;
    expiresLabel: string;
    expiresNever: string;
    expiresDays: string;
    createButton: string;
    saveCopyTitle: string;
    saveCopyHint: string;
    copy: string;
    copied: string;
    closeNotice: string;
    revoke: string;
    revoked: string;
    revokedAt: string;
    expired: string;
    expiresOn: string;
    neverUsed: string;
    lastUsed: string;
    createdAt: string;
    scopeRead: string;
    scopeWriteContent: string;
    scopeWriteSocial: string;
    scopeAdmin: string;
    scopeReadHint: string;
    scopeWriteContentHint: string;
    scopeWriteSocialHint: string;
    scopeAdminHint: string;
    confirmRevokeTitle: string;
    confirmRevokeBody: string;
  };
  apiDocs: {
    title: string;
    intro: string;
    authTitle: string;
    authIntro: string;
    formatTitle: string;
    formatIntro: string;
    examplesTitle: string;
    examplesIntro: string;
    rateLimitTitle: string;
    rateLimitNote: string;
    safetyTitle: string;
    safetyNote: string;
    getKey: string;
  };
  tags: {
    title: string;
    notFound: string;
    entitiesSection: string;
    publicationsSection: string;
  };
  groups: {
    title: string;
    subtitle: string;
    empty: string;
    create: string;
    loginToCreate: string;
    join: string;
    leave: string;
    membersTitle: string;
    membersShort: string;
    postsShort: string;
    postsTitle: string;
    newPost: string;
    loginToPost: string;
    joinToPost: string;
    postTitle: string;
    postBody: string;
    publish: string;
    backToList: string;
    backToGroup: string;
    privateLabel: string;
    addCommentTitle: string;
    commentPlaceholder: string;
    publishComment: string;
    noComments: string;
    by: string;
    ownerLabel: string;
    formName: string;
    formNamePlaceholder: string;
    formSlug: string;
    formDescription: string;
    formPrivate: string;
  };
  health: {
    label: string;
    stub: string;
  };
};

const ru: Dictionary = {
  appName: "Соционическая Семантика",
  tagline:
    "Платформа для аргументированных интерпретаций и теорий — а не споров о ТИМах",
  nav: {
    entities: "Сущности",
    theories: "Теории",
    login: "Войти",
    register: "Регистрация",
    profile: "Профиль",
  },
  home: {
    popularEntities: "Популярные сущности",
    popularTheories: "Активные теории",
    intro:
      "Каждая интерпретация в системе обязана быть привязана к Теории. Вместо одного «правильного» ТИМа — лента аргументированных мнений, отсортированных по голосам сообщества.",
    explore: "Перейти к каталогу",
    empty: "Пока пусто.",
  },
  entities: {
    title: "Сущности",
    subtitle:
      "Слова, понятия и личности, которые сообщество интерпретирует в рамках разных теорий.",
    kindWord: "Слово",
    kindPerson: "Личность",
    kindMaterial: "Материал",
    addNew: "Добавить сущность",
    tags: "Теги",
    backToList: "← Ко всем сущностям",
  },
  notifications: {
    title: "Уведомления",
    empty: "Уведомлений пока нет.",
    markAllRead: "Прочитать все",
    seeAll: "Все уведомления →",
  },
  search: {
    placeholder: "Поиск...",
    title: "Поиск",
    noResults: "Ничего не найдено.",
    entitiesSection: "Сущности",
    theoriesSection: "Теории",
    publicationsSection: "Публикации",
    usersSection: "Люди",
    questionsSection: "Вопросы",
    pollsSection: "Опросы",
    groupsSection: "Группы",
    groupPostsSection: "Посты в группах",
  },
  material: {
    embedUrl: "Ссылка для встраивания (embed URL)",
    embedHint:
      "YouTube, Vimeo или любая публичная страница. Для статьи это может быть ссылка на исходник, для видео — на ролик.",
    sourceUrl: "Ссылка на источник",
    sourceHint: "Где это опубликовано в оригинале.",
    iframeBlocked: "Источник не разрешил встраивание. Открой по ссылке выше.",
  },
  bookmarks: {
    title: "Закладки",
    empty: "Пока нет закладок. Жми на 🔖 рядом с материалом, чтобы сохранить.",
    types: {
      entity: "Сущность",
      interpretation: "Интерпретация",
      theory: "Теория",
      theory_object: "Объект теории",
      publication: "Публикация",
      product: "Продукт",
    },
  },
  schools: {
    title: "Школы",
    subtitle:
      "Соционические школы и их традиции. Описание подходов, ключевые авторы, список литературы и источники.",
    empty: "Школ пока нет.",
    addButton: "Создать школу",
    loginToAdd: "Войди чтобы создать школу",
    name: "Название",
    namePlaceholder: "Школа гуманитарной соционики, Информационная физика...",
    slug: "Slug (для URL)",
    description: "Описание подхода и истории",
    foundedYear: "Год основания",
    foundedPlace: "Место",
    foundedPlacePlaceholder: "Киев, Москва...",
    founderName: "Основатель",
    founderNamePlaceholder: "А. Аугустинавичюте, В. Гуленко...",
    founderHint:
      "Имя основателя как текст. Если основатель — пользователь платформы, он может присоединиться через 'Я отсюда'.",
    founderLabel: "Основатель",
    websiteUrl: "Сайт школы",
    create: "Создать",
    literatureTitle: "Литература и источники",
    literatureEmpty: "Источников пока нет.",
    membersTitle: "Представители",
    sourcesShort: "источ.",
    membersShort: "учас.",
    addSourceButton: "Добавить источник",
    addSourceConfirm: "Добавить",
    sourceKind: "Тип",
    sourceTitle: "Название",
    sourceAuthors: "Авторы",
    sourceYear: "Год",
    sourceUrl: "Ссылка",
    sourceDescription: "Краткое описание",
    sourceKinds: {
      book: "Книга",
      article: "Статья",
      paper: "Научная работа",
      video: "Видео",
      podcast: "Подкаст",
      website: "Сайт",
      other: "Другое",
    },
    join: "Я отсюда",
    leave: "Покинуть",
  },
  trending: {
    title: "В тренде",
    subtitle: "Топ-интерпретации последних 7 дней.",
  },
  influences: {
    title: "Кто на меня повлиял",
    empty: "Пока никого не указано.",
    add: "Добавить влияние",
    influencerUsername: "Username пользователя платформы",
    influencerExternal: "Или имя внешнего автора (например, классик)",
    note: "Комментарий (как именно повлиял)",
    addExternalHelp:
      "Если указан внешний автор — он не будет связан с аккаунтом, только текст.",
  },
  mentor: {
    available: "Я могу менторить",
    seeking: "Ищу ментора",
    flagsTitle: "Менторство",
    pageTitle: "Менторство",
    pageSubtitle:
      "Найди ментора или предложи свою помощь. Менторы и ищущие отмечают это в настройках профиля.",
    tabAvailable: "Доступны",
    tabSeeking: "Ищут",
    emptyAvailable: "Пока никто не открыл менторство.",
    emptySeeking: "Пока никто не ищет ментора.",
    contact: "Связаться",
    contactNoChannel: "Связь через профиль",
    karmaShort: "карма",
  },
  collections: {
    title: "Коллекции",
    subtitle:
      "Курируемые подборки — собирай сущности, теории, статьи и продукты в тематические списки.",
    empty: "Коллекций пока нет. Создай первую.",
    create: "Создать коллекцию",
    name: "Название",
    namePlaceholder: "Лучшие интерпретации про БИ",
    description: "Описание",
    isPublic: "Публичная (видна всем)",
    privateLabel: "Приватная",
    itemsShort: "элем.",
    backToOwner: "← К автору",
    addItemTitle: "В коллекцию",
    addItemHint: "Выбери одну из своих коллекций или создай новую.",
    menu: {
      buttonTitle: "В коллекцию",
      heading: "Сохранить в коллекцию",
      empty: "У тебя пока нет коллекций.",
      newCollection: "+ Новая коллекция",
      newPlaceholder: "Название новой коллекции",
      createButton: "Создать",
      loginToSave: "Войди, чтобы сохранять",
      savedInCount: "сохранено в",
    },
  },
  leaderboard: {
    title: "Рейтинг",
    subtitle: "Топ пользователей по карме за период.",
    empty: "Пока нет голосов в этом периоде.",
    ranges: {
      week: "Неделя",
      month: "Месяц",
      all: "Всё время",
    },
  },
  badges: {
    title: "Бейджи",
    labels: {
      first_interpretation: "Первый шаг",
      author_10: "Автор × 10",
      author_50: "Автор × 50",
      commentator_25: "Комментатор × 25",
      theorist: "Теоретик",
      forked: "Школа форков",
      voice: "Голос сообщества",
      expert: "Эксперт",
      mentor: "Ментор",
      creator: "Создатель",
    },
  },
  questions: {
    title: "Вопросы",
    subtitle: "Задай вопрос сообществу. Лучшие ответы поднимаются голосами, автор вопроса может принять один как «решающий».",
    empty: "Вопросов пока нет.",
    askButton: "Задать вопрос",
    loginToAsk: "Войди чтобы задать вопрос",
    loginToAnswer: "Войди чтобы ответить",
    formTitle: "Заголовок вопроса",
    titlePlaceholder: "Как отличить БИ от БЛ в проявлении у личности?",
    formBody: "Текст вопроса",
    bodyPlaceholder: "Опиши контекст и что именно тебя интересует...",
    bodyHint: "Markdown + цитирования [[Сущность]] работают.",
    resolved: "Решён",
    answersWord: "ответов",
    answersShort: "отв.",
    answerButton: "Ответить",
    answerPlaceholder: "Развёрнутый ответ с обоснованием...",
    publishAnswer: "Опубликовать ответ",
    acceptButton: "Принять как решение",
    acceptedLabel: "Принят",
  },
  events: {
    title: "События",
    subtitle: "Митапы, вебинары, воркшопы. RSVP помогает оценить аудиторию.",
    empty: "Предстоящих событий пока нет.",
    addButton: "Создать событие",
    loginToAdd: "Войди чтобы добавить",
    formTitle: "Название",
    description: "Описание",
    startAt: "Начало",
    endAt: "Конец (опц.)",
    location: "Место",
    locationPlaceholder: "Москва, Москва-Сити, 5 этаж",
    locationUrl: "Ссылка (Zoom / карта)",
    publish: "Опубликовать",
    organizerLabel: "Организатор",
    rsvpTitle: "Твой ответ",
    rsvpLogin: "Войди чтобы откликнуться",
    attendeesShort: "уч.",
    attendeesTitle: "Участники",
    kinds: {
      online: "Онлайн",
      offline: "Оффлайн",
      hybrid: "Гибрид",
    },
    rsvp: {
      going: "Иду",
      maybe: "Возможно",
      interested: "Интересно",
    },
  },
  theories: {
    title: "Теории",
    subtitle:
      "Соционические системы и их форки. Каждая теория задаёт собственный набор объектов и их семантику.",
    forks: "форков",
    fork: "Форкнуть",
    forkTitle: "Создать форк",
    forkHint:
      "Создаст копию теории со всеми её объектами под твоим авторством. Сможешь править описания и добавлять свои объекты.",
    parent: "Родительская теория",
    seed: "Сид",
    interpretationsInTheory: "интерпретаций в этой теории",
    objectsTitle: "Объекты теории",
  },
  theoryObject: {
    citations: "Что говорят классики",
    citationsEmpty: "Цитаты пока не добавлены.",
    descriptionTitle: "Описание в этой теории",
    backToTheory: "← К теории",
  },
  interpretation: {
    inTheory: "в теории",
    onObject: "на объекте",
    by: "от",
    karma: "карма",
    score: "очков",
    comments: "комментариев",
    stancePro: "Поддержка",
    stanceContra: "Опровержение",
    stanceNeutral: "Уточнение",
    addComment: "Ответить",
    addInterpretation: "Добавить интерпретацию",
    filterByTheory: "Фильтр по теории",
    allTheories: "Все теории",
    loginToReply: "Войди чтобы ответить",
  },
  comment: {
    bodyPlaceholder: "Аргумент в поддержку, опровержение или уточнение...",
    publish: "Опубликовать",
  },
  actions: {
    edit: "редактировать",
    delete: "удалить",
    save: "Сохранить",
    cancel: "Отмена",
    confirmTitle: "Подтверди удаление",
    confirmDelete: "Удалить?",
    confirmDeleteInterpretation: "Удалить интерпретацию вместе со всеми комментариями?",
    confirmDeleteEntity:
      "Удалить сущность? Нельзя если на ней есть интерпретации других авторов.",
    confirmDeleteTheory:
      "Удалить теорию? Нельзя если на ней есть интерпретации других авторов.",
  },
  auth: {
    loginTitle: "Войти",
    loginSubtitle: "Введите email и пароль или используйте Google.",
    registerTitle: "Регистрация",
    registerSubtitle: "Создайте аккаунт, чтобы публиковать интерпретации.",
    email: "Email",
    password: "Пароль",
    passwordHint: "Минимум 8 символов.",
    username: "Username",
    usernameHint: "Латиница, цифры и _, 3–32 символа.",
    displayName: "Имя для отображения",
    optional: "необязательно",
    submitLogin: "Войти",
    submitRegister: "Создать аккаунт",
    or: "или",
    google: "Войти через Google",
    haveAccount: "Уже есть аккаунт?",
    noAccount: "Нет аккаунта?",
    placeholder: "",
    invalidCredentials: "Неверный email или пароль",
    registeredButLoginFailed:
      "Аккаунт создан, но войти не удалось. Попробуй на странице входа.",
    logout: "Выйти",
  },
  addInterpretation: {
    theory: "Теория",
    theoryObject: "Объект теории",
    body: "Аргументация",
    bodyPlaceholder:
      "Объясни почему эта сущность относится к выбранному объекту теории...",
    bodyHint: "Минимум 20 символов. Опирайся на семантику теории.",
    selectTheory: "выбери теорию",
    selectObject: "выбери объект",
    selectBoth: "Выбери теорию и объект",
    publish: "Опубликовать",
    cancel: "Отмена",
    loginToAdd: "Войди чтобы добавить интерпретацию",
  },
  addEntity: {
    button: "Добавить сущность",
    kind: "Тип",
    title: "Название",
    titleWordPlaceholder: "Например: Эмпатия",
    titlePersonPlaceholder: "Например: Достоевский",
    slug: "Slug (для URL)",
    slugHint:
      "Латиница, цифры и дефисы. Автоматически генерируется из названия, можно поправить.",
    description: "Вики-описание",
    descriptionPlaceholder:
      "Нейтральное определение, без соционической интерпретации (она идёт отдельно через теории)...",
    descriptionHint: "Минимум 20 символов. Базовый смысл без типажа.",
    create: "Создать",
    loginToAdd: "Войди чтобы добавить сущность",
  },
  profile: {
    joined: "с нами с",
    karma: "карма",
    interpretations: "интерпретаций",
    comments: "комментариев",
    entities: "сущностей",
    theories: "теорий",
    followers: "подписчиков",
    following: "подписок",
    topInterpretation: "Топ-интерпретация",
    controversialInterpretation: "Самая спорная",
    favoriteObjects: "Любимые объекты теории",
    favoriteTheory: "Любимая теория",
    recentInterpretations: "Недавние интерпретации",
    theoriesAuthored: "Авторские теории",
    noInterpretations: "Пока нет интерпретаций.",
    noTheories: "Авторских теорий пока нет.",
    notFound: "Пользователь не найден.",
    inEntity: "о сущности",
    inTheory: "в теории",
    forks: "форков",
    editButton: "Редактировать профиль",
    displayName: "Имя для отображения",
    bio: "О себе",
    bioPlaceholder: "Расскажи о своих интересах в соционике, своей школе, любимых теориях...",
    imageUrl: "URL аватара",
    imageHint: "Ссылка на картинку. Загрузка файлов появится позже.",
    follow: "Подписаться",
    unfollow: "Отписаться",
    bioEmpty: "Биография не заполнена.",
    rolesTitle: "Роли",
    rolesHint:
      "Выбери одну или несколько. Можно добавить своё. До 8 ролей.",
    rolesCustomPlaceholder: "Своя роль...",
    manageLinks: "Управлять ссылками",
    manageAffiliations: "Школы и менторство",
    addLink: "Добавить",
    linksClose: "Готово",
    linkLabelPlaceholder: "Подпись (например: Мой канал)",
    linksTitle: "Ссылки",
    schoolsLabel: "Школы, к которым отношусь",
    schoolsHint: "Можно выбрать несколько. Школы создаются на /schools.",
  },
  publications: {
    title: "Публикации",
    addButton: "Опубликовать",
    empty: "Публикаций пока нет.",
    kindArticle: "Статья",
    kindVideo: "Видео",
    formTitle: "Название",
    videoUrl: "Ссылка на видео",
    videoHint: "YouTube, Vimeo, RuTube — любая публичная ссылка.",
    bodyArticle: "Текст статьи",
    bodyVideoDescription: "Описание видео",
    tags: "Теги",
    tagsPlaceholder: "социалика, типирование, бэ",
    tagsHint: "Через запятую. Создаются автоматически.",
    publish: "Опубликовать",
    backToProfile: "← К автору",
    referencesTitle: "Связано с",
    importButton: "Импорт по URL",
    importTitle: "Импорт публикации по ссылке",
    importHint:
      "Substack-пост, публичный пост в Telegram-канале или любая HTML-страница с og:title. Создаст черновик публикации, который можно отредактировать.",
    importUrlPlaceholder: "https://example.substack.com/p/article-slug",
    importPreview: "Получить превью",
    importCreate: "Создать публикацию",
    importedFrom: "Импортировано из",
  },
  products: {
    title: "Услуги и продукты",
    addButton: "Добавить продукт",
    empty: "Продуктов пока нет.",
    kindLabel: "Тип",
    formTitle: "Название",
    description: "Описание",
    price: "Цена",
    priceHint:
      "В рублях/долларах и т.д. Десятичные через точку. Оставь пустым для «по запросу».",
    priceOnRequest: "По запросу",
    currency: "Валюта",
    url: "Ссылка для заказа",
    urlHint: "Сайт записи / форма / мессенджер.",
    publish: "Опубликовать",
    reviewsCount: "отзывов",
    reviewsTitle: "Отзывы",
    leaveReview: "Оставить отзыв",
    yourReview: "Твой отзыв",
    reviewPlaceholder: "Опиши свой опыт работы с этим автором/продуктом...",
    publishReview: "Опубликовать отзыв",
    loginToReview: "Войди чтобы оставить отзыв",
    ownerNoReview: "Свой продукт нельзя оценивать.",
    backToProfile: "← К автору",
    kinds: {
      course: "Курс",
      consultation: "Консультация",
      book: "Книга",
      typing: "Типирование",
      workshop: "Воркшоп",
      other: "Другое",
    },
  },
  addTheory: {
    button: "Создать теорию",
    name: "Название теории",
    namePlaceholder: "Например: Информационная физика",
    slug: "Slug (для URL)",
    description: "Описание теории",
    parent: "Родительская теория",
    parentHint:
      "Если форкаешь существующую — выбери её. Иначе создаётся теория с нуля.",
    noParent: "С нуля (без родителя)",
    copyObjects: "Скопировать объекты родительской теории при создании",
    create: "Создать",
  },
  addTheoryObject: {
    button: "Добавить объект",
    kind: "Тип объекта",
    name: "Название",
    slug: "Slug",
    description: "Описание",
    create: "Создать",
    kinds: {
      custom: "Произвольный",
      aspect: "Аспект",
      function_position: "Функция-позиция",
      type: "Тип (ТИМ)",
      intertype_relation: "Интертипное отношение",
      dichotomy: "Признак / дихотомия",
    },
  },
  feed: {
    title: "Лента подписок",
    subtitle: "Последние интерпретации авторов, на которых ты подписан.",
  },
  entityRelations: {
    title: "Связи",
    empty: "Связей пока нет.",
    addButton: "Добавить связь",
    target: "Связать с",
    pickTarget: "Выбери сущность",
    kind: "Тип связи",
    customLabel: "Своя подпись",
    customLabelPlaceholder: "например: учитель, преемник, символизирует...",
    description: "Описание связи",
    descriptionPlaceholder: "Поясни в одной строке",
    optional: "необязательно",
    create: "Связать",
    kinds: {
      related: "связан с",
      synonym: "синоним",
      antonym: "антоним",
      part_of: "часть",
      contains: "включает",
      example_of: "пример",
      instance_of: "экземпляр",
      causes: "вызывает",
      caused_by: "вызвано",
      precedes: "предшествует",
      follows: "следует за",
      custom: "своё",
    },
  },
  stats: {
    title: "Статистика платформы",
    subtitle: "Открытые цифры по содержанию и активности сообщества.",
    totalsHeading: "Всего",
    weeklyHeading: "За последнюю неделю",
    labels: {
      users: "Пользователи",
      entities: "Сущности",
      theories: "Теории",
      interpretations: "Интерпретации",
      comments: "Комментарии",
      votes: "Голоса",
      publications: "Публикации",
      schools: "Школы",
      questions: "Вопросы",
      events: "События",
      newInterpretations: "Новых интерпретаций",
      newComments: "Новых комментариев",
      newUsers: "Новых пользователей",
    },
  },
  versioning: {
    history: "История правок",
    historyEmpty: "Версий пока нет — это первая редакция.",
    revisionLabel: "Версия",
    by: "автор",
    backToCurrent: "← К текущей версии",
    diffBetween: "Изменения",
    current: "Текущая",
    noDiff: "Изменений нет.",
  },
  coauthors: {
    title: "Соавторы",
    add: "Добавить соавтора",
    addPlaceholder: "username",
    remove: "убрать",
    empty: "Соавторов пока нет.",
    notFound: "Пользователь не найден",
    selfNotAllowed: "Себя добавлять не нужно",
    added: "Добавлен",
  },
  dm: {
    title: "Сообщения",
    subtitle: "Личные диалоги один на один.",
    empty: "Диалогов пока нет.",
    sendButton: "Отправить",
    placeholder: "Написать сообщение...",
    sendToProfile: "Написать",
    me: "ты",
    backToList: "← К списку",
    threadEmpty: "В этом диалоге ещё нет сообщений. Напиши первым.",
    unreadShort: "новых",
    typingPlaceholder: "Сообщение...",
  },
  onboarding: {
    skip: "Пропустить",
    back: "← Назад",
    next: "Далее →",
    finish: "Готово",
    counter: "Шаг {current} из {total}",
    explore: "Открыть",
    replay: "Открыть тур заново",
    welcomeTitle: "Добро пожаловать в Соционическую Семантику",
    welcomeBody:
      "Это платформа, где сообщество обсуждает соционику через аргументы, а не через споры о ТИМах. Сейчас покажу, что здесь есть — займёт минуту.",
    contentTitle: "Сущности и Теории — основа контента",
    contentBody:
      "Сущность — это слово, личность или материал (текст, видео). Теория — это система объектов (аспектов, ТИМов, отношений). Любая интерпретация всегда привязана к конкретной теории, и теорию можно форкнуть, как репозиторий на GitHub.",
    contentLinkLabel: "Посмотреть каталог сущностей",
    interpretationsTitle: "Интерпретации, голосование, цитаты",
    interpretationsBody:
      "Интерпретация — это твой аргумент: «эта сущность относится к такому-то объекту такой-то теории, потому что…». Сообщество голосует за или против. В тексте можно использовать [[Эмпатия]], [[#intuition-of-feelings]], [[@username]] — они автоматически превращаются в ссылки.",
    socialTitle: "Социальный слой",
    socialBody:
      "Комментарии с позицией (Поддержка / Опровержение / Уточнение), голосование за комментарии и треды на 3 уровня. Подписки, личные сообщения, группы по интересам (Reddit-стиль), коллекции, лайв-опросы — всё на месте.",
    socialLinkLabel: "Заглянуть в группы",
    authorTitle: "Авторские инструменты",
    authorBody:
      "Можешь публиковать статьи и видео с тегами и перекрёстными ссылками, продавать курсы / консультации с отзывами, проводить опросы, создавать группы. У каждой публикации — версионирование и соавторы.",
    qaTitle: "Q&A, события, школы",
    qaBody:
      "Задавай вопросы и принимай «решающие» ответы. Создавай события с RSVP. Указывай свою школу и кто на тебя повлиял — твой профиль становится частью карты соционической мысли.",
    advancedTitle: "Продвинутое",
    advancedBody:
      "Аннотации к фрагментам материалов в стиле Genius (выдели текст → прикрепи заметку). Embed-виджеты для встраивания карточек на внешние сайты. API-ключи для CLI и AI-агентов — можно автоматически наполнять платформу контентом.",
    advancedLinkLabel: "API-документация",
    finalTitle: "Поехали",
    finalBody:
      "Тур можно открыть заново из меню в шапке. Начни с заполнения профиля — это поможет сообществу понять твой контекст.",
    finalCta: "К профилю",
  },
  checklist: {
    title: "Освойся на платформе",
    subtitle: "Несколько простых шагов, чтобы влиться:",
    hide: "Скрыть",
    done: "Готово! Спасибо, что ты с нами.",
    progressFmt: "{done} из {total}",
    steps: {
      profileFilled: {
        label: "Заполни профиль — био или роли + аватар",
        cta: "К профилю",
      },
      interpretationPublished: {
        label: "Опубликуй первую интерпретацию",
        cta: "К сущностям",
      },
      commented: {
        label: "Прокомментируй чью-то интерпретацию",
        cta: "Открыть сущности",
      },
      voted: {
        label: "Проголосуй за интерпретацию или комментарий",
        cta: "Открыть тренды",
      },
      followed: {
        label: "Подпишись хотя бы на одного автора",
        cta: "Лидерборд",
      },
      authored: {
        label: "Создай свой контент: статью, вопрос, опрос или группу",
        cta: "Публикации",
      },
    },
  },
  hints: {
    stance: "Поддержка усиливает аргумент, Опровержение оспаривает, Уточнение добавляет нюанс без оценки.",
    karma: "Сумма голосов «за» − «против» по всем твоим интерпретациям и комментариям. Растёт когда сообщество ценит твою аргументацию.",
    slug: "Часть URL: латиница, цифры, дефисы. Автоматически генерируется из заголовка, можно поправить вручную.",
    citations: "В тексте можно ссылаться: [[Эмпатия]] на сущность, [[#intuition-of-feelings]] на объект теории, [[@username]] на пользователя. Алиасы: [[Эмпатия|любовь]].",
    theoryRequired: "Каждая интерпретация привязана к конкретной теории и её объекту — так одно слово может иметь разные толкования в разных системах.",
    interpretationBody: "Минимум 20 символов. Поддерживается markdown и цитирование двойными скобками. Опирайся на семантику выбранной теории.",
  },
  apiKeys: {
    title: "API-ключи",
    subtitle:
      "Bearer-токены для CLI, ботов и AI-агентов. Действуют как ты — генерируй с минимально нужными правами.",
    docsLink: "Документация API →",
    create: "Создать ключ",
    empty: "Ключей пока нет.",
    labelLabel: "Подпись (для себя)",
    labelPlaceholder: "Бот для импорта статей",
    scopesLabel: "Права",
    expiresLabel: "Срок жизни",
    expiresNever: "Без срока",
    expiresDays: "дней",
    createButton: "Сгенерировать",
    saveCopyTitle: "Сохрани ключ сейчас — позже его не показать",
    saveCopyHint:
      "После закрытия диалога секрет уже не увидеть. Если потерял — отзови и создай новый.",
    copy: "Скопировать",
    copied: "Скопировано",
    closeNotice: "Я сохранил ключ",
    revoke: "Отозвать",
    revoked: "Отозван",
    revokedAt: "Отозван",
    expired: "Истёк",
    expiresOn: "Истекает",
    neverUsed: "Не использовался",
    lastUsed: "Последний раз",
    createdAt: "Создан",
    scopeRead: "Чтение",
    scopeWriteContent: "Запись: контент",
    scopeWriteSocial: "Запись: соц. действия",
    scopeAdmin: "Управление ключами",
    scopeReadHint: "Получать данные через GET (где применимо).",
    scopeWriteContentHint:
      "Создавать сущности, теории, публикации, посты, опросы.",
    scopeWriteSocialHint:
      "Голоса, комментарии, подписки, RSVP, закладки.",
    scopeAdminHint:
      "Управлять API-ключами. По соображениям безопасности недоступно через сам API-ключ — только из браузера.",
    confirmRevokeTitle: "Отозвать ключ?",
    confirmRevokeBody:
      "После отзыва ключ перестанет работать сразу. Всех агентов, что им пользуются, нужно будет переподключить.",
  },
  apiDocs: {
    title: "HTTP API",
    intro:
      "Все мутации платформы доступны как tRPC-эндпоинты на /api/trpc/<router>.<method>. Аутентификация — Bearer-токеном из настроек.",
    authTitle: "Аутентификация",
    authIntro:
      "Сгенерируй ключ в настройках и передавай его в заголовке Authorization. Ключ показывается ОДИН раз — сохрани сразу.",
    formatTitle: "Формат запросов",
    formatIntro:
      "tRPC использует superjson. Тело — JSON с ключом 'json' (и опционально 'meta' для дат / Map). Ответ — то же. Для query-параметров используй ?input=<json-encoded>. Для мутаций — POST с JSON-телом.",
    examplesTitle: "Примеры",
    examplesIntro:
      "Создать сущность, добавить интерпретацию, найти что-то — самые частые операции для агентов.",
    rateLimitTitle: "Лимиты",
    rateLimitNote:
      "Сейчас явных rate-limit нет, но ведём счётчик lastUsedAt. Если поток запросов нарушит работу платформы — ключ может быть отозван.",
    safetyTitle: "Безопасность",
    safetyNote:
      "Не публикуй ключ в открытых репозиториях. Создавай отдельный ключ для каждого бота / агента. Если есть подозрение на утечку — отзови немедленно. Управление ключами доступно только из браузера, не через сам API-ключ.",
    getKey: "Получить ключ →",
  },
  annotations: {
    title: "Аннотации к материалу",
    helper:
      "Выдели фрагмент текста выше и нажми «Добавить заметку», чтобы привязать комментарий к конкретному месту.",
    selectFirst: "Сначала выдели фрагмент в тексте.",
    addButton: "Добавить заметку к выделенному",
    bodyPlaceholder: "Твоя интерпретация или вопрос об этом фрагменте...",
    publish: "Опубликовать",
    empty: "Аннотаций пока нет. Будь первым.",
    quoteLabel: "Фрагмент",
    findInText: "Найти в тексте",
  },
  tags: {
    title: "Тег",
    notFound: "Ничего с таким тегом не найдено.",
    entitiesSection: "Сущности",
    publicationsSection: "Публикации",
  },
  groups: {
    title: "Группы",
    subtitle:
      "Сообщества по интересам. Reddit-стиль: вступай, публикуй посты, обсуждай.",
    empty: "Групп пока нет.",
    create: "Создать группу",
    loginToCreate: "Войди чтобы создать",
    join: "Вступить",
    leave: "Покинуть",
    membersTitle: "Участники",
    membersShort: "уч.",
    postsShort: "постов",
    postsTitle: "Посты",
    newPost: "Новый пост",
    loginToPost: "Войди чтобы постить",
    joinToPost: "Вступи в группу чтобы публиковать",
    postTitle: "Заголовок",
    postBody: "Текст поста",
    publish: "Опубликовать",
    backToList: "← Ко всем группам",
    backToGroup: "← К группе",
    privateLabel: "Приватная",
    addCommentTitle: "Комментарии",
    commentPlaceholder: "Что думаешь?",
    publishComment: "Отправить",
    noComments: "Пока нет комментариев.",
    by: "автор",
    ownerLabel: "Владелец",
    formName: "Название",
    formNamePlaceholder: "Например: Гуманитарная соционика",
    formSlug: "Slug",
    formDescription: "Описание",
    formPrivate: "Приватная (только по приглашениям)",
  },
  polls: {
    title: "Опросы",
    subtitle: "Сообщество голосует. Хороший способ потипировать через коллективный разум.",
    empty: "Опросов пока нет.",
    create: "Создать опрос",
    loginToCreate: "Войди чтобы создать",
    questionLabel: "Вопрос",
    questionPlaceholder: "Какой ТИМ у этого персонажа?",
    descriptionLabel: "Контекст (опц.)",
    slugLabel: "Slug",
    optionLabel: "Вариант",
    addOption: "+ Добавить вариант",
    removeOption: "удалить",
    closesAt: "Закрыть до (опц.)",
    publish: "Опубликовать",
    voteHint: "Свой голос можно поменять.",
    voteCount: "голосов",
    voted: "Голос учтён",
    closed: "Голосование закрыто",
    backToList: "← Ко всем опросам",
    by: "автор",
  },
  health: {
    label: "Состояние сервера",
    stub: "Stub-режим: данные из mock-слоя, БД не подключена.",
  },
};

const en: Dictionary = {
  appName: "Socionics Semantics",
  tagline:
    "A platform for reasoned interpretations and theories — not arguments about types",
  nav: {
    entities: "Entities",
    theories: "Theories",
    login: "Sign in",
    register: "Sign up",
    profile: "Profile",
  },
  home: {
    popularEntities: "Popular entities",
    popularTheories: "Active theories",
    intro:
      "Every interpretation must be tied to a Theory. Instead of one 'correct' type, you get a feed of arguments ranked by community votes.",
    explore: "Browse catalog",
    empty: "Empty for now.",
  },
  entities: {
    title: "Entities",
    subtitle:
      "Words, concepts, and people the community interprets through different theories.",
    kindWord: "Word",
    kindPerson: "Person",
    kindMaterial: "Material",
    addNew: "Add entity",
    tags: "Tags",
    backToList: "← Back to entities",
  },
  notifications: {
    title: "Notifications",
    empty: "No notifications yet.",
    markAllRead: "Mark all read",
    seeAll: "See all →",
  },
  search: {
    placeholder: "Search...",
    title: "Search",
    noResults: "No results.",
    entitiesSection: "Entities",
    theoriesSection: "Theories",
    publicationsSection: "Publications",
    usersSection: "People",
    questionsSection: "Questions",
    pollsSection: "Polls",
    groupsSection: "Groups",
    groupPostsSection: "Group posts",
  },
  material: {
    embedUrl: "Embed URL",
    embedHint:
      "YouTube, Vimeo, or any public page. For articles — original link; for videos — the video itself.",
    sourceUrl: "Source URL",
    sourceHint: "Where this is originally published.",
    iframeBlocked: "The source did not allow embedding. Open via the link.",
  },
  bookmarks: {
    title: "Bookmarks",
    empty: "No bookmarks yet. Click 🔖 next to anything to save it.",
    types: {
      entity: "Entity",
      interpretation: "Interpretation",
      theory: "Theory",
      theory_object: "Theory object",
      publication: "Publication",
      product: "Product",
    },
  },
  schools: {
    title: "Schools",
    subtitle:
      "Socionic schools and traditions. Approach, key authors, literature and sources.",
    empty: "No schools yet.",
    addButton: "Create school",
    loginToAdd: "Sign in to create a school",
    name: "Name",
    namePlaceholder: "Humanitarian socionics, Information physics...",
    slug: "Slug",
    description: "Approach and history",
    foundedYear: "Founded year",
    foundedPlace: "Place",
    foundedPlacePlaceholder: "Kiev, Moscow...",
    founderName: "Founder",
    founderNamePlaceholder: "A. Augustinavichyute, V. Gulenko...",
    founderHint: "Founder as text. If they are a platform user, they can join.",
    founderLabel: "Founder",
    websiteUrl: "Website",
    create: "Create",
    literatureTitle: "Literature and sources",
    literatureEmpty: "No sources yet.",
    membersTitle: "Members",
    sourcesShort: "src",
    membersShort: "mem",
    addSourceButton: "Add source",
    addSourceConfirm: "Add",
    sourceKind: "Kind",
    sourceTitle: "Title",
    sourceAuthors: "Authors",
    sourceYear: "Year",
    sourceUrl: "URL",
    sourceDescription: "Short description",
    sourceKinds: {
      book: "Book",
      article: "Article",
      paper: "Paper",
      video: "Video",
      podcast: "Podcast",
      website: "Website",
      other: "Other",
    },
    join: "I'm from here",
    leave: "Leave",
  },
  trending: {
    title: "Trending",
    subtitle: "Top interpretations from the last 7 days.",
  },
  influences: {
    title: "Who influenced me",
    empty: "Nobody listed yet.",
    add: "Add influence",
    influencerUsername: "Username of a platform user",
    influencerExternal: "Or name of an external author (e.g. classic)",
    note: "How they influenced you",
    addExternalHelp:
      "External authors are stored as plain text, not linked to an account.",
  },
  mentor: {
    available: "I can mentor",
    seeking: "Seeking a mentor",
    flagsTitle: "Mentorship",
    pageTitle: "Mentorship",
    pageSubtitle:
      "Find a mentor or offer your help. Mentors and seekers flag this in profile settings.",
    tabAvailable: "Available",
    tabSeeking: "Seeking",
    emptyAvailable: "Nobody is offering mentorship yet.",
    emptySeeking: "Nobody is seeking a mentor yet.",
    contact: "Contact",
    contactNoChannel: "Contact via profile",
    karmaShort: "karma",
  },
  collections: {
    title: "Collections",
    subtitle:
      "Curated lists — group entities, theories, articles, products into themed sets.",
    empty: "No collections yet. Create your first.",
    create: "Create collection",
    name: "Name",
    namePlaceholder: "Best interpretations of white intuition",
    description: "Description",
    isPublic: "Public (visible to all)",
    privateLabel: "Private",
    itemsShort: "items",
    backToOwner: "← Back to author",
    addItemTitle: "Add to collection",
    addItemHint: "Pick one of your collections or create new.",
    menu: {
      buttonTitle: "Add to collection",
      heading: "Save to a collection",
      empty: "You don't have any collections yet.",
      newCollection: "+ New collection",
      newPlaceholder: "New collection name",
      createButton: "Create",
      loginToSave: "Sign in to save",
      savedInCount: "saved in",
    },
  },
  leaderboard: {
    title: "Leaderboard",
    subtitle: "Top users by karma over time range.",
    empty: "No votes yet in this range.",
    ranges: {
      week: "Week",
      month: "Month",
      all: "All time",
    },
  },
  badges: {
    title: "Badges",
    labels: {
      first_interpretation: "First step",
      author_10: "Author × 10",
      author_50: "Author × 50",
      commentator_25: "Commenter × 25",
      theorist: "Theorist",
      forked: "Forker",
      voice: "Community voice",
      expert: "Expert",
      mentor: "Mentor",
      creator: "Creator",
    },
  },
  questions: {
    title: "Questions",
    subtitle: "Ask the community. Best answers float to the top by votes, the asker can mark one as accepted.",
    empty: "No questions yet.",
    askButton: "Ask a question",
    loginToAsk: "Sign in to ask",
    loginToAnswer: "Sign in to answer",
    formTitle: "Question title",
    titlePlaceholder: "How to tell BI from BL in person's behavior?",
    formBody: "Question body",
    bodyPlaceholder: "Describe context and what you actually want to know...",
    bodyHint: "Markdown + [[Entity]] citations work.",
    resolved: "Resolved",
    answersWord: "answers",
    answersShort: "ans.",
    answerButton: "Answer",
    answerPlaceholder: "Reasoned answer with grounding...",
    publishAnswer: "Publish answer",
    acceptButton: "Accept as solution",
    acceptedLabel: "Accepted",
  },
  events: {
    title: "Events",
    subtitle: "Meetups, webinars, workshops. RSVP shows interest.",
    empty: "No upcoming events.",
    addButton: "Create event",
    loginToAdd: "Sign in to add",
    formTitle: "Title",
    description: "Description",
    startAt: "Start",
    endAt: "End (opt.)",
    location: "Location",
    locationPlaceholder: "Moscow, Moscow City, floor 5",
    locationUrl: "Link (Zoom / map)",
    publish: "Publish",
    organizerLabel: "Organizer",
    rsvpTitle: "Your reply",
    rsvpLogin: "Sign in to RSVP",
    attendeesShort: "att.",
    attendeesTitle: "Attendees",
    kinds: {
      online: "Online",
      offline: "Offline",
      hybrid: "Hybrid",
    },
    rsvp: {
      going: "Going",
      maybe: "Maybe",
      interested: "Interested",
    },
  },
  theories: {
    title: "Theories",
    subtitle:
      "Socionic systems and their forks. Each theory defines its own objects and their semantics.",
    forks: "forks",
    fork: "Fork",
    forkTitle: "Create a fork",
    forkHint:
      "Creates a copy of the theory with all its objects under your authorship. You can edit descriptions and add your own objects.",
    parent: "Parent theory",
    seed: "Seed",
    interpretationsInTheory: "interpretations in this theory",
    objectsTitle: "Theory objects",
  },
  theoryObject: {
    citations: "What the classics say",
    citationsEmpty: "No citations yet.",
    descriptionTitle: "Description in this theory",
    backToTheory: "← Back to theory",
  },
  interpretation: {
    inTheory: "in theory",
    onObject: "on object",
    by: "by",
    karma: "karma",
    score: "points",
    comments: "comments",
    stancePro: "Support",
    stanceContra: "Refute",
    stanceNeutral: "Clarify",
    addComment: "Reply",
    addInterpretation: "Add interpretation",
    filterByTheory: "Filter by theory",
    allTheories: "All theories",
    loginToReply: "Sign in to reply",
  },
  comment: {
    bodyPlaceholder: "Argument supporting, refuting, or clarifying...",
    publish: "Publish",
  },
  actions: {
    edit: "edit",
    delete: "delete",
    save: "Save",
    cancel: "Cancel",
    confirmTitle: "Confirm delete",
    confirmDelete: "Delete?",
    confirmDeleteInterpretation:
      "Delete this interpretation and all its comments?",
    confirmDeleteEntity:
      "Delete entity? Not allowed if other people have interpretations on it.",
    confirmDeleteTheory:
      "Delete theory? Not allowed if other people have interpretations in it.",
  },
  auth: {
    loginTitle: "Sign in",
    loginSubtitle: "Enter email and password or use Google.",
    registerTitle: "Sign up",
    registerSubtitle: "Create an account to publish interpretations.",
    email: "Email",
    password: "Password",
    passwordHint: "Minimum 8 characters.",
    username: "Username",
    usernameHint: "Letters, digits, and _, 3–32 characters.",
    displayName: "Display name",
    optional: "optional",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    or: "or",
    google: "Sign in with Google",
    haveAccount: "Already have an account?",
    noAccount: "No account?",
    placeholder: "",
    invalidCredentials: "Wrong email or password",
    registeredButLoginFailed:
      "Account created, but sign-in failed. Try the sign-in page.",
    logout: "Sign out",
  },
  addInterpretation: {
    theory: "Theory",
    theoryObject: "Theory object",
    body: "Argument",
    bodyPlaceholder:
      "Explain why this entity relates to the chosen theory object...",
    bodyHint: "Minimum 20 characters. Ground it in the theory's semantics.",
    selectTheory: "pick a theory",
    selectObject: "pick an object",
    selectBoth: "Pick both theory and object",
    publish: "Publish",
    cancel: "Cancel",
    loginToAdd: "Sign in to add an interpretation",
  },
  addEntity: {
    button: "Add entity",
    kind: "Kind",
    title: "Title",
    titleWordPlaceholder: "e.g. Empathy",
    titlePersonPlaceholder: "e.g. Dostoevsky",
    slug: "Slug (URL part)",
    slugHint:
      "Lowercase letters, digits, and hyphens. Auto-generated from title.",
    description: "Wiki description",
    descriptionPlaceholder:
      "Neutral definition, without a socionic interpretation (those go separately via theories)...",
    descriptionHint: "Minimum 20 characters. Plain meaning, no typing.",
    create: "Create",
    loginToAdd: "Sign in to add an entity",
  },
  profile: {
    joined: "joined",
    karma: "karma",
    interpretations: "interpretations",
    comments: "comments",
    entities: "entities",
    theories: "theories",
    followers: "followers",
    following: "following",
    topInterpretation: "Top interpretation",
    controversialInterpretation: "Most controversial",
    favoriteObjects: "Favorite theory objects",
    favoriteTheory: "Favorite theory",
    recentInterpretations: "Recent interpretations",
    theoriesAuthored: "Authored theories",
    noInterpretations: "No interpretations yet.",
    noTheories: "No authored theories yet.",
    notFound: "User not found.",
    inEntity: "on entity",
    inTheory: "in theory",
    forks: "forks",
    editButton: "Edit profile",
    displayName: "Display name",
    bio: "About",
    bioPlaceholder:
      "Tell about your interests in socionics, your school, favorite theories...",
    imageUrl: "Avatar URL",
    imageHint: "Link to an image. File upload will come later.",
    follow: "Follow",
    unfollow: "Unfollow",
    bioEmpty: "Bio not filled in.",
    rolesTitle: "Roles",
    rolesHint: "Pick one or more. You can add a custom one. Up to 8.",
    rolesCustomPlaceholder: "Custom role...",
    manageLinks: "Manage links",
    manageAffiliations: "Schools and mentorship",
    addLink: "Add",
    linksClose: "Done",
    linkLabelPlaceholder: "Label (e.g. My channel)",
    linksTitle: "Links",
    schoolsLabel: "Schools I belong to",
    schoolsHint: "Pick any number. Schools are created on /schools.",
  },
  publications: {
    title: "Publications",
    addButton: "Publish",
    empty: "No publications yet.",
    kindArticle: "Article",
    kindVideo: "Video",
    formTitle: "Title",
    videoUrl: "Video URL",
    videoHint: "YouTube, Vimeo — any public link.",
    bodyArticle: "Article body",
    bodyVideoDescription: "Video description",
    tags: "Tags",
    tagsPlaceholder: "socionics, typing, white-ethics",
    tagsHint: "Comma-separated. Created automatically.",
    publish: "Publish",
    backToProfile: "← Back to author",
    referencesTitle: "Linked with",
    importButton: "Import from URL",
    importTitle: "Import publication from a URL",
    importHint:
      "A Substack post, a public Telegram channel post, or any HTML page with og:title. Creates a draft publication you can edit.",
    importUrlPlaceholder: "https://example.substack.com/p/article-slug",
    importPreview: "Fetch preview",
    importCreate: "Create publication",
    importedFrom: "Imported from",
  },
  products: {
    title: "Services and products",
    addButton: "Add product",
    empty: "No products yet.",
    kindLabel: "Kind",
    formTitle: "Title",
    description: "Description",
    price: "Price",
    priceHint:
      "Decimal point allowed. Leave empty for 'on request'.",
    priceOnRequest: "On request",
    currency: "Currency",
    url: "Booking URL",
    urlHint: "Booking page, form, or messenger.",
    publish: "Publish",
    reviewsCount: "reviews",
    reviewsTitle: "Reviews",
    leaveReview: "Leave a review",
    yourReview: "Your review",
    reviewPlaceholder: "Describe your experience with this product...",
    publishReview: "Publish review",
    loginToReview: "Sign in to leave a review",
    ownerNoReview: "Can't review your own product.",
    backToProfile: "← Back to author",
    kinds: {
      course: "Course",
      consultation: "Consultation",
      book: "Book",
      typing: "Typing session",
      workshop: "Workshop",
      other: "Other",
    },
  },
  addTheory: {
    button: "Create theory",
    name: "Theory name",
    namePlaceholder: "e.g. Information Physics",
    slug: "Slug (URL part)",
    description: "Description",
    parent: "Parent theory",
    parentHint:
      "If you're forking an existing one — pick it. Otherwise the theory is created from scratch.",
    noParent: "From scratch (no parent)",
    copyObjects: "Copy parent theory's objects on create",
    create: "Create",
  },
  addTheoryObject: {
    button: "Add object",
    kind: "Object kind",
    name: "Name",
    slug: "Slug",
    description: "Description",
    create: "Create",
    kinds: {
      custom: "Custom",
      aspect: "Aspect",
      function_position: "Function position",
      type: "Type (TIM)",
      intertype_relation: "Intertype relation",
      dichotomy: "Dichotomy",
    },
  },
  feed: {
    title: "Following feed",
    subtitle: "Latest interpretations from people you follow.",
  },
  entityRelations: {
    title: "Relations",
    empty: "No relations yet.",
    addButton: "Add relation",
    target: "Link with",
    pickTarget: "Pick an entity",
    kind: "Relation type",
    customLabel: "Custom label",
    customLabelPlaceholder: "e.g. teacher, successor, symbolizes...",
    description: "Relation note",
    descriptionPlaceholder: "Explain in one line",
    optional: "optional",
    create: "Link",
    kinds: {
      related: "related to",
      synonym: "synonym",
      antonym: "antonym",
      part_of: "part of",
      contains: "contains",
      example_of: "example of",
      instance_of: "instance of",
      causes: "causes",
      caused_by: "caused by",
      precedes: "precedes",
      follows: "follows",
      custom: "custom",
    },
  },
  stats: {
    title: "Platform stats",
    subtitle: "Open numbers about the content and activity of the community.",
    totalsHeading: "Total",
    weeklyHeading: "Last 7 days",
    labels: {
      users: "Users",
      entities: "Entities",
      theories: "Theories",
      interpretations: "Interpretations",
      comments: "Comments",
      votes: "Votes",
      publications: "Publications",
      schools: "Schools",
      questions: "Questions",
      events: "Events",
      newInterpretations: "New interpretations",
      newComments: "New comments",
      newUsers: "New users",
    },
  },
  versioning: {
    history: "Revision history",
    historyEmpty: "No revisions yet — this is the first edit.",
    revisionLabel: "Revision",
    by: "by",
    backToCurrent: "← Back to current",
    diffBetween: "Changes",
    current: "Current",
    noDiff: "No changes.",
  },
  coauthors: {
    title: "Co-authors",
    add: "Add co-author",
    addPlaceholder: "username",
    remove: "remove",
    empty: "No co-authors yet.",
    notFound: "User not found",
    selfNotAllowed: "Can't add yourself",
    added: "Added",
  },
  dm: {
    title: "Messages",
    subtitle: "Private one-on-one conversations.",
    empty: "No conversations yet.",
    sendButton: "Send",
    placeholder: "Write a message...",
    sendToProfile: "Message",
    me: "you",
    backToList: "← Back",
    threadEmpty: "No messages here yet. Be the first.",
    unreadShort: "new",
    typingPlaceholder: "Message...",
  },
  onboarding: {
    skip: "Skip",
    back: "← Back",
    next: "Next →",
    finish: "Done",
    counter: "Step {current} of {total}",
    explore: "Open",
    replay: "Replay the tour",
    welcomeTitle: "Welcome to Socionics Semantics",
    welcomeBody:
      "A platform where the community discusses socionics through arguments instead of fighting over TIMs. Here's what's available — takes a minute.",
    contentTitle: "Entities and Theories — the content base",
    contentBody:
      "An Entity is a word, person, or material (text/video). A Theory is a system of objects (aspects, TIMs, relations). Every interpretation is tied to a specific theory, and theories can be forked like GitHub repos.",
    contentLinkLabel: "Browse entities",
    interpretationsTitle: "Interpretations, voting, citations",
    interpretationsBody:
      "An interpretation is your argument: 'this entity belongs to this object of this theory, because…'. The community votes. In the text you can use [[Empathy]], [[#intuition-of-feelings]], [[@username]] — they auto-link.",
    socialTitle: "Social layer",
    socialBody:
      "Comments with a stance (Support / Refute / Clarify), comment voting, threads up to 3 levels. Follows, DMs, interest groups (Reddit-style), collections, live polls — all in.",
    socialLinkLabel: "Check out groups",
    authorTitle: "Author tools",
    authorBody:
      "Publish articles and videos with tags and cross-references, sell courses / consultations with reviews, run polls, create groups. Each publication has revisions and co-authors.",
    qaTitle: "Q&A, events, schools",
    qaBody:
      "Ask questions and accept 'solving' answers. Create events with RSVP. Mark your school and who influenced you — your profile becomes part of the socionics knowledge graph.",
    advancedTitle: "Advanced",
    advancedBody:
      "Genius-style annotations on material fragments (select text → attach a note). Embed widgets for third-party sites. API keys for CLIs and AI agents — automate content creation.",
    advancedLinkLabel: "API docs",
    finalTitle: "Let's go",
    finalBody:
      "You can replay the tour from the header menu. Start with filling out your profile — context helps the community understand your takes.",
    finalCta: "To profile",
  },
  checklist: {
    title: "Get oriented",
    subtitle: "A few simple steps to ramp up:",
    hide: "Hide",
    done: "All done! Thanks for being here.",
    progressFmt: "{done} of {total}",
    steps: {
      profileFilled: {
        label: "Fill out your profile — bio or roles + avatar",
        cta: "To profile",
      },
      interpretationPublished: {
        label: "Publish your first interpretation",
        cta: "Browse entities",
      },
      commented: {
        label: "Comment on someone's interpretation",
        cta: "Open entities",
      },
      voted: {
        label: "Vote on an interpretation or comment",
        cta: "See trending",
      },
      followed: {
        label: "Follow at least one author",
        cta: "Leaderboard",
      },
      authored: {
        label: "Create your own content: article, question, poll, or group",
        cta: "Publications",
      },
    },
  },
  hints: {
    stance: "Support reinforces, Refute challenges, Clarify adds nuance without judgment.",
    karma: "Sum of upvotes minus downvotes across all your interpretations and comments. Grows when the community values your reasoning.",
    slug: "Part of the URL: letters, digits, hyphens. Auto-generated from the title, editable.",
    citations: "In text you can link: [[Empathy]] to an entity, [[#intuition-of-feelings]] to a theory object, [[@username]] to a user. Aliases: [[Empathy|love]].",
    theoryRequired: "Every interpretation is tied to a specific theory and object — so one word can have different readings across systems.",
    interpretationBody: "Minimum 20 chars. Markdown and double-bracket citations supported. Ground your argument in the chosen theory's semantics.",
  },
  apiKeys: {
    title: "API keys",
    subtitle:
      "Bearer tokens for CLIs, bots and AI agents. They act as you — grant the minimum scopes you need.",
    docsLink: "API docs →",
    create: "Create key",
    empty: "No keys yet.",
    labelLabel: "Label (for yourself)",
    labelPlaceholder: "Article import bot",
    scopesLabel: "Scopes",
    expiresLabel: "Expires in",
    expiresNever: "Never",
    expiresDays: "days",
    createButton: "Generate",
    saveCopyTitle: "Save this key now — you won't see it again",
    saveCopyHint:
      "Once you close this dialog, the secret is gone. If you lose it, revoke and create a new one.",
    copy: "Copy",
    copied: "Copied",
    closeNotice: "I saved the key",
    revoke: "Revoke",
    revoked: "Revoked",
    revokedAt: "Revoked",
    expired: "Expired",
    expiresOn: "Expires",
    neverUsed: "Never used",
    lastUsed: "Last used",
    createdAt: "Created",
    scopeRead: "Read",
    scopeWriteContent: "Write: content",
    scopeWriteSocial: "Write: social",
    scopeAdmin: "Manage keys",
    scopeReadHint: "Fetch data via GET endpoints (where supported).",
    scopeWriteContentHint:
      "Create entities, theories, publications, posts, polls.",
    scopeWriteSocialHint: "Votes, comments, follows, RSVPs, bookmarks.",
    scopeAdminHint:
      "Manage API keys. For security, not honored from API keys themselves — browser only.",
    confirmRevokeTitle: "Revoke this key?",
    confirmRevokeBody:
      "Once revoked the key stops working immediately. Any agent using it will need a new key.",
  },
  apiDocs: {
    title: "HTTP API",
    intro:
      "All platform mutations are exposed as tRPC endpoints at /api/trpc/<router>.<method>. Authentication is via a Bearer token from settings.",
    authTitle: "Authentication",
    authIntro:
      "Generate a key in settings and pass it via the Authorization header. The full secret is shown ONCE — save it then.",
    formatTitle: "Request format",
    formatIntro:
      "tRPC uses superjson. Body is JSON with a 'json' key (and optional 'meta' for Dates / Maps). For queries, encode inputs as ?input=<json-encoded>. For mutations, POST with JSON body.",
    examplesTitle: "Examples",
    examplesIntro:
      "Create an entity, add an interpretation, run a search — the common moves for agents.",
    rateLimitTitle: "Rate limits",
    rateLimitNote:
      "No hard limits yet, but we track lastUsedAt. Abusive traffic will get the key revoked.",
    safetyTitle: "Safety",
    safetyNote:
      "Don't publish keys in open repos. Use one key per bot. Revoke immediately on suspected leak. Key management is browser-only — not callable via an API key itself.",
    getKey: "Get a key →",
  },
  annotations: {
    title: "Material annotations",
    helper:
      "Select a fragment above and click 'Add note' to attach a comment to that exact place.",
    selectFirst: "Select a fragment in the text first.",
    addButton: "Annotate selection",
    bodyPlaceholder: "Your interpretation or question about this fragment...",
    publish: "Publish",
    empty: "No annotations yet. Be the first.",
    quoteLabel: "Quote",
    findInText: "Find in text",
  },
  tags: {
    title: "Tag",
    notFound: "Nothing found for this tag.",
    entitiesSection: "Entities",
    publicationsSection: "Publications",
  },
  groups: {
    title: "Groups",
    subtitle:
      "Interest communities, Reddit-style — join, post, discuss.",
    empty: "No groups yet.",
    create: "Create group",
    loginToCreate: "Sign in to create",
    join: "Join",
    leave: "Leave",
    membersTitle: "Members",
    membersShort: "members",
    postsShort: "posts",
    postsTitle: "Posts",
    newPost: "New post",
    loginToPost: "Sign in to post",
    joinToPost: "Join the group to post",
    postTitle: "Title",
    postBody: "Post body",
    publish: "Publish",
    backToList: "← Back to groups",
    backToGroup: "← Back to group",
    privateLabel: "Private",
    addCommentTitle: "Comments",
    commentPlaceholder: "What do you think?",
    publishComment: "Send",
    noComments: "No comments yet.",
    by: "by",
    ownerLabel: "Owner",
    formName: "Name",
    formNamePlaceholder: "e.g. Humanitarian socionics",
    formSlug: "Slug",
    formDescription: "Description",
    formPrivate: "Private (invite only)",
  },
  polls: {
    title: "Polls",
    subtitle: "The community votes — great for typing-by-crowd.",
    empty: "No polls yet.",
    create: "Create poll",
    loginToCreate: "Sign in to create",
    questionLabel: "Question",
    questionPlaceholder: "What TIM is this character?",
    descriptionLabel: "Context (opt.)",
    slugLabel: "Slug",
    optionLabel: "Option",
    addOption: "+ Add option",
    removeOption: "remove",
    closesAt: "Closes at (opt.)",
    publish: "Publish",
    voteHint: "You can change your vote.",
    voteCount: "votes",
    voted: "Vote recorded",
    closed: "Voting closed",
    backToList: "← Back to polls",
    by: "by",
  },
  health: {
    label: "Server status",
    stub: "Stub mode: mock data, DB not connected.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
