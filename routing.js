app.hosts = {
    'default': '/mediabox/',
    internal: '/mediabox/'
}

app.routes = {
    '/*': [
	'explicit',
	'dynamicWeb',
	{type: 'cacheControl', mediaTypes: {'text/css': 'farFuture', 'application/x-javascript': 'farFuture', 'image/png': 'farFuture', 'image/gif': 'farFuture', 'image/jpeg': 'farFuture'}, next:
[
	    'staticWeb',
	    {type: 'staticWeb', root: sincerity.container.getLibrariesFile('web')}]}
    ],
    '/auth/{action}/': {type: 'implicit', id: 'auth'},
    '/app/{action}/': {type: 'implicit', id: 'app'},
    '/fm/{action}/': {type: 'implicit', id: 'fm'},
    '/thumb/{_id}/': {type: 'implicit', id: 'thumb'},
    '/image/{action}/': {type: 'implicit', id: 'image'},
    '/audio/{action}/': {type: 'implicit', id: 'audio'}
}

app.dispatchers = {
    javascript: {library: '/resources/'}
}