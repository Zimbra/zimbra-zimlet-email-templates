import { createElement, Component } from 'preact';
import style from './style.less';
import wire from 'wiretie';
import { withText } from 'preact-i18n';
import { ModalDialog, FolderListLight } from '@zimbra-client/components';
import cx from 'classnames';
import { Spinner } from '@zimbra-client/blocks';
import { FILTER_FOLDER_IDS, FOLDER_LIST_OPTIONS } from '../../constants';

@wire('zimbra', {}, zimbra => ({
	folderData: zimbra.folders.list
}))
@wire('zimbra', null, zimbra => ({
	moveMessage(docId, parentDirId) {
		if (docId !== '') {
			const soapObj = {
				action: {
					op: 'move',
					id: `${docId}`,
					l: `${parentDirId}`
				},
				_jsns: 'urn:zimbraMail'
			};
			return zimbra.jsonRequest('ItemActionRequest', soapObj);
		}
		return Promise.resolve(null);
	}
}))
@withText({
	saveDialogTitle: 'emailTemplates.saveDialog.title',
	saveBtnLabel: 'emailTemplates.saveDialog.btnLabel',
	subjectRequire: 'emailTemplates.subjectRequire',
	savingMsg: 'emailTemplates.savingMsg',
	savedMsg: 'emailTemplates.savedMsg',
	saveMsgError: 'emailTemplates.saveMsgError',
	saveMsgSelectFolder: 'emailTemplates.saveMsgSelectFolder',
	saveMsgPermissionIssue: 'emailTemplates.saveMsgPermissionIssue'
})
export default class SaveTemplate extends Component {
	constructor(props) {
		super(props);
		this.zimletContext = props.context;
		this.state = {
			folderList: [],
			sharedFolders: [],
			selectedFolderId: null,
			loading: true
		};
	}

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

	handleFolderClick = folderData => {
		this.setState({ selectedFolderId: folderData.id });
	};

	handleSaveClick = () => {
		const subjectEle = this.props.subjectInput.current;
		if (subjectEle.value.trim() == '') {
			this.alert(this.props.subjectRequire);
			return;
		}

		const msg = this.props.getMessage();
		if (this.state.selectedFolderId !== null) {
			this.props
				.moveMessage(msg.draftId, this.state.selectedFolderId)
				.then(moveRes => {
					if (moveRes.id !== undefined) {
						this.alert(this.props.savedMsg);
						this.props.closeSaveModal();
					} else {
						this.alert(this.props.saveMsgPermissionIssue);
					}
				})
				.catch(error => {
					this.alert(this.props.saveMsgError);
					console.log('Error: ', error);
					this.props.closeSaveModal();
				});
		} else {
			this.alert(this.props.saveMsgSelectFolder);
		}
	};

	alert = message => {
		const { dispatch } = this.zimletContext.store;
		dispatch(
			this.zimletContext.zimletRedux.actions.notifications.notify({
				message
			})
		);
	};

	render(
		{ closeSaveModal, saveDialogTitle, saveBtnLabel },
		{ folderList, sharedFolders, loading }
	) {
		return (
			<ModalDialog
				class={style.saveTemplateModal}
				title={saveDialogTitle}
				cancelLabel="buttons.cancel"
				actionLabel={saveBtnLabel}
				onClose={closeSaveModal}
				onAction={this.handleSaveClick}
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
							<p class={style.saveTip}>Please select folder to store template</p>
							<FolderListLight
								folders={folderList}
								folderNameProp={this.getFolderName}
								onFolderClick={this.handleFolderClick}
								sharedFolders={sharedFolders}
							/>
						</div>
					</div>
				)}
			</ModalDialog>
		);
	}
}
