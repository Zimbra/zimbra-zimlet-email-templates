import { createElement, Fragment } from 'preact';
import style from './style.less';
import { Text } from 'preact-i18n';
import {
	ModalDialog,
	FolderListLight,
	ConfirmModalDialog,
	TextInput
} from '@zimbra-client/components';
import TemplatePane from './template-pane';
import { FILTER_FOLDER_IDS, FOLDER_VIEW } from '../../constants';
import { Spinner } from '@zimbra-client/blocks';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { useFoldersQuery } from '@zimbra-client/graphql';
import { getFolderName } from '../../lib/util';
import get from 'lodash-es/get';
import withIntl from '../../enhancers';

function InsertTemplate({ getSubject, setSubject, insertAtCaret, closeInsertModal }) {
	const [state, setState] = useState(() => ({
		loading: true,
		folderList: [],
		sharedFolders: [],
		selectedFolderName: null,
		showPlaceholderDialog: false,
		placeholderList: [],
		showConfirm: false,
		selectedTemplate: null
	}));

	const { data } = useFoldersQuery({
		variables: {
			view: FOLDER_VIEW
		},
		options: {
			fetchPolicy: 'cache-only'
		}
	});

	const {
		loading,
		folderList,
		sharedFolders,
		selectedFolderName,
		showPlaceholderDialog,
		placeholderList,
		showConfirm,
		selectedTemplate
	} = state;

	const setSelectedTemplate = useCallback(
		template => {
			setState(prevState => {
				return {
					...prevState,
					selectedTemplate: template
				};
			});
		}, [selectedTemplate]
	);

	const closePlaceholderDialog = useCallback(
		() => {
			setState(prevState => {
				return {
					...prevState,
					showPlaceholderDialog: false
				};
			});
		}, [showPlaceholderDialog]
	);

	const hideConfirm = useCallback(
		userResp => {
			if (userResp !== null) {
				loadTemplate(userResp);
			} else {
				setState(prevState => {
					return {
						...prevState,
						showConfirm: false
					};
				});
			}
		}, [showConfirm]
	);

	const setPlaceholder = useCallback(
		e => {
			const obj = placeholderList.find(o => o.field === e.target.name);
			obj.value = e.target.value;
		}, [placeholderList]
	);

	const handleInsertClick = useCallback(
		() => {
			if (selectedTemplate === null) return;

			const placeholderListArr = [];
			const regex = new RegExp('\\$\\{[-a-zA-Z._0-9 ]+\\}', 'ig');
			let subjectArry;
			if (selectedTemplate.subject) {
				subjectArry = selectedTemplate.subject.match(regex);
				if (subjectArry !== null) {
					// get unique placeholders list...
					subjectArry = Array.from(new Set(subjectArry));
				}
			}

			let bodyArry = selectedTemplate.html.match(regex);
			if (bodyArry !== null) {
				bodyArry = Array.from(new Set(bodyArry));
			}

			if (subjectArry !== null || bodyArry !== null) {
				subjectArry &&
					subjectArry.forEach(placeholder => {
						placeholderListArr.push({ field: placeholder, value: '' });
					});

				bodyArry &&
					bodyArry.forEach(placeholder => {
						placeholderListArr.push({ field: placeholder, value: '' });
					});

				setState(prevState => {
					return {
						...prevState,
						showPlaceholderDialog: true,
						placeholderList: placeholderListArr
					};
				});
			} else {
				loadTemplate();
			}
		}, [selectedTemplate, showPlaceholderDialog, placeholderList]
	);

	const loadTemplate = useCallback(
		(overrideSubject = true) => {
			const currSubject = getSubject();
			if (currSubject !== '' && showConfirm == false) {
				setState(prevState => {
					return {
						...prevState,
						showConfirm: true
					};
				});
				return;
			}

			let subject = selectedTemplate.subject;
			let msgBody = selectedTemplate.html;
			placeholderList.forEach(placeholder => {
				if (placeholder.value !== '') {
					subject = subject.split(placeholder.field).join(placeholder.value);
					msgBody = msgBody.split(placeholder.field).join(placeholder.value);
				}
			});
			if (overrideSubject) {
				setSubject(subject);
			}

			if (selectedTemplate.inlineAttachments) {
				msgBody = updateInlineImages(msgBody);
			}

			insertAtCaret(msgBody, false);
			setTimeout(() => closeInsertModal(), 300);
		}, [showConfirm, selectedTemplate, placeholderList]
	);

	const updateInlineImages = useCallback(
		msgBody => {
			const inlineAttachments = selectedTemplate.inlineAttachments;
			if (inlineAttachments.length > 0) {
				inlineAttachments.forEach(function (inlineAttachment) {
					const findNeedle = `cid:${inlineAttachment.contentId.replace('@', '&#64;')}`;
					msgBody = msgBody.replace(findNeedle, inlineAttachment.url);
				});
			}
			return msgBody;
		}, [selectedTemplate]
	);

	const handleFolderClick = useCallback(
		({ absFolderPath }) => {
			const folderName = absFolderPath.replace(/^\//g, '');
			if (selectedFolderName !== folderName) {
				setState(prevState => {
					return {
						...prevState,
						selectedFolderName: folderName
					};
				});
			}
		}, [selectedFolderName]
	);

	useEffect(() => {
		if (data) {
			const folders = (get(data, 'getFolder.folders.0.folders') || []).filter(folder => !FILTER_FOLDER_IDS.includes(parseInt(folder.id))); // Trash, Chat
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

	const placeholderTable = placeholderList.map((placeholder, index) => (
		<div class={style.row} key={index}>
			<div class={style.cell}>{placeholder.field.replace(/\$|\{|\}/g, '')}</div>
			<div class={style.cell}>
				<TextInput name={placeholder.field} onChange={setPlaceholder} />
			</div>
		</div>
	));

	return (
		<Fragment>
			<ModalDialog
				class={style.insertTemplateModal}
				title="emailTemplates.insertDialog.title"
				cancelLabel="buttons.cancel"
				actionLabel="emailTemplates.insertDialog.btnLabel"
				onClose={closeInsertModal}
				onAction={handleInsertClick}
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
								<FolderListLight
									folders={folderList}
									folderNameProp={getFolderName}
									onFolderClick={handleFolderClick}
									sharedFolders={sharedFolders}
								/>
							</div>

							<div class={style.rightSide}>
								<TemplatePane
									selectedFolderName={selectedFolderName}
									setSelectedTemplate={setSelectedTemplate}
									selectedTemplate={selectedTemplate}
								/>
							</div>
						</div>
					)}
			</ModalDialog>
			{showConfirm && (
				<ConfirmModalDialog
					title={<Text id="emailTemplates.subjectConfirm" />}
					cancelButton={false}
					onResult={hideConfirm}
				/>
			)}
			{showPlaceholderDialog && (
				<ModalDialog
					title={<Text id="emailTemplates.replaceDialog.title" />}
					onClose={closePlaceholderDialog}
					onAction={loadTemplate}
					actionLabel='buttons.save'
				>
					<div class={style.placeholderTip}>
						<Text id="emailTemplates.replaceDialog.tipMsg" />
					</div>
					<div class={style.placeholderWrapper}>
						<div class={style.table}>{placeholderTable}</div>
					</div>
				</ModalDialog>
			)}
		</Fragment>
	);
}
export default withIntl()(InsertTemplate);
