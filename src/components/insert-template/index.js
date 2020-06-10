import { createElement, Component } from 'preact';
import { Text } from 'preact-i18n';
import style from './style.less';
import wire from 'wiretie';
import { withText } from 'preact-i18n';
import {
	ModalDialog,
	FolderListLight,
	ConfirmModalDialog,
	TextInput
} from '@zimbra-client/components';
import TemplatePane from './template-pane.js';
import cx from 'classnames';
import { FILTER_FOLDER_IDS, FOLDER_LIST_OPTIONS } from '../../constants';
import { Spinner } from '@zimbra-client/blocks';

@wire('zimbra', {}, zimbra => ({
	folderData: zimbra.folders.list
}))
@withText({
	insertDialogTitle: 'emailTemplates.insertDialog.title',
	insertBtnLabel: 'emailTemplates.insertDialog.btnLabel'
})
export default class InsertTemplate extends Component {
	state = {
		loading: true,
		folderList: [],
		sharedFolders: [],
		selectedFolderName: null,
		showPlaceholderDialog: false,
		showConfirm: false
	};
	placeholderList = [];
	selectedTemplate = null;

	setSelectedTemplate = template => {
		this.selectedTemplate = template;
	};

	closePlaceholderDialog = () => {
		this.setState({ showPlaceholderDialog: false });
	};

	hideConfirm = userResp => {
		if (userResp === true) {
			this.setState({ showConfirm: false }, this.loadTemplate());
		} else if (userResp === false) {
			this.setState({ showConfirm: false }, this.loadTemplate(false));
		} else {
			this.setState({ showConfirm: false });
		}
	};

	setPlaceholder = e => {
		const obj = this.placeholderList.find(o => o.field === e.target.name);
		obj.value = e.target.value;
	};

	handleInsertClick = () => {
		const tempObj = this.selectedTemplate;
		if (tempObj === null) return;

		this.placeholderList = [];
		const regex = new RegExp('\\$\\{[-a-zA-Z._0-9 ]+\\}', 'ig');
		let subjectArry;
		if (tempObj.subject) {
			subjectArry = tempObj.subject.match(regex);
			if (subjectArry !== null) {
				// get unique placeholders list...
				subjectArry = Array.from(new Set(subjectArry));
			}
		}

		let bodyArry = tempObj.html.match(regex);
		if (bodyArry !== null) {
			bodyArry = Array.from(new Set(bodyArry));
		}

		if (subjectArry !== null || bodyArry !== null) {
			subjectArry &&
				subjectArry.forEach(placeholder => {
					this.placeholderList.push({ field: placeholder, value: '' });
				});

			bodyArry &&
				bodyArry.forEach(placeholder => {
					this.placeholderList.push({ field: placeholder, value: '' });
				});

			this.setState({ showPlaceholderDialog: true });
		} else {
			this.setState({ showPlaceholderDialog: false }, this.loadTemplate);
		}
	};

	loadTemplate = (overrideSubject = true) => {
		const subjectEle = this.props.subjectInput.current;
		if (subjectEle.value !== '' && this.state.showConfirm == false) {
			this.setState({ showConfirm: true });
			return;
		}

		let subject = this.selectedTemplate.subject;
		let msgBody = this.selectedTemplate.html;
		this.placeholderList.forEach(placeholder => {
			if (placeholder.value !== '') {
				subject = subject.split(placeholder.field).join(placeholder.value);
				msgBody = msgBody.split(placeholder.field).join(placeholder.value);
			}
		});
		if (overrideSubject) {
			subjectEle.value = subject;
		}

		const event = new Event('input');
		subjectEle.dispatchEvent(event);

		if (this.selectedTemplate.inlineAttachments !== undefined) {
			msgBody = this.updateInlineImages(msgBody);
		}

		this.props.insertAtCaret(msgBody, false);
		setTimeout(() => this.props.closeInsertModal(), 300);
		this.selectedTemplate = null;
	};

	updateInlineImages = msgBody => {
		const inlineAttachments = this.selectedTemplate.inlineAttachments;
		if (inlineAttachments.length > 0) {
			inlineAttachments.forEach(function(inlineAttachment) {
				const findNeedle = `cid:${inlineAttachment.contentId.replace('@', '&#64;')}`;
				msgBody = msgBody.replace(findNeedle, inlineAttachment.url);
			});
		}
		return msgBody;
	};

	componentDidMount() {
		this.props.folderData(FOLDER_LIST_OPTIONS).then(res => {
			const filterFolders = FILTER_FOLDER_IDS; // Trash, Chat
			const sharedFolders = res.link !== undefined ? res.link : this.state.sharedFolders;
			this.setState({
				folderList: res.folder.filter(function(folder) {
					return !filterFolders.includes(folder.id);
				}),
				sharedFolders,
				loading: false
			});
		});
	}

	handleFolderClick = ({ absFolderPath }) => {
		const folderName = absFolderPath.replace(/^\//g, '');
		if (this.state.selectedFolderName !== folderName) {
			this.setState({ selectedFolderName: folderName });
		}
	};

	getFolderName = folder => folder.name;

	render(
		{ closeInsertModal, insertDialogTitle, insertBtnLabel },
		{ folderList, sharedFolders, selectedFolderName, loading }
	) {
		const placeholderList = this.placeholderList.map(placeholder => (
			<div class={style.row}>
				<div class={style.cell}>{placeholder.field.replace(/\$|\{|\}/g, '')}</div>
				<div class={style.cell}>
					<TextInput name={placeholder.field} onChange={this.setPlaceholder} />
				</div>
			</div>
		));
		return (
			<div>
				{this.state.showConfirm && (
					<ConfirmModalDialog
						title={<Text id="emailTemplates.subjectConfirm" />}
						cancelButton={false}
						onResult={this.hideConfirm}
					/>
				)}
				{this.state.showPlaceholderDialog && (
					<ModalDialog
						title={<Text id="emailTemplates.replaceDialog.title" />}
						onClose={this.closePlaceholderDialog}
						onAction={this.loadTemplate}
						actionLabel={`buttons.save`}
					>
						<div class={style.placeholderTip}>
							<Text id="emailTemplates.replaceDialog.tipMsg" />
						</div>
						<div class={style.placeholderWrapper}>
							<div class={style.table}>{placeholderList}</div>
						</div>
					</ModalDialog>
				)}
				<ModalDialog
					class={style.insertTemplateModal}
					title={insertDialogTitle}
					cancelLabel="buttons.cancel"
					actionLabel={insertBtnLabel}
					onClose={closeInsertModal}
					onAction={this.handleInsertClick}
					headerClass={style.header}
					contentClass={style.content}
					footerClass={cx(style.footer)}
					disableOutsideClick
				>
					{loading ? (
						<Spinner block />
					) : (
						<div class={style.dataInner}>
							<div class={style.leftSide}>
								<FolderListLight
									folders={folderList}
									folderNameProp={this.getFolderName}
									onFolderClick={this.handleFolderClick}
									sharedFolders={sharedFolders}
								/>
							</div>

							<div class={style.rightSide}>
								<TemplatePane
									selectedFolderName={selectedFolderName}
									setSelectedTemplate={this.setSelectedTemplate}
								/>
							</div>
						</div>
					)}
				</ModalDialog>
			</div>
		);
	}
}
