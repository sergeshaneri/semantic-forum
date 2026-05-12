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
    addNew: string;
    tags: string;
    backToList: string;
  };
  theories: {
    title: string;
    subtitle: string;
    forks: string;
    fork: string;
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
    addNew: "Добавить сущность",
    tags: "Теги",
    backToList: "← Ко всем сущностям",
  },
  theories: {
    title: "Теории",
    subtitle:
      "Соционические системы и их форки. Каждая теория задаёт собственный набор объектов и их семантику.",
    forks: "форков",
    fork: "Форкнуть теорию",
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
    addNew: "Add entity",
    tags: "Tags",
    backToList: "← Back to entities",
  },
  theories: {
    title: "Theories",
    subtitle:
      "Socionic systems and their forks. Each theory defines its own objects and their semantics.",
    forks: "forks",
    fork: "Fork theory",
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
