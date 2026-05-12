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
    addLink: string;
    linksClose: string;
    linkLabelPlaceholder: string;
    linksTitle: string;
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
    addLink: "Добавить",
    linksClose: "Готово",
    linkLabelPlaceholder: "Подпись (например: Мой канал)",
    linksTitle: "Ссылки",
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
    addLink: "Add",
    linksClose: "Done",
    linkLabelPlaceholder: "Label (e.g. My channel)",
    linksTitle: "Links",
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
  health: {
    label: "Server status",
    stub: "Stub mode: mock data, DB not connected.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
