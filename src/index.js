import { createElement } from 'preact';
import TemplateOptions from './components/template-options';

export default function Zimlet(context) {
	const { plugins } = context;
	const exports = {};

	exports.init = function init() {
		const options = createOptions(context);
		plugins.register('slot::compose-sender-options-menu', options);
	};
	return exports;
}

function createOptions(context) {
	return props => {
		if (props.matchesScreenMd) {
			return <TemplateOptions {...props} context={context} />;
		}
	};
}
