import type { Translation } from '../i18n-types'

const en: Translation = {
	nav: {
		brand: 'Scrobblr',
		search: 'Search',
		profile: 'Profile',
		settings: 'Settings',
		logout: 'Log out',
		login: 'Log in',
		register: 'Sign up',
	},
	home: {
		meta: {
			title: 'Scrobblr — Your music history, yours',
		},
		hero: {
			badge: 'Open source · No ads · Yours',
			title1: 'Your music.',
			title2: 'Your history.',
			description: 'Scrobblr tracks every song you listen to, shows your stats, and connects you with friends — no algorithms, no trackers, no distractions.',
		},
		cta: {
			ownProfile: 'View my profile',
			signup: 'Create free account',
			login: 'Log in',
		},
		features: {
			scrobbling: {
				title: 'Automatic scrobbling',
				desc: 'Connect your favorite player and record every listen effortlessly, in real time.',
			},
			stats: {
				title: 'Detailed statistics',
				desc: 'Top artists, top tracks, activity heatmap and trends by period.',
			},
			profiles: {
				title: 'Public profiles',
				desc: 'Share what you listen to, follow friends, and discover new music through them.',
			},
		},
		benefits: {
			heading: 'Made for music lovers',
			subtitle: 'Everything you need to understand your music history, no clutter.',
			item1: 'Real-time tracking',
			item2: 'Weekly and monthly stats',
			item3: 'Compare with friends',
			item4: 'No premium account',
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
		'404': 'This page does not exist.',
		'403': "You don't have access to this.",
		'401': 'You need to log in first.',
		generic: 'Something went wrong.',
		backHome: '← Back to home',
	},
	login: {
		meta: {
			title: 'Log in — Scrobblr',
		},
		brand: 'Scrobblr',
		subtitle: 'Your music history. Yours.',
		label: {
			username: 'Username',
			password: 'Password',
		},
		placeholder: {
			username: 'yourusername',
			password: '••••••••',
		},
		submit: 'Log in',
		error: {
			fallback: 'Error logging in',
			emptyFields: 'Fill in all fields.',
			invalidCredentials: 'Invalid username or password.',
			serverError: 'Could not connect to the server',
		},
		prompt: "Don't have an account?",
		signupLink: 'Sign up',
	},
	register: {
		meta: {
			title: 'Create account — Scrobblr',
		},
		brand: 'Scrobblr',
		subtitle: 'Start tracking what you listen to.',
		label: {
			username: 'Username',
			displayName: 'Display name',
			email: 'Email',
			emailConfirm: 'Confirm email',
			password: 'Password',
		},
		sublabel: {
			username: 'min. 2 characters',
			displayName: 'optional',
			password: 'min. 8 characters',
		},
		placeholder: {
			username: 'yourusername',
			displayName: 'Your Name',
			email: 'you@email.com',
			emailConfirm: 'you@email.com',
			password: '••••••••',
		},
		submit: 'Create account',
		error: {
			fallback: 'Error creating account',
			emptyFields: 'Fill in all required fields.',
			usernameTooShort: 'Username must be at least 2 characters.',
			passwordTooShort: 'Password must be at least 8 characters.',
			invalidEmail: 'Invalid email address.',
			emailMismatch: 'Emails do not match.',
			conflict: 'That username or email is already in use.',
			serverError: 'Could not connect to the server.',
		},
		prompt: 'Already have an account?',
		loginLink: 'Log in',
	},
	search: {
		meta: {
			titleDefault: 'Search',
			titlePrefix: '"{query}" — Search',
			titleSuffix: ' — Scrobblr',
		},
		input: {
			placeholder: 'Search artists, tracks or users…',
			loading: 'Searching…',
			empty: 'Type to search artists, tracks or users.',
			tooShort: 'Keep typing… (2 characters minimum)',
		},
		filter: {
			all: 'All',
			artists: 'Artists',
			tracks: 'Tracks',
			users: 'Users',
		},
		empty: {
			prefix: 'No results for',
		},
		section: {
			artists: 'Artists',
			tracks: 'Tracks',
			users: 'Users',
		},
		label: {
			scrobbles: 'scrobbles',
			listeners: 'listeners',
			unknownArtist: '—',
		},
	},
	artist: {
		meta: {
			titleSuffix: ' — Scrobblr',
		},
		stat: {
			scrobbles: 'Scrobbles',
			listeners: 'Listeners',
			since: 'On Scrobblr since',
		},
		section: {
			topTracks: 'Popular tracks',
			topListeners: 'Top listeners',
		},
		empty: {
			topTracks: 'No popular tracks yet.',
			topListeners: 'No listeners yet.',
		},
		error: {
			invalidId: 'Invalid artist ID',
			notFound: 'Artist not found',
			loadFailed: 'Failed to load artist',
			notAuthenticated: 'Not authenticated',
			emptyComment: 'Empty comment',
			commentFailed: 'Failed to post comment',
			deleteFailed: 'Failed to delete',
		},
	},
	track: {
		meta: {
			titleSuffix: ' — Scrobblr',
		},
		stat: {
			scrobbles: 'Scrobbles',
			duration: 'Duration',
		},
		section: {
			topListeners: 'Top listeners',
		},
		empty: {
			topListeners: 'No listeners yet.',
		},
		error: {
			invalidId: 'Invalid track ID',
			notFound: 'Track not found',
			loadFailed: 'Failed to load track',
			notAuthenticated: 'Not authenticated',
			emptyComment: 'Empty comment',
			commentFailed: 'Failed to post comment',
			deleteFailed: 'Failed to delete',
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
			overall: 'All',
		},
		tab: {
			recent: 'Recents',
			stats: 'Stats',
		},
		section: {
			recentScrobbles: 'Recent scrobbles',
			topArtists: 'Top artists',
			topTracks: 'Top tracks',
		},
		empty: {
			recentScrobbles: 'No scrobbles yet.',
			data: 'No data.',
		},
		loading: 'Loading...',
		historyEnd: '- end of history -',
		toast: {
			followSuccess: 'You are now following @{username}',
			unfollowSuccess: 'You have unfollowed @{username}',
			followError: 'Error changing follow status',
		},
		verifiedTooltip: 'Verified user',
		toastCopiedUsername: 'Copied username to clipboard',
		button: {
			following: 'Following',
			follow: 'Follow',
		},
		stat: {
			scrobbles: 'scrobbles',
			followers: 'followers',
			follower: 'follower',
			since: 'since',
		},
		modal: {
			avatarLabel: '{username} avatar',
		},
		error: {
			notFound: 'User not found',
			private: 'This profile is private',
			loadFailed: 'Failed to load profile',
			notAuthenticated: 'Not authenticated',
			follow: 'Error following',
			unfollow: 'Error unfollowing',
		},
	},
	friends: {
		meta: {
			titleSuffix: ' — friends — Scrobblr',
		},
		tab: {
			followers: 'Followers',
			following: 'Following',
		},
		pageTitle: 'Friends',
		empty: {
			followers: 'No followers yet.',
			following: 'Not following anyone yet.',
		},
		label: {
			scrobbles: 'scrobbles',
		},
		button: {
			following: 'Following',
			follow: 'Follow',
		},
		toast: {
			unfollow: 'You have unfollowed @{username}',
			follow: 'You are now following @{username}',
			error: 'Error changing follow status',
		},
		error: {
			notFound: 'User not found',
			private: 'This profile is private',
			loadFailed: 'Failed to load profile',
		},
	},
	settings: {
		meta: {
			title: 'Settings — Scrobblr',
		},
		section: {
			profile: 'Profile',
			profileDesc: 'Basic information for your public account.',
			privacy: 'Privacy',
			privacyDesc: 'Control who can see your activity.',
			apiTokens: 'API Tokens',
			apiTokensDesc: 'Manage your tokens for scrobbling from external players.',
			appearance: 'Appearance',
			appearanceDesc: 'Customize how Scrobblr looks for you.',
		},
		label: {
			avatar: 'Profile picture',
			username: 'Username',
			displayName: 'Display name',
			bio: 'Biography',
			privateProfile: 'Private profile',
			showInSearch: 'Show in search',
			theme: 'Theme',
			palette: 'Color palette',
		},
		placeholder: {
			displayName: 'Your public name',
			bio: 'Tell the world what music defines you',
		},
		hint: {
			avatar: 'JPG, PNG or WebP. Max 8 MB.',
			displayName: 'Leave empty to use your username.',
		},
		desc: {
			privateProfile: 'Only you can view your profile',
			showInSearch: 'Appear in Scrobblr search results and external search engines',
		},
		badge: {
			comingSoon: 'Coming soon',
		},
		token: {
			warning: "Save this token now — it won't be shown again",
			labelPrefix: 'Token for',
			copied: '✓ Copied',
			copy: 'Copy',
			close: 'I saved it, close',
		},
		tokenList: {
			title: 'Your tokens',
			cancel: 'Cancel',
			new: '+ New token',
			empty: "You don't have any tokens yet.",
			created: 'Created',
			lastUsed: 'Last used:',
			expires: 'Expires',
			revoke: 'Revoke',
		},
		tokenForm: {
			nameLabel: 'Token name',
			namePlaceholder: 'e.g. Spotify, Last.fm scrobbler…',
			expiration: 'Expiration',
			optional: '(optional)',
			noExpiration: 'No expiration',
			exp30days: '30 days',
			exp90days: '90 days',
			exp1year: '1 year',
			creating: 'Creating…',
			create: 'Create token',
		},
		toast: {
			saved: 'Settings saved',
			saveError: 'Error saving changes',
			tokenCreated: 'Token created successfully',
			createError: 'Error creating token',
			tokenRevoked: 'Token revoked',
			revokeError: 'Error revoking token',
		},
		time: {
			never: 'Never',
			today: 'Today',
			yesterday: 'Yesterday',
			daysAgo: '{days} days ago',
		},
		error: {
			notAuthenticated: 'Not authenticated.',
			nameRequired: 'Name is required.',
			nameTooLong: 'Name must be less than 64 characters.',
			namePlaceholder: 'e.g. Spotify, Last.fm scrobbler…',
			createFailed: "Token couldn't be created.",
			idRequired: 'ID is required.',
			revokeFailed: "Token couldn't be revoked.",
			saveFailed: 'Could not save settings.',
		},
	},
	comments: {
		title: 'Comments ({count})',
		placeholder: {
			authed: 'Write a comment...',
			unauthed: 'Log in to comment',
		},
		submit: 'Post',
		empty: 'No comments yet.',
		delete: 'Delete',
		error: {
			publish: 'Error posting comment',
			delete: 'Error deleting comment',
		},
	},
	heatmap: {
		title: 'Activity',
		summary: '{totalScrobbles} listens on {activeDays} days',
		legendLess: 'Less',
		legendMore: 'More',
		dayLabels: {
			mon: 'M',
			wed: 'W',
			fri: 'F',
		},
		tooltip: {
			singular: 'listen',
			plural: 'listens',
			format: '{count} {label} — {date}',
		},
	},
	imageCandidates: {
		title: 'Proposed images',
		uploading: 'Uploading...',
		propose: 'Propose image',
		empty: 'No proposed images yet.',
		altPrefix: 'Candidate proposed by {username}',
		error: {
			vote: 'Error voting',
			upload: 'Error uploading image',
		},
		success: {
			proposed: 'Image proposed',
		},
	},
	refresh: {
		button: 'Refresh metadata',
		success: 'Refresh in progress, may take a few seconds',
		error: 'Error refreshing',
	},
	authModal: {
		title: 'Log in',
		description: 'You need an account to follow other users.',
		cancel: 'Cancel',
		login: 'Log in',
	},
	settingsSidebar: {
		title: 'Settings',
		profile: 'Profile',
		privacy: 'Privacy',
		apiTokens: 'API tokens',
		appearance: 'Appearance',
		viewProfile: 'View profile',
		close: 'Close',
		menuLabel: 'Settings menu',
	},
	confirmChanges: {
		saved: 'Changes saved',
		unsaved: 'You have unsaved changes',
		discard: 'Discard changes',
		savedButton: '✓ Saved',
		saveButton: 'Save changes',
	},
	toggle: {
		defaultLabel: 'Toggle',
	},
	nowPlaying: {
		label: 'listening',
	},
}

export default en
