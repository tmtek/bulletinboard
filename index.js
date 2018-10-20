const {ConvoApp, Convo} = require('@tmtek/convo');

class BulletinBoard extends ConvoApp {

  onRegisterIntents() {
    this.registerIntent('welcome', (convo, params, option, debug) =>
      Convo.close(convo.promise(() => {
          if (this.hasBulletins(convo)) {
            return this.readBulletins(convo);
          } else {
            return convo.speak('Welcome to BulletinBoard. To add something to your board, just say: add, and then the message');
          }
      }),debug)
    );

    this.registerIntent('add_bulletin', (convo, {bulletin}, option, debug) =>
      Convo.close(this.addBulletin(convo,bulletin),debug)
    );

    this.registerIntent('read_bulletins', (convo, params, option, debug) =>
      Convo.close(this.readBulletins(convo),debug)
    );

    this.registerIntent('clear_bulletins', (convo, params, option, debug) =>
      Convo.close(this.clearBulletins(convo), debug)
    );
  }

  hasBulletins(convo) {
    return convo.isInStorage("bulletins", list => list.length > 0);
  }

  readBulletins(convo) {
    if (this.hasBulletins(convo)) {
      let bulletins = convo.getFromStorage("bulletins");
      convo.speak("Here's what's on the board:")
      bulletins.forEach(bulletin => {
				convo.speak(this.ensureSentence(bulletin.text));
			});
    } else {
      convo.speak("There's nothing on your board. To add something to your board, just say: add, and then the message")
    }
    return convo;
  }

  addBulletin(convo, message) {
    var bulletins = [];
    if (this.hasBulletins(convo)) {
        bulletins = convo.getFromStorage("bulletins");
    }
    bulletins.push({text:message, added: new Date().valueOf()});
    convo.setToStorage("bulletins", bulletins);
    return convo.speak(`Adding:${message}`);
  }

  clearBulletins(convo) {
    convo.setToStorage("bulletins", []);
    return convo.speak(`Cleared all bulletins.`);
  }

	ensureSentence(sentence) {
		if (!/\.$/.test(sentence)) {
			return `${sentence}.`;
		}
		return sentence;
	}
}

module.exports = {BulletinBoard}
