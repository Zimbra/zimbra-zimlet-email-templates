import { withIntlWrapper } from '@zimbra-client/enhancers';

/**
 * @method withIntl
 * Wraps the `withIntlWrapper` HOC imported from from zimbra-client
 * It passes the path of internationalization file path of zimlet and moment as well.
 *
 * @returns {Class} `withIntlWrapper`
 *
 */
export default function withIntl() {
	/**
	 * @method withIntlWrapper
	 * accepts three arguments which can be use to load zimlet locale.
	 * @param {Object} - with following values
	 * @param {Function} importFn which returns `import` with intl locale path of the zimlet.
	 * @param {Boolean} showLoader Show loader on container or not
	 *
	 */
	return withIntlWrapper({
		importFn: locale => import(/* webpackMode: "eager" */ `./intl/${locale}.json`),
		showLoader: false
	});
}
