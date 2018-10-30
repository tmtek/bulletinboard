const {ConvoApp, Convo, Say} = require('@tmtek/convo');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');

class BulletinBoard extends ConvoApp {

	onPrepareHelp() {
		this._help = [
			{
				description:'How to add bulletins to the board.',
				tips:[
					{tip:'Say "Add Bulletin" to add a new bulletin to your board.'},
					{tip:'Say "Add" followed by your message to quickly add a new bulletin to the board.'},
					{tip:'New bulletins will be automatically sorted by when they expire.'}
				]
			},
			{
				description:'How to navigate the bulletin board list.',
				tips:[
					{tip:'You can say "what\'s on the board" at any time to hear what\'s on your board'},
					{tip:'Bulletins are often presented in pages. You can say "next page", or "previous page" to jump ahead or back.'},
					{tip:'You can say "read them all" to read the entire list of bulletins with no pages.'},
					{tip:'When you are presented with a list page, you can ask to select any bulletin by saying "Select the first one.", or "select the second one".'},
					{tip:'You can select any item by saying "Select the one that contains..." along with a word that is in the bulletin you want to select.'},
					{tip:'You can say "back to list" at any time to return to your place in a list after a selection.'}
				]
			},
			{
				description:'How to create bulletins that expire, and delete ones that don\'t.',
				tips:[
					{tip:'If an added bulletin contains reference to a day such as : "today", "tonight", "tomorrow", "Tuesday", then it will automatically expire at the end of that day.'},
					{tip:'If we cannot determine when a bulletin expires automatically, then it will remain on the board until it is deleted manually.'},
					{tip:'If you select a bulletin from the list, it can be manually deleted by saying "delete it", or "wipe it".'},
					{tip:'You can delete all bulletins at any time by saying "Wipe the board".'}
				]
			}
		];
	}

	onRegisterIntents() {
		this.onPrepareHelp();
		this.initTimeAndExpires();
		this.registerListIntents();
		this.registerIntent('help', (convo, params, option, debug) =>
			Convo.ask(
				convo
					.setList('help', this._help, {start:0, count:-1})
					.forListPage(this.onRespondForList)
					,
			debug)
		);
		this.registerIntent('welcome', (convo, params, option, debug) =>
			Convo.ask(convo.promise(() => {
				if (this.hasBulletins(convo)) {
					return this.readBulletins(
						convo
							.speak('Welcome to BulletinBoard.')
							.speak('Don\'t forget you can ask for help if you want to learn about what I can do.', false)
							.speak('Here\'s your upcoming bulletins:'),
						3
					)
				} else {
				  return convo
						.speak('Welcome to BulletinBoard.')
						.speak('Just ask for help if you want to learn about what I can do.', false);
				}
			}), debug)
		);
		this.registerIntent('add_bulletin', (convo, {bulletin}, option, debug) =>
		  Convo.ask(this.addBulletin(convo,bulletin), debug)
		);
		this.registerIntent('read_bulletins', (convo, params, option, debug) =>
		  Convo.ask(this.readBulletins(convo, ConvoApp.ensureNumber(params.count)),debug)
		);
		this.registerIntent('read_bulletins_all', (convo, params, option, debug) =>
		  Convo.close(this.readBulletins(convo, -1),debug)
		);
		this.registerIntent('clear_bulletins', (convo, params, option, debug) =>
		  Convo.ask(this.clearBulletins(convo), debug)
		);
		this.registerIntent('bulletin_delete', (convo, params, option, debug) =>
		  Convo.ask(this.deleteBulletin(convo), debug)
		);
		this.registerIntent('update_expires', (convo, params, option, debug) =>
		  Convo.ask(this.applyExpiresForBulletins(convo), debug)
		);
	}

	onRespondForList({ convo, type, page, paging, list }) {
		if (type === 'bulletin') {
			return convo
				.write(`Your Bulletin Board:`, true)
				.speak(Say.listPageResponse(page, paging, list, item => Say.ensureSentence(item.text), "\n\n"), false)
				.present(Convo.List({
						title: "Bulletins:",
						items: Say.listItems(list, item => ({
							title:item.text,
							description:`${item.expires ? "Expires " + new TimeAgo('en-US').format(new Date(item.expires)): "Doesn't Expire."}`
						}))
					}),
					'actions.capability.SCREEN_OUTPUT'
				);
		} else if (type === 'help') {
			if (!convo.isInStorage("help_intro", intro => intro.ran)) {
				convo.speak(`Before you are presented with the list of help topics, know that you can say "Select the first one", or "Select the second one", etc to get more details on any of the topics presented to you.`, false)
				.setToStorage("help_intro", {ran:true});
			}
			return convo.speak('Here are the help topics:')
			.speak(Say.listPageResponse(page, paging, list, item => Say.ensureSentence(item.description), "\n\n"), false)
			.present(
				Convo.List({
					title:'Help Topics',
					items:Say.listItems(
						list,
						item => ({title:item.description, description:`${item.tips.length} tips`})
					)
				}),
				'actions.capability.SCREEN_OUTPUT'
			)
		}
		return convo.speak("Can't access the list right now.");
	}

	onRespondForListSelection({ convo, type, item }) {
		if (type === 'bulletin' && item) {
			return convo
			.speak(Say.ensureSentence(`${item.text}`))
			.speak(
				item.expires ?
				`This bulletin expires ${new TimeAgo('en-US').format(new Date(item.expires))}`
				:
				"This bulletin will not expire."
			)
		} else if (type === 'help' && item) {
			return convo
			.speak(item.description)
			.speak('Before we read the tips, know that you can say "back to list" to return to the help topics.\n\n')
			.speak(item.tips.reduce((say, tip) => say.sentence(`${tip.tip}\n\n`), new Say()), false)
			.present(
				Convo.List({
					title:'Tips',
					items:Say.listItems(
						item.tips,
						tip => ({title:tip.tip}),
						(item, i) => `tip${i}`
					)
				}),
				'actions.capability.SCREEN_OUTPUT'
			);
		}
		return convo.speak('Nothing is selected');
	}

	onListSelectUI(convo, type, itemName) {
		//return convo.speak(`Selected:${itemName}`);
		return convo.selectFromList(ConvoApp.ensureNumber(itemName.split('_')[1]));
	}

	onQueryListForSelection(type, item, query) {
		if (type === 'bulletin' && item) {
			return new RegExp(query.toLowerCase()).test(item.text.toLowerCase());
		}
		return false;
	}

	hasBulletins(convo) {
	  return convo.isInStorage("bulletins", list => list.length > 0);
	}

	readBulletins(convo, count = 5) {
		let correctedCount = count === 0 ? 5 : count;
		if (this.hasBulletins(convo)) {
		  let bulletins = this.expireBulletins(convo).getFromStorage("bulletins");
		  return convo
				.setList('bulletin', bulletins, {start:0, count:correctedCount})
				.forListPage(this.onRespondForList);
		}
		return convo.speak("There's nothing on your board. To add something to your board, just say: add, and then the message");
	}

	expireBulletins(convo) {
		let cleanedBulletins = convo.getFromStorage("bulletins")
		.filter(bulletin => {
			let now = new Date().valueOf();
			return !bulletin.expires || bulletin.expires >= now;
		})
		convo.setToStorage("bulletins", cleanedBulletins);
		return convo;
	}

	addBulletin(convo, message) {
	    let bulletins = this.hasBulletins(convo) ? convo.getFromStorage("bulletins") : [];
	    bulletins.unshift({text:message, added: new Date().valueOf(), expires: this.extractDate(message)});
			bulletins = bulletins.sort((item1, item2) => {
				if (item1.expires === item2.expires) {
					return 0;
				}
				if (item1.expires && !item2.expires) {
					return -1;
				}
				if (item2.expires && !item1.expires) {
					return 1;
				}
				return  item1.expires - item2.expires;
			})
			return convo
				.setToStorage("bulletins", bulletins)
				.updateList(bulletins)
				.speak(`Adding:${message}`);
	}

	clearBulletins(convo) {
	    return convo
				.setToStorage("bulletins", [])
				.clearList()
				.speak(`Cleared all bulletins.`);
	}

	deleteBulletin(convo) {
		return convo.promise(() => {
			let selection = convo.getListSelection();
			if (selection && selection.type === 'bulletin') {
				let bulletins = convo.getFromStorage("bulletins");
				let bulletin = bulletins[selection.index];
				bulletins.splice(selection.index,1);
				return convo
					.setToStorage("bulletins", bulletins)
					.updateList(bulletins)
					.speak(`Deleted:${bulletin.text}`);
			}
			return convo.speak('There was no bulletin to delete.');
		})
	}

	applyExpiresForBulletins(convo) {
		return convo.promise(() => {
			let bulletins = convo.getFromStorage("bulletins")
			.map(bulletin => {
				bulletin.expires = this.extractDate(bulletin.text);
				return bulletin;
			})
			.sort((item1, item2) => {
				if (item1.expires === item2.expires) {
					return 0;
				}
				if (item1.expires && !item2.expires) {
					return -1;
				}
				if (item2.expires && !item1.expires) {
					return 1;
				}
				return  item1.expires - item2.expires;
			})
			return convo
				.setToStorage("bulletins", bulletins)
				.speak("Updated expiry for all bulletins.");
		})
	}

	initTimeAndExpires() {
		TimeAgo.locale(en);
		this.datewords = [
			{name:'tomorrow', getDate:()=> {
				let now =  new Date();
				now.setUTCDate(now.getUTCDate() + 1);
				return now;
			}},
			{name:'today', getDate:()=> {
				return new Date();
			}},
			{name:'tonight', getDate:()=> {
				return new Date();
			}},
			{name:'sunday', getDate:() => this.getDateFromToday(0)},
			{name:'monday', getDate:() => this.getDateFromToday(1)},
			{name:'tuesday', getDate:() => this.getDateFromToday(2)},
			{name:'wednesday', getDate:() => this.getDateFromToday(3)},
			{name:'thursday', getDate:() => this.getDateFromToday(4)},
			{name:'friday', getDate:() => this.getDateFromToday(5)},
			{name:'saturday', getDate:() => this.getDateFromToday(6)}
		]
	}

	getDateFromToday(targetDayIndex) {
		let today = new Date();
		let todayIndex = today.getUTCDay();
		let daysToAdd = (targetDayIndex - todayIndex + 7);
		let daysToAddWeekCorrection = daysToAdd >= 7 ? daysToAdd - 7 : daysToAdd;
		today.setUTCDate(today.getUTCDate() + daysToAddWeekCorrection);
		return today;
	}

	setTimeToEndOfDay(date) {
		date.setUTCHours(23, 59, 59, 999);
		return date;
	}

	extractDate(sentence) {
		let matches = this.datewords.filter(dateword => {
			return new RegExp(dateword.name).test(sentence.toLowerCase());
		})
		.map(({name, getDate}) => {
			if (getDate){
				return {
					name:name,
					date:this.setTimeToEndOfDay(getDate())
				};
			}
			return {name};
		})
		return matches && matches.length > 0 ? matches[0].date.valueOf() : null;
	}
}

module.exports = {BulletinBoard}
