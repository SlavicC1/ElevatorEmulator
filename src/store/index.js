import {createStore} from 'vuex';

const consts = {
    floorHeight: 100,
    cageSpeed: 2,
    baseUpdateTime: 20,
    cageAwaitsTime: 1000,
}

export default createStore({
    state() {
        return {
            //нажата ли кнопка
            floors: [
                false,
                false,
                false,
                false,
                false,
            ], 
            cages: [{
                bottom: 0,
                state: 'idle', // 'idle' | 'moving' | 'waits'
                direction: 'up', // 'up' | 'down'
                floor: 1,
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
        setFloorAcivity(state, {floorNumber, isActive}) {
            state.floors[floorNumber - 1] = isActive;
        },
        setCageFloor(state, {cageIndex, floor}) {
            state.cages[cageIndex].floor = floor;
        }
    },
    
    actions: {
        addFloorToQueue(context, {floorNumber}) {
            let state = context.state;
            if(state.floorsQueue.includes(floorNumber)) return;
            context.commit('setFloorAcivity', {floorNumber, isActive: true});
            context.commit('pushToQueue',{floorNumber});
        },
        
        moveCageToNextFloor: function moveCageToNextFloor(context, {cageIndex}) {
            let state = context.state;

            if(state.cages[cageIndex].state != 'idle') return;
            if(state.floorsQueue.length < 1) return;
            
            let floorNumber = state.floorsQueue[0];
            context.commit('shiftQueue');
            
            if(floorNumber === state.cages[cageIndex].floor) {
                context.commit('setFloorAcivity', {floorNumber, isActive: false});
                return;
            }

            context.commit('setCageFloor', {cageIndex, floor: floorNumber});

            let newBottom = (floorNumber - 1) * consts.floorHeight;
            context.commit('setCageState',{cageIndex, cageState:'moving'});
            context.commit('setCageDirection', {
                cageIndex, 
                cageDirection: newBottom > state.cages[cageIndex].bottom ? 'up' : 'down'
            });

            const movingCage = setInterval(() => {
                let currentBottom = state.cages[cageIndex].direction === 'up' ? (
                    state.cages[cageIndex].bottom + consts.cageSpeed
                ) : (
                    state.cages[cageIndex].bottom - consts.cageSpeed
                );

                let stop = state.cages[cageIndex].direction === 'up' ? (
                    currentBottom >= newBottom
                ) : (
                    currentBottom <= newBottom
                );

                if(stop) {
                    context.commit('setCageBottom', {cageIndex, bottom: newBottom});
                    context.commit('setCageState', {cageIndex, cageState: 'waits'});
                    setTimeout(() => {
                        context.commit('setCageState', {cageIndex, cageState: 'idle'});
                        context.commit('setFloorAcivity', {floorNumber, isActive: false});
                        moveCageToNextFloor(context, {cageIndex});
                    }, consts.cageAwaitsTime);
                    clearInterval(movingCage);
                } else {
                    context.commit('setCageBottom', {cageIndex, bottom: currentBottom});
                }
            }, consts.baseUpdateTime);
        }
    }
});