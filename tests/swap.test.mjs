import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('../app.js',import.meta.url),'utf8');
const source=app.slice(app.indexOf('function swapStations('),app.indexOf('function bindEvents()'));
function run(from,to,prefix=''){
 const ids=prefix?['routineFrom','routineTo']:['fromStation','toStation'];
 const nodes=Object.fromEntries([[ids[0],{value:from[0],dataset:{line:from[1]}}],[ids[1],{value:to[0],dataset:{line:to[1]}}],[ids[0]+'Line',{value:from[1]}],[ids[1]+'Line',{value:to[1]}]]);
 let synced=0;
 const context={document:{getElementById:id=>nodes[id]},syncInputOptions(){synced++},toast(){},activeGoal:{to:'기존 진행 목표'},planCache:{},$(){throw Error('active goal should not be changed')}};
 vm.createContext(context);vm.runInContext(source,context);context.swapStations(...ids);
 return {nodes,ids,synced,context};
}
test('swap moves transfer station with its selected line, twice restores it',()=>{
 const {nodes,ids,synced,context}=run(['신촌','경의중앙선'],['시청','2호선']);
 assert.equal(nodes.fromStation.value,'시청');assert.equal(nodes.fromStation.dataset.line,'2호선');
 assert.equal(nodes.toStation.value,'신촌');assert.equal(nodes.toStation.dataset.line,'경의중앙선');
 assert.equal(nodes.fromStationLine.value,'');assert.equal(synced,1);
 assert.equal(context.activeGoal.to,'기존 진행 목표');
 context.swapStations(...ids);assert.equal(nodes.fromStation.value,'신촌');
});
test('repeat-route swap handles an empty endpoint without losing the other station',()=>{
 const {nodes}=run(['',''],['이대','2호선'],'routine');
 assert.equal(nodes.routineFrom.value,'이대');assert.equal(nodes.routineFrom.dataset.line,'2호선');
 assert.equal(nodes.routineTo.value,'');assert.equal(nodes.routineTo.dataset.line,'');
});
