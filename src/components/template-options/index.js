import { createElement, Component } from 'preact';
import { Text } from 'preact-i18n';
import { Icon } from '@zimbra-client/blocks';
import style from './style.less';
import { withText } from 'preact-i18n';
import {
	ActionMenu,
	DropDownWrapper,
	ActionMenuGroup,
	ActionMenuItem
} from '@zimbra-client/components';
import InsertTemplate from '../insert-template';
import SaveTemplate from '../save-template';

@withText({
	templateBtnTooltip: 'emailTemplates.templateBtnTooltip'
})
export default class TemplateOptions extends Component {
	state = {
		showInsertDialog: false,
		showSaveDialog: false
	};

	showInsertModal = () => {
		this.setState({ showInsertDialog: true });
	};

	closeInsertModal = () => {
		this.setState({ showInsertDialog: false });
	};

	showSaveModal = () => {
		this.setState({ showSaveDialog: true });
	};

	closeSaveModal = () => {
		this.setState({ showSaveDialog: false });
	};

	render({ templateBtnTooltip }) {
		return (
			<div class={style.zmEditorToolbarRightZimletSlot}>
				<ActionMenu label={<Icon name="file-word-o" />} arrow={false} title={templateBtnTooltip}>
					<DropDownWrapper>
						<ActionMenuGroup class={style.templateMenu}>
							<ActionMenuItem
								icon="mail-reply-all"
								iconClass={style.actionIcon}
								onClick={this.showInsertModal}
							>
								<Text id="emailTemplates.insertTemplateLabel" />
							</ActionMenuItem>
							<div class={style.separator} />
							<ActionMenuItem
								icon="folder-add"
								iconClass={style.actionIcon}
								onClick={this.showSaveModal}
							>
								<Text id="emailTemplates.saveTemplateLabel" />
							</ActionMenuItem>
						</ActionMenuGroup>
					</DropDownWrapper>
				</ActionMenu>
				{this.state.showInsertDialog && (
					<InsertTemplate
						closeInsertModal={this.closeInsertModal}
						insertAtCaret={this.props.insertAtCaret}
						subjectInput={this.props.subjectInput}
					/>
				)}
				{this.state.showSaveDialog && (
					<SaveTemplate
						closeSaveModal={this.closeSaveModal}
						getMessage={this.props.getMessage}
						subjectInput={this.props.subjectInput}
						context={this.props.context}
					/>
				)}
			</div>
		);
	}
}
