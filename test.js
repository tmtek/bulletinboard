const {BulletinBoard} = require('./index');
const {Convo, ConvoStorage} = require('@tmtek/convo');


let cs = new ConvoStorage("storage.json")
	cs.load(storageConvo => {
		new BulletinBoard()
		  .intent(storageConvo, 'welcome', null, null, {log:false})
			.then(({app, convo}) => app.intent(new Convo(convo), 'help', null, null, {log:false}))
			.then(({app, convo}) => app.intent(new Convo(convo), 'list_select', {index:3}, null, {log:true}))
			//.then(({app, convo}) => app.intent(storageConvo, 'update_expires', {}, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {bulletin:"Give Seb a bath today"}, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(storageConvo), 'read_bulletins', {}, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select_next', null, null, {log:true}))
			//
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_next', null, null, {log:true}))
			//.then(({app, convo}) => app.intent(new Convo(convo), 'list_select', null, null, {log:true}))
			//.intent(storageConvo, 'read_bulletins', null, null, {log:true})
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {text:"Give Seb a bath"}, null, {log:true}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {text:"Mel goes out with Jarra Saturday night."}, null, {log:false}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'read_bulletins', null, null, {log:true}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'clear_bulletins', null, null, {log:true}))
		  //.then(({app, convo}) => app.intent(new Convo(convo), 'read_bulletins', null, null, {log:true}))
	});
