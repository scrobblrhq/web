import type { BaseTranslation } from '../i18n-types'

const es = {
	nav: {
		brand: 'Scrobblr',
		search: 'Buscar',
		profile: 'Perfil',
		settings: 'Ajustes',
		logout: 'Salir',
		login: 'Entrar',
		register: 'Registrarse',
	},
	home: {
		meta: {
			title: 'Scrobblr — Tu historial musical, tuyo',
		},
		hero: {
			badge: 'Código abierto · Sin anuncios · Tuyo',
			title1: 'Tu música.',
			title2: 'Tu historial.',
			description: 'Scrobblr registra cada canción que escuchas, te muestra tus estadísticas y conecta con tus amigos — sin algoritmos, sin trackers, sin distracciones.',
		},
		cta: {
			ownProfile: 'Ver mi perfil',
			signup: 'Crear cuenta gratis',
			login: 'Iniciar sesión',
		},
		features: {
			scrobbling: {
				title: 'Scrobbling automático',
				desc: 'Conecta tu reproductor favorito y registra cada escucha sin esfuerzo, en tiempo real.',
			},
			stats: {
				title: 'Estadísticas detalladas',
				desc: 'Top artistas, top canciones, heatmap de actividad y tendencias por período.',
			},
			profiles: {
				title: 'Perfiles públicos',
				desc: 'Comparte lo que escuchas, sigue amigos y descubre música nueva a través de ellos.',
			},
		},
		benefits: {
			heading: 'Hecho para quien ama la música',
			subtitle: 'Todo lo que necesitas para entender tu historia musical, sin ruido.',
			item1: 'Registro en tiempo real',
			item2: 'Estadísticas semanales y mensuales',
			item3: 'Compara con amigos',
			item4: 'Sin cuenta premium',
		},
		footer: {
			brand: 'Scrobblr',
			github: 'GitHub',
		},
	},
	error: {
		meta: {
			titleSuffix: ' — Scrobblr',
		},
		'404': 'Esta página no existe.',
		'403': 'No tienes acceso a esto.',
		'401': 'Tienes que iniciar sesión primero.',
		generic: 'Algo salió mal.',
		backHome: '← Volver al inicio',
	},
	login: {
		meta: {
			title: 'Iniciar sesión — Scrobblr',
		},
		brand: 'Scrobblr',
		subtitle: 'Tu historial musical. Tuyo.',
		label: {
			username: 'Usuario',
			password: 'Contraseña',
		},
		placeholder: {
			username: 'tuusuario',
			password: '••••••••',
		},
		submit: 'Entrar',
		error: {
			fallback: 'Error al iniciar sesión',
			emptyFields: 'Completa todos los campos.',
			invalidCredentials: 'Usuario o contraseña incorrectos.',
			serverError: 'No se pudo conectar con el servidor',
		},
		prompt: '¿No tienes cuenta?',
		signupLink: 'Regístrate',
	},
	register: {
		meta: {
			title: 'Crear cuenta — Scrobblr',
		},
		brand: 'Scrobblr',
		subtitle: 'Empieza a registrar lo que escuchas.',
		label: {
			username: 'Usuario',
			displayName: 'Nombre visible',
			email: 'Email',
			emailConfirm: 'Confirmar email',
			password: 'Contraseña',
		},
		sublabel: {
			username: 'mín. 2 caracteres, solo letras, números, - y _',
			displayName: 'opcional',
			password: 'mín. 8 caracteres',
		},
		placeholder: {
			username: 'tuusuario',
			displayName: 'Tu Nombre',
			email: 'tu@email.com',
			emailConfirm: 'tu@email.com',
			password: '••••••••',
		},
		submit: 'Crear cuenta',
		error: {
			fallback: 'Error al crear cuenta',
			emptyFields: 'Completa todos los campos obligatorios.',
			usernameTooShort: 'El usuario debe tener al menos 2 caracteres.',
			usernameTooLong: 'El usuario no puede tener más de 32 caracteres.',
			usernameInvalidChars: 'El usuario solo puede contener letras, números, guiones y guiones bajos.',
			passwordTooShort: 'La contraseña debe incluir al menos 8 caracteres.',
			passwordTooLong: 'La contraseña no puede tener más de 128 caracteres.',
			passwordInvalidChars: 'La contraseña contiene caracteres no permitidos.',
			invalidEmail: 'El email no es válido.',
			emailMismatch: 'Los emails no coinciden.',
			conflict: 'Ese nombre de usuario o email ya están en uso.',
			serverError: 'No se pudo conectar con el servidor.',
		},
		prompt: '¿Ya tienes cuenta?',
		loginLink: 'Inicia sesión',
	},
	search: {
		meta: {
			titleDefault: 'Buscar',
			titlePrefix: '"{query}" — Búsqueda',
			titleSuffix: ' — Scrobblr',
		},
		input: {
			placeholder: 'Buscar artistas, canciones o usuarios…',
			loading: 'Buscando…',
			empty: 'Escribe para buscar artistas, canciones o usuarios.',
			tooShort: 'Sigue escribiendo… (mínimo 2 caracteres)',
		},
		filter: {
			all: 'Todo',
			artists: 'Artistas',
			tracks: 'Canciones',
			users: 'Usuarios',
		},
		empty: {
			prefix: 'Sin resultados para',
		},
		section: {
			artists: 'Artistas',
			tracks: 'Canciones',
			users: 'Usuarios',
		},
		label: {
			scrobbles: 'scrobbles',
			listeners: 'oyentes',
			unknownArtist: '—',
		},
	},
	artist: {
		meta: {
			titleSuffix: ' — Scrobblr',
		},
		stat: {
			scrobbles: 'Scrobbles',
			listeners: 'Oyentes',
			since: 'En Scrobblr desde',
		},
		section: {
			topTracks: 'Canciones populares',
			topListeners: 'Oyentes principales',
		},
		empty: {
			topTracks: 'Todavía no hay canciones populares.',
			topListeners: 'Todavía no hay oyentes.',
		},
		error: {
			invalidId: 'ID de artista inválido',
			notFound: 'Artista no encontrado',
			loadFailed: 'Error al cargar el artista',
			notAuthenticated: 'No autenticado',
			emptyComment: 'Comentario vacío',
			commentFailed: 'Error al comentar',
			deleteFailed: 'Error al borrar',
		},
	},
	track: {
		meta: {
			titleSuffix: ' — Scrobblr',
		},
		stat: {
			scrobbles: 'Scrobbles',
			duration: 'Duración',
		},
		section: {
			topListeners: 'Oyentes principales',
		},
		empty: {
			topListeners: 'Todavía no hay oyentes.',
		},
		error: {
			invalidId: 'ID de canción inválido',
			notFound: 'Canción no encontrada',
			loadFailed: 'Error al cargar la canción',
			notAuthenticated: 'No autenticado',
			emptyComment: 'Comentario vacío',
			commentFailed: 'Error al comentar',
			deleteFailed: 'Error al borrar',
		},
	},
	profile: {
		meta: {
			titleSuffix: ' — Scrobblr',
		},
		period: {
			'7days': '7d',
			'1month': '30d',
			'3months': '90d',
			overall: 'Todo',
		},
		tab: {
			recent: 'Recientes',
			stats: 'Estadísticas',
		},
		section: {
			recentScrobbles: 'Scrobbles recientes',
			topArtists: 'Top artistas',
			topTracks: 'Top canciones',
		},
		empty: {
			recentScrobbles: 'Sin scrobbles aún.',
			data: 'Sin datos.',
		},
		loading: 'Cargando...',
		historyEnd: '- fin del historial -',
		toast: {
			followSuccess: 'Ahora sigues a @{username}',
			unfollowSuccess: 'Has dejado de seguir a @{username}',
			followError: 'Error al cambiar seguimiento',
		},
		verifiedTooltip: 'Usuario verificado',
		toastCopiedUsername: 'Nombre de usuario copiado',
		button: {
			following: 'Siguiendo',
			follow: 'Seguir',
		},
		stat: {
			scrobbles: 'scrobbles',
			followers: 'seguidores',
			follower: 'seguidor',
			since: 'desde',
		},
		modal: {
			avatarLabel: 'Avatar de {username}',
		},
		error: {
			notFound: 'Usuario no encontrado',
			private: 'Este perfil es privado',
			loadFailed: 'Error al cargar el perfil',
			notAuthenticated: 'No autenticado',
			follow: 'Error al seguir',
			unfollow: 'Error al dejar de seguir',
		},
	},
	friends: {
		meta: {
			titleSuffix: ' — amigos — Scrobblr',
		},
		tab: {
			followers: 'Seguidores',
			following: 'Siguiendo',
		},
		pageTitle: 'Amigos',
		empty: {
			followers: 'Sin seguidores aún.',
			following: 'No sigue a nadie aún.',
		},
		label: {
			scrobbles: 'scrobbles',
		},
		button: {
			following: 'Siguiendo',
			follow: 'Seguir',
		},
		toast: {
			unfollow: 'Has dejado de seguir a @{username}',
			follow: 'Ahora sigues a @{username}',
			error: 'Error al cambiar seguimiento',
		},
		error: {
			notFound: 'Usuario no encontrado',
			private: 'Este perfil es privado',
			loadFailed: 'Error al cargar el perfil',
		},
	},
	settings: {
		meta: {
			title: 'Configuración — Scrobblr',
		},
		section: {
			profile: 'Perfil',
			profileDesc: 'Información básica de tu cuenta pública.',
			privacy: 'Privacidad',
			privacyDesc: 'Controla quién puede ver tu actividad.',
			apiTokens: 'Tokens de API',
			apiTokensDesc: 'Gestiona tus tokens para scrobblear desde reproductores externos.',
			appearance: 'Apariencia',
			appearanceDesc: 'Personaliza cómo se ve Scrobblr para ti.',
		},
		label: {
			avatar: 'Foto de perfil',
			username: 'Nombre de usuario',
			displayName: 'Nombre mostrado',
			bio: 'Biografía',
			privateProfile: 'Perfil privado',
			showInSearch: 'Mostrar en búsquedas',
			theme: 'Tema',
			palette: 'Paleta de color',
		},
		placeholder: {
			displayName: 'Tu nombre público',
			bio: 'Cuéntale al mundo qué música te define',
		},
		hint: {
			avatar: 'JPG, PNG o WebP. Máximo 8 MB.',
			displayName: 'Déjalo vacío para usar tu nombre de usuario.',
		},
		desc: {
			privateProfile: 'Solo tú puedes ver tu perfil',
			showInSearch: 'Aparecer en los resultados de búsqueda de Scrobblr y motores de búsqueda externos',
		},
		badge: {
			comingSoon: 'Próximamente',
		},
		token: {
			warning: 'Guarda este token ahora — no se volverá a mostrar',
			labelPrefix: 'Token para',
			copied: '✓ Copiado',
			copy: 'Copiar',
			close: 'Ya lo guardé, cerrar',
		},
		tokenList: {
			title: 'Tus tokens',
			cancel: 'Cancelar',
			new: '+ Nuevo token',
			empty: 'No tienes tokens aún.',
			created: 'Creado',
			lastUsed: 'Último uso:',
			expires: 'Expira',
			revoke: 'Revocar',
		},
		tokenForm: {
			nameLabel: 'Nombre del token',
			namePlaceholder: 'ej. Spotify, Last.fm scrobbler…',
			expiration: 'Expiración',
			optional: '(opcional)',
			noExpiration: 'Sin expiración',
			exp30days: '30 días',
			exp90days: '90 días',
			exp1year: '1 año',
			creating: 'Creando…',
			create: 'Crear token',
		},
		toast: {
			saved: 'Configuración guardada',
			saveError: 'Error al guardar cambios',
			tokenCreated: 'Token creado correctamente',
			createError: 'Error al crear token',
			tokenRevoked: 'Token revocado',
			revokeError: 'Error al revocar token',
		},
		time: {
			never: 'Nunca',
			today: 'Hoy',
			yesterday: 'Ayer',
			daysAgo: 'Hace {days} días',
		},
		error: {
			notAuthenticated: 'No autenticado.',
			nameRequired: 'El nombre es obligatorio.',
			nameTooLong: 'El nombre debe ser menor a 64 caracteres.',
			namePlaceholder: 'ej. Spotify, Last.fm scrobbler…',
			createFailed: "No se pudo crear el token.",
			idRequired: 'Se requiere un ID.',
			revokeFailed: "No se pudo revocar el token.",
			saveFailed: 'No se pudieron guardar los cambios.',
		},
	},
	comments: {
		title: 'Comentarios ({count})',
		placeholder: {
			authed: 'Escribe un comentario...',
			unauthed: 'Inicia sesión para comentar',
		},
		submit: 'Publicar',
		empty: 'Todavía no hay comentarios.',
		delete: 'Borrar',
		error: {
			publish: 'Error al publicar el comentario',
			delete: 'Error al borrar el comentario',
		},
	},
	heatmap: {
		title: 'Actividad',
		summary: '{totalScrobbles} escuchas en {activeDays} días',
		legendLess: 'Menos',
		legendMore: 'Más',
		dayLabels: {
			mon: 'L',
			wed: 'X',
			fri: 'V',
		},
		tooltip: {
			singular: 'escucha',
			plural: 'escuchas',
			format: '{count} {label} — {date}',
		},
	},
	imageCandidates: {
		title: 'Imágenes propuestas',
		uploading: 'Subiendo...',
		propose: 'Proponer imagen',
		empty: 'Todavía no hay imágenes propuestas.',
		altPrefix: 'Candidata propuesta por {username}',
		error: {
			vote: 'Error al votar',
			upload: 'Error al subir la imagen',
		},
		success: {
			proposed: 'Imagen propuesta',
		},
	},
	refresh: {
		button: 'Actualizar metadata',
		success: 'Actualización en curso, puede tardar unos segundos',
		error: 'Error al actualizar',
	},
	authModal: {
		title: 'Iniciar sesión',
		description: 'Necesitás tener una cuenta para seguir a otros usuarios.',
		cancel: 'Cancelar',
		login: 'Iniciar sesión',
	},
	settingsSidebar: {
		title: 'Configuración',
		profile: 'Perfil',
		privacy: 'Privacidad',
		apiTokens: 'Tokens de API',
		appearance: 'Apariencia',
		viewProfile: 'Ver perfil',
		close: 'Cerrar',
		menuLabel: 'Menú de configuración',
	},
	confirmChanges: {
		saved: 'Cambios guardados',
		unsaved: 'Tienes cambios sin guardar',
		discard: 'Descartar cambios',
		savedButton: '✓ Guardado',
		saveButton: 'Guardar cambios',
	},
	toggle: {
		defaultLabel: 'Toggle',
	},
	nowPlaying: {
		label: 'escuchando',
	},
} satisfies BaseTranslation

export default es
