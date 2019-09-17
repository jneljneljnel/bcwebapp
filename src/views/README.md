

# MaiaChat #


## Description ##

Maia-chat is an UI framework for chat applications that can be easily AI enabled with the power of dmpl and dmos.

## INSTALLATION ##
```
npm install maia-chat
```
## USAGE ##

1) Import the ```MaiaChat``` component and add it to the component of your choice
```javascript

import  React  from  'react';
import { MaiaChat } from  'maia-chat';
	
class  App  extends  React.Component {
	render() {
		return (
			<div  className="App">
				<MaiaChat  />
			</div>
		);
	}
}

export  default  App;

```

2) Required props include ```handleNewUserInput``` and ```initialMessage```, which is a function that is called everytime user input is received and the first message (act object) sent to the chat, respectively.

  

```javascript

import  React  from  'react';
import { MaiaChat } from  'maia-chat';

const  firstMessage = {
		object:  "maia",
		action:  "say",
		params: {
			ssml:  "Hi! How are you doing?",
			tts:  true
		}
	}

class  App  extends  React.Component {
	//Handles what the return message will be based on the user input
	handleUserInput = (userInput) => {
		console.log('User said' + `${userInput}`);
	}

	render() {
		return (
		<div className="App">
			<MaiaChat
				handleNewUserInput={this.handleUserInput}
				initialMessage={firstMessage}
			/>
		</div>
	)};
}

```

3) Import methods for sending system messages
```javascript

import  React  from  'react';
import { MaiaChat, addResponseMessage } from  'maia-chat';

const  firstMessage = {
	object:  "maia",
	action:  "say",
		params: {
		ssml:  "Hi! How are you doing?",
		tts:  true
	}
}

class  App  extends  React.Component {
	handleUserInput = (userInput) => {
		if (userInput === 'hello'){
			addResponseMessage({
				object:  "maia",
				action:  "say",
				params: {
					ssml:  "That's good to hear!",
					tts:  true
				}
			});
		}
	}

	render() {
		return (
		<div className="App">
			<MaiaChat
				handleNewUserInput={this.handleUserInput}
				initialMessage={firstMessage}
			/>
		</div>);
	}
}

  

```

4) Other props for MaiaChat
```javascript

import  React  from  'react';
import { MaiaChat, addResponseMessage } from  'maia-chat';

const  firstMessage = {
	object:  "maia",
	action:  "say",
		params: {
		ssml:  "Hi! How are you doing?",
		tts:  true
	}
}

class  App  extends  React.Component {
	handleUserInput = (userInput) => {
		if (userInput === 'hello'){
			addResponseMessage({
				object:  "maia",
				action:  "say",
				params: {
					ssml:  "That's good to hear!",
					tts:  true
				}
			});
		}
	}

	render() {
		return (
		<div className="App">
			<MaiaChat
				...
				username="Daniel"
				title="The Solar System"
			/>
		</div>);
	}
}

  

```
## API ##

#### Props ####
||type| required| default |description
|--|--|--|--|--|
|**handleNewUserInput(newInput)**|function |yes  |Function that receives new input from user and handles what to send next  |
|**initialMessage**|Object or Array| no |First message sent from Maia; Object needs to be in act message format or an array of act messages|
|**username**|string |no  |Name of user; Also determines the alphabetical letter for the user avatar|
|**title**|string |no  |Title of chat lesson displayed above chat; Empty title will result in no title|


#### Functions ####

||parameters| Description
|--|--|--|
|**addResponseMessage**|Act message/s (Object or Array) |Message outputted by Maia; If parameter is an array of act messages, speech bubbles will stack and only the last speech bubble will display pointy end and avatar.|
|**addUserMessage**|string or object |Message outputted by user


#### Act Messages ####
tbd



### MAINTAINERS ###

* Jeremy Nelson (jnelson@dm.ai)