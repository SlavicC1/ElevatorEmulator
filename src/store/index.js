import {createStore} from 'vuex';

export const FLOOR_STATE = {
    IDLE: 'idle',
    WAITS_CAGE: 'waits_elevator',
    IN_QUEUE: 'in_queue',
};

export const CAGE_STATE = {
    IDLE: 'idle',
    WAITING_ON_FLOOR: 'waiting_on_floor',
    IN_MOVE: 'in_move',
    WILL_MOVE: 'will_move',
};

export const CAGE_MOVING_DIRECTION = {
    UP: 'up',
    DOWN: 'down',
};



const consts = {
    floorHeight: 100, //px
    cageSpeed: 0.1, // px/ms
    cageAwaitsTime: 3000,
}

export default createStore({
    state() {
        return {
            floors: [
                {state: FLOOR_STATE.IDLE},
                {state: FLOOR_STATE.IDLE},
                {state: FLOOR_STATE.IDLE},
                {state: FLOOR_STATE.IDLE},
                {state: FLOOR_STATE.IDLE},
            ], 
            cages: [{
                bottom: 0,
                state: CAGE_STATE.IDLE,
                direction: CAGE_MOVING_DIRECTION.UP,
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
        setCageFloor(state, {cageIndex, floor}) {
            state.cages[cageIndex].floor = floor;
        },
        setCageToWaitsStartTime(state, {cageIndex, waitsStartTime}){
            state.cages[cageIndex].waitsSince = waitsStartTime;
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

        setState(state, {newState}){
            state.floors = newState.floors;
            state.cages = newState.cages;
            state.floorsQueue = newState.floorsQueue;
        },
    },
    
    actions: {
        addFloorToQueue(context, {floorNumber}) {
            const state = context.state;
            if(state.floorsQueue.includes(floorNumber)) return;

            for(let i = 0; i < state.cages.length; i++) {
                if(state.cages[i].floor === floorNumber 
                    && state.cages[i].state === CAGE_STATE.IDLE) return;
            }

            context.commit('setFloorAcivity', {floorNumber, floorControlsState: FLOOR_STATE.IN_QUEUE});
            context.commit('pushToQueue',{floorNumber});
        },
        
        makeCageWaitOnFloor(context, {cageIndex, waitingTime}) {
            setTimeout(() => {
                context.commit('setCageState', {cageIndex, cageState: CAGE_STATE.IDLE});
                context.dispatch('moveCageToNextFloor', {cageIndex});
            }, waitingTime);
        },

        moveCageToFloor(context, {cageIndex, floorNumber}) {
            const state = context.state;

            context.commit('setFloorAcivity', {floorNumber, floorControlsState: FLOOR_STATE.WAITS_CAGE});
            context.commit('setCageFloor', {cageIndex, floor: floorNumber});

            let newBottom = (floorNumber - 1) * consts.floorHeight;

            context.commit('setCageState',{cageIndex, cageState: CAGE_STATE.IN_MOVE});
            context.commit('setCageDirection', {
                cageIndex, 
                cageDirection: newBottom > state.cages[cageIndex].bottom ? CAGE_MOVING_DIRECTION.UP : CAGE_MOVING_DIRECTION.DOWN
            });

            let lastTime = (new Date()).getTime();

            const movingAnimationCallback = () => {
                let dT = (new Date()).getTime() - lastTime;
                lastTime = (new Date()).getTime();

                let currentBottom = state.cages[cageIndex].direction === CAGE_MOVING_DIRECTION.UP ? (
                    state.cages[cageIndex].bottom + consts.cageSpeed * dT
                ) : (
                    state.cages[cageIndex].bottom - consts.cageSpeed * dT
                );

                let stop = state.cages[cageIndex].direction === CAGE_MOVING_DIRECTION.UP ? (
                    currentBottom >= newBottom
                ) : (
                    currentBottom <= newBottom
                );

                if(stop) {
                    context.commit('setCageBottom', {cageIndex, bottom: newBottom});
                    context.commit('setCageState', {cageIndex, cageState: CAGE_STATE.WAITING_ON_FLOOR});
                    context.commit('setCageToWaitsStartTime', {cageIndex, waitsStartTime: lastTime});
                    context.commit('setFloorAcivity', {floorNumber: state.cages[cageIndex].floor, floorControlsState: FLOOR_STATE.IDLE});
                    context.dispatch('makeCageWaitOnFloor', {cageIndex, waitingTime: consts.cageAwaitsTime});
                } else {
                    context.commit('setCageBottom', {cageIndex, bottom: currentBottom});
                    window.requestAnimationFrame(movingAnimationCallback);
                }
            }

            window.requestAnimationFrame(movingAnimationCallback);
        },

        moveCageToNextFloor(context, {cageIndex}) {
            const state = context.state;

            if(state.cages[cageIndex].state === CAGE_STATE.WAITING_ON_FLOOR) return;
            if(state.cages[cageIndex].state === CAGE_STATE.IN_MOVE) return;

            let floorNumber = state.cages[cageIndex].floor;

            if(state.cages[cageIndex].state === CAGE_STATE.IDLE) {
                if(state.floorsQueue.length < 1) return;
            
                floorNumber = state.floorsQueue[0];
                context.commit('shiftQueue');
            
                if(floorNumber === state.cages[cageIndex].floor) {
                    context.commit('setFloorAcivity', {floorNumber, floorControlsState: FLOOR_STATE.IDLE});
                    return;
                }
            }

            context.dispatch('moveCageToFloor', {cageIndex, floorNumber});
        },

        nexIdleCageStartMoving(context) {
            const state = context.state;
            
            let cageIndex = 0;
            const currentFloor  = state.floorsQueue[0];
            if(!currentFloor) return;
            let nearestCageDistance = state.floors.length;

            for(let i = 0; i < state.cages.length; i++) {
                let currentDistance = Math.abs(currentFloor - state.cages[i].floor);
                if(state.cages[i].state === CAGE_STATE.IDLE
                    && nearestCageDistance > currentDistance) {
                        nearestCageDistance = currentDistance;
                        cageIndex = i;
                }
            }
            context.dispatch('moveCageToNextFloor', {cageIndex});
        },

        cagesStartMoving(context) {
            const state = context.state;
            for(let i = 0; i < state.cages.length; i++) {
                context.dispatch('moveCageToNextFloor', {cageIndex: i});
            }
        },

        saveState(context) {
            const state = context.state;
            for( let i=0; i < state.cages.length; i++){
                if(state.cages[i].state === CAGE_STATE.IN_MOVE){
                    context.commit('setCageState', {cageIndex: i, cageState: CAGE_STATE.WILL_MOVE});
                }
            }
            localStorage.setItem('elevator-emulator-state',JSON.stringify(state));
        },

        loadState(context) {
            const state = context.state;
            let newState = JSON.parse(localStorage.getItem('elevator-emulator-state'));

            if(!newState) return;
            if(state.cages.length != newState.cages.length || state.floors.length != newState.floors.length) return;

            context.commit('setState',{newState});

            //waits лифты продолжают ждать оставшееся им время
            let now = (new Date()).getTime();
            for(let i = 0; i < state.cages.length; i++){
                let leftTime = consts.cageAwaitsTime - ( now - state.cages[i].waitsSince );
                if(state.cages[i].state === CAGE_STATE.WAITING_ON_FLOOR){
                    context.dispatch('makeCageWaitOnFloor', {cageIndex: i, waitingTime: leftTime});
                }
            }
        },

        setNewBasicState(context, {numberOfFloors, numberOfCages}) {
            let floors = [];
            for( let i = 0; i < numberOfFloors; i++ ) {
                floors.push({state: FLOOR_STATE.IDLE});
            }
            let cages = [];
            for( let i = 0; i < numberOfCages; i++ ) {
                cages.push({
                    bottom: 0,
                    state: CAGE_STATE.IDLE,
                    direction: CAGE_MOVING_DIRECTION.UP,
                    floor: 1,
                    waitsSince: 0,
                });
            }
            let newState = {
                floors,
                cages,
                floorsQueue: [],
            };
            context.commit('setState',{newState});
        }
    }
});