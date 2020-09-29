# zimbra-zimlet-email-templates
This is a Zimlet that helps the user to maintain and use Email Templates. An User will use templates when s/he has to send a lot of 'similar looking' emails but with small changes. Consider an Accountant in the finance department sending invoices at the end of the month. The Accountant will create an invoice template with all the boiler plate text in it, leaving placeholders in the template where the changing data needs to go. When it is time to send out the actual invoices, the accountant will do the following:
* Compose a new email.
* Insert the invoice template into this new email.
* While inserting, the user will replace the actual values for the placehoder.
* Send the email.

Thus this Zimlet eases the user's job when they need to send many emails with boiler plate content and with small changes for each instance.

## Loading the Zimlet
Like all other Zimlets, this one will also be available to the user when the Administrator enables it.
On the compose email screen, when the user sees a templates button at bottom-right(figure #1), it means this zimlet is loaded and available.

## Creating a new template
The user can create a template with all the boiler-plate text and placeholders as follows (figure #1).
* Compose an email as usual. (Click on "New Message" button in the Mail tab)
* Add the boiler-plate text as necessary.
* We can add placeholders where appropriate using $ sign with a name in curly braces as ${MY_PLACEHOLDER}
* Placeholder names are case-sensitive and can use albhabets, numbers, hyphen, underscore, dot and space characters.

## Saving the template
* Once the user creates a new template with the above steps, s/he should click on templates button and choose "Save as Template" option (figure #1).
* It will show the list of folders to save the template. User can select any folder and click the Save button.
Note: User can also save templates in any "Shared Folders" with write permission.

## Composing an email with templates
* Click on "New Message" button in the Mail tab to compose a new message.
* Click on ...-menu and choose the "Insert Template" option, it will show the list of folders in a dialog.
* Click on any folder and it will list templates in that folder.
* Click on any template and click "Insert" button to insert that template.
* In an email, the user can insert as many templates as s/he wishes.
* The user can insert the template at any position using the cursor.
Note: Templates are saved as nothing but regular emails. In that sense any previously existing email can be used in the Insert dialogue.

## Screenshots
> ![](screenshots/zimlet-button.png)
*This button shows email templates zimlet is loaded.*

> ![](screenshots/insert-dialog.png)
*Insert Template - Lists folders and templates under the clicked folder.*

> ![](screenshots/placeholder-dialog.png)
*Template having placeholders - asks user to fill values for placeholders.*

> ![](screenshots/template_converted.png)
*Example of placeholder template.*

> ![](screenshots/save-template.png)
*Save as Template - Click on any folder where you want to save this template.*

## Instructions for developers

## Prerequisites 

To follow the steps in this article you need a Zimbra test server. You will need to have Zimbra 9 Network Edition. You can set this up in a Virtual Machine in the cloud or you can install it on your local computer inside VirtualBox/KVM/Parallels etc. If you decide to set it up on your local computer you need at least an i5 with 16GB of RAM and a SSD. Your test server needs to be accessible over SSH. Instructions on how to set up your Zimbra server: https://blog.zimbra.com/2018/01/install-zimbra-collaboration-8-8-ubuntu-16-04-lts/ make sure to install the latest patches. You can find instructions on how to install patches at https://wiki.zimbra.com/wiki/Zimbra_Releases

## Deploy the Zimlet Sideloader

You need to deploy and enable the Zimlet Sideloader on your development server. You only have to do this step once. 

      yum install zimbra-zimlet-sideloader
      apt install zimbra-zimlet-sideloader
      su - zimbra
      zmmailboxdctl restart

![](screenshots/01-COS-Zimlet.png)
*Verify that the Sideloader Zimlet is available and enabled for your Zimbra Class of Service (CoS) by logging into the Admin UI -> Home -> Configure -> Class of Service.*

![](screenshots/02-User-Zimlet.png)
*Verify that the Sideloader Zimlet is available and enabled for your Zimbra and account by logging into the Admin UI -> Home -> Manage -> Accounts.*

## Installing Zimlet CLI

You can develop Zimbra Zimlets on any OS supported by NodeJS (https://nodejs.org/en/download/). This article will include Linux commands you can run on CentOS/Fedora/Redhat and Ubuntu. If you run on a different OS reading these commands should help you understand what you must do to get started. 

Zimbra provides a tool called Zimlet CLI that is based on Webpack. It is used for building/packaging your Zimlet and for working with Zimlet templates. Install it on your local computer:

As root:

      yum install nodejs
      apt install nodejs
      npm install -g @zimbra/zimlet-cli


## Downloading and running the Email Templates Zimlet

Create a folder on your local computer to store the Email Templates Zimlet:

      mkdir templates_zimlet
      cd templates_zimlet
      git clone git@github.com:Zimbra/zimbra-zimlet-email-templates.git
      cd zimbra-zimlet-email-templates
      npm install
      zimlet watch

The output of this command should be:

```
Compiled successfully!

You can view the application in browser.

Local:            https://localhost:8081/index.js
On Your Network:  https://192.168.1.100:8081/index.js
```

Visit https://localhost:8081/index.js in your browser and accept the self-signed certificate. The index.js is a packed version of the `Email Templates Zimlet`. More information about the zimlet command, npm and using SSL certificates can be found in https://github.com/Zimbra/zm-zimlet-guide. 

## Sideload the email templates Zimlet

Log on to your Zimbra development server and make sure that you are seeing the modern UI. Then append `/sdk/zimlets` to the URL.

> ![](screenshots/03-Sideload.png)
*Sideload the Email Templates Zimlet by clicking Load Zimlet. The Zimlet is now added to the Zimbra UI in real-time. No reload is necessary.*

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/zimbra/zimlet-cli/blob/master/README.md).

## Visual Studio Code

Open the folder `~/templates_zimlet/zimbra-zimlet-email-templates` in Visual Studio code to take a look at the code in the Email Templates Zimlet. More information on this can be found at: https://github.com/Zimbra/zm-zimlet-guide.

## How to implement the feature

First step is to implement the Zimlet slot `compose-footer-right-btn`. This is done in 

* ~/templates_zimlet/zimbra-zimlet-email-templates/src/index.js

```javascript
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

```

It is important to understand that the compose-footer-right-btn Zimlet slot passes on to our Zimlet the getMessage, insertAtCaret prop. We use this getMessage prop to get the composed message and insertAtCaret prop is used to set the template content in the body of composer. This piece of code calls methods from Composer component from Zimbra core when user inserts or saves a template.

```javascript
this.props.insertAtCaret(msgBody, false);
```

```javascript
const msg = this.props.getMessage();
```

## Zimlet slot compose-sender-options-menu

This Zimlet uses the compose-sender-options-menu Zimlet slot. This slot allows a Zimlet developer to get/set the subject and body of the email message a user is composing. The Zimlet slot has the following props:

| prop |
|---|
| getMessage |
| insertAtCaret |
| getSubject |
| setSubject |
| isPlainText |
