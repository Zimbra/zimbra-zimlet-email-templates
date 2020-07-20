import { createElement } from 'preact';
import { Text } from 'preact-i18n';
import {
	ActionMenuGroup,
	ActionMenuItem
} from '@zimbra-client/components';
import InsertTemplate from '../insert-template';
import SaveTemplate from '../save-template';
import HelpModal from '../help-modal';
import { callWith } from '@zimbra-client/util';
import { INSERT_MODAL, SAVE_MODAL, HELP_MODAL } from '../../constants';
import withIntl from '../../enhancers';

function TemplateOptions({
	insertAtCaret,
	getMessage,
	getSubject,
	setSubject,
	context,
	isPlainText
}) {

	let modal;
	const { addModal } = context.zimletRedux.actions.zimlets;

	const openModal = (modalId) => {
		const { dispatch } = context.store;
		switch (modalId) {
			case INSERT_MODAL:
				modal = <InsertTemplate
					closeInsertModal={callWith(handleClose, { isTrusted: true, modalId })}
					insertAtCaret={insertAtCaret}
					getSubject={getSubject}
					setSubject={setSubject}
				/>
				break;
			case SAVE_MODAL:
				modal = <SaveTemplate
					closeSaveModal={callWith(handleClose, { isTrusted: true, modalId })}
					getMessage={getMessage}
					getSubject={getSubject}
					context={context}
				/>
				break;
			case HELP_MODAL:
				modal = <HelpModal closeHelpModal={callWith(handleClose, { isTrusted: true, modalId })} />;
				break;
		}
		dispatch(addModal({ id: modalId, modal: modal }));
	}

	const handleClose = e => {
		const { dispatch } = context.store;
		return e && e.isTrusted && dispatch(addModal({ id: e.modalId }));
	}

	if (!isPlainText) {
		return (
			<ActionMenuGroup>
				<ActionMenuItem
					icon="mail-reply-all"
					onClick={callWith(openModal, INSERT_MODAL)}>
					<Text id="emailTemplates.insertTemplateLabel" />
				</ActionMenuItem>
				<ActionMenuItem icon="folder-add" onClick={callWith(openModal, SAVE_MODAL)}>
					<Text id="emailTemplates.saveTemplateLabel" />
				</ActionMenuItem>
				<ActionMenuItem icon="about" onClick={callWith(openModal, HELP_MODAL)}>
					<Text id="emailTemplates.helpTitle" />
				</ActionMenuItem>
			</ActionMenuGroup>
		);
	}
}
export default withIntl()(TemplateOptions);

