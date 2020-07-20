import { FOLDER_VIEW } from '../constants';

export const fetchListing = (context, templateFolder) => {
	const options = {
		offset: 0,
		limit: 30,
		query: `in:("${templateFolder}")`,
		types: `${FOLDER_VIEW}`,
		needExp: 1,
		html: 1,
		fetch: 'all',
		_jsns: 'urn:zimbraMail'
	};
	return context.zimbra.jsonRequest('SearchRequest', options);
};

export const moveMessage = (context, docId, parentDirId) => {
	if (docId !== '') {
		const soapObj = {
			action: {
				op: 'move',
				id: `${docId}`,
				l: `${parentDirId}`
			},
			_jsns: 'urn:zimbraMail'
		};
		return context.zimbra.jsonRequest('ItemActionRequest', soapObj);
	}
	return Promise.resolve(null);
};

export const getFolderName = folder => folder.name;
