/* Sasha & Dias Monopoly — prototype 0.1
   Local play works without accounts. Online broadcast is a starter integration;
   add supabase/config.sql and credentials to enable two-device sync.
*/
const START_CASH = 1500;
const players = [
 {id:0,name:"Саша",token:"S",money:START_CASH,pos:0,properties:[],jail:0,jailTurns:0,skip:false},
 {id:1,name:"Диас",token:"D",money:START_CASH,pos:0,properties:[],jail:0,jailTurns:0,skip:false}
];
const colors={brown:"#9b7653",lightblue:"#9bd8e4",pink:"#dca4c6",orange:"#e8a15d",red:"#cf7471",yellow:"#e3cc65",green:"#77a78c",blue:"#6b83c3",none:"#b8c5b6"};
// 40 spaces, indexed in clockwise order; prices/rents are preliminary game units.
const spaces=[
 {name:"START",type:"start",icon:"🏁",corner:true},
 {name:"Szabadság tér",type:"property",group:"brown",price:60,buildCost:30,rent:[2,10,30,90,160,250]},
 {name:"Közösségi kassza",type:"chest",icon:"💌"},
 {name:"Dunapart",type:"property",group:"brown",price:60,buildCost:30,rent:[4,20,60,180,320,450]},
 {name:"Adóhivatal",type:"tax",icon:"🧾",amount:100},
 {name:"Keleti pályaudvar",type:"railroad",icon:"🚉",price:200},
 {name:"Szentendre",type:"property",group:"lightblue",price:100,buildCost:40,rent:[6,30,90,270,400,550]},
 {name:"Szerencse",type:"chance",icon:"🎲"},
 {name:"Margitsziget",type:"property",group:"lightblue",price:100,buildCost:40,rent:[6,30,90,270,400,550]},
 {name:"Rudas",type:"property",group:"lightblue",price:120,buildCost:40,rent:[8,40,100,300,450,600]},
 {name:"Börtön / látogatás",type:"jail",icon:"🔒",corner:true},
 {name:"Gellért tér",type:"property",group:"pink",price:140,buildCost:50,rent:[10,50,150,450,625,750]},
 {name:"Vízművek",type:"utility",icon:"💧",price:150},
 {name:"Tifliso",type:"property",group:"pink",price:140,buildCost:50,rent:[10,50,150,450,625,750]},
 {name:"Sasha & Dias",type:"property",group:"pink",price:160,buildCost:50,rent:[12,60,180,500,700,900]},
 {name:"Nyugati pályaudvar",type:"railroad",icon:"🚉",price:200},
 {name:"Lidl",type:"property",group:"orange",price:180,buildCost:60,rent:[14,70,200,550,750,950]},
 {name:"Közösségi kassza",type:"chest",icon:"💌"},
 {name:"IKEA",type:"property",group:"orange",price:180,buildCost:60,rent:[14,70,200,550,750,950]},
 {name:"Kálvin Kebab",type:"property",group:"orange",price:200,buildCost:60,rent:[16,80,220,600,800,1000]},
 {name:"Ingyenes parkoló",type:"parking",icon:"🅿️",corner:true},
 {name:"Etyek",type:"property",group:"red",price:220,buildCost:70,rent:[18,90,250,700,875,1050]},
 {name:"Szerencse",type:"chance",icon:"🎲"},
 {name:"Balaton",type:"property",group:"red",price:220,buildCost:70,rent:[18,90,250,700,875,1050]},
 {name:"Hévíz",type:"property",group:"red",price:240,buildCost:70,rent:[20,100,300,750,925,1100]},
 {name:"Déli pályaudvar",type:"railroad",icon:"🚉",price:200},
 {name:"Vinted",type:"property",group:"yellow",price:260,buildCost:80,rent:[22,110,330,800,975,1150]},
 {name:"Szerelem / esély",type:"property",group:"yellow",price:260,buildCost:80,rent:[22,110,330,800,975,1150]},
 {name:"Internet",type:"utility",icon:"📶",price:150},
 {name:"Váci utca",type:"property",group:"yellow",price:280,buildCost:80,rent:[24,120,360,850,1025,1200]},
 {name:"Menj a börtönbe",type:"gotojail",icon:"🚔",corner:true},
 {name:"Szállás Budán",type:"property",group:"green",price:300,buildCost:90,rent:[26,130,390,900,1100,1275]},
 {name:"Andrássy út",type:"property",group:"green",price:300,buildCost:90,rent:[26,130,390,900,1100,1275]},
 {name:"Közösségi kassza",type:"chest",icon:"💌"},
 {name:"Parlament",type:"property",group:"green",price:320,buildCost:90,rent:[28,150,450,1000,1200,1400]},
 {name:"Kelenföld pályaudvar",type:"railroad",icon:"🚉",price:200},
 {name:"Szerencse",type:"chance",icon:"🎲"},
 {name:"Várnegyed",type:"property",group:"blue",price:350,buildCost:100,rent:[35,175,500,1100,1300,1500]},
 {name:"Luxusadó",type:"tax",icon:"💎",amount:200},
 {name:"Dunai panoráma",type:"property",group:"blue",price:400,buildCost:100,rent:[50,200,600,1400,1700,2000]}
];
const groupMembers={}; spaces.forEach((s,i)=>{if(s.group)(groupMembers[s.group]??=[]).push(i)});
const defaultChest=[
 {title:"Учёба окупается! 🎓",text:"Диас учился, старался и наконец получил заслуженную стипендию. Приятно, когда университет платит тебе, а не наоборот!",amount:50},
 {title:"Ару угощает! 💕",text:"Саша и Ару снова спорили, кто заплатит. В этот раз Ару оказалась быстрее!",amount:15},
 {title:"А это тоже продам! 📦",text:"Саша начала с одежды, но быстро поняла: на Vinted можно продать вообще всё. Диас, прячь свои вещи!",amount:30},
 {title:"Пассивный доход Саши 💸",text:"Соседи Диаса перевели деньги за интернет.",amount:20},
 {title:"Финансовая поддержка! 💗",text:"Саша потратилась, а Диас сам перевёл ей деньги на еду.",amount:100},
 {title:"Пора бриться! 🪒",text:"Диас собирается звонить бабушке по видеосвязи. Срочно бриться!",amount:50},
 {title:"Саша снова хочет букет! 💐",text:"Пора оформлять заказ в Dolce Vita.",amount:-80},
 {title:"Защита от воров! 🔐",text:"Пришлось установить дополнительный замок.",amount:-100},
 {title:"Опять эта труба! 🔧",text:"Труба под раковиной снова решила напомнить о себе. Вызовите сантехника.",amount:-120},
 {title:"Только самое необходимое! 🛒",text:"Саша и Диас пошли в Lidl за самым необходимым. Как жаль, что у Саши с Диасом совершенно разные представления о необходимом.",amount:-80},
 {title:"Без попкорна никак! 🍿",text:"Саша и Диас поняли, что вечер не состоится без шоколадно-карамельного попкорна.",amount:-60},
 {title:"Бесплатный пробный период! 💳",text:"Диас снова забыл отменить подписку. Бесплатный период закончился два месяца назад.",amount:-60},
 {title:"Обед в IKEA! 🌭",text:"Заехали за мелочью, а заодно устроили свидание с хот-догами.",amount:-50},
 {title:"Сантехник снова нужен! 🧰",text:"Труба под раковиной опять потекла.",amount:-100},
 {title:"Мы объелись! 😴",text:"Мы объелись. Время отдохнуть.",amount:0,skip:true},
 {title:"Почти семейная жизнь! ❤️",text:"Диас так часто ночевал у Саши, что дорогу домой уже можно было забыть. Аренда? Какая аренда?",special:"rentfree"}
];
const defaultChance=[
 {title:"Карой берётся за дело! 🚨",text:"Карой нашёл вора по видеокамерам. Отправляйтесь в тюрьму с флешкой.",goto:10},
 {title:"Последний вагон! 🚆",text:"Вы снова опаздываете на поезд. Переместитесь к ближайшему вокзалу." ,nearest:"railroad"},
 {title:"Чтобы вы были живы тоже важно! 🚕",text:"«Таксист, быстрее!» — «Чтобы вы были живы тоже важно». Переместитесь на две клетки вперёд.",move:2},
 {title:"На Хевиз! 🏊",text:"Отправляйтесь на озеро Хевиз. Поролоновые палки сами себя не арендуют.",goto:24},
 {title:"На Рудаш! ♨️",text:"Отправляйтесь в Рудаш.",goto:9},
 {title:"Свидание в Тифлисо! ❤️",text:"Саша хочет на свидание. Идите в Tifliso.",goto:13},
 {title:"Буби! 🚲",text:"Саша и Диас взяли Bubi. Крутите педали — переместитесь на пять клеток вперёд.",move:5},
 {title:"Всё обошлось! 🚑",text:"Травмпункт / полиция: на этот раз всё обошлось.",amount:50},
 {title:"Отель / последнее средство 🏨",text:"Переместитесь на START.",goto:0},
 {title:"Карта выхода из тюрьмы 🔓",text:"Сохрани эту карту: она позволит выйти из тюрьмы без оплаты.",special:"jailfree"}
];
let state={players,active:0,round:1,lastDice:[null,null],rolled:false,extraRollPending:false,canBuy:null,log:[],chestIndex:0,chanceIndex:0,room:null,gameOver:false, pendingDebt:null,auctionActive:false};
let supabaseClient=null, channel=null, isApplyingRemote=false;
let onlineRole="offline", localPlayerId=0, connectedRoom="", syncTimer=null, syncRevision=0;
const clientId="client-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9);
function onlineConnected(){return !!channel && (onlineRole==="host"||onlineRole==="guest")}
function isMyTurn(){return !onlineConnected()||localPlayerId===state.active}
function updateOnlineControls(){
 const online=onlineConnected();
 if($("newGameBtn"))$("newGameBtn").disabled=online&&onlineRole!=="host";
 if($("inviteBtn"))$("inviteBtn").disabled=!online||onlineRole!=="host";
 if($("onlineHelp")&&online)$("onlineHelp").textContent=onlineRole==="host"?"Ты создала комнату. Скопируй ссылку и отправь Диасу. Он должен выбрать роль «Войти в комнату» и подключиться с тем же проектом Supabase.":"Ты подключилась как Диас. Действия доступны, когда ход Диаса; состояние игры приходит от создателя комнаты.";
}
const $=id=>document.getElementById(id);
function fmt(n){return Math.round(n).toLocaleString("en-US").replace(/,/g," ");}
function addLog(msg){state.log.unshift({time:new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}),msg});state.log=state.log.slice(0,30);renderLog();broadcast();}
function current(){return state.players[state.active]}
function ownerOf(index){return state.players.find(p=>p.properties.includes(index))}
function houseCount(i){const o=ownerOf(i);return o?.buildings?.[i]||0}
function initPlayers(){state.players=state.players.map((p,i)=>({...p,id:i,name:i===0?"Саша":"Диас",token:i===0?"S":"D",money:START_CASH,pos:0,properties:[],jail:0,jailTurns:0,jailCard:false,buildings:{},mortgaged:[],skip:false,consecutiveDoubles:0,rentFree:0}));}
function renderBoard(){
 const root=$("cells");root.innerHTML="";
 // positions around a classic square, index 0 bottom-right, 10 bottom-left, 20 top-left, 30 top-right
 spaces.forEach((s,i)=>{
   let col,row;
   if(i<=10){col=11-i;row=11}
   else if(i<=20){col=1;row=11-(i-10)}
   else if(i<=30){col=i-20+1;row=1}
   else {col=11;row=i-30+1}
   const el=document.createElement("div");el.className="cell"+(s.corner?" corner":"");el.style.gridColumn=col;el.style.gridRow=row;
   if(s.group){el.querySelector;const stripe=document.createElement("div");stripe.className="stripe";stripe.style.background=colors[s.group];el.appendChild(stripe)}
   const name=document.createElement("div");name.className="cell-name";name.textContent=s.name;el.appendChild(name);
   if(s.price){const price=document.createElement("div");price.className="cell-price";price.textContent=fmt(s.price);el.appendChild(price)}
   if(s.icon){const icon=document.createElement("div");icon.className="cell-icon";icon.textContent=s.icon;el.appendChild(icon)}
   if(s.group){const h=document.createElement("div");h.className="housemarks";const b=houseCount(i);h.textContent=b===5?"🏨":b?"🏠".repeat(b):"";el.appendChild(h)}
   const tokens=document.createElement("div");tokens.className="tokens";
   state.players.filter(p=>p.pos===i).forEach(p=>{const t=document.createElement("span");t.className="token "+(p.id===0?"s-token":"d-token");t.textContent=p.token;tokens.appendChild(t)});
   el.appendChild(tokens);
   const owner=ownerOf(i);if(owner){el.classList.add(owner.id===0?"owned-s":"owned-d");const mark=document.createElement("span");mark.className="owner-mark";mark.style.background=owner.id===0?"#d7838a":"#315d4c";el.appendChild(mark)}
   if(owner?.mortgaged?.includes(i))el.classList.add("mortgaged");
   el.title=s.name+(s.price?` · Цена ${s.price}`:"");
   root.appendChild(el);
 });
}
function worth(p){return p.money+p.properties.reduce((sum,i)=>sum+(isMortgaged(p,i)?Math.floor((spaces[i].price||0)/2):(spaces[i].price||0)),0)+p.properties.reduce((sum,i)=>sum+(p.buildings[i]||0)*(spaces[i].buildCost||50),0)}
function renderMoney(){const a=state.players[0],b=state.players[1];$("sashaMoney").textContent=fmt(a.money);$("diasMoney").textContent=fmt(b.money);$("sashaWorth").textContent="Состояние: "+fmt(worth(a));$("diasWorth").textContent="Состояние: "+fmt(worth(b));}
function renderProps(){
 const all=state.players.flatMap(p=>p.properties.map(i=>({p,i})));$("propertyCount").textContent=all.length+" участков";const root=$("propertiesList");root.innerHTML="";
 if(!all.length){root.innerHTML='<p class="empty">Пока никто не купил ни одной улицы.</p>';return}
 all.forEach(({p,i})=>{const s=spaces[i],d=document.createElement("div");d.className="property-item";const c=document.createElement("span");c.className="property-color";c.style.background=colors[s.group]||"#aab";const n=document.createElement("b");n.textContent=s.name;const o=document.createElement("span");o.className="owner-name";o.textContent=p.name+(p.mortgaged.includes(i)?" · заложена":"");d.append(c,n,o);root.append(d)});
}
function renderLog(){const root=$("log");root.innerHTML="";state.log.forEach(e=>{const d=document.createElement("div");d.className="log-entry";const t=document.createElement("time");t.textContent=e.time;const s=document.createElement("span");s.textContent=e.msg;d.append(t,s);root.append(d)})}
function render(){
 renderBoard();renderMoney();renderProps();
 const p=current();$("activeName").textContent=p.name;$("activeToken").textContent=p.token;$("activeToken").className="token big "+(p.id===0?"s-token":"d-token");
 $("activeStatus").textContent=p.jail?"В тюрьме · попытка освобождения":p.skip?"Пропуск хода":"Твой ход";
 $("roundLabel").textContent="Раунд "+state.round;
 $("die1").textContent=state.lastDice[0]??"—";$("die2").textContent=state.lastDice[1]??"—";$("diceTotal").textContent=state.lastDice[0]==null?"—":state.lastDice[0]+state.lastDice[1];
 $("rollBtn").textContent=state.extraRollPending?"Бросить ещё раз 🎲":"Бросить кубики";
 const canAct=isMyTurn();
 $("rollBtn").disabled=!canAct||(state.rolled&&!state.extraRollPending)||state.gameOver||!!state.pendingDebt||(state.extraRollPending&&state.canBuy!==null);
 $("endTurnBtn").disabled=!canAct||!state.rolled||state.extraRollPending||state.canBuy!==null||state.gameOver||!!state.pendingDebt;
 $("buyBtn").disabled=!canAct||state.canBuy===null||state.gameOver||!!state.pendingDebt;$("declineBtn").disabled=!canAct||state.canBuy===null||state.gameOver||!!state.pendingDebt;
 updateManagement();updateOnlineControls();
 $("actionHint").textContent=onlineConnected()&&!canAct?`Сейчас ходит ${p.name}. Дождись своего хода.`:state.gameOver?"Игра завершена. Нажми «Новая игра», чтобы начать снова.":state.pendingDebt?"Сначала погаси долг или объяви банкротство.":state.canBuy!==null?`${p.name}, эта клетка свободна. Купить за ${fmt(spaces[state.canBuy].price)}?`:state.extraRollPending?"Выпал дубль! Реши вопрос с покупкой, затем бросай ещё раз.":state.rolled?"Ход сделан. Можно завершить ход.":"Брось кубики, чтобы начать ход.";
}
function groupOwned(p,index){const g=spaces[index].group;return groupMembers[g]?.every(i=>p.properties.includes(i))}

function ownedObjectCount(){return state.players.reduce((n,p)=>n+p.properties.length,0)}
function isMortgaged(p,i){return (p.mortgaged||[]).includes(i)}
function selectedProperty(){const i=Number($("manageProperty").value);return Number.isInteger(i)&&current().properties.includes(i)?i:null}
function groupUnmortgaged(p,index){const g=spaces[index].group;return groupMembers[g]?.every(j=>!isMortgaged(p,j))}
function canBuild(p,i){const s=spaces[i];return s.type==="property"&&groupOwned(p,i)&&groupUnmortgaged(p,i)&&!isMortgaged(p,i)&&(p.buildings[i]||0)<4&&p.money>=s.buildCost}
function updateManagement(){
 const sel=$("manageProperty");if(!sel)return;const p=current(),old=sel.value;sel.innerHTML="";
 const owned=p.properties.filter(i=>spaces[i].type==="property");
 if(!owned.length){const o=document.createElement("option");o.value="";o.textContent="Нет улиц";sel.append(o)}
 owned.forEach(i=>{const o=document.createElement("option");o.value=String(i);o.textContent=spaces[i].name+(isMortgaged(p,i)?" (заложена)":"");sel.append(o)});
 if(owned.includes(Number(old)))sel.value=old;
 const i=selectedProperty(),s=i===null?null:spaces[i],b=i===null?0:(p.buildings[i]||0),canAct=isMyTurn();
 $("buildBtn").disabled=!canAct||!!state.pendingDebt||!(i!==null&&canBuild(p,i));
 $("hotelBtn").disabled=!canAct||!!state.pendingDebt||!(i!==null&&s&&groupOwned(p,i)&&groupUnmortgaged(p,i)&&!isMortgaged(p,i)&&b===4&&p.money>=s.buildCost);
 $("mortgageBtn").disabled=!canAct||!(i!==null&&!isMortgaged(p,i)&&!p.properties.some(j=>spaces[j].group===s?.group&&(p.buildings[j]||0)>0));
 $("redeemBtn").disabled=!canAct||!!state.pendingDebt||!(i!==null&&isMortgaged(p,i)&&p.money>=Math.ceil(Math.floor(s.price/2)*1.1));
 $("sellBuildingBtn").disabled=!canAct||!(i!==null&&(p.buildings[i]||0)>0);
 $("sellPropertyBtn").disabled=!canAct||!(i!==null&&(p.buildings[i]||0)===0&&!isMortgaged(p,i));
}
function buildHouse(){
 if(state.pendingDebt)return;const p=current(),i=selectedProperty();if(i===null)return;const s=spaces[i];
 if(!canBuild(p,i)){openModal("Пока нельзя строить","Нужна полная цветовая группа, незаложенная улица и достаточно денег. Максимум — 4 дома.",[{label:"Понятно",action:closeModal}]);return}
 p.money-=s.buildCost;p.buildings[i]=(p.buildings[i]||0)+1;addLog(`${p.name} построил(а) дом на «${s.name}» за ${s.buildCost}.`);render();broadcast()
}
function buildHotel(){
 if(state.pendingDebt)return;const p=current(),i=selectedProperty();if(i===null)return;const s=spaces[i];
 if(!groupOwned(p,i)||!groupUnmortgaged(p,i)||isMortgaged(p,i)||(p.buildings[i]||0)!==4||p.money<s.buildCost){openModal("Пока нельзя построить отель","Нужны 4 дома на улице, полная цветовая группа и деньги на улучшение.",[{label:"Понятно",action:closeModal}]);return}
 p.money-=s.buildCost;p.buildings[i]=5;addLog(`${p.name} заменил(а) 4 дома на «${s.name}» отелем за ${s.buildCost}.`);render();broadcast()
}
function mortgage(){
 const p=current(),i=selectedProperty();if(i===null)return;const s=spaces[i];
 if(!s.price||isMortgaged(p,i)||p.properties.some(j=>spaces[j].group===s.group&&(p.buildings[j]||0)>0)){openModal("Нельзя заложить","Сначала продай все дома и отели в этой цветовой группе.",[{label:"Понятно",action:closeModal}]);return}
 p.mortgaged.push(i);const amount=Math.floor(s.price/2);p.money+=amount;addLog(`${p.name} заложил(а) «${s.name}» и получил(а) ${amount}.`);render();broadcast();if(state.pendingDebt?.playerId===p.id)trySettleDebt()
}
function redeem(){
 if(state.pendingDebt)return;const p=current(),i=selectedProperty();if(i===null)return;const s=spaces[i],amount=Math.floor(s.price/2),cost=Math.ceil(amount*1.1);
 if(!isMortgaged(p,i)||p.money<cost)return;
 p.money-=cost;p.mortgaged=p.mortgaged.filter(j=>j!==i);addLog(`${p.name} выкупил(а) «${s.name}» за ${cost}.`);render();broadcast()
}

function sellBuilding(){
 const p=current(),i=selectedProperty();if(i===null)return;const s=spaces[i],level=p.buildings[i]||0;
 if(!level){openModal("Нет зданий","На этой улице нет домов или отеля.",[{label:"Понятно",action:closeModal}]);return}
 const refund=Math.floor(s.buildCost/2);
 if(level===5)p.buildings[i]=4;else p.buildings[i]=level-1;
 p.money+=refund;addLog(`${p.name} продал(а) здание на «${s.name}» банку за ${refund}.`);render();broadcast();
 if(state.pendingDebt?.playerId===p.id)trySettleDebt();
}
function sellProperty(){
 const p=current(),i=selectedProperty();if(i===null)return;const s=spaces[i];
 if(isMortgaged(p,i)){openModal("Улица уже заложена","Заложенную недвижимость нельзя продать банку второй раз.",[{label:"Понятно",action:closeModal}]);return}
 if((p.buildings[i]||0)>0||p.properties.some(j=>spaces[j].group===s.group&&(p.buildings[j]||0)>0)){openModal("Сначала продай здания","Перед продажей или передачей улицы нужно продать все дома и отели в её цветовой группе.",[{label:"Понятно",action:closeModal}]);return}
 const amount=Math.floor(s.price/2);
 openModal("Продать недвижимость?",`Банк выкупит «${s.name}» за ${amount} (половина цены покупки).`,[
  {label:"Продать",action:()=>{closeModal();p.money+=amount;p.properties=p.properties.filter(j=>j!==i);p.mortgaged=p.mortgaged.filter(j=>j!==i);delete p.buildings[i];addLog(`${p.name} продал(а) «${s.name}» банку за ${amount}.`);render();broadcast();if(state.pendingDebt?.playerId===p.id)trySettleDebt()}},
  {label:"Отмена",className:"secondary",action:closeModal}
 ]);
}
function offerTrade(){
 if(state.pendingDebt){openModal("Сначала погаси долг","Во время непогашенного долга обмены недоступны.",[{label:"Понятно",action:closeModal}]);return}
 const p=current(),other=state.players[1-state.active];
 const eligible=(player)=>player.properties.filter(i=>!isMortgaged(player,i)&&!player.properties.some(j=>spaces[j].group===spaces[i].group&&(player.buildings[j]||0)>0));
 const mine=eligible(p),theirs=eligible(other);
 if(!mine.length){openModal("Нечего предложить","Для обмена нужны незаложенные объекты без зданий в цветовой группе.",[{label:"Понятно",action:closeModal}]);return}
 const choices=mine.map(i=>({label:spaces[i].name,action:()=>chooseTarget(i)}));
 choices.push({label:"Отмена",className:"secondary",action:closeModal});
 openModal("Предложить обмен",`Выбери объект, который предлагает ${p.name}.`,choices);
 function chooseTarget(myIndex){
  closeModal();
  const targets=theirs.map(j=>({label:spaces[j].name,action:()=>configureDeal(myIndex,j)}));
  targets.push({label:"Только за деньги",className:"secondary",action:()=>configureDeal(myIndex,null)});
  targets.push({label:"Отмена",className:"secondary",action:closeModal});
  openModal("Что предлагает соперник?",`Выбери объект ${other.name} в обмен или денежную сделку.`,targets);
 }
 function configureDeal(myIndex,theirIndex){
  closeModal();
  let cashFromMe=0;
  const ask=theirIndex===null?`Введи денежную доплату со стороны ${p.name}: положительное число — ${p.name} платит ${other.name}, отрицательное — ${other.name} платит ${p.name}.`:`Введи денежную доплату со стороны ${p.name}: положительное число — ${p.name} платит ${other.name}, отрицательное — ${other.name} платит ${p.name}.`;
  const raw=window.prompt(ask,"0");
  if(raw===null)return;
  cashFromMe=Number(raw);
  if(!Number.isFinite(cashFromMe)||!Number.isInteger(cashFromMe)){openModal("Некорректная сумма","Введи целое число или 0.",[{label:"Понятно",action:closeModal}]);return}
  if(theirIndex===null&&cashFromMe>=0){openModal("Укажи цену продажи","Для сделки только за деньги введи отрицательную сумму — сколько соперник заплатит тебе.",[{label:"Понятно",action:closeModal}]);return}
  if(cashFromMe>p.money||-cashFromMe>other.money){openModal("Не хватает денег","Одна из сторон не может внести указанную сумму.",[{label:"Понятно",action:closeModal}]);return}
  const cashText=cashFromMe>0?`${p.name} доплачивает ${other.name} ${fmt(cashFromMe)}.`:cashFromMe<0?`${other.name} доплачивает ${p.name} ${fmt(-cashFromMe)}.`:"Денежной доплаты нет.";
  const dealText=theirIndex===null?`${p.name} передаёт «${spaces[myIndex].name}» ${other.name}. ${cashText}`:`${p.name} передаёт «${spaces[myIndex].name}», ${other.name} передаёт «${spaces[theirIndex].name}». ${cashText}`;
  openModal("Подтвердить обмен",dealText,[
   {label:"Обе стороны согласны",action:()=>{
    closeModal();
    p.money-=cashFromMe;other.money+=cashFromMe;
    p.properties=p.properties.filter(k=>k!==myIndex);other.properties.push(myIndex);
    if(theirIndex!==null){other.properties=other.properties.filter(k=>k!==theirIndex);p.properties.push(theirIndex)}
    addLog(`${p.name} и ${other.name} заключили сделку: ${spaces[myIndex].name}${theirIndex!==null?" ↔ "+spaces[theirIndex].name:" за деньги"}.`);
    render();broadcast();
   }},
   {label:"Отмена",className:"secondary",action:closeModal}
  ]);
 }
}
function runAuction(index){
 const s=spaces[index];let bid=0,leader=null,turn=state.active,passes=0;state.auctionActive=true;
 const finish=()=>{
  state.auctionActive=false;closeModal();
  if(leader===null){addLog(`Аукцион «${s.name}» завершён без ставок.`)}
  else {const winner=state.players[leader];winner.money-=bid;winner.properties.push(index);winner.buildings??={};winner.mortgaged??=[];addLog(`${winner.name} выиграл(а) аукцион «${s.name}» за ${bid}.`)}
  state.active=state.pendingAuctionReturnActive??state.active;state.pendingAuctionReturnActive=null;render();broadcast();
 };
 const show=()=>{
  const player=state.players[turn];
  const minimum=leader===null?10:bid+10;
  const canRaise=player.money>=minimum;
  openModal("Аукцион: "+s.name,`Ставка: ${leader===null?"пока нет ставок":fmt(bid)+" — "+state.players[leader].name}. Сейчас ход торгов: ${player.name}.`,[
   {label:canRaise?(leader===null?`Сделать ставку ${minimum}`:`Повысить до ${minimum}`):"Не хватает денег для ставки",className:canRaise?"primary":"secondary",action:()=>{if(!canRaise)return;bid=minimum;leader=turn;passes=0;turn=1-turn;show()}},
   {label:`${player.name}: пас`,className:"secondary",action:()=>{
    passes++;
    if(leader===null&&passes>=2){finish();return}
    if(leader!==null&&turn!==leader){finish();return}
    turn=1-turn;show();
   }}
  ]);
 };
 state.pendingAuctionReturnActive=state.active;
 show();
}
function rentFor(index,rollTotal=null){
 const s=spaces[index],o=ownerOf(index);if(!o||o.id===state.active||isMortgaged(o,index))return 0;
 if(s.type==="railroad"){const count=o.properties.filter(i=>spaces[i].type==="railroad"&&!isMortgaged(o,i)).length;return [0,50,100,200,400][count]}
 if(s.type==="utility"){const count=o.properties.filter(i=>spaces[i].type==="utility"&&!isMortgaged(o,i)).length;return (rollTotal||7)*(count===2?10:4)}
 let level=o.buildings[index]||0;let rent=s.rent[level]||0;if(level===0&&groupOwned(o,index))rent*=2;return rent;
}
function movePlayer(p,steps){
 const old=p.pos;p.pos=(p.pos+steps+40)%40;
 if(steps>0&&p.pos<old){p.money+=200;addLog(`${p.name} прошёл START и получил 200.`)}
 land(p,p.pos);
}
function moveTo(p,index,collectStart=true){if(collectStart&&index<p.pos)p.money+=200;p.pos=index;land(p,index)}
function land(p,index){
 const s=spaces[index];state.canBuy=null;
 addLog(`${p.name} попал(а) на «${s.name}».`);
 if(s.type==="property"||s.type==="railroad"||s.type==="utility"){
   const owner=ownerOf(index);
   if(!owner){state.canBuy=index;if(ownedObjectCount()>=18&&p.money<s.price){state.canBuy=null;runAuction(index)}}
   else if(owner.id!==p.id){if((p.rentFree||0)>0){p.rentFree--;addLog(`${p.name} воспользовался/воспользовалась бесплатной ночёвкой и не платит аренду.`)}else{const r=rentFor(index,state.lastDice[0]+state.lastDice[1]);if(r){charge(p,r,owner,`аренда за «${s.name}»`);if(!state.pendingDebt)addLog(`${p.name} заплатил(а) ${r} аренды игроку ${owner.name}.`)}}}
 } else if(s.type==="tax"){charge(p,s.amount,null,"налог");if(!state.pendingDebt)addLog(`${p.name} заплатил(а) налог ${s.amount}.`)}
 else if(s.type==="gotojail"){sendToJail(p)}
 else if(s.type==="chance"||s.type==="chest"){drawCard(s.type,p)}
 render();
}
function charge(p,amount,creditor=null,reason="платёж"){
 if(amount<=0)return true;
 if(p.money>=amount){p.money-=amount;if(creditor)creditor.money+=amount;return true}
 state.pendingDebt={playerId:p.id,creditorId:creditor?creditor.id:null,amount,reason};
 openDebtModal();return false;
}
function maxLiquidationFunds(p){
 let total=0;
 for(const i of p.properties){const s=spaces[i];if(!isMortgaged(p,i))total+=Math.floor((s.price||0)/2);const level=p.buildings?.[i]||0;if(s.type==="property"&&level>0)total+=Math.floor((s.buildCost||0)/2)*level;}
 return total;
}
function openDebtModal(){
 const d=state.pendingDebt;if(!d)return;const p=state.players[d.playerId];
 const actions=[{label:"Проверить оплату",action:()=>{closeModal();trySettleDebt()}}];
 if(p.money+maxLiquidationFunds(p)<d.amount)actions.push({label:"Объявить банкротство",className:"secondary",action:()=>{closeModal();declareBankruptcy(p)}});
 openModal("Нужно оплатить долг",`${p.name}: ${fmt(d.amount)} за ${d.reason}. Сейчас у тебя ${fmt(p.money)}. Продай здания или заложи недвижимость, затем нажми «Проверить оплату». ${actions.length===1?"Банкротство пока недоступно: у тебя ещё достаточно имущества, чтобы попытаться собрать нужную сумму.":"Похоже, даже после ликвидации имущества денег не хватит."}`,actions);
}
function trySettleDebt(){
 const d=state.pendingDebt;if(!d)return;
 const p=state.players[d.playerId];
 if(p.money<d.amount){openDebtModal();return}
 p.money-=d.amount;
 const creditor=d.creditorId===null?null:state.players.find(q=>q.id===d.creditorId);
 if(creditor)creditor.money+=d.amount;
 state.pendingDebt=null;
 addLog(`${p.name} погасил(а) долг ${d.amount} (${d.reason}).`);
 if(d.reason==="третий неудачный бросок в тюрьме"){p.jail=0;p.jailTurns=0;movePlayer(p,state.lastDice[0]+state.lastDice[1]);}
 render();broadcast();
}
function declareBankruptcy(p){
 const d=state.pendingDebt;
 const creditor=d&&d.creditorId!==null?state.players.find(q=>q.id===d.creditorId):null;
 const winner=state.players.find(q=>q.id!==p.id);
 if(creditor){creditor.money+=p.money; p.properties.forEach(i=>{if(!creditor.properties.includes(i))creditor.properties.push(i);creditor.buildings??={};creditor.buildings[i]=p.buildings[i]||0;creditor.mortgaged??=[];if(p.mortgaged.includes(i)&&!creditor.mortgaged.includes(i))creditor.mortgaged.push(i)});}
 else {p.properties=[];}
 p.properties=[];p.buildings={};p.mortgaged=[];p.money=0;state.pendingDebt=null;state.gameOver=true;state.canBuy=null;
 addLog(`${p.name} обанкротился/обанкротилась. Победитель: ${winner.name}.`);
 render();broadcast();
 openModal("Игра окончена 🏁",`${p.name} не смог(ла) погасить долг. Победитель: ${winner.name}!`,[{label:"Новая игра",action:()=>{closeModal();newGame()}}]);
}

function sendToJail(p){p.pos=10;p.jail=1;p.jailTurns=0;p.consecutiveDoubles=0;state.canBuy=null;addLog(`${p.name} отправляется в тюрьму.`)}
function drawCard(type,p){
 const deck=type==="chest"?defaultChest:defaultChance;const card=deck[(type==="chest"?state.chestIndex++:state.chanceIndex++)%deck.length];
 openModal(card.title,card.text, [{label:"Продолжить",action:()=>{
  closeModal();
  if(card.amount>0){p.money+=card.amount;addLog(`${p.name} получил(а) ${card.amount} по карточке «${card.title}».`)}else if(card.amount<0){if(charge(p,-card.amount,null,`карточка «${card.title}»`))addLog(`${p.name} заплатил(а) ${-card.amount} по карточке «${card.title}».`)}
  if(state.pendingDebt){render();broadcast();return}
  if(card.skip){p.skip=true;addLog(`${p.name} пропускает следующий ход.`)}
  if(card.special==="rentfree"){p.rentFree=1}
  if(card.special==="jailfree"){p.jailCard=true;addLog(`${p.name} получил(а) карту выхода из тюрьмы.`)}
  if(card.goto!==undefined){if(card.goto===10){sendToJail(p)}else moveTo(p,card.goto)}
  if(card.move){movePlayer(p,card.move)}
  if(card.nearest){let next=spaces.findIndex((s,i)=>i>p.pos&&s.type===card.nearest);if(next<0)next=spaces.findIndex(s=>s.type===card.nearest);moveTo(p,next)}
  render();broadcast();
 }}]);
}
function openModal(title,text,buttons=[]){$("closeModal").style.display=state.auctionActive?"none":"block";$("modalTitle").textContent=title;$("modalText").textContent=text;const root=$("modalButtons");root.innerHTML="";buttons.forEach(b=>{const btn=document.createElement("button");btn.className=b.className||"primary";btn.textContent=b.label;btn.onclick=b.action;root.appendChild(btn)});$("modal").classList.remove("hidden")}
function closeModal(){if(state.auctionActive)return;$("modal").classList.add("hidden")}
function roll(){
 if(state.gameOver||state.pendingDebt)return;const p=current();
 if(state.extraRollPending){if(state.canBuy!==null)return;state.rolled=false;state.extraRollPending=false;doRoll(p);return}
 if(state.rolled)return;
 if(p.skip){p.skip=false;state.rolled=true;addLog(`${p.name} пропускает ход: слишком объелись.`);render();return}
 if(p.jail){
  const choices=[
   ...(p.jailCard?[{label:"Использовать карту выхода",action:()=>{p.jailCard=false;p.jail=0;p.jailTurns=0;closeModal();addLog(`${p.name} использовал(а) карту выхода из тюрьмы.`);doRoll(p)}}]:[]),
   {label:"Заплатить 50 и выйти",action:()=>{if(p.money<50){closeModal();openModal("Не хватает денег","Чтобы выйти из тюрьмы, нужно 50. Можно попытаться выбросить дубль.",[{label:"Попытаться выбросить дубль",action:()=>{closeModal();attemptJailRoll(p)}}]);return}p.money-=50;p.jail=0;p.jailTurns=0;closeModal();doRoll(p)}},
   {label:"Попытаться выбросить дубль",className:"secondary",action:()=>{closeModal();attemptJailRoll(p)}}
  ];
  if((p.jailTurns||0)>=2){choices[1]={label:"Третья попытка (при неудаче заплатить 50)",className:"secondary",action:()=>{closeModal();attemptJailRoll(p,true)}}}
  openModal("Тюрьма 🔒",`${p.name} в тюрьме. Можно заплатить 50 или попытаться выбросить дубль.`,choices);return;
 }
 doRoll(p);
}
function attemptJailRoll(p,finalAttempt=false){
 const d1=1+Math.floor(Math.random()*6),d2=1+Math.floor(Math.random()*6),dbl=d1===d2;
 state.lastDice=[d1,d2];addLog(`${p.name} пытается выйти из тюрьмы: ${d1} + ${d2}.`);
 if(dbl){p.jail=0;p.jailTurns=0;state.rolled=true;movePlayer(p,d1+d2);render();return}
 p.jailTurns=(p.jailTurns||0)+1;
 if(finalAttempt||p.jailTurns>=3){if(p.money>=50){p.money-=50;p.jail=0;p.jailTurns=0;state.rolled=true;movePlayer(p,d1+d2);addLog(`${p.name} заплатил(а) 50 после неудачных попыток и вышел/вышла из тюрьмы.`)}else{state.rolled=true;addLog(`${p.name} не выбросил(а) дубль и не может заплатить за освобождение.`);state.pendingDebt={playerId:p.id,creditorId:null,amount:50,reason:"третий неудачный бросок в тюрьме"};openDebtModal()}}
 else state.rolled=true;
 render();
}
function doRoll(p){
 state.extraRollPending=false;
 const d1=1+Math.floor(Math.random()*6),d2=1+Math.floor(Math.random()*6),dbl=d1===d2;
 state.lastDice=[d1,d2];state.rolled=true;state.canBuy=null;
 if(dbl){p.consecutiveDoubles=(p.consecutiveDoubles||0)+1;if(p.consecutiveDoubles>=3){sendToJail(p);p.consecutiveDoubles=0;state.rolled=true;state.extraRollPending=false;render();broadcast();return}}else p.consecutiveDoubles=0;
 addLog(`${p.name} выбросил(а) ${d1} + ${d2}.`);
 movePlayer(p,d1+d2);if(dbl&&!p.jail)state.extraRollPending=true;
 render();broadcast();
}
function declinePurchase(){
 const i=state.canBuy;if(i===null)return;const s=spaces[i];state.canBuy=null;
 if(ownedObjectCount()>=18){state.active=state.active;runAuction(i)}
 else{addLog(`${current().name} отказался(ась) от «${s.name}». Аукционы ещё не включены; объект остаётся у банка.`);render();broadcast()}
}

function buy(){const p=current(),i=state.canBuy;if(i===null||state.pendingDebt)return;const s=spaces[i];if(p.money<s.price){state.canBuy=null;if(ownedObjectCount()>=18){addLog(`${p.name} не может оплатить «${s.name}» по полной цене; начинается аукцион.`);runAuction(i)}else{addLog(`${p.name} не может купить «${s.name}». До включения аукционов объект остаётся у банка.`);render();broadcast()}return}p.money-=s.price;p.properties.push(i);p.buildings??={};p.mortgaged??=[];state.canBuy=null;addLog(`${p.name} купил(а) «${s.name}» за ${s.price}.`);render();broadcast()}
function endTurn(){
 if(!state.rolled||state.extraRollPending||state.canBuy!==null||state.pendingDebt)return;state.rolled=false;state.extraRollPending=false;state.canBuy=null;state.lastDice=[null,null];
 const was=state.active;state.players[was].consecutiveDoubles=0;state.active=1-state.active;if(was===1)state.round++;render();broadcast();
}
function newGame(){if(!confirm("Начать новую игру? Текущий прогресс будет сброшен."))return;initPlayers();state.active=0;state.round=1;state.lastDice=[null,null];state.rolled=false;state.extraRollPending=false;state.canBuy=null;state.log=[];state.chestIndex=0;state.chanceIndex=0;state.gameOver=false;state.pendingDebt=null;state.auctionActive=false;addLog("Новая игра началась! У каждого по 1 500 игровых Ft.");render();broadcast()}
function serializableState(){
 return {players:state.players,active:state.active,round:state.round,lastDice:state.lastDice,rolled:state.rolled,extraRollPending:state.extraRollPending,canBuy:state.canBuy,log:state.log,chestIndex:state.chestIndex,chanceIndex:state.chanceIndex,gameOver:state.gameOver,pendingDebt:state.pendingDebt,auctionActive:state.auctionActive};
}
function sendSnapshot(eventName){
 if(!channel||isApplyingRemote)return;
 const payload={...serializableState(),senderId:clientId,senderRole:onlineRole,revision:++syncRevision,sentAt:Date.now()};
 channel.send({type:"broadcast",event:eventName,payload});
}
function broadcast(){
 if(!channel||isApplyingRemote)return;
 if(syncTimer)clearTimeout(syncTimer);
 // Batch synchronous game updates so the other device receives a complete action,
 // rather than intermediate states emitted by each log entry.
 syncTimer=setTimeout(()=>{syncTimer=null;sendSnapshot(onlineRole==="host"?"state":"guest_state")},100);
}
async function loadSupabaseLibrary(){
 if(window.supabase)return window.supabase;
 await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";script.onload=resolve;script.onerror=()=>reject(new Error("Не удалось загрузить Supabase SDK"));document.head.appendChild(script)});
 if(!window.supabase)throw new Error("Supabase SDK не инициализировался");
 return window.supabase;
}
function applyRemoteState(payload){
 if(!payload||!Array.isArray(payload.players)||payload.players.length!==2)return;
 isApplyingRemote=true;
 const {senderId,senderRole,revision,sentAt,...remoteState}=payload;
 state={...state,...remoteState};
 isApplyingRemote=false;
 render();renderLog();
}
function roomFromUrl(){
 try{const params=new URLSearchParams(window.location.search);return params.get("room")||""}catch(_){return ""}
}
function applyRoomUrlDefaults(){
 const room=roomFromUrl();if(room&&$("roomCode"))$("roomCode").value=room.toUpperCase();
 try{const params=new URLSearchParams(window.location.search);const role=params.get("role");if((role==="guest"||role==="host")&&$("onlineRole"))$("onlineRole").value=role}catch(_){}
}
async function connectOnline(){
 const url=$("supabaseUrl").value.trim(),key=$("supabaseKey").value.trim();
 const role=$("onlineRole").value==="guest"?"guest":"host";
 let room=($("roomCode").value.trim()||"").toUpperCase().replace(/[^A-Z0-9-]/g,"");
 if(role==="host"&&!room)room="SD-"+Math.random().toString(36).slice(2,7).toUpperCase();
 if(!room){openModal("Нужен код комнаты","Введи код комнаты, который прислал создатель игры.",[{label:"Понятно",action:closeModal}]);return}
 if(!url||!key){openModal("Нужны данные Supabase","Создай проект Supabase и вставь Project URL и публичный anon/publishable key. Не используй service_role key.",[{label:"Понятно",action:closeModal}]);return}
 try{
  onlineRole=role;localPlayerId=role==="host"?0:1;connectedRoom=room;
  await loadSupabaseLibrary();
  supabaseClient=window.supabase.createClient(url,key);
  if(channel)await supabaseClient.removeChannel(channel);
  channel=supabaseClient.channel("monopoly-room-"+room,{config:{broadcast:{self:false},presence:{key:clientId}}});
  channel.on("broadcast",{event:"state"},({payload})=>{
   if(onlineRole!=="guest"||!payload||payload.senderRole!=="host")return;
   applyRemoteState(payload);
   $("connectionBadge").textContent="Онлайн · "+room;$("connectionBadge").className="badge online";
  });
  channel.on("broadcast",{event:"guest_state"},({payload})=>{
   if(onlineRole!=="host"||!payload||payload.senderRole!=="guest")return;
   // Only the guest device may originate the guest-side state; the host rebroadcasts
   // the accepted state as the room snapshot. For a private two-person game this is
   // practical sync, not a secure server-authoritative anti-cheat system.
   applyRemoteState(payload);broadcast();
  });
  channel.on("broadcast",{event:"hello"},({payload})=>{
   if(onlineRole==="host"&&payload?.senderRole==="guest")sendSnapshot("state");
  });
  channel.subscribe(status=>{
   if(status==="SUBSCRIBED"){
    $("connectionBadge").textContent=(role==="host"?"Комната создана · ":"Подключаемся · ")+room;
    $("connectionBadge").className="badge online";
    updateOnlineControls();render();
    if(role==="host")sendSnapshot("state");
    else channel.send({type:"broadcast",event:"hello",payload:{senderId:clientId,senderRole:"guest",room}});
  }else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"||status==="CLOSED"){
    channel=null;onlineRole="offline";$("connectionBadge").textContent="Нет соединения";$("connectionBadge").className="badge offline";render();
    openModal("Соединение прервано","Проверь URL и публичный ключ Supabase, интернет и одинаковый код комнаты на обоих устройствах.",[{label:"Понятно",action:closeModal}]);
  }
  });
 }catch(e){channel=null;onlineRole="offline";$("connectionBadge").textContent="Локальная игра";$("connectionBadge").className="badge offline";openModal("Ошибка подключения",String(e.message||e),[{label:"Закрыть",action:closeModal}])}
}
async function copyInviteLink(){
 if(!onlineConnected()||onlineRole!=="host")return;
 let url;
 try{const base=window.location.origin+window.location.pathname;url=base+"?room="+encodeURIComponent(connectedRoom)+"&role=guest"}
 catch(_){openModal("Ссылка недоступна","Сначала опубликуй игру на GitHub Pages, затем создай комнату ещё раз.",[{label:"Понятно",action:closeModal}]);return}
 try{await navigator.clipboard.writeText(url);openModal("Ссылка скопирована 💌","Отправь Диасу эту ссылку. Ему также понадобятся тот же Supabase URL и публичный ключ, а затем нужно нажать «Подключить онлайн».",[{label:"Отлично",action:closeModal}])}
 catch(_){openModal("Ссылка для Диаса",url+"\n\nСкопируй её вручную и отправь Диасу.",[{label:"Закрыть",action:closeModal}])}
}
$("rollBtn").onclick=roll;$("endTurnBtn").onclick=endTurn;$("buyBtn").onclick=buy;$("declineBtn").onclick=declinePurchase;
$("buildBtn").onclick=buildHouse;$("hotelBtn").onclick=buildHotel;$("mortgageBtn").onclick=mortgage;$("redeemBtn").onclick=redeem;
$("sellBuildingBtn").onclick=sellBuilding;$("sellPropertyBtn").onclick=sellProperty;$("tradeBtn").onclick=offerTrade;
$("manageProperty").onchange=updateManagement;$("newGameBtn").onclick=newGame;$("closeModal").onclick=closeModal;$("connectBtn").onclick=connectOnline;$("inviteBtn").onclick=copyInviteLink;$("clearLogBtn").onclick=()=>{state.log=[];renderLog()};
initPlayers();applyRoomUrlDefaults();render();addLog("Добро пожаловать в Sasha & Dias Monopoly. Подключи онлайн-комнату, чтобы играть с разных устройств.");
