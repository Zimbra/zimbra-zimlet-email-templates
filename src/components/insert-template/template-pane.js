import { createElement, Component } from 'preact';
import style from './style.less';
import wire from 'wiretie';
import { withText } from 'preact-i18n';
import cx from 'classnames';
import { FOLDER_VIEW } from '../../constants';

@wire('zimbra', null, zimbra => ({
	fetchListing(templateFolder) {
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
		return zimbra.jsonRequest('SearchRequest', options);
	}
}))
@withText({
	noTemplatesMsg: 'emailTemplates.noTemplatesMsg'
})
export default class TemplatePane extends Component {
	state = {
		templateList: [],
		selectedTemplate: null
	};

	componentDidUpdate(prevProps) {
		if (this.props.selectedFolderName !== prevProps.selectedFolderName) {
			this.props.fetchListing(this.props.selectedFolderName).then(res => {
				this.setState({ templateList: res, selectedTemplate: null });
				this.props.setSelectedTemplate(null);
			});
		}
	}

	handleTemplateClick = template => {
		this.setState({ selectedTemplate: template });
		this.props.setSelectedTemplate(template);
	};

	render({ noTemplatesMsg }, { templateList }) {
		const selectedId = this.state.selectedTemplate !== null ? this.state.selectedTemplate.id : null;
		let list = false;
		list =
			Array.isArray(templateList) &&
			templateList.map(template => (
				<div
					class={cx(
						style.templateItem,
						style.narrow,
						selectedId && template.id === selectedId && style.selected
					)}
				>
					<div class={style.listItem} onClick={this.handleTemplateClick.bind(this, template)}>
						<div class={style.listItemName}>{template.subject}</div>
					</div>
				</div>
			));
		return (
			<div class={style.innerClass}>
				{list ? list : <div class={style.noItems}>{noTemplatesMsg}</div>}
			</div>
		);
	}
}
