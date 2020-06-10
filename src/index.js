import { createElement } from 'preact';
import withIntl from './enhancers';
import TemplateOptions from './components/template-options';

export default function Zimlet(context) {
	const { plugins } = context;
	const exports = {};

	exports.init = function init() {
		plugins.register('slot::compose-footer-right-btn', templateBtn);
	};

	const templateBtn = withIntl()(props => {
		return (
			<TemplateOptions
				getMessage={props.getMessage}
				insertAtCaret={props.insertAtCaret}
				subjectInput={props.subjectInput}
				context={context}
			/>
		);
	});
	return exports;
}
