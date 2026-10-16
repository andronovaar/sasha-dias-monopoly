// Lightweight logic smoke tests. Run from the project folder with: node tests/smoke_test.js
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourcePath = path.join(__dirname, '..', 'app.js');

class FakeElement {
  constructor(id = '') {
    this.id = id; this.children = []; this.style = {}; this.value = '';
    this.textContent = ''; this.disabled = false; this.className = ''; this.title = '';
    this._innerHTML = '';
    this.classList = { add() {}, remove() {}, contains() { return false; } };
  }
  set innerHTML(value) { this._innerHTML = value; if (value === '') this.children = []; }
  get innerHTML() { return this._innerHTML; }
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); return item; }
}
const elements = {};
const document = {
  getElementById(id) { return elements[id] || (elements[id] = new FakeElement(id)); },
  createElement(tag) { return new FakeElement(tag); }
};
const context = {
  document, window: {}, console, Math, Date, Intl,
  setTimeout() {}, confirm() { return true; }, prompt() { return '0'; }
};
context.globalThis = context;
vm.createContext(context);
const source = fs.readFileSync(sourcePath, 'utf8') + `\n;globalThis.__test = { state, spaces, buildHouse, buildHotel, sellBuilding, mortgage, trySettleDebt, runAuction, buy, land, rentFor };`;
vm.runInContext(source, context, { timeout: 5000 });
const t = context.__test;
const state = t.state;
function assert(condition, message) { if (!condition) throw new Error(message); }
function resetPlayers() {
  state.players.forEach((p, i) => Object.assign(p, {
    id: i, name: i === 0 ? 'Саша' : 'Диас', money: 1500, pos: 0,
    properties: [], buildings: {}, mortgaged: [], jail: 0, jailTurns: 0,
    skip: false, consecutiveDoubles: 0, rentFree: 0
  }));
  state.active = 0; state.round = 1; state.lastDice = [null, null];
  state.rolled = false; state.extraRollPending = false; state.canBuy = null;
  state.gameOver = false; state.pendingDebt = null; state.auctionActive = false;
}

assert(state.players.length === 2, 'game initializes two players');
assert(state.players.every(p => p.money === 1500), 'each player starts with 1,500');
assert(t.spaces.length === 40, 'board contains 40 cells');

// Buy two brown properties and build one house.
resetPlayers();
state.players[0].properties = [1, 3];
elements.manageProperty.value = '1';
t.buildHouse();
assert(state.players[0].buildings[1] === 1, 'house is built');
assert(state.players[0].money === 1470, 'house cost is deducted');

// Landing on the developed street transfers rent to its owner.
state.active = 1; state.lastDice = [3, 4];
t.land(state.players[1], 1);
assert(state.players[1].money === 1490, 'rent is charged');
assert(state.players[0].money === 1480, 'rent is credited to owner');

// A complete color group doubles rent without buildings; a hotel can be built and downgraded.
state.players[0].buildings[1] = 0; state.active = 1;
assert(t.rentFor(1, 7) === 4, 'complete color group doubles base rent');
state.active = 0; state.players[0].money = 1000; state.players[0].buildings[1] = 4;
elements.manageProperty.value = '1'; t.buildHotel();
assert(state.players[0].buildings[1] === 5, 'four houses upgrade to a hotel');
assert(state.players[0].money === 970, 'hotel upgrade cost is deducted');
t.sellBuilding();
assert(state.players[0].buildings[1] === 4, 'selling a hotel returns four houses');
assert(state.players[0].money === 985, 'selling a hotel refunds half the upgrade cost');

// Mortgage is blocked while buildings remain in the same color group.
resetPlayers(); state.players[0].properties = [1, 3]; state.players[0].money = 1480;
state.players[0].buildings[1] = 1; state.active = 0; elements.manageProperty.value = '3';
t.mortgage();
assert(!state.players[0].mortgaged.includes(3), 'cannot mortgage a group with buildings');

// After selling the house, a mortgage pays half the purchase price.
elements.manageProperty.value = '1'; t.sellBuilding();
elements.manageProperty.value = '3'; t.mortgage();
assert(state.players[0].mortgaged.includes(3), 'property becomes mortgaged');
assert(state.players[0].money === 1525, 'sale refund and mortgage proceeds are correct');

// Debt can be settled and paid to the creditor.
state.players[1].money = 60;
state.pendingDebt = { playerId: 1, creditorId: 0, amount: 50, reason: 'test debt' };
t.trySettleDebt();
assert(state.pendingDebt === null, 'debt clears when covered');
assert(state.players[1].money === 10, 'debtor pays exact amount');
assert(state.players[0].money === 1575, 'creditor receives payment');

// Auction: one bid followed by the opponent passing awards the property.
resetPlayers();
state.players[0].properties = [1,2,3,4,5,6,7,8,9];
state.players[1].properties = [11,12,13,14,15,16,17,18,19];
t.runAuction(30);
let buttons = elements.modalButtons.children;
assert(buttons.length === 2, 'auction offers bid and pass');
buttons[0].onclick();
buttons = elements.modalButtons.children;
buttons[1].onclick();
assert(state.players[0].properties.includes(30), 'auction winner receives property');
assert(state.players[0].money === 1490, 'auction winner pays the winning bid');
assert(!state.auctionActive, 'auction ends after the opponent passes');

console.log('PASS — start state, 40-cell board, building, rent, mortgage restrictions, mortgage proceeds, debt settlement, auction bid/pass.');


// Online wiring smoke checks (network connection itself requires user Supabase credentials).
const appSource = fs.readFileSync(sourcePath, 'utf8');
assert(appSource.includes('event:"guest_state"'), 'guest snapshots are sent');
assert(appSource.includes('event:"state"'), 'host snapshots are sent');
assert(appSource.includes('function copyInviteLink()'), 'invite-link helper exists');
assert(appSource.includes('function isMyTurn()'), 'online turn ownership helper exists');
console.log('PASS — online host/guest wiring and invite-link hooks are present.');
