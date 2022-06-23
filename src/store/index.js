import {createStore} from 'vuex';



const consts = {
    floorHeight: 100, //px
    cageSpeed: 0.1, // px/ms
    baseUpdateTime: 20, 
    cageAwaitsTime: 3000,
}

export default createStore({
    state() {
        return {
            //off - кнопка на этаже не нажата
            //on - кнопка на этаже нажата
            //waits - на этаж едет лифт
            floors: [
                {state: 'off'},
                {state: 'off'},
                {state: 'off'},
                {state: 'off'},
                {state: 'off'},
            ], 
            cages: [{
                bottom: 0,
                state: 'idle', // 'idle' | 'moving' | 'waits' | 'should-movung'
                direction: 'up', // 'up' | 'down'
                floor: 1,
                waitsSince: 0,
            }],
            floorsQueue: [],
        };
    },

    mutations: {
        setCageBottom(state, {cageIndex, bottom}) {
            state.cages[cageIndex].bottom = bottom;
        },
        setCageState(state, {cageIndex, cageState}) {
            state.cages[cageIndex].state = cageState;
        },
        setCageDirection(state, {cageIndex, cageDirection}) {
            state.cages[cageIndex].direction = cageDirection;
        },
        pushToQueue(state, {floorNumber}) {
            state.floorsQueue.push(floorNumber);
        },
        shiftQueue(state) {
            state.floorsQueue.shift();
        },        
        setFloorAcivity(state, {floorNumber, floorControlsState}) {
            state.floors[floorNumber - 1].state = floorControlsState;
        },
        setCageFloor(state, {cageIndex, floor}) {
            state.cages[cageIndex].floor = floor;
        },
        setState(state, {newState}){
            state.floors = newState.floors;
            state.cages = newState.cages;
            state.floorsQueue = newState.floorsQueue;
        },
        setCageToWaitsStartTime(state, {cageIndex, waitsStartTime}){
            state.cages[cageIndex].waitsSince = waitsStartTime;
        }
    },
    
    actions: {
        addFloorToQueue(context, {floorNumber}) {
            let state = context.state;
            if(state.floorsQueue.includes(floorNumber)) return;
            context.commit('setFloorAcivity', {floorNumber, floorControlsState: 'on'});
            context.commit('pushToQueue',{floorNumber});
        },
        
        moveCageToNextFloor(context, {cageIndex}) {
            let state = context.state;

            if(state.cages[cageIndex].state === 'waits') return;
            if(state.cages[cageIndex].state === 'moving') return;

            let floorNumber = state.cages[cageIndex].floor;

            if(state.cages[cageIndex].state === 'idle') {
                if(state.floorsQueue.length < 1) return;
            
                floorNumber = state.floorsQueue[0];
                context.commit('shiftQueue');
            
                if(floorNumber === state.cages[cageIndex].floor) {
                    context.commit('setFloorAcivity', {floorNumber, floorControlsState: 'off'});
                    return;
                }
            }

            context.commit('setFloorAcivity', {floorNumber, floorControlsState: 'waits'});
            context.commit('setCageFloor', {cageIndex, floor: floorNumber});

            let newBottom = (floorNumber - 1) * consts.floorHeight;

            context.commit('setCageState',{cageIndex, cageState:'moving'});
            context.commit('setCageDirection', {
                cageIndex, 
                cageDirection: newBottom > state.cages[cageIndex].bottom ? 'up' : 'down'
            });

            let lastTime = (new Date()).getTime();

            const movingCage = setInterval(() => {
                let dT = (new Date()).getTime() - lastTime;
                lastTime = (new Date()).getTime();

                let currentBottom = state.cages[cageIndex].direction === 'up' ? (
                    state.cages[cageIndex].bottom + consts.cageSpeed * dT
                ) : (
                    state.cages[cageIndex].bottom - consts.cageSpeed * dT
                );

                let stop = state.cages[cageIndex].direction === 'up' ? (
                    currentBottom >= newBottom
                ) : (
                    currentBottom <= newBottom
                );

                if(stop) {
                    context.commit('setCageBottom', {cageIndex, bottom: newBottom});
                    context.commit('setCageState', {cageIndex, cageState: 'waits'});
                    context.commit('setCageToWaitsStartTime', {cageIndex, waitsStartTime: lastTime});
                    setTimeout(() => {
                        context.commit('setCageState', {cageIndex, cageState: 'idle'});
                        context.commit('setFloorAcivity', {floorNumber, floorControlsState: 'off'});
                        context.dispatch('moveCageToNextFloor', {cageIndex});
                    }, consts.cageAwaitsTime);
                    clearInterval(movingCage);
                } else {
                    context.commit('setCageBottom', {cageIndex, bottom: currentBottom});
                }
            }, consts.baseUpdateTime);
        },

        saveState(context) {
            let state = context.state;
            for( let i=0; i < state.cages.length; i++){
                if(state.cages[i].state === 'moving'){
                    context.commit('setCageState', {cageIndex: i, cageState: 'should-moving'});
                }
            }
            localStorage.setItem('elevator-emulator-state',JSON.stringify(state));
        },

        loadState(context) {
            let newState = JSON.parse(localStorage.getItem('elevator-emulator-state'));
            if( newState ) context.commit('setState',{newState});
            let state = context.state;
            console.log(newState);
            //waits лифты продолжают ждать оставшееся им время
            let now = (new Date()).getTime();
            for(let i = 0; i < state.cages.length; i++){
                let leftTime = consts.cageAwaitsTime - ( now - state.cages[i].waitsSince );
                if(state.cages[i].state === 'waits'){
                    setTimeout(() => {
                        context.commit('setCageState', {cageIndex: i, cageState: 'idle'});
                        context.commit('setFloorAcivity', {floorNumber: state.cages[i].floor, floorControlsState: 'off'});
                        context.dispatch('moveCageToNextFloor', {cageIndex: i});
                    }, leftTime);
                }
            }
        },

        setNewBasicState(context, {numberOfFloors, numberOfCages}) {
            let floors = Array(numberOfFloors).map( () => ({state: 'off'}));
            let cages = Array(numberOfCages).map( () => ({
                bottom: 0,
                state: 'idle', // 'idle' | 'moving' | 'waits'
                direction: 'up', // 'up' | 'down'
                floor: 1,
                waitsSince: 0,
            }));
            let newState = {
                floors,
                cages,
                floorsQueue: [],
            };
            context.commit('setState',{newState});
        }
    }
});