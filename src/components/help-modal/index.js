import { createElement } from 'preact';
import { Text } from 'preact-i18n';
import { ModalDialog } from '@zimbra-client/components';
import style from './style.less';
import withIntl from '../../enhancers';

function HelpModal({ closeHelpModal }) {
	const getListData = (category, listCount) => {
		let listItems = [];
		for (let i = 0; i < listCount; i++) {
			listItems.push(<li key={`${category}List${i + 1}`}><Text id={`emailTemplates.helpModal.${category}.list${i + 1}`} /></li>);
		}
		return (<ul>{listItems}</ul>);
	}

	return (
		<ModalDialog
			title={<Text id="emailTemplates.helpTitle" />}
			class={style.helpModal}
			cancelButton={false}
			onClose={closeHelpModal}
			onAction={closeHelpModal}
		>
			<div class={style.helpWrapper}>
				<h3><Text id="emailTemplates.helpModal.createTemplate.title" /></h3>
				<p><Text id="emailTemplates.helpModal.createTemplate.intro" /></p>
				{getListData('createTemplate', 4)}
				<h3><Text id="emailTemplates.helpModal.saveTemplate.title" /></h3>
				{getListData('saveTemplate', 3)}
				<h3><Text id="emailTemplates.helpModal.composeWithTemplate.title" /></h3>
				{getListData('composeWithTemplate', 6)}
				<h3><Text id="emailTemplates.helpModal.notes.title" /></h3>
				{getListData('notes', 2)}
			</div>
		</ModalDialog>
	);
}
export default withIntl()(HelpModal);