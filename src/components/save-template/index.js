import { createElement } from 'preact';
import style from './style.less';
import { withText } from 'preact-i18n';
import { ModalDialog, FolderListLight } from '@zimbra-client/components';
import { Spinner } from '@zimbra-client/blocks';
import { FILTER_FOLDER_IDS, FOLDER_VIEW } from '../../constants';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { moveMessage, getFolderName } from '../../lib/util';
import { useFoldersQuery } from '@zimbra-client/graphql';
import withIntl from '../../enhancers';
import get from 'lodash-es/get';

function SaveTemplate(
	{
		getSubject,
		subjectRequire,
		getMessage,
		closeSaveModal,
		savedMsg,
		saveMsgError,
		saveMsgSelectFolder,
		saveMsgPermissionIssue,
		context: zimletContext
	},
	context
) {
	const [state, setState] = useState(() => ({
		folderList: [],
		sharedFolders: [],
		selectedFolderId: null,
		loading: true
	}));

	const { folderList, sharedFolders, selectedFolderId, loading } = state;
	const { data } = useFoldersQuery({
		variables: {
			view: FOLDER_VIEW
		},
		options: {
			fetchPolicy: 'cache-only'
		}
	});

	const handleFolderClick = useCallback(
		folderData => {
			setState(prevState => {
				return {
					...prevState,
					selectedFolderId: folderData.id
				};
			});
		}, [selectedFolderId]
	);

	const handleSaveClick = useCallback(
		() => {
			const currSubject = getSubject();
			if (currSubject.trim() == '') {
				notify(subjectRequire);
				return;
			}

			const msg = getMessage();
			if (selectedFolderId !== null) {
				moveMessage(context, msg.draftId, selectedFolderId)
					.then(moveRes => {
						if (moveRes.id) {
							notify(savedMsg);
							closeSaveModal();
						} else {
							notify(saveMsgPermissionIssue);
						}
					})
					.catch(error => {
						notify(saveMsgError);
						console.error('Error: ', error);
						closeSaveModal();
					});
			} else {
				notify(saveMsgSelectFolder);
			}
		}, [selectedFolderId]
	);

	const notify = message => {
		const { dispatch } = zimletContext.store;
		dispatch(
			zimletContext.zimletRedux.actions.notifications.notify({
				message
			})
		);
	};

	useEffect(() => {
		if (data) {
			const folders = (get(data, 'getFolder.folders.0.folders') || []).filter(folder => !FILTER_FOLDER_IDS.includes(parseInt(folder.id))) // Trash, Chat
			const sharedFolders = (get(data, 'getFolder.folders.0.linkedFolders') || []);
			setState(prevState => {
				return {
					...prevState,
					folderList: folders,
					sharedFolders: sharedFolders,
					loading: false
				};
			});
		}
	}, [data]);

	return (
		<ModalDialog
			class={style.saveTemplateModal}
			title="emailTemplates.saveDialog.title"
			cancelLabel="buttons.cancel"
			actionLabel="emailTemplates.saveDialog.btnLabel"
			onClose={closeSaveModal}
			onAction={handleSaveClick}
			headerClass={style.header}
			contentClass={style.content}
			footerClass={style.footer}
			disableOutsideClick
		>
			{loading ? (
				<Spinner block />
			) : (
					<div class={style.dataInner}>
						<div class={style.leftSide}>
							<p class={style.saveTip}>{saveMsgSelectFolder}</p>
							<FolderListLight
								folders={folderList}
								folderNameProp={getFolderName}
								onFolderClick={handleFolderClick}
								sharedFolders={sharedFolders}
							/>
						</div>
					</div>
				)}
		</ModalDialog>
	);
}

export default withIntl()(withText({
	subjectRequire: 'emailTemplates.subjectRequire',
	savedMsg: 'emailTemplates.savedMsg',
	saveMsgError: 'emailTemplates.saveMsgError',
	saveMsgSelectFolder: 'emailTemplates.saveMsgSelectFolder',
	saveMsgPermissionIssue: 'emailTemplates.saveMsgPermissionIssue'
})(SaveTemplate));
