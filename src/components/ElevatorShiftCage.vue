<template>
  <div 
    :class="cageClass" 
    :style="{ bottom: cageState.bottom + 'px' }">
      <div v-if="cageState.state != ELEVATOR_STATE.IDLE"
        class="cage-indication">
        <div v-if="cageState.direction === ELEVATOR_MOVING_DIRECTION.UP">&uArr;</div>
        <div v-if="cageState.direction === ELEVATOR_MOVING_DIRECTION.DOWN">&dArr;</div>
        {{cageState.floor}}
      </div>
  </div>
</template>

<script>
import { ELEVATOR_MOVING_DIRECTION, ELEVATOR_STATE } from '@/store';

export default {
  name: 'ElevatorShiftCage',

  props: {
    cageState: Object,
  },

  data() {
    return {
      ELEVATOR_MOVING_DIRECTION,
      ELEVATOR_STATE

    }
  },

  computed: {
    cageClass() {
      let classes = [
        'cage',
        this.cageState.state === ELEVATOR_STATE.WAITING_ON_FLOOR ? 'waiting' : ''
      ];
      return classes.join(' ');
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/constants.scss';
  .cage {
    width: $shift-width;
    height: $floor-height;
    position: relative;
    margin: auto;
    border: 1px solid grey;
    background: blue;
    position: absolute;
    bottom: 0;
    left: $wall-width;
  }

  .waiting {
    background: red;
  }

  .cage-indication {
    width: 20px;
    text-align: center;
    margin: 10px auto;
    border: 1px solid black;
    background: white;
  }
</style>
