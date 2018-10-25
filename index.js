const {ConvoApp, Convo, Say} = require('@tmtek/convo');

class BulletinBoard extends ConvoApp {

	onRegisterIntents() {
		this.registerListIntents();
		this.registerIntent('welcome', (convo, params, option, debug) =>
			Convo.ask(convo.promise(() => {
				if (this.hasBulletins(convo)) {
				  return this.readBulletins(convo);
				} else {
				  return convo.speak('Welcome to BulletinBoard. To add something to your board, just say: add, and then the message');
				}
			}),debug)
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
	}

	onRespondForList({ convo, type, page, paging, list }) {
		if (type === 'bulletin') {
			return convo.speak(Say.listPageResponse(page, paging, list, item => Say.ensureSentence(item.text), "\n\n"));
		}
		return convo.speak(`Where's my list?:${JSON.stringify(convo.getContext('list'))}`);
	}

	onRespondForListSelection({ convo, type, item }) {
		if (type === 'bulletin' && item) {
			return convo.speak(`${item.text}`);
		}
		return convo.speak('Nothing is selected');
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
		  let bulletins = convo.getFromStorage("bulletins");
		  return convo
				.setList('bulletin', bulletins, {start:0, count:correctedCount})
				.forListPage(this.onRespondForList);
		}
		return convo.speak("There's nothing on your board. To add something to your board, just say: add, and then the message");
	}

	addBulletin(convo, message) {
	    let bulletins = this.hasBulletins(convo) ? convo.getFromStorage("bulletins") : [];
	    bulletins.unshift({text:message, added: new Date().valueOf()});
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
}

module.exports = {BulletinBoard}
