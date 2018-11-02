const {BulletinBoard} = require('../index');
const {Convo, ConvoStorage, ConvoTest} = require('@tmtek/convo');
let assert = require('assert');

function getConvoWithBulletins(amountOfBulletins = 3, addExpiry = null) {
	return new Convo(Convo.mockConv(conv => {
		let arr = [];
		for (let i = 0; i < amountOfBulletins; i++ ) {
			if (addExpiry) {
				let expiry = addExpiry(i);
				if (expiry) {
					arr.push({text:`Bulletin ${i}`, expires:`${addExpiry(i)}`});
				} else {
					arr.push({text:`Bulletin ${i}`});
				}
			} else {
				arr.push({text:`Bulletin ${i}`});
			}

		}
		conv.user.storage.bulletins = arr;
	}));
}

describe('BulletinBoard', () => {
	describe('#welcome', () => {
		it('Should welcome with no list if no items are stored.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
			  .intent(new Convo(), 'welcome')
				.then(({ convo, requests }) => {
					assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']))
					assert(!ConvoTest.containsResponseType(requests, ['List']))
					assert(!convo.hasList(), 'Shouldn\'t be a list active');
					return { convo, requests };
				}),
				done
			);
		});
		it('Should welcome with rich List if items are stored.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
			  .intent(getConvoWithBulletins(), 'welcome')
				.then(({ convo, requests }) => {
					assert(ConvoTest.containsResponseType(requests, ['SimpleResponse', 'List']))
					assert(convo.hasList(), 'Shouldn\'t be a list active');
					return { convo, requests };
				}),
				done
			);
		});
	});
	describe('#add_bulletin', () => {
		it('Should allow a new bulletin to be added directly, when no list currently exists.', (done) => {
			let bulletinText = 'test bulletin';
			ConvoTest.testConversation(
				new BulletinBoard()
				.intent(new Convo(), 'add_bulletin', {bulletin:bulletinText})
				.then(({ convo, requests }) => {
					assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
					assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length ===1);
					assert(convo.getFromStorage('bulletins')[0].text === bulletinText, 'New item should hav been first in the list.');
					return { convo, requests };
				}),
				done
			);
		});
		it('Should allow a new bulletin to be added directly, when list currently exists.', (done) => {
			let bulletinText = 'test bulletin';
			ConvoTest.testConversation(
				new BulletinBoard()
				.intent(getConvoWithBulletins(), 'add_bulletin', {bulletin:bulletinText})
				.then(({ convo, requests }) => {
					assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
					assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 4);
					assert(convo.getFromStorage('bulletins')[0].text === bulletinText, 'New item should hav been first in the list.');
					return { convo, requests };
				}),
				done
			);
		});
		it('Should allow multiple bulletin additions in one session.', (done) => {
			let bulletinText = 'test bulletin';
			let bulletinText2 = 'test bulletin 2';
			let bulletinText3 = 'test bulletin 3';
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(), 'add_bulletin', {bulletin:bulletinText})
					.then(({ app, convo, requests }) => {
						assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
						assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 4);
						assert(convo.getFromStorage('bulletins')[0].text === bulletinText, 'New item should hav been first in the list.');
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {bulletin:bulletinText2}))
					.then(({ app, convo, requests }) => {
						assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
						assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 5);
						assert(convo.getFromStorage('bulletins')[0].text === bulletinText2, 'New item should hav been first in the list.');
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {bulletin:bulletinText3}))
					.then(({ app, convo, requests }) => {
						assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
						assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 6);
						assert(convo.getFromStorage('bulletins')[0].text === bulletinText3, 'New item should hav been first in the list.');
						return { app, convo, requests };
					}),
					done
			);
		});
		it('Should update bulletin list if it is active and new bulletin is added.', (done) => {
			let bulletinText = 'test bulletin';
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(), 'welcome')
					.then(({ app, convo, requests }) => {
						assert(ConvoTest.containsResponseType(requests, ['SimpleResponse', 'List']));
						assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 3);
						assert(convo.hasList('bulletin') && convo.getList().list.length === 3)
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'add_bulletin', {bulletin:bulletinText}))
					.then(({ app, convo, requests }) => {
						assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
						assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 4);
						assert(convo.getFromStorage('bulletins')[0].text === bulletinText, 'New item should hav been first in the list.');
						assert(convo.hasList('bulletin') && convo.getList().list.length === 4);
						assert(convo.getList().list[0].text === bulletinText);
						return { app, convo, requests };
					}),
					done
			)
		});
	});
	describe('#clear_bulletins', () => {
		it('Should clear all existing bulletins if some exist. in storage.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(), 'clear_bulletins')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 0);
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should not error if no bulletins exist.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(new Convo(), 'clear_bulletins')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 0);
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should clear all existing bulletins from storage and empty an exiting list.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(), 'welcome')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 3);
						assert(convo.hasList('bulletin') && convo.getList().list.length === 3);
						return { app, convo, requests };
					})
					.then(({app, convo, requests}) => app.intent(new Convo(convo), 'clear_bulletins'))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 0);
						assert(!convo.hasList('bulletin') || convo.getList().list.length === 0);
						return { app, convo, requests };
					}),
				done
			);
		});
	});
	describe('#help', () => {
		it('Should be able to activate help directly.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'help')
					.then(({ app, convo, requests }) => {
						assert(convo.hasList('help'));
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should be able to activate help after welcome.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'welcome')
					.then(({ app, convo, requests }) => {
						assert(convo.hasList('bulletin'));
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					})
					.then(({app, convo, requests}) => app.intent(new Convo(convo), 'help'))
					.then(({ app, convo, requests }) => {
						assert(convo.hasList('help'));
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					}),
				done
			);
		});
	});
	describe('#read_bulletins', () => {
		it('Should activate the List, read the first page of five, and respond to the user with a rich List.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'read_bulletins')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 0);
						assert(convo.getList('bulletin').paging.count === 5);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should activate the List and page by 3.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'read_bulletins', {count:3})
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 0);
						assert(convo.getList('bulletin').paging.count === 3);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'list_next'))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 3);
						assert(convo.getList('bulletin').paging.count === 3);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should be able to page through the list and have it loop back.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'read_bulletins')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 0);
						assert(convo.getList('bulletin').paging.count === 5);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'list_next'))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 5);
						assert(convo.getList('bulletin').paging.count === 5);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'list_next'))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 0);
						assert(convo.getList('bulletin').paging.count === 5);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should be able to return to bulletin list from help.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'help')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('help'));
						return { app, convo, requests };
					})
					.then(({app, convo}) => app.intent(new Convo(convo), 'read_bulletins'))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 0);
						assert(convo.getList('bulletin').paging.count === 5);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					}),
				done
			);
		});
	});
	describe('#read_bulletins_all', () => {
		it('Should activate the List, read all bulletins and close.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'read_bulletins_all')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').paging.start === 0);
						assert(convo.getList('bulletin').paging.count === -1);
						assert(ConvoTest.containsResponseType(requests, ['List']));
						assert(ConvoTest.isConversationClose(requests));
						return { app, convo, requests };
					}),
				done
			);
		});
	});
	describe('#select_bulletin', () => {
		it('Should be able to select a bulletin from the list.', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'welcome')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').list[1].text === 'Bulletin 1');
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					})
					.then(({app, convo, requests}) => app.intent(new Convo(convo), 'list_select', {index:2}))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.hasListSelection());
						assert(convo.getListSelection().item.text === convo.getList('bulletin').list[1].text);
						return { app, convo, requests };
					}),
				done
			);
		});
	});
	describe('#bulletin_delete', () => {
		it('Should be able delete selected bulletins', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(getConvoWithBulletins(9), 'welcome')
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').list[1].text === 'Bulletin 1');
						assert(ConvoTest.containsResponseType(requests, ['List']));
						return { app, convo, requests };
					})
					.then(({app, convo, requests}) => app.intent(new Convo(convo), 'list_select', {index:2}))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 9);
						assert(convo.hasList('bulletin'));
						assert(convo.hasListSelection());
						assert(convo.getListSelection().item.text === convo.getList('bulletin').list[1].text);
						return { app, convo, requests };
					})
					.then(({app, convo, requests}) => app.intent(new Convo(convo), 'bulletin_delete'))
					.then(({ app, convo, requests }) => {
						assert(convo.getFromStorage('bulletins').length === 8);
						assert(convo.hasList('bulletin'));
						assert(convo.getList('bulletin').list[1].text !== 'Bulletin 1');
						return { app, convo, requests };
					}),
				done
			);
		});
		it('Should not error', (done) => {
			ConvoTest.testConversation(
				new BulletinBoard()
					.intent(new Convo(), 'welcome')
					.then(({app, convo, requests}) => app.intent(new Convo(convo), 'bulletin_delete')),
				done
			);
		});
	});

	describe('#extractDate', () => {
		it('Ensure all keywords extract dates and that case doesn\'t matter.', () => {
			let bb = new BulletinBoard();
			assert(bb.extractDate('Do something Today'));
			assert(bb.extractDate('Do something Tonight'));
			assert(bb.extractDate('Do something Tomorrow'));
			assert(bb.extractDate('Do something Sunday'));
			assert(bb.extractDate('Do something Monday'));
			assert(bb.extractDate('Do something Tuesday'));
			assert(bb.extractDate('Do something Wednesday'));
			assert(bb.extractDate('Do something Thursday'));
			assert(bb.extractDate('Do something Friday'));
			assert(bb.extractDate('Do something Saturday'));
			assert(bb.extractDate('Do something today'));
			assert(bb.extractDate('Do something tonight'));
			assert(bb.extractDate('Do something tomorrow'));
			assert(bb.extractDate('Do something sunday'));
			assert(bb.extractDate('Do something monday'));
			assert(bb.extractDate('Do something tuesday'));
			assert(bb.extractDate('Do something wednesday'));
			assert(bb.extractDate('Do something thursday'));
			assert(bb.extractDate('Do something friday'));
			assert(bb.extractDate('Do something saturday'));
			assert(!bb.extractDate('Do something'));
			assert(!bb.extractDate('Do something yesterday'));
			assert(!bb.extractDate(''));
			assert(!bb.extractDate());
		});
		it('Ensure that keywords resolve to the correct day.', () => {
			let bb = new BulletinBoard();

			let now = new Date();
			let tomorrow = new Date(now);
			tomorrow.setUTCDate(now.getUTCDate() + 1);

			assert(new Date(bb.extractDate('Do something today')).getUTCDay() === now.getUTCDay());
			assert(new Date(bb.extractDate('Do something tonight')).getUTCDay() === now.getUTCDay());
			assert(new Date(bb.extractDate('Do something tomorrow')).getUTCDay() === tomorrow.getUTCDay());
			assert(new Date(bb.extractDate('Do something sunday')).getUTCDay() === 0);
			assert(new Date(bb.extractDate('Do something monday')).getUTCDay() === 1);
			assert(new Date(bb.extractDate('Do something tuesday')).getUTCDay() === 2);
			assert(new Date(bb.extractDate('Do something wednesday')).getUTCDay() === 3);
			assert(new Date(bb.extractDate('Do something thursday')).getUTCDay() === 4);
			assert(new Date(bb.extractDate('Do something friday')).getUTCDay() === 5);
			assert(new Date(bb.extractDate('Do something saturday')).getUTCDay() === 6);
		});
		it('Ensure that keywords resolve to dates in the future.', () => {
			let bb = new BulletinBoard();
			let now = new Date().valueOf();
			assert(new Date(bb.extractDate('Do something today')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something tonight')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something tomorrow')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something sunday')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something monday')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something tuesday')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something wednesday')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something thursday')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something friday')).valueOf() > now);
			assert(new Date(bb.extractDate('Do something saturday')).valueOf() > now);
		});
	});

	describe('#add_bulletin_with_expiries', () => {
		it('A bulletin with a closer expiry then the rest should be added to the start of the list.', (done) => {
			let twodaysfromnow = new Date();
			twodaysfromnow.setUTCDate(twodaysfromnow.getUTCDate() + 2);
			let expirys = [twodaysfromnow.valueOf(), twodaysfromnow.valueOf(), twodaysfromnow.valueOf()];
			let newBulletinText = 'Do Something Today';
			ConvoTest.testConversation(
				new BulletinBoard()
				.intent(getConvoWithBulletins(3, (i) => expirys[i]), 'add_bulletin', {bulletin:newBulletinText})
				.then(({ convo, requests }) => {
					assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
					assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 4);
					assert(convo.getFromStorage('bulletins')[0].text === newBulletinText, 'New item should hav been first in the list.');
					return { convo, requests };
				}),
				done
			);
		});
		it('A bulletin with a further expiry then the rest should be added to the end of the list.', (done) => {
			let today = new Date();
			let expirys = [today.valueOf(), today.valueOf(), today.valueOf()];
			let newBulletinText = 'Do Something Tomorrow';
			ConvoTest.testConversation(
				new BulletinBoard()
				.intent(getConvoWithBulletins(3, (i) => expirys[i]), 'add_bulletin', {bulletin:newBulletinText})
				.then(({ convo, requests }) => {
					assert(ConvoTest.containsResponseType(requests, ['SimpleResponse']));
					assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 4);
					assert(convo.getFromStorage('bulletins')[3].text === newBulletinText, 'New item should hav been first in the list.');
					return { convo, requests };
				}),
				done
			);
		});
	});

	describe('#auto_expiry', () => {
		it('Should remove all bulletins that are expired when list is invoked.', (done) => {
			let yesterday = new Date();
			yesterday.setUTCDate(yesterday.getUTCDate() - 1);
			let today = new Date();
			let expirys = [yesterday.valueOf(), yesterday.valueOf(), today.valueOf()];
			ConvoTest.testConversation(
				new BulletinBoard()
				.intent(getConvoWithBulletins(3, (i) => expirys[i]), 'welcome')
				.then(({ convo, requests }) => {
					assert(convo.getFromStorage('bulletins') && convo.getFromStorage('bulletins').length === 1, `Was: ${convo.getFromStorage('bulletins').length}`);
					return { convo, requests };
				}),
				done
			);
		});
	});
});
