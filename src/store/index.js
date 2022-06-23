import {createStore} from 'vuex';

export const FLOOR_STATE = {
    IDLE: 'idle',
    WAITS_ELEVATOR: 'waits_elevator',
    IN_QUEUE: 'in_queue',
};

export const ELEVATOR_STATE = {
    IDLE: 'idle',
    WAITING_ON_FLOOR: 'waiting_on_floor',
    IN_MOVE: 'in_move',
    WILL_MOVE: 'will_move',
};

export const ELEVATOR_MOVING_DIRECTION = {
    UP: 'up',
    DOWN: 'down',
};



const consts = {
    floorHeight: 100, //px
    cageSpeed: 0.1, // px/ms
    baseUpdateTime: 20, 
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
                state: ELEVATOR_STATE.IDLE,
                direction: ELEVATOR_MOVING_DIRECTION.UP,
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
            let state = context.state;
            if(state.floorsQueue.includes(floorNumber)) return;
            context.commit('setFloorAcivity', {floorNumber, floorControlsState: FLOOR_STATE.IN_QUEUE});
            context.commit('pushToQueue',{floorNumber});
        },
        
        makeCageWaitOnFloor(context, {cageIndex, waitingTime}) {
            setTimeout(() => {
                context.commit('setCageState', {cageIndex, cageState: ELEVATOR_STATE.IDLE});
                context.dispatch('moveCageToNextFloor', {cageIndex});
            }, waitingTime);
        },

        moveCgeToFloor(context, {cageIndex, floorNumber}) {
            let state = context.state;

            context.commit('setFloorAcivity', {floorNumber, floorControlsState: FLOOR_STATE.WAITS_ELEVATOR});
            context.commit('setCageFloor', {cageIndex, floor: floorNumber});

            let newBottom = (floorNumber - 1) * consts.floorHeight;

            context.commit('setCageState',{cageIndex, cageState: ELEVATOR_STATE.IN_MOVE});
            context.commit('setCageDirection', {
                cageIndex, 
                cageDirection: newBottom > state.cages[cageIndex].bottom ? ELEVATOR_MOVING_DIRECTION.UP : ELEVATOR_MOVING_DIRECTION.DOWN
            });

            let lastTime = (new Date()).getTime();

            const movingCage = setInterval(() => {
                let dT = (new Date()).getTime() - lastTime;
                lastTime = (new Date()).getTime();

                let currentBottom = state.cages[cageIndex].direction === ELEVATOR_MOVING_DIRECTION.UP ? (
                    state.cages[cageIndex].bottom + consts.cageSpeed * dT
                ) : (
                    state.cages[cageIndex].bottom - consts.cageSpeed * dT
                );

                let stop = state.cages[cageIndex].direction === ELEVATOR_MOVING_DIRECTION.UP ? (
                    currentBottom >= newBottom
                ) : (
                    currentBottom <= newBottom
                );

                if(stop) {
                    context.commit('setCageBottom', {cageIndex, bottom: newBottom});
                    context.commit('setCageState', {cageIndex, cageState: ELEVATOR_STATE.WAITING_ON_FLOOR});
                    context.commit('setCageToWaitsStartTime', {cageIndex, waitsStartTime: lastTime});
                    context.commit('setFloorAcivity', {floorNumber: state.cages[cageIndex].floor, floorControlsState: FLOOR_STATE.IDLE});
                    context.dispatch('makeCageWaitOnFloor', {cageIndex, waitingTime: consts.cageAwaitsTime});
                    clearInterval(movingCage);
                } else {
                    context.commit('setCageBottom', {cageIndex, bottom: currentBottom});
                }
            }, consts.baseUpdateTime);
        },

        moveCageToNextFloor(context, {cageIndex}) {
            let state = context.state;

            if(state.cages[cageIndex].state === ELEVATOR_STATE.WAITING_ON_FLOOR) return;
            if(state.cages[cageIndex].state === ELEVATOR_STATE.IN_MOVE) return;

            let floorNumber = state.cages[cageIndex].floor;

            if(state.cages[cageIndex].state === ELEVATOR_STATE.IDLE) {
                if(state.floorsQueue.length < 1) return;
            
                floorNumber = state.floorsQueue[0];
                context.commit('shiftQueue');
            
                if(floorNumber === state.cages[cageIndex].floor) {
                    context.commit('setFloorAcivity', {floorNumber, floorControlsState: FLOOR_STATE.IDLE});
                    return;
                }
            }

            context.dispatch('moveCgeToFloor', {cageIndex, floorNumber});
        },

        cagesStartMoving(context) {
            let state = context.state;
            for(let i = 0; i < state.cages.length; i++) {
                context.dispatch('moveCageToNextFloor', {cageIndex: i});
            }
        },

        saveState(context) {
            let state = context.state;
            for( let i=0; i < state.cages.length; i++){
                if(state.cages[i].state === ELEVATOR_STATE.IN_MOVE){
                    context.commit('setCageState', {cageIndex: i, cageState: ELEVATOR_STATE.WILL_MOVE});
                }
            }
            localStorage.setItem('elevator-emulator-state',JSON.stringify(state));
        },

        loadState(context) {
            let state = context.state;
            let newState = JSON.parse(localStorage.getItem('elevator-emulator-state'));

            if(!newState) return;
            if(state.cages.length != newState.cages.length || state.floors.length != newState.floors.length) return;

            context.commit('setState',{newState});
            state = context.state;
            //waits лифты продолжают ждать оставшееся им время
            let now = (new Date()).getTime();
            for(let i = 0; i < state.cages.length; i++){
                let leftTime = consts.cageAwaitsTime - ( now - state.cages[i].waitsSince );
                if(state.cages[i].state === ELEVATOR_STATE.WAITING_ON_FLOOR){
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
                    state: ELEVATOR_STATE.IDLE,
                    direction: ELEVATOR_MOVING_DIRECTION.UP,
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