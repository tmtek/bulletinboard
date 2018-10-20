const {BulletinBoard} = require('./index');
const {Convo, ConvoStorage} = require('@tmtek/convo');


new ConvoStorage("storage.json")
	.load(storageConvo => {
		new BulletinBoard()
		  .intent(storageConvo, 'welcome', null, null, {log:true})
			//.intent(storageConvo, 'read_bulletins', null, null, {log:true})
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {text:"Phin is not going to the bday party"}, null, {log:false}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {text:"Mel goes out with Jarra Saturday night."}, null, {log:false}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'read_bulletins', null, null, {log:true}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'clear_bulletins', null, null, {log:true}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'read_bulletins', null, null, {log:true}))
	});
