import { createElement } from 'preact';
import style from './style.less';
import { Text } from 'preact-i18n';
import cx from 'classnames';
import { useState, useEffect } from 'preact/hooks';
import { fetchListing } from '../../lib/util';
import { callWith } from '@zimbra-client/util';
import get from 'lodash-es/get';

export default function TemplatePane(
	{ selectedFolderName, selectedTemplate, setSelectedTemplate },
	context
) {
	const [templateList, setTemplateList] = useState([]);
	const [clickedTemplate, setclickedTemplate] = useState(selectedTemplate);

	const handleTemplateClick = template => {
		setSelectedTemplate(template);
	};

	useEffect(() => {
		if (selectedFolderName !== null) {
			fetchListing(context, selectedFolderName).then(res => {
				setTemplateList(res);
				setSelectedTemplate(null);
			});
		}
	}, [selectedFolderName]);

	useEffect(() => {
		setclickedTemplate(selectedTemplate);
	}, [selectedTemplate]);

	const selectedId = get(clickedTemplate, 'id') || null;
	const list =
		Array.isArray(templateList) &&
		templateList.map(template => (
			<div
				class={cx(
					style.templateItem,
					style.narrow,
					selectedId && template.id === selectedId && style.selected
				)}
				key={template.id}
				onClick={callWith(handleTemplateClick, template)}
			>
				<div class={style.listItem}>
					<div class={style.listItemName}>{template.subject}</div>
				</div>
			</div>
		));
	return (
		<div class={style.innerClass}>
			{templateList.length > 0 ? list : <div class={style.noItems}><Text id="emailTemplates.noTemplatesMsg" /></div>}
		</div>
	);
}
