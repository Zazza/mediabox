document.executeOnce('/sincerity/objects/')

app.settings = {
	description: {
		name: 'Mediabox',
		description: 'Mediabox',
		author: 'Dmitry Samotoy',
		owner: 'Tushkan.com'
	},

	errors: {
		debug: true,
		homeUrl: 'http://tushkan.com/', // Only used when debug=false
		contactEmail: 'info@tushkan.com' // Only used when debug=false,
	},
	
	code: {
		libraries: ['libraries'], // Handlers and tasks will be found here
		defrost: true,
		minimumTimeBetweenValidityChecks: 1000,
		defaultDocumentName: 'default',
		defaultExtension: 'js',
		defaultLanguageTag: 'javascript',
		sourceViewable: true
	}
}

app.globals = {
    config: {
        theme: 'black',
        baseUrl: '/mediabox/',
        session_limit: 3600,
        session_long_limit: 2592000,
        storage: 'http://fm'
        //storage: 'http://tushkan.com/fm'
    },
    mediaTypes: {
        image: 'img/ftypes/image.png',
        doc: 'img/ftypes/msword.png',
        pdf: 'img/ftypes/pdf.png',
        txt: 'img/ftypes/text.png',
        flv: 'img/ftypes/flash.png',
        exe: 'img/ftypes/executable.png',
        xls: 'img/ftypes/excel.png',
        audio: 'img/ftypes/audio.png',
        html: 'img/ftypes/html.png',
        zip: 'img/ftypes/compress.png',
        video: 'img/ftypes/flash.png',
        any: 'img/ftypes/unknown.png',
        folder: 'img/ftypes/folder.png'
    },
    extension: [
        ['image', 'bmp', 'jpg', 'jpeg', 'gif', 'png'],
        ['audio', 'ogg', 'mp3'],
        ['video', 'mp4', 'mov', 'wmv', 'flv', 'avi', 'mpg'],
        ['text', 'txt'],
        ['doc', 'doc', 'rtf', 'docx'],
        ['pdf', 'pdf', 'djvu'],
        ['txt', 'txt', 'lst', 'ini'],
        ['flv', 'flv'],
        ['exe', 'exe', 'com',' bat', 'sh'],
        ['xls', 'xls', 'xlsx'],
        ['html', 'htm', 'html', 'shtml'],
        ['zip', 'zip', 'rar', 'tar', 'gz', '7z']
    ]
}