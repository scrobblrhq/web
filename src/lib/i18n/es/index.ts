import type { BaseTranslation } from "../i18n-types";

const es = {
  nav: {
    search: "Buscar",
    profile: "Perfil",
    settings: "Ajustes",
    logout: "Salir",
    login: "Entrar",
    register: "Registrarse",
  },
  functions: {
    time: {
      never: "Nunca",
      now: "Ahora mismo",
      minsAgo: "Hace {mins} minutos",
      hoursAgo: "Hace {hours} horas",
      today: "Hoy",
      yesterday: "Ayer",
      daysAgo: "Hace {days} días",
    },
  },
  // es
  common: {
    rateLimited:
      "Has superado el límite de peticiones. Espera un minuto e inténtalo de nuevo.",
  },
  scrobbler: {
    authorize: {
      title: "Autorizar aplicación",
      intro:
        "Una aplicación quiere registrar scrobbles en tu cuenta @{username}.",
      appLabel: "Aplicación (clave API)",
      accountLabel: "Cuenta",
      destinationLabel: "Después irás a",
      nextToken:
        "Al aprobar no saldrás de esta página: vuelve a la aplicación para terminar.",
      nextCallback:
        "Al aprobar, tu navegador irá a {host}. Apruébalo solo si reconoces ese sitio.",
      approve: "Aprobar",
      approving: "Aprobando…",
      cancel: "Cancelar",
      approved: "Aprobada. Ya puedes volver a la aplicación.",
      alreadyApproved: "Esta solicitud ya estaba aprobada.",
      expired:
        "Esta solicitud ha caducado. Vuelve a empezar desde la aplicación.",
    },
    error: {
      invalidRequest: "Solicitud no válida.",
      invalidCallback: "La dirección de retorno no es válida.",
      notFound: "No encontramos esa solicitud. Puede haber caducado.",
      loadFailed: "No se pudo cargar la solicitud.",
      signedOut: "Tu sesión ha caducado. Inicia sesión de nuevo.",
      approveFailed: "No se pudo aprobar la aplicación.",
    },
  },
  home: {
    meta: {
      title: "Scrobblr — Tu historial musical, tuyo",
    },
    hero: {
      badge: "Código abierto · Sin anuncios · Tuyo",
      title1: "Tu música.",
      title2: "Tu historial.",
      description:
        "Scrobblr registra cada canción que escuchas, te muestra tus estadísticas y conecta con tus amigos — sin algoritmos, sin trackers, sin distracciones.",
    },
    cta: {
      ownProfile: "Ver mi perfil",
      signup: "Crear cuenta gratis",
      login: "Iniciar sesión",
    },
    features: {
      scrobbling: {
        title: "Scrobbling automático",
        desc: "Conecta tu reproductor favorito y registra cada escucha sin esfuerzo, en tiempo real.",
      },
      stats: {
        title: "Estadísticas detalladas",
        desc: "Top artistas, top canciones, heatmap de actividad y tendencias por período.",
      },
      profiles: {
        title: "Perfiles públicos",
        desc: "Comparte lo que escuchas, sigue amigos y descubre música nueva a través de ellos.",
      },
    },
    benefits: {
      heading: "Hecho para quien ama la música",
      subtitle:
        "Todo lo que necesitas para entender tu historia musical, sin ruido.",
      item1: "Registro en tiempo real",
      item2: "Estadísticas semanales y mensuales",
      item3: "Compara con amigos",
      item4: "Sin cuenta premium",
    },
    footer: {
      brand: "Scrobblr",
      github: "GitHub",
    },
  },
  error: {
    meta: {
      titleSuffix: " — Scrobblr",
    },
    "404": "Esta página no existe.",
    "403": "No tienes acceso a esto.",
    "401": "Tienes que iniciar sesión primero.",
    generic: "Algo salió mal.",
    backHome: "← Volver al inicio",
  },
  login: {
    meta: {
      title: "Iniciar sesión — Scrobblr",
    },
    brand: "Scrobblr",
    subtitle: "Tu historial musical. Tuyo.",
    label: {
      username: "Usuario",
      password: "Contraseña",
    },
    placeholder: {
      username: "tuusuario",
      password: "••••••••",
    },
    submit: "Entrar",
    error: {
      fallback: "Error al iniciar sesión",
      emptyFields: "Completa todos los campos.",
      invalidCredentials: "Usuario o contraseña incorrectos.",
      rateLimited:
        "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
      serverError: "No se pudo conectar con el servidor",
      connectionFailed: "La web no pudo establecer conexión con el servicio de inicio de sesión. Inténtalo de nuevo más tarde.",
      appCredentials: "La API rechazó las credenciales internas de la web. Contacta al equipo de soporte.",
      apiUnavailable: "El servicio de inicio de sesión respondió con un error (HTTP {status}). Inténtalo más tarde.",
      apiRejected: "El servicio de inicio de sesión rechazó la solicitud (HTTP {status}).",
      unexpected: "Ocurrió un error inesperado al iniciar sesión. Inténtalo de nuevo.",
    },
    prompt: "¿No tienes cuenta?",
    signupLink: "Regístrate",
  },
  register: {
    meta: {
      title: "Crear cuenta — Scrobblr",
    },
    brand: "Scrobblr",
    subtitle: "Empieza a registrar lo que escuchas.",
    label: {
      username: "Usuario",
      displayName: "Nombre visible",
      email: "Email",
      emailConfirm: "Confirmar email",
      password: "Contraseña",
    },
    sublabel: {
      username: "mín. 2 caracteres, solo letras, números, - y _",
      displayName: "opcional",
      password: "mín. 8 caracteres",
    },
    placeholder: {
      username: "tuusuario",
      displayName: "Tu Nombre",
      email: "tu@email.com",
      emailConfirm: "tu@email.com",
      password: "••••••••",
    },
    submit: "Crear cuenta",
    error: {
      fallback: "Error al crear cuenta",
      emptyFields: "Completa todos los campos obligatorios.",
      usernameTooShort: "El usuario debe tener al menos 2 caracteres.",
      usernameTooLong: "El usuario no puede tener más de 32 caracteres.",
      usernameInvalidChars:
        "El usuario solo puede contener letras, números, guiones y guiones bajos.",
      passwordTooShort: "La contraseña debe incluir al menos 8 caracteres.",
      passwordTooLong: "La contraseña no puede tener más de 128 caracteres.",
      passwordInvalidChars: "La contraseña contiene caracteres no permitidos.",
      invalidEmail: "El email no es válido.",
      emailMismatch: "Los emails no coinciden.",
      conflict: "Ese nombre de usuario o email ya están en uso.",
      serverError: "No se pudo conectar con el servidor.",
      connectionFailed: "La web no pudo establecer conexión con el servicio de registro. Inténtalo de nuevo más tarde.",
      appCredentials: "La API rechazó las credenciales internas de la web. Contacta al equipo de soporte.",
      apiUnavailable: "El servicio de registro respondió con un error (HTTP {status}). Inténtalo más tarde.",
      apiRejected: "El servicio de registro rechazó la solicitud (HTTP {status}).",
      unexpected: "Ocurrió un error inesperado al crear la cuenta. Inténtalo de nuevo.",
    },
    prompt: "¿Ya tienes cuenta?",
    loginLink: "Inicia sesión",
  },
  search: {
    error: {
      rateLimit:
        "Demasiadas búsquedas en poco tiempo. Espera un momento e inténtalo de nuevo.",
    },
    meta: {
      titleDefault: "Buscar",
      titlePrefix: '"{query}" — Búsqueda',
      titleSuffix: " — Scrobblr",
    },
    input: {
      placeholder: "Buscar artistas, canciones o usuarios…",
      loading: "Buscando…",
      empty: "Escribe para buscar artistas, canciones o usuarios.",
      tooShort: "Sigue escribiendo… (mínimo 2 caracteres)",
    },
    filter: {
      all: "Todo",
      artists: "Artistas",
      tracks: "Canciones",
      users: "Usuarios",
    },
    empty: {
      prefix: "Sin resultados para",
    },
    section: {
      artists: "Artistas",
      tracks: "Canciones",
      users: "Usuarios",
    },
    label: {
      scrobbles: "scrobbles",
      listeners: "oyentes",
      unknownArtist: "—",
    },
  },
  artist: {
    meta: {
      titleSuffix: " — Scrobblr",
    },
    stat: {
      scrobbles: "Scrobbles",
      listeners: "Oyentes",
      since: "En Scrobblr desde",
    },
    section: {
      topTracks: "Canciones populares",
      topListeners: "Oyentes principales",
    },
    empty: {
      topTracks: "Todavía no hay canciones populares.",
      topListeners: "Todavía no hay oyentes.",
    },
    error: {
      invalidId: "ID de artista inválido",
      notFound: "Artista no encontrado",
      loadFailed: "Error al cargar el artista",
      notAuthenticated: "No autenticado",
      invalidImage: "El archivo de imagen no es válido.",
      uploadFailed: "No se pudo subir la imagen.",
      emptyComment: "Comentario vacío",
      commentFailed: "Error al comentar",
      deleteFailed: "Error al borrar",
    },
  },
  track: {
    meta: {
      titleSuffix: " — Scrobblr",
    },
    stat: {
      scrobbles: "Scrobbles",
      duration: "Duración",
    },
    section: {
      topListeners: "Oyentes principales",
    },
    empty: {
      topListeners: "Todavía no hay oyentes.",
    },
    error: {
      invalidId: "ID de canción inválido",
      notFound: "Canción no encontrada",
      loadFailed: "Error al cargar la canción",
      notAuthenticated: "No autenticado",
      emptyComment: "Comentario vacío",
      commentFailed: "Error al comentar",
      deleteFailed: "Error al borrar",
    },
  },
  album: {
    releaseYear: "Año de lanzamiento",
  },
  profile: {
    gallery: {
      view: "Ver galería",
      count: "{count} imágenes",
    },
    meta: {
      titleSuffix: " — Scrobblr",
    },
    period: {
      "1year": "1a",
      overall: "Todo",
    },
    tab: {
      recent: "Recientes",
      stats: "Estadísticas",
    },
    section: {
      recentScrobbles: "Scrobbles recientes",
      topArtists: "Top artistas",
      topTracks: "Top canciones",
    },
    empty: {
      recentScrobbles: "Sin scrobbles aún.",
      data: "Sin datos.",
    },
    loading: "Cargando...",
    historyEnd: "- fin del historial -",
    toast: {
      followSuccess: "Ahora sigues a @{username}",
      unfollowSuccess: "Has dejado de seguir a @{username}",
      followError: "Error al cambiar seguimiento",
      blockSuccess: "Bloqueaste a @{username}",
      unblockSuccess: "Desbloqueaste a @{username}",
      blockError: "Error al cambiar el bloqueo",
      confirmBlock: "¿Bloquear a @{username}? Podrás desbloquearlo después.",
    },
    verifiedTooltip: "Usuario verificado",
    toastCopiedUsername: "Nombre de usuario copiado",
    button: {
      following: "Siguiendo",
      follow: "Seguir",
      block: "Bloquear",
      unblock: "Desbloquear",
    },
    stat: {
      scrobbles: "scrobbles",
      followers: "seguidores",
      follower: "seguidor",
      since: "desde",
    },
    modal: {
      avatarLabel: "Avatar de {username}",
    },
    error: {
      notFound: "Usuario no encontrado",
      private: "Este perfil es privado",
      loadFailed: "Error al cargar el perfil",
      notAuthenticated: "No autenticado",
      follow: "Error al seguir",
      unfollow: "Error al dejar de seguir",
    },
  },
  friends: {
    meta: {
      titleSuffix: " — amigos — Scrobblr",
    },
    tab: {
      followers: "Seguidores",
      following: "Siguiendo",
    },
    pageTitle: "Amigos",
    empty: {
      followers: "Sin seguidores aún.",
      following: "No sigue a nadie aún.",
    },
    label: {
      scrobbles: "scrobbles",
    },
    button: {
      following: "Siguiendo",
      follow: "Seguir",
      block: "Bloquear",
      unblock: "Desbloquear",
      removeFollower: "Eliminar seguidor",
      loadMore: "Ver más",
    },
    toast: {
      unfollow: "Has dejado de seguir a @{username}",
      follow: "Ahora sigues a @{username}",
      error: "Error al cambiar seguimiento",
      block: "Bloqueaste a @{username}",
      unblock: "Desbloqueaste a @{username}",
      removeFollower: "Eliminaste a @{username} de tus seguidores",
      actionError: "No se pudo completar la acción",
      confirmRemoveFollower: "¿Eliminar a @{username} de tus seguidores?",
      confirmBlock: "¿Bloquear a @{username}? Podrás desbloquearlo después.",
    },
    error: {
      notFound: "Usuario no encontrado",
      private: "Este perfil es privado",
      loadFailed: "Error al cargar el perfil",
    },
  },
  settings: {
    meta: {
      title: "Configuración — Scrobblr",
    },
    section: {
      profile: "Perfil",
      profileDesc: "Información básica de tu cuenta pública.",
      connections: "Conexiones",
      connectionsDesc:
        "Trae tu historial de escucha a Scrobblr automáticamente.",
      privacy: "Privacidad",
      privacyDesc: "Controla quién puede ver tu actividad.",
      apiTokens: "Tokens de API",
      apiTokensDesc:
        "Gestiona tokens de acceso para clientes que usan directamente la API de Scrobblr.",
      appearance: "Apariencia",
      appearanceDesc: "Personaliza cómo se ve Scrobblr para ti.",
      sessions: "Sesiones",
      sessionsDesc: "Gestiona las sesiones abiertas en tu cuenta.",
      allTitle: "Cerrar sesión en todos los dispositivos",
      allDesc:
        "Invalida todas tus sesiones, incluida esta. Tendrás que volver a iniciar sesión.",
    },
    session: {
      allButton: "Cerrar todas las sesiones",
      cancel: "Cancelar",
      confirm: "Sí, cerrar todas",
      error: "No se pudieron cerrar las sesiones.",
    },
    label: {
      avatar: "Foto de perfil",
      username: "Nombre de usuario",
      displayName: "Nombre mostrado",
      bio: "Biografía",
      privateProfile: "Perfil privado",
      showInSearch: "Mostrar en búsquedas",
      theme: "Tema",
      palette: "Paleta de color",
    },
    connection: {
      connected: "Conectado",
      disconnected: "No conectado",
      connect: "Conectar {provider}",
      disconnect: "Desconectar",
      active: "El scrobbling automático está activo.",
      inactive: "Conecta tu cuenta para empezar a scrobblear automáticamente.",
      error: "No se pudo actualizar la conexión de {provider}.",
      result: {
        ok: "{provider} conectado.",
        denied: "Cancelaste la conexión con {provider}.",
        invalid: "La respuesta de {provider} no es válida. Inténtalo de nuevo.",
        conflict: "Esa cuenta de {provider} ya está vinculada.",
        rateLimited: "Demasiados intentos. Espera un momento.",
        unavailable: "{provider} no está disponible ahora mismo.",
        failed: "No se pudo conectar {provider}.",
      },
    },
    import: {
      title: "Importar historial de Last.fm",
      description: "Trae a Scrobblr tus scrobbles y canciones favoritas de Last.fm. Se omiten los scrobbles que ya existen.",
      connectedAs: "Conectado como {username}. Puedes importar aquí su historial.",
      unlinked: "Vincula Last.fm para importar tu historial de escucha y canciones favoritas.",
      start: "Importar historial",
      starting: "Iniciando…",
      queued: "Importación de Last.fm en cola.",
      startFailed: "No se pudo iniciar la importación de Last.fm.",
      fullHistory: "Volver a revisar todo el historial",
      recent: "Importación más reciente",
      pending: "En espera",
      running: "Importando",
      done: "Completada",
      failed: "Fallida",
      cancelled: "Cancelada",
      progressLabel: "Progreso de importación",
      progress: "{fetched} de {total} scrobbles leídos",
      summary: "{imported} importados · {duplicates} duplicados · {skipped} omitidos",
      cancel: "Cancelar importación",
      cancelling: "Cancelando…",
      cancelledToast: "Importación cancelada.",
      cancelFailed: "No se pudo cancelar la importación.",
      invalidId: "Importación no válida.",
    },
    placeholder: {
      displayName: "Tu nombre público",
      bio: "Cuéntale al mundo qué música te define",
    },
    hint: {
      avatar: "JPG, PNG o WebP. Máximo 8 MB.",
      displayName: "Déjalo vacío para usar tu nombre de usuario.",
    },
    desc: {
      privateProfile: "Solo tú puedes ver tu perfil",
      showInSearch:
        "Aparecer en los resultados de búsqueda de Scrobblr y motores de búsqueda externos",
    },
    badge: {
      comingSoon: "Próximamente",
    },
    token: {
      warning: "Guarda este token ahora — no se volverá a mostrar",
      labelPrefix: "Token para",
      copied: "✓ Copiado",
      copy: "Copiar",
      close: "Ya lo guardé, cerrar",
    },
    tokenList: {
      title: "Tus tokens",
      cancel: "Cancelar",
      new: "+ Nuevo token",
      empty: "No tienes tokens aún.",
      created: "Creado",
      lastUsed: "Último uso:",
      expires: "Expira",
      revoke: "Revocar",
    },
    tokenForm: {
      nameLabel: "Nombre del token",
      namePlaceholder: "ej. Spotify, Last.fm scrobbler...",
      expiration: "Expiración",
      optional: "(opcional)",
      noExpiration: "Sin expiración",
      exp30days: "30 días",
      exp90days: "90 días",
      exp1year: "1 año",
      creating: "Creando…",
      create: "Crear token",
    },
    toast: {
      saved: "Configuración guardada",
      saveError: "Error al guardar cambios",
      tokenCreated: "Token creado correctamente",
      createError: "Error al crear token",
      tokenRevoked: "Token revocado",
      revokeError: "Error al revocar token",
    },
    error: {
      notAuthenticated: "No autenticado.",
      nameRequired: "El nombre es obligatorio.",
      nameTooLong: "El nombre debe ser menor a 64 caracteres.",
      namePlaceholder: "ej. Spotify, Last.fm scrobbler...",
      createFailed: "No se pudo crear el token.",
      idRequired: "Se requiere un ID.",
      revokeFailed: "No se pudo revocar el token.",
      saveFailed: "No se pudieron guardar los cambios.",
      disconnectFailed: "No se pudo conectar la cuenta.",
      logoutAllFailed:
        "No se pudieron cerrar las sesiones. Inténtalo de nuevo.",
    },
  },
  comments: {
    title: "Comentarios ({count})",
    placeholder: {
      authed: "Escribe un comentario...",
      unauthed: "Inicia sesión para comentar",
    },
    submit: "Publicar",
    empty: "Todavía no hay comentarios.",
    delete: "Borrar",
    error: {
      publish: "Error al publicar el comentario",
      delete: "Error al borrar el comentario",
    },
  },
  heatmap: {
    title: "Actividad",
    summary: "{totalScrobbles} escuchas en {activeDays} días",
    legendLess: "Menos",
    legendMore: "Más",
    dayLabels: {
      mon: "L",
      wed: "X",
      fri: "V",
    },
    tooltip: {
      singular: "escucha",
      plural: "escuchas",
      format: "{count} {label} — {date}",
    },
  },
  imageCandidates: {
    title: "Imágenes propuestas",
    uploading: "Subiendo...",
    propose: "Proponer imagen",
    empty: "Todavía no hay imágenes propuestas.",
    altPrefix: "Candidata propuesta por {username}",
    error: {
      vote: "Error al votar",
      upload: "Error al subir la imagen",
    },
    success: {
      proposed: "Imagen propuesta",
    },
  },
  refresh: {
    button: "Actualizar metadata",
    success: "Actualización en curso, puede tardar unos segundos",
    error: "Error al actualizar",
  },
  authModal: {
    title: "Iniciar sesión",
    description: "Necesitás tener una cuenta para seguir a otros usuarios.",
    cancel: "Cancelar",
    login: "Iniciar sesión",
  },
  settingsSidebar: {
    title: "Configuración",
    connections: "Conexiones",
    profile: "Perfil",
    privacy: "Privacidad",
    apiTokens: "Tokens de API",
    appearance: "Apariencia",
    sessions: "Sesiones",
    viewProfile: "Ver perfil",
    close: "Cerrar",
    menuLabel: "Menú de configuración",
  },
  confirmChanges: {
    saved: "Cambios guardados",
    unsaved: "Tienes cambios sin guardar",
    discard: "Descartar cambios",
    savedButton: "✓ Guardado",
    saveButton: "Guardar cambios",
  },
  toggle: {
    defaultLabel: "Toggle",
  },
  nowPlaying: {
    label: "escuchando",
  },
} satisfies BaseTranslation;

export default es;
